export default async function handler(req: any, res: any) {
  try {
    const rawText = (req.query?.text as string) || "";
    const lang = (req.query?.lang as string) || "bn";
    const text = rawText.trim();

    if (!text) {
      return res.status(400).send("Text parameter is required");
    }

    // Google Translate TTS with proper desktop user agent and referer
    const targetUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}&client=tw-ob`;

    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://translate.google.com/",
      },
    });

    if (!response.ok) {
      return res.status(response.status).send("Failed to fetch audio stream");
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = response.headers.get("content-type") || "audio/mpeg";

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(200).send(buffer);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "Audio error" });
  }
}
