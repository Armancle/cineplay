// Vercel Serverless Function — TMDB API Secure Proxy
// Hides TMDB Bearer Token from client-side code

module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed. Only GET is supported." });
  }

  const token = process.env.TMDB_READ_ACCESS_TOKEN || process.env.TMDB_API_KEY || process.env.TMDB_TOKEN;

  if (!token) {
    return res.status(503).json({
      error: "TMDB_READ_ACCESS_TOKEN environment variable is not configured on the server.",
      results: []
    });
  }

  const { endpoint, ...params } = req.query || {};

  if (!endpoint || typeof endpoint !== "string") {
    return res.status(400).json({ error: "Missing required 'endpoint' query parameter." });
  }

  // Prevent path traversal
  const sanitizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  if (sanitizedEndpoint.includes("..")) {
    return res.status(400).json({ error: "Invalid endpoint format." });
  }

  try {
    const tmdbUrl = new URL(`https://api.themoviedb.org/3${sanitizedEndpoint}`);

    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        tmdbUrl.searchParams.append(key, params[key]);
      }
    });

    if (!tmdbUrl.searchParams.has("language")) {
      tmdbUrl.searchParams.append("language", "en-US");
    }

    const tmdbRes = await fetch(tmdbUrl.toString(), {
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    const data = await tmdbRes.json();

    // Cache successful responses for 1 hour on edge CDN, 1 day stale-while-revalidate
    if (tmdbRes.ok) {
      res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
    }

    return res.status(tmdbRes.status).json(data);
  } catch (error) {
    console.error("[TMDB Proxy Error]:", error);
    return res.status(500).json({ error: "Failed to fetch data from TMDB API.", details: error.message });
  }
};
