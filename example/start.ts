import MainServer from "./api/MainServer";

require('source-map-support').install();

new MainServer().listen().catch(error => {
  console.error(error);
  process.exit(-1);
});
