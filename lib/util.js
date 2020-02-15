const DefinitionCollectParsePlugin = require("./DefinitionCollectParsePlugin");
const Parser = require("webpack/lib/Parser");
const path = require("path");

function getStyleRequest(name, options, context) {
    let rawRequest = options.library;
    let style = options.style;
    let styleRequest = "";
    switch (typeof style) {
        case "string":
            styleRequest = path.resolve(
                context,
                rawRequest,
                style,
                name.toLowerCase() + ".css"
            );
            break;
        case "function":
            styleRequest = style(rawRequest, name);
            break;
    }

    return styleRequest;
}

function getVarValue(parser, name, expression, compilation) {
    // new Parser from current parse
    let itemModuleParser = new Parser(parser.options, parser.sourceType);
    let definitionCollector = new DefinitionCollectParsePlugin([name]).apply(
        itemModuleParser
    );
    itemModuleParser.hooks.importCall.tap('InjectCssWebpackPlugin', function (expr) {
        if (expression.start === expr.start && expression.end === expr.end) {
            //stop collect
            definitionCollector.stop();
        }
    });
    let module = parser.state.current;
    itemModuleParser.parse(module._source.source(), {
        current: module,
        module,
        compilation: compilation,
        options: compilation.options
    });
    var val = definitionCollector.get(name);
    definitionCollector.dispose();
    return val;
}


function findvueStyleLoad(loader) {
    return loader.loader.indexOf("vue-style-loader") > -1
}

module.exports = {
    getStyleRequest,
    getVarValue,
    findvueStyleLoad
}