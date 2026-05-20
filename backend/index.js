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

app.post('/api/auth/verify', async (req, res) => {
    // We now receive role, phone, and opid from the frontend
    const { role, phone, opid, sessionToken } = req.body;

    console.log(`Received verification request for role: ${role}`);
    console.log('Phone:', phone);
    if (role === 'patient') console.log('OPID:', opid);

    try {
        // NOTE: If using real Supabase Auth for OTP generation, verify the sessionToken here first 
        // using supabase.auth.getUser(sessionToken) before hitting the DB tables.

        // Normalize Phone Number to match database format (+91...)
        let normalizedPhone = (phone || '').toString().trim().replace(/\s+/g, '');
        if (normalizedPhone && !normalizedPhone.startsWith('+')) {
            if (normalizedPhone.startsWith('91')) {
                normalizedPhone = `+${normalizedPhone}`;
            } else {
                normalizedPhone = `+91${normalizedPhone}`;
            }
        }

        // ==========================================
        // PATIENT VERIFICATION LOGIC
        // ==========================================
        if (role === 'patient') {
            if (!opid) {
                return res.status(400).json({ error: "OP Number is required for patient login." });
            }

            console.log('🔍 Checking if patient exists with matching OPID and Phone...');
            const { data: patient, error: dbError } = await supabase
                .from('patients')
                .select('*')
                .eq('phone_number', normalizedPhone)
                .ilike('opid', opid.trim()) // ilike ensures case-insensitivity (e.g., psg123 vs PSG123)
                .single();

            if (dbError || !patient) {
                console.error('❌ Patient not found or mismatch:', dbError?.message);
                return res.status(403).json({ error: "Invalid OP Number or Phone Number combination. Not registered in clinic." });
            }

            console.log('✅ Patient DB match successful!', patient.opid);
            return res.json({ message: "Login successful", user: patient });
        }

        // ==========================================
        // DOCTOR VERIFICATION LOGIC
        // ==========================================
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

app.listen(3000, () => console.log('Server running on port 3000'));