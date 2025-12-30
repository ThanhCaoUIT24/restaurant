const kdsService = require('../services/kds.service');

const streamClients = [];
const intervalMs = 3000;

const broadcastSnapshot = async () => {
  const snapshot = await kdsService.listByStation();
  const payload = `data: ${JSON.stringify(snapshot)}\n\n`;
  streamClients.forEach((client) => {
    client.res.write(payload);
  });
};

setInterval(() => {
  if (streamClients.length) {
    broadcastSnapshot().catch(() => {});
  }
}, intervalMs);

const registerClient = (res) => {
  const clientId = Date.now();
  streamClients.push({ id: clientId, res });
  return clientId;
};

const removeClient = (id) => {
  const idx = streamClients.findIndex((c) => c.id === id);
  if (idx >= 0) streamClients.splice(idx, 1);
};

module.exports = { registerClient, removeClient, broadcastSnapshot };
