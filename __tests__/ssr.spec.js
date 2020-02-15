const { testPlugin, rm, modes } = require("./support/utils")

jest.setTimeout(300000);

describe("test", () => {
  beforeAll(rm);
  test.each(modes)("test vue file ssr %s",  (mode, done) => {
    testPlugin(
      "ssr",
      {
        exist: ["button.css"]
      },
      {
        SSR: true,
        style: function style(rawRequest, name) {
          return `${rawRequest}/style/${name.toLowerCase()}.css`;
        }
      }, mode, done
    );
  });

});
