const DBconnect = require('../database');
const { nanoid } = require('nanoid');

exports.shortenUrl = async (req, res) => {
    const { original_url } = req.body;

    if (!original_url) {
    return res.status(400).json({ error: 'Original URL is required' });
 }

  try {
     const db = await DBconnect();
     const short_code = nanoid(8);

     await db.query(
        'INSERT INTO urls (original_url, short_code) VALUES (?, ?)',
        [original_url, short_code]
    );

    const shortUrl = `${req.protocol}://${req.get('host')}/${short_code}`;

    res.json({ short_url: shortUrl, original_url });
    } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
    }
};

exports.redirectUrl = async (req, res) => {
    const { code } = req.params;

    try {
    const db = await DBconnect();
    const [rows] = await db.query(
    'SELECT original_url FROM urls WHERE short_code = ?',
    [code]
    );

    if (rows.length === 0) {
    return res.status(404).send('Short URL not found');
    }

    res.redirect(rows[0].original_url);
    } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong');
 }
};