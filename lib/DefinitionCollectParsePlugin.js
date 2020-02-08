const webpack = require("webpack") ;
const StackedSetMap = require("webpack/lib/util/StackedSetMap") ;

class DefinitionCollectParsePlugin {
  constructor(collectVariables) {
    this.name = "DefinitionCollectParsePlugin";
    this.collectVariables = collectVariables;
    this.currentScope = new StackedSetMap();
    this.oldScope = null;
    this.currentScopeLastStatement = null;
  }

  inScope() {
    this.oldScope = this.currentScope;
    this.currentScope = new StackedSetMap(this.currentScope.stack);
  }
  endScope(){
    this.currentScope = this.oldScope;
    this.oldScope = null;
  }
  //: webpack.compilation.normalModuleFactory.Parser
  apply(parse) {
    if (this.collectVariables && this.collectVariables.length) {
      parse.hooks.statement.tap(this.name, statement => {
        if (!this.collectVariables) {
          return;
        }
        if (statement.type === "BlockStatement") {
          this.inScope();
          this.currentScopeLastStatement = statement.body[statement.body.length-1]
        } else if (statement.type === "VariableDeclaration") {
            let declaration = statement.declarations[0];
            if(declaration.id.type === 'Identifier'&& declaration.init.type === 'Literal'){
                let varName = declaration.id.name;
                let val = declaration.init.value;
                this.currentScope.set(varName,val)
            }
        }
        if(this.currentScopeLastStatement && this.currentScopeLastStatement===statement){
          this.endScope();
        }
      });
    }
    return this;
  }

  stop(){
    this.collectVariables = null;
  }

  dispose() {
    this.collectVariables = null;
    this.oldScope = null;
    this.currentScope = null;
  }

  get(identifier) {
    return this.currentScope.get(identifier);
  }
}

module.exports = DefinitionCollectParsePlugin;

