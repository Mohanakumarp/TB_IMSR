import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import bcrypt from 'bcrypt';
import twilio from 'twilio';
import jwt from 'jsonwebtoken';

// Initialize Twilio
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const twilioWhatsApp = process.env.TWILIO_WHATSAPP_NUMBER; // e.g., 'whatsapp:+14155238886'
const app = express();
app.use(express.json());
app.use(cors());

// Initialize Supabase Client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// ==========================================
// SECURITY MIDDLEWARE
// ==========================================
// This function intercepts requests to make sure the user has a valid session token
const authenticateUser = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    // 🛑 DEBUGGING LOGS 🛑
    // console.log("👉 1. Raw Auth Header:", authHeader);
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: "Missing or invalid authorization header. Please log in." });
    }

    const token = authHeader.split(' ')[1];
    // 🛑 DEBUGGING LOGS 🛑
    // console.log("👉 2. Extracted Token:", token);
    // console.log("👉 3. Token Length:", token ? token.length : 0);
    // NEW: Catch tokens that evaluated to the string "null" or "undefined" on the frontend
    if (!token || token === 'null' || token === 'undefined') {
        return res.status(401).json({ error: "Token is null or undefined. Please log in again." });
    }

    try {
        // Ask Supabase if this token is real and hasn't expired
        const { data: { user }, error } = await supabase.auth.getUser(token);
        
        if (error || !user) {
            console.error('❌ Middleware Auth Error:', error?.message);
            return res.status(401).json({ error: "Unauthorized access: Invalid or expired token." });
        }

        req.authUser = user;
        req.authToken = token;

        // Token is good! Let the request proceed to the actual route
        next();
    } catch (e) {
        console.error('❌ Middleware Server Error:', e.message);
        return res.status(500).json({ error: "Internal server error during authentication." });
    }
};

// Custom middleware for Coordinator routes
const authenticateCoordinator = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Missing token" });
    
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== 'coordinator') throw new Error('Not a coordinator');
        req.coordinator = decoded;
        next();
    } catch (e) {
        res.status(403).json({ error: "Unauthorized access." });
    }
};

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================
app.post('/api/auth/verify', async (req, res) => {
    const { role, phone, opid, sessionToken } = req.body;

    console.log(`Received verification request for role: ${role}`);
    console.log('Phone:', phone);
    if (role === 'patient') console.log('OPID:', opid);

    try {
        // 1. VERIFY THE JWT TOKEN FIRST (Security Check)
        if (!sessionToken) {
            return res.status(400).json({ error: "Missing session token." });
        }
        
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(sessionToken);
        if (authError || !authUser) {
            console.error('❌ Token Verification Failed:', authError?.message);
            return res.status(401).json({ error: "Invalid session token. OTP verification failed." });
        }
        console.log('✅ Supabase JWT Verified!');

        // 2. Normalize Phone Number
        let normalizedPhone = (phone || '').toString().trim().replace(/\s+/g, '');
        if (normalizedPhone && !normalizedPhone.startsWith('+')) {
            if (normalizedPhone.startsWith('91')) {
                normalizedPhone = `+${normalizedPhone}`;
            } else {
                normalizedPhone = `+91${normalizedPhone}`;
            }
        }

        // 3. PATIENT VERIFICATION LOGIC
        if (role === 'patient') {
            if (!opid) {
                return res.status(400).json({ error: "OP Number is required for patient login." });
            }

            console.log('🔍 Checking if patient exists with matching OPID and Phone...');
            const { data: patient, error: dbError } = await supabase
                .from('patients')
                .select('*')
                .eq('phone_number', normalizedPhone)
                .ilike('opid', opid.trim())
                .single();

            if (dbError || !patient) {
                console.error('❌ Patient not found or mismatch:', dbError?.message);
                return res.status(403).json({ error: "Invalid OP Number or Phone Number combination. Not registered in clinic." });
            }

            console.log('✅ Patient DB match successful!', patient.opid);
            return res.json({ message: "Login successful", user: patient });
        }

        // 4. DOCTOR VERIFICATION LOGIC
        if (role === 'doctor') {
            console.log('🔍 Checking if doctor exists with Phone...');
            const { data: doctor, error: dbError } = await supabase
                .from('doctors')
                .select('*')
                .eq('phone_number', normalizedPhone)
                .single();

            if (dbError || !doctor) {
                console.error('❌ Doctor not found:', dbError?.message);
                return res.status(403).json({ error: "Doctor phone number not recognized in the system." });
            }

            console.log('✅ Doctor DB match successful!', doctor.doctor_id);
            return res.json({ message: "Login successful", user: doctor });
        }

        return res.status(400).json({ error: "Invalid role specified." });

    } catch (e) {
        console.error('❌ Internal Server Error:', e.message);
        res.status(500).json({ error: "Internal server error during verification." });
    }
});

// ==========================================
// PATIENT APP ROUTES (Now Protected!)
// ==========================================

// Notice we added 'authenticateUser' as the second parameter here.
// This forces the request to pass the security check before running the database query.

// Get Patient Appointments & History
app.get('/api/patient/:opid/appointments', authenticateUser, async (req, res) => {
    const { opid } = req.params;
    try {
        const { data, error } = await supabase
            .from('appointments')
            .select(`
                appointment_id,
                appointment_date,
                status,
                surgery_required,
                tumour_board_recommendations ( recommended_plan ),
                doctors ( name )
            `)
            .eq('opid', opid)
            .order('appointment_date', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Get Patient Profile (Includes Primary Doctor)
app.get('/api/patient/:opid/profile', authenticateUser, async (req, res) => {
    const { opid } = req.params;
    try {
        const { data, error } = await supabase
            .from('patients')
            .select(`
                *,
                doctors!primary_doctor_id ( name, department )
            `)
            .eq('opid', opid)
            .single();

        if (error) throw error;
        res.json(data);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});
// ==========================================
// DOCTOR APP ROUTES (Protected)
// ==========================================

// 1. Get Doctor Dashboard (List of Patients & Appointments)
app.get('/api/doctor/:doctorId/dashboard', authenticateUser, async (req, res) => {
    const { doctorId } = req.params;
    
    try {
        // Query the appointments table, and join the patients table
        const { data, error } = await supabase
            .from('appointments')
            .select(`
                appointment_id,
                appointment_date,
                status,
                surgery_required,
                patients (
                    opid,
                    patient_name,
                    diagnosis
                )
            `)
            .eq('doctor_id', doctorId)
            .order('appointment_date', { ascending: false });

        if (error) throw error;
        
        // Transform the data slightly to match what your frontend expects
        const formattedData = data.map(apt => ({
            opNumber: apt.patients?.opid,
            patientName: apt.patients?.patient_name,
            procedureName: apt.patients?.diagnosis || (apt.surgery_required ? 'Surgery' : 'Consultation'),
            scheduledDate: new Date(apt.appointment_date).toLocaleDateString(),
            status: apt.status.toLowerCase(), // e.g., 'completed', 'upcoming', 'missed'
            appointmentId: apt.appointment_id
        }));

        res.json(formattedData);
    } catch (e) {
        console.error('❌ Error fetching doctor dashboard:', e.message);
        res.status(500).json({ error: e.message });
    }
});

// 2. Get Specific Patient Details for the Doctor (including Tumor Board Notes)
app.get('/api/doctor/patient/:opid', authenticateUser, async (req, res) => {
    const { opid } = req.params;

    try {
        // Fetch patient details along with their appointments and tumor board notes
        const { data, error } = await supabase
            .from('patients')
            .select(`
                opid,
                patient_name,
                diagnosis,
                appointments (
                    appointment_id,
                    appointment_date,
                    status,
                    surgery_required,
                    tumour_board_recommendations ( recommended_plan )
                )
            `)
            .eq('opid', opid)
            .single();

        if (error) throw error;

        // Find the most relevant appointment (usually the latest one)
        // Note: Sorts appointments by date descending to get the newest one first
        const latestAppointment = data.appointments?.sort(
            (a, b) => new Date(b.appointment_date) - new Date(a.appointment_date)
        )[0];

        // Format for the frontend patient details screen
        const formattedPatientDetails = {
            opNumber: data.opid,
            patientName: data.patient_name,
            status: latestAppointment?.status?.toLowerCase() || 'unknown',
            procedureName: data.diagnosis,
            scheduledDate: latestAppointment ? new Date(latestAppointment.appointment_date).toLocaleDateString() : 'Not Scheduled',
            tumorBoardNotes: latestAppointment?.tumour_board_recommendations?.[0]?.recommended_plan || 'No board recommendations available.',
            lastUpdated: latestAppointment?.appointment_date || new Date().toISOString()
        };

        res.json(formattedPatientDetails);
    } catch (e) {
        console.error('❌ Error fetching patient details for doctor:', e.message);
        res.status(500).json({ error: e.message });
    }
});

// ==========================================
// PATIENT CHAT ROUTE
// ==========================================
app.post('/api/chat', authenticateUser, async (req, res) => {
    try {
        const { message, patient: clientPatient } = req.body;

        if (!message || typeof message !== 'string') {
            return res.status(400).json({ error: 'Message is required.' });
        }

        const requestedOpNumber = (clientPatient?.opNumber || req.authUser?.user_metadata?.opid || req.authUser?.user_metadata?.opNumber || '').toString().trim();

        if (!requestedOpNumber) {
            return res.status(400).json({ error: 'Patient OP number is required for chat.' });
        }

        const { data: patientRecord, error: patientError } = await supabase
            .from('patients')
            .select('*')
            .ilike('opid', requestedOpNumber)
            .single();

        if (patientError || !patientRecord) {
            console.error('❌ Patient lookup failed:', patientError?.message, 'Requested OP:', requestedOpNumber);
            return res.status(404).json({ error: 'No patient record found for the requested OP number.' });
        }

        const normalizePhone = (value) => (value || '')
            .toString()
            .replace(/\D/g, '')
            .slice(-10);

        const authPhone = req.authUser?.phone || req.authUser?.user_metadata?.phone || req.authUser?.user_metadata?.phone_number;
        if (authPhone && patientRecord.phone_number) {
            const normalizedAuthPhone = normalizePhone(authPhone);
            const normalizedPatientPhone = normalizePhone(patientRecord.phone_number);

            if (!normalizedAuthPhone || !normalizedPatientPhone) {
                console.error('❌ Unable to normalize phone numbers for comparison:', authPhone, patientRecord.phone_number);
            } else if (normalizedAuthPhone !== normalizedPatientPhone) {
                console.error('❌ Authenticated phone does not match patient phone:', normalizedAuthPhone, normalizedPatientPhone, authPhone, patientRecord.phone_number);
                return res.status(403).json({ error: 'Authenticated user does not match the requested patient record.' });
            }
        }

        if (clientPatient?.opNumber && clientPatient.opNumber.toString().trim().toLowerCase() !== patientRecord.opid.toString().trim().toLowerCase()) {
            return res.status(403).json({ error: 'Requested patient context does not match the authenticated patient.' });
        }

        const { data: appointmentRows, error: appointmentError } = await supabase
            .from('appointments')
            .select(`
                appointment_id,
                appointment_date,
                status,
                surgery_required,
                tumour_board_recommendations ( recommended_plan ),
                doctors ( name )
            `)
            .eq('opid', patientRecord.opid)
            .order('appointment_date', { ascending: false });

        if (appointmentError) {
            throw appointmentError;
        }

        const patientHistory = (appointmentRows || []).map((appointment) => ({
            appointmentId: appointment.appointment_id,
            scheduledDate: appointment.appointment_date,
            status: appointment.status,
            surgeryRequired: appointment.surgery_required,
            doctorName: appointment.doctors?.name || null,
            tumorBoardNotes: appointment.tumour_board_recommendations?.recommended_plan || null,
        }));

        const upcomingAppointment = (appointmentRows || []).find((appointment) => {
            const statusValue = (appointment.status || '').toString().toLowerCase();
            return statusValue === 'scheduled' || statusValue === 'upcoming';
        }) || appointmentRows?.[0] || null;

        const systemPrompt = [
            'You are the PSG Hospitals patient assistant for the EMR-Integrated Tumor Board Monitoring System.',
            'Answer only from the patient context provided below.',
            'If a detail is not present in the patient context, say you do not have that information.',
            'Do not invent dates, diagnoses, procedures, or instructions.',
            'Keep the answer concise and patient-friendly.',
            '',
            `Patient: ${patientRecord.patient_name || 'Unknown'} (${patientRecord.opid || 'N/A'})`,
            'Patient context (JSON):',
            JSON.stringify({
                profile: {
                    opid: patientRecord.opid,
                    patient_name: patientRecord.patient_name,
                    diagnosis: patientRecord.diagnosis || null,
                },
                upcomingAppointment,
                history: patientHistory,
            }, null, 2),
        ].join('\n');

        // Replace this fallback with your real local inference or RAG call.
        // Example options:
        // - A local LLM endpoint (Ollama, vLLM, LM Studio, etc.)
        // - A custom retrieval layer that first fetches relevant history chunks
        //   and then passes them to the model as the system prompt.
        let reply;
        try {
            reply = await runLocalSlm({
                systemPrompt,
                message,
                patient: patientRecord,
                history: patientHistory,
            });
        } catch (modelError) {
            console.error('⚠️ Local SLM failed, using fallback response:', modelError?.message || modelError);
            reply = buildFallbackPatientReply({ message, patient: patientRecord, history: patientHistory, upcomingAppointment });
        }

        return res.json({ reply });
    } catch (e) {
        console.error('❌ Chat route error:', e.message);
        return res.status(500).json({ error: 'Failed to generate chat response.' });
    }
});

async function runLocalSlm({ systemPrompt, message, patient, history }) {
    const localEndpoint = process.env.LOCAL_SLM_URL;

    if (localEndpoint) {
        const controller = new AbortController();
        const timeoutMs = Number(process.env.SLM_TIMEOUT_MS || 45000);
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        let response;
        try {
            response = await fetch(localEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    systemPrompt,
                    message,
                    patient,
                    history,
                }),
                signal: controller.signal,
            });
        } catch (fetchError) {
            if (fetchError?.name === 'AbortError') {
                throw new Error(`Local SLM request timed out after ${timeoutMs}ms`);
            }
            throw fetchError;
        } finally {
            clearTimeout(timeoutId);
        }

        if (!response.ok) {
            const errorText = await response.text().catch(() => '');
            throw new Error(`Local SLM request failed with status ${response.status}${errorText ? `: ${errorText}` : ''}`);
        }

        const data = await response.json();
        return data.reply || data.answer || data.text || 'No response returned by the local model.';
    }

    const latest = history[0];
    const summary = latest
        ? `Your latest recorded procedure is ${latest.scheduledDate ? `scheduled on ${new Date(latest.scheduledDate).toLocaleDateString()}` : 'on file'}${latest.tumorBoardNotes ? `, with notes: ${latest.tumorBoardNotes}` : ''}.`
        : 'No procedure history is available in the database yet.';

    return `${summary} This answer was generated from the authenticated patient record only. Configure LOCAL_SLM_URL to connect your local model server and get model-generated responses.`;
}

function buildFallbackPatientReply({ message, patient, history, upcomingAppointment }) {
    const lower = (message || '').toLowerCase();

    if (!history || history.length === 0) {
        return `Hello ${patient?.patient_name || 'Patient'}. I could not reach the AI service right now, but your record currently shows no procedure history. Please contact your coordinator for the latest update.`;
    }

    if (lower.includes('next') || lower.includes('appointment') || lower.includes('schedule') || lower.includes('when')) {
        if (upcomingAppointment) {
            const when = upcomingAppointment.appointment_date
                ? new Date(upcomingAppointment.appointment_date).toLocaleString()
                : 'date not available';
            return `Your next recorded appointment is on ${when}. If you need to reschedule, please contact PSG Hospitals support.`;
        }
        return 'I could not find an upcoming appointment in your record right now. Please check with your care coordinator.';
    }

    const latest = history[0];
    const latestDate = latest?.scheduledDate ? new Date(latest.scheduledDate).toLocaleDateString() : 'not available';
    const notes = latest?.tumorBoardNotes || 'No tumor board notes are available for the latest record.';

    return `I could not reach the AI service, so I am using your EMR data directly. Latest procedure date: ${latestDate}. Tumor board note: ${notes}`;
}


// ==========================================
// COORDINATOR AUTHENTICATION
// ==========================================

// COORDINATOR ROUTES
// ==========================================
// TWILIO HELPER FUNCTION
// ==========================================
const sendWhatsAppMessage = async (toNumber, messageBody) => {
    if (!toNumber) return;
    
    // Normalize phone number (ensure +91 and whatsapp: prefix)
    let formattedNumber = toNumber.toString().trim().replace(/\s+/g, '');
    if (!formattedNumber.startsWith('+')) {
        formattedNumber = formattedNumber.startsWith('91') ? `+${formattedNumber}` : `+91${formattedNumber}`;
    }
    if (!formattedNumber.startsWith('whatsapp:')) {
        formattedNumber = `whatsapp:${formattedNumber}`;
    }

    try {
        const message = await twilioClient.messages.create({
            body: messageBody,
            from: twilioWhatsApp, // Your Twilio Sandbox Number
            to: formattedNumber
        });
        console.log(`✅ WhatsApp sent to ${formattedNumber}. SID: ${message.sid}`);
    } catch (error) {
        console.error(`❌ Twilio WhatsApp Error for ${formattedNumber}:`, error.message);
    }
};
// 1. Coordinator Login
// Make sure to import bcrypt at the top of your file if you haven't already:
// const bcrypt = require('bcrypt');
app.post('/api/coordinator/login', async (req, res) => {
  try {
    const { login_id, password } = req.body;

    if (!login_id || !password) {
      return res.status(400).json({ error: 'Missing login_id or password' });
    }

    // 1. Fetch coordinator from database
    const { data: coordinator, error } = await supabase
      .from('coordinators')
      .select('*')
      .eq('login_id', login_id)
      .single();

    if (error || !coordinator) {
      return res.status(401).json({ error: 'Invalid coordinator' });
    }

    // 2. Compare password using bcrypt!
    const isMatch = await bcrypt.compare(password, coordinator.password_hash);
    
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // 3. Generate JWT token for coordinator
    const token = jwt.sign(
      { coordinator_id: coordinator.coordinator_id, type: 'coordinator' },
      process.env.JWT_SECRET,
      { expiresIn: '12h' }
    );

    // 4. Return the token (fixed variable name here)
    return res.json({
      coordinator_id: coordinator.coordinator_id,
      name: coordinator.name,
      login_id: coordinator.login_id,
      token: token 
    });
    
  } catch (error) {
    console.error('Coordinator login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// 2. Middleware to verify coordinator token
const verifyCoordinatorToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    if (decoded.type !== 'coordinator') {
      return res.status(403).json({ error: 'Not a coordinator' });
    }
    req.coordinator_id = decoded.coordinator_id;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// 3. Get all patients (for coordinator to see available patients)
app.get('/api/coordinator/patients', verifyCoordinatorToken, async (req, res) => {
  try {
    const { data: patients, error } = await supabase
      .from('patients')
      .select('opid, patient_name, phone_number, diagnosis, primary_doctor_id')
      .order('patient_name', { ascending: true });

    if (error) throw error;
    res.json(patients);
  } catch (error) {
    console.error('Fetch patients error:', error);
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

// 4. Get all doctors (for coordinator to assign to appointments)
app.get('/api/coordinator/doctors', verifyCoordinatorToken, async (req, res) => {
  try {
    const { data: doctors, error } = await supabase
      .from('doctors')
      .select('doctor_id, name, department, phone_number')
      .order('name', { ascending: true });

    if (error) throw error;
    res.json(doctors);
  } catch (error) {
    console.error('Fetch doctors error:', error);
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
});

// 5. Create appointment (allocate appointment to patient)
app.post('/api/coordinator/appointments', verifyCoordinatorToken, async (req, res) => {
  try {
    const { opid, doctor_id, appointment_date, surgery_required, recommended_plan } = req.body;

    if (!opid || !doctor_id || !appointment_date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // 1. Create appointment
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .insert([{
          opid,
          doctor_id,
          appointment_date,
          surgery_required: surgery_required || false,
          status: 'Scheduled'
      }])
      .select()
      .single();

    if (appointmentError) throw appointmentError;

    // 2. Create tumour board recommendation if provided
    if (recommended_plan) {
      const { error: recommendationError } = await supabase
        .from('tumour_board_recommendations')
        .insert([{ appointment_id: appointment.appointment_id, recommended_plan }]);

      if (recommendationError) console.error('Recommendation warning:', recommendationError);
    }

    // ---------------------------------------------------------
    // 3. WHATSAPP NOTIFICATION LOGIC (TO PATIENT)
    // ---------------------------------------------------------
    try {
        // Fetch patient and assigned doctor details
        const { data: patient } = await supabase.from('patients').select('patient_name, phone_number').eq('opid', opid).single();
        const { data: doctor } = await supabase.from('doctors').select('name').eq('doctor_id', doctor_id).single();

        if (patient && patient.phone_number) {
            const dateStr = new Date(appointment_date).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });
            const typeStr = surgery_required ? 'Surgical Procedure' : 'Consultation';
            
            const msg = `🏥 *PSG Hospitals*\n\nHello ${patient.patient_name},\n\nYour ${typeStr} with ${doctor?.name || 'your doctor'} has been scheduled for *${dateStr}*.\n\nPlease check your patient app for any pre-procedure instructions.`;
            
            // Send message in the background (no await) so the frontend doesn't hang waiting for Twilio
            sendWhatsAppMessage(patient.phone_number, msg);
        }
    } catch (notifyError) {
        console.error('Failed to send creation WhatsApp:', notifyError);
    }
    // ---------------------------------------------------------

    res.status(201).json({ message: 'Appointment created successfully', appointment });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
});

// 6. Get appointments (for coordinator to manage)
app.get('/api/coordinator/appointments', verifyCoordinatorToken, async (req, res) => {
  try {
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select(`
        appointment_id,
        opid,
        doctor_id,
        appointment_date,
        status,
        surgery_required,
        patients(patient_name, diagnosis),
        doctors(name, department),
        tumour_board_recommendations(recommended_plan)
      `)
      .order('appointment_date', { ascending: false });

    if (error) throw error;
    res.json(appointments);
  } catch (error) {
    console.error('Fetch appointments error:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// 7. Update appointment status (cancel, complete, etc.)
app.put('/api/coordinator/appointments/:appointment_id', verifyCoordinatorToken, async (req, res) => {
  try {
    const { appointment_id } = req.params;
    const { status, recommended_plan } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    // 1. Update appointment status
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .update({ status })
      .eq('appointment_id', appointment_id)
      .select()
      .single();

    if (appointmentError) throw appointmentError;

    // 2. Update recommendation if provided
    if (recommended_plan) {
      const { error: recError } = await supabase
        .from('tumour_board_recommendations')
        .update({ recommended_plan })
        .eq('appointment_id', appointment_id);

      if (recError) console.error('Recommendation update warning:', recError);
    }

    // ---------------------------------------------------------
    // 3. WHATSAPP NOTIFICATION LOGIC (TO PRIMARY DOCTOR)
    // ---------------------------------------------------------
    if (status === 'Completed') {
        try {
            // Fetch the appointment's patient, and that patient's primary doctor ID
            const { data: aptData } = await supabase
                .from('appointments')
                .select(`patients ( patient_name, primary_doctor_id )`)
                .eq('appointment_id', appointment_id)
                .single();

            const primaryDoctorId = aptData?.patients?.primary_doctor_id;
            const patientName = aptData?.patients?.patient_name;

            if (primaryDoctorId && patientName) {
                // Fetch the primary doctor's phone number
                const { data: primaryDoctor } = await supabase
                    .from('doctors')
                    .select('name, phone_number')
                    .eq('doctor_id', primaryDoctorId)
                    .single();

                if (primaryDoctor && primaryDoctor.phone_number) {
                    const msg = `⚕️ *EMR Alert*\n\nHello ${primaryDoctor.name},\n\nThe scheduled procedure/consultation for your primary patient *${patientName}* has just been marked as *Completed* by the coordinator.\n\nPlease review their updated EMR notes when available.`;
                    
                    sendWhatsAppMessage(primaryDoctor.phone_number, msg);
                }
            }
        } catch (notifyError) {
            console.error('Failed to send completion WhatsApp:', notifyError);
        }
    }
    // ---------------------------------------------------------

    res.json({ message: 'Appointment updated successfully', appointment });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
});

// 8. Delete appointment
app.delete('/api/coordinator/appointments/:appointment_id', verifyCoordinatorToken, async (req, res) => {
  try {
    const { appointment_id } = req.params;

    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('appointment_id', appointment_id);

    if (error) throw error;

    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({ error: 'Failed to delete appointment' });
  }
});

// Use 0.0.0.0 to ensure it accepts connections from your mobile device on the local Wi-Fi
app.listen(3000, '0.0.0.0', () => console.log('Server running on port 3000'));