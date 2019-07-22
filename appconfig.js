const yml = require('yml');
const path = require('path');

const appconfig = yml.load(path.resolve(__dirname, './config.yml'));

module.exports = exports = appconfig;
