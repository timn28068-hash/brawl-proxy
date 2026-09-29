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

  // получаем путь из query-параметра
  let path = req.query.path || '';
  if (Array.isArray(path)) {
    path = path.join('/');
  }

  // собираем query-строку для проброса
  const queryParams = new URLSearchParams();
  for (const [key, value] of Object.entries(req.query)) {
    if (key !== 'path') {
      queryParams.append(key, value);
    }
  }
  const queryStr = queryParams.toString();

  const targetUrl = `https://api.brawlstars.com/v1/${path}${queryStr ? '?' + queryStr : ''}`;

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
