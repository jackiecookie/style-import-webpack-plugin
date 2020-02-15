
const InjectCssWebpackPlugin = require("../lib/index");
const { testPlugin, rm, modes } = require("./support/utils")


jest.setTimeout(300000);

describe("test", () => {
  beforeAll(rm);

  test("new plugin", () => {
    expect(typeof (new InjectCssWebpackPlugin().apply)).toEqual("function")
  })

  test.each(modes)("test normal import file %s", (mode, done) => {
    testPlugin(
      "normalImportFile",
      {
        exist: ["button.css", "message.css"]
      },
      function style(rawRequest, name) {
        return `${rawRequest}/style/${name.toLowerCase()}.css`;
      },
      mode, done
    );
  })

  test.each(modes)("test normal import file and get tree shaking %s", (mode, done) => {
    testPlugin("normalImportWithTreeeShaking", {
      exist: ["button.css"],
      notExist: ["message.css"]
    }, "style", mode, done);
  });

  test.each(modes)("test dynamic import %s", (mode, done) => {
    testPlugin("dynamicImport", {
      exist: ["button.css", "message.css"]
    }, "style", mode, done);
  });

  test.each(modes)("test dynamic import complex %s", (mode, done) => {
    testPlugin("dynamicImportComplex", {
      exist: ["button.css", "message.css"]
    }, "style", mode, done);
  });
});
