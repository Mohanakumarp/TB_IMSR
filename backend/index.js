import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';

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
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: "Missing or invalid authorization header. Please log in." });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Ask Supabase if this token is real and hasn't expired
        const { data: { user }, error } = await supabase.auth.getUser(token);
        
        if (error || !user) {
            console.error('❌ Middleware Auth Error:', error?.message);
            return res.status(401).json({ error: "Unauthorized access: Invalid or expired token." });
        }

        // Token is good! Let the request proceed to the actual route
        next();
    } catch (e) {
        console.error('❌ Middleware Server Error:', e.message);
        return res.status(500).json({ error: "Internal server error during authentication." });
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

// Use 0.0.0.0 to ensure it accepts connections from your mobile device on the local Wi-Fi
app.listen(3000, '0.0.0.0', () => console.log('Server running on port 3000'));