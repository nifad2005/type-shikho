import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "2mb" }));

// In-memory cache for audio buffers to ensure instantaneous audio playback
const audioCache = new Map<string, { buffer: Buffer; contentType: string }>();

// Basic Health Check Endpoint
app.get("/api/health", (_req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString()
  });
});

/**
 * Standard Non-AI Bengali / English Text-To-Speech (TTS) Proxy
 * Streams high-fidelity native standard Bengali pronunciation with 0 AI involvement.
 */
app.get("/api/tts", async (req, res) => {
  try {
    const rawText = (req.query.text as string) || "";
    const lang = (req.query.lang as string) || "bn";
    const text = rawText.trim();

    if (!text) {
      return res.status(400).send("Text parameter is required");
    }

    const cacheKey = `${lang}:${text}`;
    if (audioCache.has(cacheKey)) {
      const cached = audioCache.get(cacheKey)!;
      res.setHeader("Content-Type", cached.contentType);
      res.setHeader("Cache-Control", "public, max-age=86400");
      return res.send(cached.buffer);
    }

    // Split text into chunks of <= 100 characters by sentence or word
    const splitTextIntoChunks = (str: string, maxLen = 95): string[] => {
      if (str.length <= maxLen) return [str];
      const chunks: string[] = [];
      const sentences = str.split(/(?<=[।?!.,\n])/g);
      let currentChunk = "";

      for (const sentence of sentences) {
        if ((currentChunk + sentence).length <= maxLen) {
          currentChunk += sentence;
        } else {
          if (currentChunk.trim()) chunks.push(currentChunk.trim());
          if (sentence.length <= maxLen) {
            currentChunk = sentence;
          } else {
            // Split long sentence by spaces
            const words = sentence.split(/\s+/);
            currentChunk = "";
            for (const word of words) {
              if ((currentChunk + " " + word).trim().length <= maxLen) {
                currentChunk = (currentChunk + " " + word).trim();
              } else {
                if (currentChunk.trim()) chunks.push(currentChunk.trim());
                currentChunk = word;
              }
            }
          }
        }
      }
      if (currentChunk.trim()) chunks.push(currentChunk.trim());
      return chunks;
    };

    const textChunks = splitTextIntoChunks(text);
    const bufferList: Buffer[] = [];

    for (const chunk of textChunks) {
      if (!chunk.trim()) continue;
      const targetUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk.trim())}&tl=${lang}&client=tw-ob`;

      const response = await fetch(targetUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Referer": "https://translate.google.com/",
        },
      });

      if (!response.ok) {
        console.warn(`TTS upstream chunk error (${response.status}) for chunk:`, chunk);
        continue;
      }

      const arrayBuffer = await response.arrayBuffer();
      bufferList.push(Buffer.from(arrayBuffer));
    }

    if (bufferList.length === 0) {
      return res.status(500).send("Failed to fetch audio stream");
    }

    const buffer = Buffer.concat(bufferList);
    const contentType = "audio/mpeg";

    // Cache up to 300 audio items in memory
    if (audioCache.size > 300) {
      const firstKey = audioCache.keys().next().value;
      if (firstKey) audioCache.delete(firstKey);
    }
    audioCache.set(cacheKey, { buffer, contentType });

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400");
    return res.send(buffer);
  } catch (err: any) {
    console.error("TTS Server Error:", err?.message || err);
    return res.status(500).send("Internal audio generation error");
  }
});

// Vite Middleware & Static Serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`TypeMaster Bengali Voice Server running on http://localhost:${PORT}`);
  });
}

startServer();
