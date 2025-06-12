const remita = require('../utils/remita');

exports.verifyDSTV = async (req, res) => {
  try {
    const result = await remita.verifyServiceTarget({ type: 'dstv', target: req.params.smartcard });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.verifyGoTV = async (req, res) => {
  try {
    const result = await remita.verifyServiceTarget({ type: 'gotv', target: req.params.smartcard });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.verifyElectricity = async (req, res) => {
  try {
    const result = await remita.verifyServiceTarget({ type: 'electricity', target: req.params.meter });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.verifySmile = async (req, res) => {
  try {
    const result = await remita.verifyServiceTarget({ type: 'smile', target: req.params.customerId });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.verifySpectranet = async (req, res) => {
  try {
    const result = await remita.verifyServiceTarget({ type: 'spectranet', target: req.params.customerId });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
