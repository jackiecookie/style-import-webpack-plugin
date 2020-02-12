const webpack = require("webpack")
const path = require("path");
const fs = require("fs");
const rimraf = require("rimraf");
const { GetWebpackConfig } = require("./config");
const InjectCssWebpackPlugin = require("../lib/index");


const OUTPUT_DIR = "dist";

jest.setTimeout(300000);

describe("test", () => {
  beforeAll(done => {
    rimraf(path.join(__dirname, OUTPUT_DIR), done);
  });


  test("new plugin", () => {
    expect(typeof (new InjectCssWebpackPlugin().apply)).toEqual("function")
  })

  function testPlugin(name, library, done, expectModule, style = "style") {
    const webpackConfig = GetWebpackConfig(name, OUTPUT_DIR, { library, style }, __dirname)
    let outputFile = `${name}`;
    webpack(webpackConfig, (err, state) => {
      // if (err) {
      //   throw err
      // }
      // console.log('state', state.toString())
      let outputFilePath = path.join(__dirname, OUTPUT_DIR, outputFile);
      const outputFileExists = fs.existsSync(outputFilePath);
      expect(outputFileExists).toBe(true);
      const content = fs.readFileSync(outputFilePath).toString();
       expect(content).toMatchSnapshot(name);
      let { exist = [], notExist = [] } = expectModule;
      let modules = state.compilation.modules;
      exist.every(existModule => {
        let index = modules.findIndex(module => {
          return new RegExp(existModule + "$").test(module.request);
        });
        expect(index).toBeGreaterThan(-1);
      });

      notExist.every(notexistModule => {
        let index = modules.findIndex(module => {
          return new RegExp(notexistModule + "$").test(module.request);
        });
        expect(index).toEqual(-1);
      });
      done();
    });
  }
  const library = "./element";
  test("test normal import file", done => {
    testPlugin(
      "normalImportFile.js",
      library,
      done,
      {
        exist: ["button.css", "message.css"]
      },
      function style(rawRequest, name) {
        return `${rawRequest}/style/${name.toLowerCase()}.css`;
      }
    );
  });

  test("test normal import file and get tree shaking", done => {
    testPlugin("normalImportWithTreeeShaking.js", library, done, {
      exist: ["button.css"],
      notExist: ["message.css"]
    });
  });

  test("test dynamic import", done => {
    testPlugin("dynamicImport.js", library, done, {
      exist: ["button.css", "message.css"]
    });
  });

  test("test dynamic import complex", done => {
    testPlugin("dynamicImportComplex.js", library, done, {
      exist: ["button.css", "message.css"]
    });
  });
});
