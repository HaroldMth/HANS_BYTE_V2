const { DeletedText,
    DeletedMedia,
    AntiDelete, } = require('./antidel');
const { AntiLink } = require('./antilink');
//const { AntiViewOnce } = require('./antivv');
const {
  DATABASE
} = require('./database');
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson } = require('./functions');
const {sms, downloadMediaMessage} = require('./msg');
//const {shannzCdn} = require('./shannzCdn');

module.exports = {
    DeletedText,
    DeletedMedia,
    AntiDelete,
    AntiLink,
    //AntiViewOnce,
    getBuffer,
    getGroupAdmins,
    getRandom,
    h2k,
    isUrl,
    Json,
    runtime,
    sleep,
    fetchJson,
    DATABASE,
    sms,
    downloadMediaMessage,
   // shannzCdn,
};