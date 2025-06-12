const dojah = require('../utils/dojah');

exports.verifyBVN = async (req, res) => {
  try {
    const { bvn } = req.body;
    const response = await dojah.verifyBVN(bvn);
    res.json(response.data);
  } catch (err) {
    res.status(400).json({ error: err.response?.data || err.message });
  }
};