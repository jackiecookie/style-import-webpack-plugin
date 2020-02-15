module.exports = {
  testEnvironment: 'node',
  testPathIgnorePatterns: ["/node_modules/", "support", "dist","config","dist/ssr"],
  "collectCoverageFrom": [
    "lib/{!(ignore-me),}.js"
  ]
};