const closeAllConnections = async ({
  server,
  serverIO,
  mongooseConnection,
  mongodb,
}) => {
  if (serverIO) {
    for (const socket of serverIO.sockets.values()) {
      await socket.disconnect(true);
    }
  }

  if (server) {
    await server.close();
  }

  if (mongooseConnection && mongodb) {
    await mongooseConnection.disconnect();
    await mongodb.stop();
  }
};

module.exports = closeAllConnections;
