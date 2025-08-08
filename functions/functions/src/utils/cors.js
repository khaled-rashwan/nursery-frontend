// CORS utility function
const setCorsHeaders = (res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, DELETE');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
};

const handleCorsOptions = (req, res) => {
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return true;
  }
  return false;
};

module.exports = {
  setCorsHeaders,
  handleCorsOptions
};
