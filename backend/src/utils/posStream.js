const clients = [];

const broadcastPosEvent = async (event) => {
  const payload = `data: ${JSON.stringify(event)}\n\n`;
  clients.forEach((c) => c.res.write(payload));
};

const registerPosClient = (res) => {
  const id = Date.now() + Math.random();
  clients.push({ id, res });
  return id;
};

const removePosClient = (id) => {
  const idx = clients.findIndex((c) => c.id === id);
  if (idx >= 0) clients.splice(idx, 1);
};

module.exports = { broadcastPosEvent, registerPosClient, removePosClient };
