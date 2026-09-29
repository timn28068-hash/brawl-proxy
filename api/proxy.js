export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const apiKey = process.env.BRAWL_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  // путь берём из req.url после /api/proxy
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname.replace(/^\/api\/proxy\/?/, '');
  const queryStr = url.search;

  if (!path) {
    return res.status(400).json({ error: 'No path provided. Use /api/proxy/players/%23TAG' });
  }

  const targetUrl = `https://api.brawlstars.com/v1/${path}${queryStr}`;

  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
      },
    });

    const data = await response.text();
    res.status(response.status);
    res.setHeader('Content-Type', 'application/json');
    return res.send(data);
  } catch (error) {
    return res.status(500).json({
      error: 'Proxy request failed',
      detail: error.message,
    });
  }
}
