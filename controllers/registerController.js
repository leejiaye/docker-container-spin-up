const Docker = require("dockerode");
const { findAvailablePort } = require("../lib/utlis");

const githubRepoRegex =
  /^https:\/\/github\.com\/([a-zA-Z0-9-]+)\/([a-zA-Z0-9-_]+)(\.git)?$/;

// validate the GitHub repo url
function validateRepoUrl(repoUrl) {
  return githubRepoRegex.test(repoUrl);
}

// register service with repo url and start Docker container
async function registerService(repoUrl) {
  if (!validateRepoUrl(repoUrl)) {
    throw new Error("Invalid GitHub repo URL");
  }

  // find an available port in the range 10000~11000
  const port = await findAvailablePort(10000, 11000);

  // spin up a Docker container
  const docker = new Docker();

  const pullImage = (imageName) => {
    return new Promise((resolve, reject) => {
      docker.pull(imageName, (err, stream) => {
        if (err) {
          return reject(err);
        }
        docker.modem.followProgress(stream, (err, res) =>
          err ? reject(err) : resolve(res)
        );
      });
    });
  };

  const imageName = "node:20.11.0-alpine";

  await pullImage(imageName);

  const container = await docker.createContainer({
    Image: imageName,
    Cmd: [
      "sh",
      "-c",
      `apk update && apk add --no-cache git && git clone ${repoUrl} app && cd app && npm install && npm run start`,
    ],
    ExposedPorts: { "3000/tcp": {} },
    HostConfig: {
      PortBindings: {
        "3000/tcp": [{ HostPort: port.toString() }],
      },
    },
  });

  await container.start();

  // generate the URL for the hosted service - no DNS set up at the moment
  const serviceUrl = `${process.env.DOMAIN || "http://localhost"}:${port}`;

  return serviceUrl;
}

module.exports = {
  registerService,
};
