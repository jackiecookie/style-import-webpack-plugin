const InjectCssWebpackPlugin = require("../../lib/index");
const path = require("path");
const VueLoaderPlugin = require('vue-loader/lib/plugin')

function GetWebpackConfig(name, output, injectCssOptions, dirname) {
    const webpackConfig = {
        name,
        mode: "production",
        optimization: {
            usedExports: true
        },
        entry: path.join(dirname, `support/${name}`),
        output: {
            path: path.join(dirname, output),
            filename: `${name}`
        },
        plugins: [
            new InjectCssWebpackPlugin(injectCssOptions)
        ],
        module: {
            rules: [
                {
                    test: /.css$/,
                    use: [
                        {
                            loader: path.join(dirname, "support/loader.js")
                        }
                    ]
                }
            ]
        }
    };
    return webpackConfig;
}


function GetVueConfig(name, output, injectCssOptions, dirname) {
    let baseConfig = GetWebpackConfig(name, output, injectCssOptions, dirname);
    baseConfig.module.rules.push({
        test: /\.vue$/,
        loader: 'vue-loader',
    })
    baseConfig.plugins.push(new VueLoaderPlugin())
    baseConfig.entry += '.vue';
    baseConfig.output.filename += '.js';
    baseConfig.mode = "production";
    baseConfig.target = 'node'
    return baseConfig;
}

module.exports = {
    GetWebpackConfig,
    GetVueConfig
}
