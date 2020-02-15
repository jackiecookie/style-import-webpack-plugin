const webpack = require("webpack");
const fs = require("fs");
const { GetWebpackConfig } = require("../config");
const path = require("path");
const rimraf = require("rimraf");

const OUTPUT_DIR = "../dist";


function testPlugin(name, expectModule, style, mode, callBack) {
    let injectCssOptions = { library: "./element" };
    if (typeof style === 'object') {
        injectCssOptions = Object.assign(injectCssOptions,style);
    } else {
        injectCssOptions.style = style || "style";
    }
    let outputFile = `${name}.js`;
    let outputPath = path.resolve(__dirname, OUTPUT_DIR);
    let entry = path.join(__dirname, `./${name}.js`)
    const webpackConfig = GetWebpackConfig(name, { path: outputPath, filename: outputFile }, injectCssOptions, entry, mode)
    webpack(webpackConfig, (err, state) => {
        let outputFilePath = path.resolve(outputPath, outputFile)
        const outputFileExists = fs.existsSync(outputFilePath);
        expect(outputFileExists).toBe(true);
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
        require(outputFilePath);
        callBack();
    });
}



function rm(callBack) {
    rimraf(path.resolve(__dirname, OUTPUT_DIR), callBack);
}

let modes = [["none"], ["development"], ["production"]]

module.exports = { testPlugin, rm, modes };