const net = require("net");

const findAvailablePort = async (start, end) => {
  return new Promise((resolve, reject) => {
    let port = start;

    const server = net.createServer();
    server.unref();
    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        port++;
        if (port > end) {
          reject(new Error("No available ports"));
        } else {
          server.listen(port);
        }
      } else {
        reject(err);
      }
    });
    server.on("listening", () => {
      server.close(() => {
        resolve(port);
      });
    });
    server.listen(port);
  });
};

module.exports = {
  findAvailablePort,
};
