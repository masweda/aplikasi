import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Multi-turn Gemini AI Chat API
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, systemInstruction } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY belum dikonfigurasi di server. Silakan hubungkan API Key di Secrets AI Studio.',
      });
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Daftar pesan percakapan (messages) wajib diisi.' });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    // Format conversation history for Gemini SDK
    const contents = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const defaultSystemInstruction =
      'Anda adalah Asisten Cerdas Konsultan TPK (Tim Pendamping Keluarga) Kota Yogyakarta - BKKBN. ' +
      'Anda bertugas membantu petugas TPK di 14 Kemantren dan 45 Kelurahan se-Kota Yogyakarta. ' +
      'Tugas utama Anda meliputi edukasi pencegahan stunting pada Calon Pengantin (CATIN), Ibu Nifas (BUFAS), dan Ibu Hamil (BUMIL). ' +
      'Kuasai standar kesehatan BKKBN: ' +
      '1. Ambang batas Anemia: Hb < 12.0 g/dL untuk Catin/WUS, Hb < 11.0 g/dL untuk Ibu Hamil. ' +
      '2. KEK (Kurang Energi Kronis): LiLA < 23.5 cm. ' +
      '3. Bayi Berat Lahir Rendah (BBLR): BBL < 2500 gram, Panjang < 48 cm. ' +
      '4. Intervensi PMT (DAIS, Puskesmas, GENTING) dan KB Pasca Persalinan (KBPP: IUD, Implan, Suntik, dll). ' +
      'Berikan jawaban yang jelas, hangat, terstruktur, berbasis sains kesehatan resmi, dan langsung dapat dipraktikkan petugas di lapangan.';

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents,
      config: {
        systemInstruction: systemInstruction || defaultSystemInstruction,
        temperature: 0.7,
      },
    });

    const reply = response.text || 'Maaf, tidak dapat menghasilkan jawaban.';
    return res.json({ reply });
  } catch (err: any) {
    console.error('Gemini Chat Server Error:', err);
    return res.status(500).json({
      error: err.message || 'Terjadi gangguan saat memproses jawaban AI.',
    });
  }
});

// Full-stack Vite mounting
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[TPK Kota Yogyakarta] Dev Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
