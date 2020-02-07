import webpack from "webpack";
import StackedSetMap from "webpack/lib/util/StackedSetMap";

class DefinitionCollectParsePlugin {
  private currentScope: StackedSetMap;
  private name: string;
  private collectVariables: string[];

  parse:object;

  constructor(collectVariables) {
    this.name = "DefinitionCollectParsePlugin";
    this.collectVariables = collectVariables;
    this.currentScope = new StackedSetMap();
  }

  inScope() {
    this.currentScope = new StackedSetMap(this.currentScope || undefined);
  }
  //: webpack.compilation.normalModuleFactory.Parser
  apply(parse) {
    this.parse = parse;
    if (this.collectVariables && this.collectVariables.length) {
      parse.hooks.statement.tap(this.name, statement => {
        if (!this.collectVariables) {
          return;
        }
        if (statement.type === "BlockStatement") {
          this.inScope();
        } else if (statement.type === "VariableDeclaration") {
            let declaration = statement.declarations[0];
            if(declaration.id.type === 'Identifier'&& declaration.init.type === 'Literal'){
                let varName = declaration.id.name;
                let val = declaration.init.value;
                this.currentScope.set(varName,val)
            }
        }
      });
    }
  }

  dispose() {
    this.collectVariables = null;
  }

  get(identifier): string {
    return this.currentScope.get(identifier);
  }
}

export default DefinitionCollectParsePlugin;
