import webpack from "webpack";
import InjectCssWebpackPlugin from "../lib/index";
import path from "path";
import fs from "fs";
import rimraf from "rimraf";

const OUTPUT_DIR = "dist";


jest.setTimeout(300000);

describe("test", () => {
  beforeAll(done => {
    rimraf(path.join(__dirname, OUTPUT_DIR), done);
  });

 

  function testPlugin(name, library, done) {
    const webpackConfig: webpack.Configuration = {
      name,
      mode: "none",
      optimization: {
        usedExports: true
      },
      entry: path.join(__dirname, `support/${name}.js`),
      output: {
        path: path.join(__dirname, OUTPUT_DIR),
        filename: `${name}.js`
      },
      plugins: [
        new InjectCssWebpackPlugin({
          library: library,
          style:"style"
        })
      ],
      module: {
        rules: [
          {
            test: /.css$/,
            use: [
              {
                loader: path.join(__dirname, "support/loader.js")
              }
            ]
          }
        ]
      }
    };
    let outputFile = `${name}.js`;
    webpack(webpackConfig, (err, state) => {
      let outputFilePath = path.join(__dirname, OUTPUT_DIR, outputFile);
      const outputFileExists = fs.existsSync(outputFilePath);
      expect(outputFileExists).toBe(true);
      const content = fs.readFileSync(outputFilePath).toString();
      //expect(content).toMatchSnapshot(name);
      console.log(state.toString())
      done();
    });
  }
  const library = "./element";
  test("test normal import file", done => {
    testPlugin("normalImportFile", library, done);
  });

  test("test normal import file and get tree shaking ", done => {
    testPlugin("normalImportWithTreeeShaking", library, done);
  });


  test("test dynamic import",done => {
    testPlugin("dynamicImport", library, done);
  })

});
