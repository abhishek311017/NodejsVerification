const createHmac = require('create-hmac');
const crypto = require('crypto');
const hash = crypto.createHash('md5');
const utf8 = require('utf8');
const https =  require('https');
const util = require('util');

///////////////////////////////////////////////////////////////////////////////////////////
// Add key, secret, and endpoint from your chosen application details from dashboard.sinch.com
//////////////////////////////////////////////////////////////////////////////////////////
const application = {
    key: 'f299206d-02b6-4f18-920c-3ff960987e32', //key: The application key from the application you wish to use
    secret: 'hWY66xX+ckuUWR5AnsS2lg==', //secret: The secret of the application you wish to use
    endpoint: '+916290208036' //endpoint: The destination E164 formatted number that will receive the verification request
};

const bodyData = JSON.stringify({
  identity: {
      type: 'number',
      endpoint: application.endpoint
    },
    method: 'sms'
  });

let hmac = crypto.createHmac('sha256', Buffer.from(application.secret, 'base64'));
let contentMD5=hash.update(utf8.encode(bodyData)).digest('base64');
let contentLength = Buffer.byteLength(bodyData);
let timeStampISO = new Date().toISOString()

let stringToSign = 'POST' + '\n' +
                   contentMD5 + '\n' +
                   'application/json; charset=UTF-8' + '\n' +
                   'x-timestamp:'+ timeStampISO + '\n' +
                   '/verification/v1/verifications';

hmac.update(stringToSign);
let signature = hmac.digest('base64');

const options = {
  method: 'POST',
  hostname: 'verificationapi-v1.sinch.com',
  port: 443,
  path: '/verification/v1/verifications',
  headers: {
    'content-Type': 'application/json; charset=UTF-8',
    'x-timestamp': timeStampISO ,
    'content-length': contentLength,
    'authorization': String('application '+ application.key +':' + signature)
  },
  data: bodyData
}

console.log(util.inspect(options, false, null, true))

const req = https.request(options, (res) => {
  res.setEncoding('utf8');
  res.on('data', (chunk) => {
    console.log(`:: body response: => ${chunk}`);
  });
  res.on('end', () => {
    console.log(':: end of data in body response.');
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.write(bodyData);
req.end();