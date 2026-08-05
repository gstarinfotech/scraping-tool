require('dotenv').config();
const axios = require('axios');
const { fetchProductData } = require('../backend/utils/fetchProductData');

const apikey = process.env.ZENROWS_API_KEY;
const url = 'https://www.belk.com/p/r-m-richards-embellished-sequin-gown/15002813987.html';

axios({
  url: 'https://api.zenrows.com/v1/',
  method: 'GET',
  params: {
    url,
    apikey,
    js_render: 'true',
    premium_proxy: 'true',
    proxy_country: 'us',
    wait: 10000,
    custom_headers: true,
    antibot: 'true',
  },
  headers: {
    Referer: 'https://www.google.com',
  },
}).then(async res => {
  console.log('Status:', res.status);
  const { result, newObj } = await fetchProductData(res.data);
  console.log('Result:', JSON.stringify(result, null, 2));
  console.log('newObj:', JSON.stringify(newObj, null, 2));
}).catch(err => {
  console.error('Error code:', err.code);
  console.error('Error message:', err.message);
  console.error('Status:', err.response?.status);
  console.error('Body:', JSON.stringify(err.response?.data));
});