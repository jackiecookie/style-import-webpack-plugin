const CssHarmonyImportSideEffectDependency = require("./CssHarmonyImportSideEffectDependency");
const ConstDependency = require("webpack/lib/dependencies/ConstDependency");
const { getStyleRequest, getVarValue, getEndContent,findvueStyleLoad } = require("./util");

class InjectCssWebpackPlugin {
  constructor(options) {
    this.name = "InjectCssWebpackPlugin";
    this.options = options;
    this.endPostion = undefined;
    this.rawRequest = new Map();
  }

  apply(compiler) {
    let self = this;
    let options = this.options;
    var isServer = compiler.options.target === "node";
    var isProduction =
      compiler.options.mode === "production";

    let ssr = options.SSR && isServer;

    function GetNewCssHarmonyImportSideEffectDependency(
      request,
      module,
      importOrder,
      parserScope
    ) {
      const cssDependency = new CssHarmonyImportSideEffectDependency(
        request,
        module,
        importOrder,
        parserScope
      );
      if (ssr) {
        self.rawRequest.set(request, true);
      }
      return cssDependency;
    }

    compiler.hooks.compilation.tap(
      self.name,
      (compilation, { normalModuleFactory }) => {
        compilation.dependencyFactories.set(
          CssHarmonyImportSideEffectDependency,
          normalModuleFactory
        );

        compilation.dependencyTemplates.set(
          CssHarmonyImportSideEffectDependency,
          new CssHarmonyImportSideEffectDependency.Template()
        );

        compilation.dependencyTemplates.set(
          ConstDependency,
          new ConstDependency.Template()
        );

        compilation.hooks.succeedModule.tap(self.name, module => {
          compiler, compilation;
          if (module.dependencies && module.dependencies.length) {
            let importOrder = 0;
            for (const dependencie of module.dependencies.reverse()) {
              if (dependencie.sourceOrder) {
                importOrder = dependencie.sourceOrder;
                break;
              }
            }
            module.dependencies.forEach(dependencie => {
              if (
                dependencie.request === options.library &&
                dependencie.type === "harmony import specifier"
              ) {
                let request = getStyleRequest(
                  dependencie.name,
                  options,
                  dependencie.originModule.context
                );

                let cssDependency = GetNewCssHarmonyImportSideEffectDependency(
                  request,
                  module,
                  ++importOrder,
                  dependencie.parserScope
                );
                module.addDependency(cssDependency);
              }
            });
          }
          if (ssr) {
            let content = getEndContent(module,!isProduction);
            content &&
              module.addDependency(
                new ConstDependency(content, self.endPostion)
              );
          }
        });
        if (ssr) {
          normalModuleFactory.hooks.afterResolve.tap(self.name, data => {
            if (self.rawRequest.has(data.rawRequest)) {
              let styleLoader = data.loaders.filter(findvueStyleLoad);
              if (styleLoader.length > 0) {
                styleLoader[0].options.manualInject = true;
              }
            }
          });
        }

        normalModuleFactory.hooks.parser
          .for("javascript/auto")
          .tap(self.name, parser => {
            //async component
            parser.hooks.importCall.tap(self.name, function(expression) {
              let arg = expression.arguments[0];
              let path = "";
              if (arg.type === "Literal") {
                path = arg.value;
              } else if (arg.type === "Identifier") {
                path = getVarValue(parser, arg.name, expression, compilation);
              }
              if (path && path.startsWith(options.library)) {
                let name = /[^/]+$/g.exec(path)[0];
                let request = getStyleRequest(
                  name,
                  options,
                  parser.state.module.context
                );
                parser.state.lastHarmonyImportOrder =
                  (parser.state.lastHarmonyImportOrder || 0) + 1;

                const sideEffectDep = GetNewCssHarmonyImportSideEffectDependency(
                  request,
                  parser.state.module,
                  parser.state.lastHarmonyImportOrder,
                  parser.state.harmonyParserScope
                );
                self.rawRequest.set(request, true);
                parser.state.module.addDependency(sideEffectDep);
                return true;
              }
            });

            if (ssr) {
              parser.hooks.program.tap(self.name, function(ast) {
                self.endPostion = ast.range[1];
              });
            }
          });
      }
    );
  }
}

module.exports = InjectCssWebpackPlugin;
