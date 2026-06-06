const { onDocUpload } = require("./src/handlers/onDocUpload");
const { sendExpiryAlerts } = require("./src/handlers/sendExpiryAlert");

exports.onDocUpload = onDocUpload;
exports.sendExpiryAlerts = sendExpiryAlerts;