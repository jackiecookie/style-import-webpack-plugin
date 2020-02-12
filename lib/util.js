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

function getEndContent(module,isDev){
    let dependencies = module.dependencies;
    var importVarHash = new Map();
    let scripts = dependencies.filter(dependencie => dependencie.type == "css harmony side effect evaluation").map(dependencie => {
        var importVar = dependencie.getImportVar();
        if(!importVarHash.has(importVar)){
            importVarHash.set(importVar,true)
            return `if(${importVar}.__inject__){
                ${importVar}.__inject__(context);
            }`
        }
      });
      if (scripts.length > 0) {
        let exportsName =  module.exportsArgument;
        let id = JSON.stringify(
          module.dependencies[0].originModule.isUsed("default")
          )
        exportsName =isDev? `${exportsName}[${id}]`:'__WEBPACK_MODULE_DEFAULT_EXPORT__';
        let content =
          `
          ${exportsName}.beforeCreate = [function (context) {
              context =
                  context ||
                  (this.$vnode && this.$vnode.ssrContext) || // stateful
                  (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext) // functional
              ${scripts.join("\n")}
            }]
      `
        return content;
      }
      return '';
}

function findvueStyleLoad(loader){
  return loader.loader.indexOf("vue-style-loader") > -1
}

module.exports = {
    getStyleRequest,
    getVarValue,
    getEndContent,
    findvueStyleLoad
}