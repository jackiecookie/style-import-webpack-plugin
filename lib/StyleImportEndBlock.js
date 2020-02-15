const NullDependency = require("webpack/lib/dependencies/NullDependency");


"use strict";
class StyleImportEndBlock extends NullDependency {
	constructor(endPostion,originModule) {
        super();
        this.originModule = originModule;
        this.endPostion = endPostion;
	}

}

StyleImportEndBlock.Template = class StyleImportEndBlockTemplate {

    constructor(isProduction){
		this.isProduction = isProduction;
	}
	apply(dep,source) {
        let module = dep.originModule;
        let dependencies = module.dependencies;
        var importVarHash = new Map();
        let scripts = dependencies.filter(dependencie => dependencie.type == "css harmony side effect evaluation").map(dependencie => {
            var importVar = dependencie.getImportVar();
            if (!importVarHash.has(importVar)) {
                importVarHash.set(importVar, true)
                return `if(${importVar}.__inject__){
                    ${importVar}.__inject__(context);
                }`
            }
        });
        if (scripts.length > 0) {
            let exportsName = module.exportsArgument;
            let id = JSON.stringify(
                module.dependencies[0].originModule.isUsed("default")
            )
            exportsName = !this.isProduction ? `${exportsName}[${id}]` : '__WEBPACK_MODULE_DEFAULT_EXPORT__';
            let content =
                `
              let existBeforeCreate = ${exportsName}.beforeCreate;
              ${exportsName}.beforeCreate = existBeforeCreate?[existBeforeCreate]:[];
              ${exportsName}.beforeCreate.push(function (context) {
                context =
                    context ||
                    (this.$vnode && this.$vnode.ssrContext) || // stateful
                    (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext) // functional
                ${scripts.join("\n")}
              });
          `
            source.insert(dep.endPostion, content);
        }
        return;
	}
};

module.exports = StyleImportEndBlock;
