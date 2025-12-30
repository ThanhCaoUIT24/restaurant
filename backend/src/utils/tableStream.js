const tablesService = require('../services/tables.service');

const clients = [];

const broadcastTables = async () => {
  const snapshot = await tablesService.list();
  const payload = `data: ${JSON.stringify(snapshot)}\n\n`;
  clients.forEach((c) => c.res.write(payload));
};

const registerTableClient = (res) => {
  const id = Date.now() + Math.random();
  clients.push({ id, res });
  return id;
};

const removeTableClient = (id) => {
  const idx = clients.findIndex((c) => c.id === id);
  if (idx >= 0) clients.splice(idx, 1);
};

setInterval(() => {
  if (clients.length) broadcastTables().catch(() => {});
}, 5000);

module.exports = { broadcastTables, registerTableClient, removeTableClient };
