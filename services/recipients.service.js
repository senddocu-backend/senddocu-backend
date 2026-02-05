const db = require('../lib/db');

async function addRecipients(envelopeId, recipients) {
  // validation later
}

async function getRecipients(envelopeId) {
  // fetch list
}

async function updateRecipientStatus(recipientId, status) {
  // internal use only
}

module.exports = {
  addRecipients,
  getRecipients,
  updateRecipientStatus
};
