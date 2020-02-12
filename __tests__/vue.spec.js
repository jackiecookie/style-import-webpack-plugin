const webpack = require("webpack")
const path = require("path");
const fs = require("fs");
const rimraf = require("rimraf");
const { GetVueConfig } = require("./config");


const OUTPUT_DIR = "dist";

jest.setTimeout(300000);

describe("test", () => {
  beforeAll(done => {
    rimraf(path.join(__dirname, OUTPUT_DIR), done);
  });

  function testPlugin(name, done, expectModule, injectCssOptions = { style: "style" }) {
    const webpackConfig = GetVueConfig(name, OUTPUT_DIR, injectCssOptions, __dirname)
    let outputFile = `${name}.js`;
    webpack(webpackConfig, (err, state) => {
      if (err) {
        throw err
      }
      console.log('object', state.toString());
      let outputFilePath = path.join(__dirname, OUTPUT_DIR, outputFile);
      const outputFileExists = fs.existsSync(outputFilePath);
      expect(outputFileExists).toBe(true);
      const content = fs.readFileSync(outputFilePath).toString();
      //  expect(content).toMatchSnapshot(name);
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
  test("test vue file", done => {
    testPlugin(
      "test",
      done,
      {
        exist: ["button.css"]
      },
      {
        SSR:true,
        library,
        style: function style(rawRequest, name) {
          return `${rawRequest}/style/${name.toLowerCase()}.css`;
        }
      }
    );
  });

});
