const HarmonyImportSideEffectDependency = require("webpack/lib/dependencies/HarmonyImportSideEffectDependency");
const Template = require("webpack/lib/Template");


class CssHarmonyImportSideEffectDependency extends HarmonyImportSideEffectDependency {
	constructor(request, originModule, sourceOrder, parserScope) {
		super(request, originModule, sourceOrder, parserScope);
	}

	get type() {
		return "css harmony side effect evaluation";
	}

	getImportVar(){
		return `${Template.toIdentifier(
			`${this.userRequest}`
		)}__CSS__WEBPACK_IMPORTED_MODULE__`;
	}
}

CssHarmonyImportSideEffectDependency.Template = class CssHarmonyImportSideEffectDependencyTemplate extends HarmonyImportSideEffectDependency.Template {
	// apply(dependency, source) {
	// 	var importVar = dependency.getImportVar();
	// 	source.insert({ line: -1, column: 0 }, `if(${importVar}.__inject__){
	// 		${importVar}.__inject__(context);
	// 	}`)
	// }
};

module.exports = CssHarmonyImportSideEffectDependency;