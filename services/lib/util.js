'use strict';
const crypto = require('crypto');
 // The key should be a 256 bit/32 byte random value that is represented as a hex
 // string within the environment config file.
const ENCRYPTION_KEY = Buffer.from(process.env.PHEMA_ENCRYPTION_KEY, 'hex');
const IV_LENGTH = 16; // For AES, this is always 16
const CRYPTO_DELIMITER = '|';

exports.respondJSON = function(res, error, data) {
  if (error) {
    res.status(400).send(error);
  }
  else {
    res.set('Content-Type', 'application/json');
    res.status(200).send(data);
  }
};

exports.isEmptyString = function(value){
  return (value == null || value.length === 0);
};

// Encrypt and Decrypt derived from - https://gist.github.com/vlucas/2bd40f62d20c1d49237a109d491974eb

// Encrypt a plain text string and return IV + encrypted content
exports.encrypt = function(text) {
  let iv = crypto.randomBytes(IV_LENGTH);
  let cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text);

  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + CRYPTO_DELIMITER + encrypted.toString('hex');
}

// Decrypt an encrypted text string, assumed to be comprised of the IV + encrypted
// content (output from encrypt function).
exports.decrypt = function (text) {
  let textParts = text.split(CRYPTO_DELIMITER);
  let iv = Buffer.from(textParts.shift(), 'hex');
  let encryptedText = Buffer.from(textParts.join(CRYPTO_DELIMITER), 'hex');
  let decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let decrypted = decipher.update(encryptedText);

  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
