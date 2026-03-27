import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app  = express();
  const PORT = process.env.PORT || 3001;

  app.use(cors());
  app.use(express.json());

  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // ── Rwanda Tour ────────────────────────────────────────────────────────────
  app.post('/api/ai/rwanda-tour', async (req, res) => {
    const { query } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY not set on server' });

    try {
      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are a highly accurate Rwanda Tourist Guide and Local News Expert.
User Query: ${query}.
Task:
1. Look for: breaking news, local events, festivals, expat groups, popular hangouts, and cultural spots.
2. If the query is about "what's happening" or "news", provide a bulleted list of the top 3-5 trending stories in Rwanda right now.
3. Provide a detailed, helpful answer in Kinyarwanda.
4. Also provide the answer in English.
Return ONLY a JSON object: { "answer": "...", "english_answer": "...", "original_query": "${query}" }`
              }]
            }],
            generationConfig: { responseMimeType: 'application/json' }
          }),
        }
      );
      const data = await geminiRes.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        console.log('Gemini raw response:', JSON.stringify(data, null, 2));
        throw new Error(data.error?.message || 'No response from Gemini');
      }
      res.json(JSON.parse(text));
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // ── TTS ────────────────────────────────────────────────────────────────────
  app.post('/api/ai/speak', async (req, res) => {
    const { text } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY not set on server' });

    try {
      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text }] }],
            generationConfig: {
              responseModalities: ['AUDIO'],
              speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } }
            }
          }),
        }
      );
      const data = await geminiRes.json();
      const audioBase64 = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!audioBase64) throw new Error('No audio returned');
      res.json({ audioBase64 });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // ── Finance prediction ─────────────────────────────────────────────────────
  app.post('/api/finance/predict', async (req, res) => {
    const { transactions } = req.body;
    try {
      const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';
      const pythonRes = await fetch(`${pythonServiceUrl}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactions }),
      });
      if (!pythonRes.ok) throw new Error('Python service unavailable');
      const data = await pythonRes.json();
      res.json(data);
    } catch {
      const totalIncome  = transactions.reduce((acc: number, t: any) => t.type === 'income'  ? acc + t.amount : acc, 0);
      const totalExpense = transactions.reduce((acc: number, t: any) => t.type === 'expense' ? acc + t.amount : acc, 0);
      const balance      = totalIncome - totalExpense;
      let wealthTrend = 'Stable';
      let povertyProb = 0.1;
      if      (balance > 500000) { wealthTrend = 'Rich/Growth'; povertyProb = 0.02; }
      else if (balance < 50000)  { wealthTrend = 'Risk';        povertyProb = 0.65; }
      res.json({
        saving_allowance:    balance * 0.2,
        wealth_trend:        wealthTrend,
        poverty_probability: povertyProb,
        recommendation:      povertyProb > 0.5
          ? 'Reduce non-essential spending immediately.'
          : 'Consider investing in local bonds.',
      });
    }
  });

  // ── General AI chat ────────────────────────────────────────────────────────
  app.post('/api/ai/chat', async (req, res) => {
    const { prompt } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY not set on server' });
    try {
      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        }
      );
      const data = await geminiRes.json();
      res.json(data);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`✅ UBWENGE HUB Node server → http://localhost:${PORT}`);
  });
}

startServer();
