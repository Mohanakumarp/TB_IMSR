import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(express.json());

// Initialize Supabase Client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

app.post('/api/auth/patient/verify', async (req, res) => {
    const { sessionToken, phone } = req.body;

    try {
        // 1. Verify the Supabase JWT is valid
        const { data: { user }, error } = await supabase.auth.getUser(sessionToken);
        if (error || !user) throw new Error("Invalid Session");

        // 2. Check if patient exists in our public records
        const { data: patient, error: dbError } = await supabase
            .from('patients')
            .select('*')
            .eq('phone_number', phone)
            .single();

        if (dbError || !patient) {
            return res.status(403).json({ error: "Patient not registered in clinic." });
        }

        // 3. Success! The user is verified and exists.
        res.json({ message: "Login successful", patient });

    } catch (e) {
        res.status(401).json({ error: e.message });
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));