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

    // Use standard Google TTS service
    const targetUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}&client=tw-ob`;

    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://translate.google.com/",
      },
    });

    if (!response.ok) {
      console.warn(`TTS upstream error: ${response.status}`);
      return res.status(response.status).send("Failed to fetch audio stream");
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = response.headers.get("content-type") || "audio/mpeg";

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
