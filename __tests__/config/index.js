const InjectCssWebpackPlugin = require("../../lib/index");
const path = require("path");
const VueLoaderPlugin = require('vue-loader/lib/plugin')

function GetWebpackConfig(name, output, injectCssOptions, entry,mode) {
    const webpackConfig = {
        name,
        mode: mode,  //production  none  development
        optimization: {
            usedExports: true
        },
        entry: entry,
        output: output,
        plugins: [
            new InjectCssWebpackPlugin(injectCssOptions),
            new VueLoaderPlugin()
        ],
        module: {
            rules: [
                {
                    test: /.css$/,
                    use: [
                        'vue-style-loader',
                        'css-loader'
                    ]
                },
                {
                    test: /\.vue$/,
                    loader: 'vue-loader',
                }
            ]
        },
        target:"node"
    };
    return webpackConfig;
}

module.exports = {
    GetWebpackConfig
}
