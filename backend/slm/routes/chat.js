const express = require('express');
const router = express.Router();

router.post('/patient-helpdesk', async (req, res) => {
  const { message, opNumber, systemPrompt, patient, history } = req.body;

  console.log(`\n--- New Helpdesk Request ---`);
  console.log(`Patient OP: ${opNumber} | Question: "${message}"`);

  const fallbackContext = systemPrompt || 'You are the PSGIMSR Tumor Board Patient Helpdesk. Answer only from the provided patient context.';
  const historyItems = Array.isArray(history) ? history : [];
  const recentHistory = historyItems.slice(0, 3).map((item) => ({
    appointmentDate: item.scheduledDate,
    status: item.status,
    doctorName: item.doctorName,
    tumorBoardNotes: item.tumorBoardNotes,
  }));
  const promptPayload = {
    patient: patient ? {
      opid: patient.opid,
      patient_name: patient.patient_name,
      diagnosis: patient.diagnosis || null,
    } : null,
    recentHistory,
    question: message,
  };

  try {
    // Build a compact prompt and call Ollama's HTTP API directly.
    const prompt = [
      fallbackContext,
      'Patient context (JSON):',
      JSON.stringify(promptPayload),
      `Question: ${message}`,
      'Answer in 1-3 short sentences. If the context does not contain the answer, say so briefly.',
    ].join('\n');

    const controller = new AbortController();
    const timeoutMs = Number(process.env.SLM_TIMEOUT_MS || 12000);
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const apiResp = await fetch('http://127.0.0.1:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          model: 'phi3:latest',
          prompt,
          stream: false,
          keep_alive: '5m',
          options: {
            num_predict: 120,
            temperature: 0.2,
          },
        }),
      });

      if (!apiResp.ok) {
        const errorText = await apiResp.text().catch(() => '');
        throw new Error(`Ollama HTTP request failed with status ${apiResp.status}${errorText ? `: ${errorText}` : ''}`);
      }

      const data = await apiResp.json();
      const reply = (data.response || data.text || '').toString().trim();
      if (!reply) throw new Error('Empty response from Ollama HTTP API');

      return res.json({ reply });
    } catch (httpError) {
      if (httpError?.name === 'AbortError') {
        throw new Error(`Local SLM request timed out after ${timeoutMs}ms`);
      }
      throw httpError;
    } finally {
      clearTimeout(timeoutId);
    }

  } catch (error) {
    console.error('Helpdesk Error:', error?.message || error);
    res.status(500).json({ error: 'Helpdesk is temporarily offline.' });
  }
});

module.exports = router;