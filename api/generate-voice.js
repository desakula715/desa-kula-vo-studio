
const presets = {
  documentary:
    "Narator dokumenter berbahasa Indonesia. Tenang, berwibawa, natural, artikulasi jelas, tempo sedang cenderung lambat, dengan jeda bermakna.",
  investigative:
    "Narator investigasi dokumenter berbahasa Indonesia. Serius, tegas, sedikit menegangkan, membangun rasa ingin tahu tanpa berlebihan.",
  news:
    "Narator berita dokumenter berbahasa Indonesia. Objektif, jelas, profesional, pengucapan angka dan istilah tepat.",
  storytelling:
    "Pencerita dokumenter berbahasa Indonesia. Hangat, natural, menarik, tetapi tetap akurat dan profesional.",
  critical:
    "Narator editorial dokumenter berbahasa Indonesia. Kritis, tajam, berwibawa, menekankan fakta dan pertanyaan tanpa terdengar marah."
};

function pcmToWav(pcm, sampleRate = 24000, channels = 1, bitsPerSample = 16) {
  const header = Buffer.alloc(44);
  const byteRate = sampleRate * channels * bitsPerSample / 8;
  const blockAlign = channels * bitsPerSample / 8;

  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write("data", 36);
  header.writeUInt32LE(pcm.length, 40);

  return Buffer.concat([header, pcm]);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Gunakan metode POST." });
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return res.status(500).json({
      error: "GEMINI_API_KEY belum diatur di Vercel."
    });
  }

  const {
    text,
    style = "documentary",
    voice = "marin",
    speed = 0.92
  } = req.body || {};

  if (typeof text !== "string" || !text.trim()) {
    return res.status(400).json({ error: "Naskah wajib diisi." });
  }

  if (text.length > 4096) {
    return res.status(400).json({
      error: "Naskah maksimal 4.096 karakter per generate."
    });
  }

  const voiceMap = {
    marin: "Kore",
    cedar: "Charon",
    onyx: "Fenrir",
    verse: "Puck",
    sage: "Aoede"
  };

  const selectedVoice = voiceMap[voice] || "Kore";
  const selectedStyle = presets[style] || presets.documentary;
  const selectedSpeed = Math.max(
    0.75,
    Math.min(1.15, Number(speed) || 0.92)
  );

  const instruction =
    `${selectedStyle} Bicaralah dengan kecepatan sekitar ${selectedSpeed} kali kecepatan normal. ` +
    "Bacakan naskah berikut dalam Bahasa Indonesia. Pertahankan isi naskah; " +
    "jangan menambahkan pembukaan atau komentar lain.\n\n" +
    "NASKAH:\n" + text;

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent",
      {
        method: "POST",
        headers: {
          "x-goog-api-key": key,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: instruction }]
          }],
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: selectedVoice
                }
              }
            }
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || "Gemini gagal membuat audio."
      });
    }

    const parts = data?.candidates?.[0]?.content?.parts || [];
    const audioPart = parts.find(part => part.inlineData?.data);

    if (!audioPart) {
      return res.status(502).json({
        error: "Gemini tidak mengembalikan audio. Coba lagi."
      });
    }

    const audioData = Buffer.from(audioPart.inlineData.data, "base64");
    const wav = pcmToWav(audioData);

    res.setHeader("Content-Type", "audio/wav");
    res.setHeader(
      "Content-Disposition",
      'inline; filename="desa-kula-vo.wav"'
    );
    res.setHeader("Cache-Control", "no-store");

    return res.status(200).send(wav);
  } catch (error) {
    return res.status(500).json({
      error: "Tidak dapat menghubungi Gemini. Silakan coba lagi."
    });
  }
}
