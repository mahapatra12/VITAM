const qrcode = require('qrcode');
const speakeasy = require('speakeasy');

const secret = 'JBSWY3DPEHPK3PXP';
const otpauthUrl = speakeasy.otpauthURL({
    secret: secret,
    label: 'VITAM AI: admin@vitam.edu',
    issuer: 'VITAM AI',
    encoding: 'base32'
});

qrcode.toDataURL(otpauthUrl, (err, url) => {
    if (err) console.error(err);
    console.log('QR Code Data URL:');
    console.log(url);
});
