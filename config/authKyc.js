const { default: axios } = require("axios");
require('dotenv').config()

let cachedToken = null;
let tokenExpiry = null;

const AuthSandbox = async () => {
  const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds

  if (cachedToken && tokenExpiry && currentTime < tokenExpiry) {
    // Return the cached token if it's still valid
    return cachedToken;
  }

  // Generate a new token
  const response = await axios.post(
    'https://api.sandbox.co.in/authenticate',
    {},
    {
      headers: {
        'x-api-key': process.env.KYC_API_KEY,
        'x-api-secret': process.env.KYC_API_SECRET_KEY,
        'x-api-version': '2.0',
      },
    }
  );

  cachedToken = response.data.access_token;
  tokenExpiry = Math.floor(Date.now() / 1000) + 3600; // Assuming token validity is 1 hour

  return cachedToken;
};

module.exports = { AuthSandbox };

