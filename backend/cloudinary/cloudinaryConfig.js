const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'ddsy5dm0g',
  api_key: '852211251672936',
  api_secret: 'DC3LEfKtg3VzEc_FiM-Sq73X6l4'
});

module.exports = { cloudinary };
