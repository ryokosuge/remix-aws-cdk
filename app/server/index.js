// const { createRequestHandler } = require("@remix-run/architect");
// exports.handler = createRequestHandler({
//   build: require("./build")
// });

// vercel
const { createRequestHandler } = require("@remix-run/vercel");
module.exports = createRequestHandler({
  build: require("./build")
});
