const { set, count } = require('../lib/storage');

function generateSlug() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let slug = '';
  for (let i = 0; i < 6; i++) {
    slug += chars[Math.floor(Math.random() * chars.length)];
  }
  return slug;
}

module.exports = async function handler(req, res) {
  const origin = req.headers.host
    ? `https://${req.headers.host}`
    : 'http://localhost:3000';

  if (req.method === 'POST') {
    const { url } = req.body || {};

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL requise' });
    }

    let normalized = url.trim();
    if (!/^https?:\/\//i.test(normalized)) {
      normalized = 'https://' + normalized;
    }

    try {
      new URL(normalized);
    } catch {
      return res.status(400).json({ error: 'URL invalide' });
    }

    const slug = generateSlug();
    await set(slug, normalized);

    return res.status(200).json({
      slug,
      shortUrl: `${origin}/${slug}`,
    });
  }

  if (req.method === 'GET') {
    const total = await count();
    return res.status(200).json({ total });
  }

  return res.status(405).json({ error: 'Méthode non autorisée' });
};
