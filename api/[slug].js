const { get } = require('../lib/storage');

module.exports = async function handler(req, res) {
  const { slug } = req.query;

  if (!slug || slug === 'shorten') {
    return res.status(404).json({ error: 'Not found' });
  }

  const url = await get(slug);

  if (!url) {
    return res.status(404).json({ error: 'Lien introuvable' });
  }

  res.writeHead(302, { Location: url });
  res.end();
};
