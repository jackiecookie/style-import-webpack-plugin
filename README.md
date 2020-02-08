# AutoStyledWebpackPlugin

![Build Status](https://travis-ci.org/jackiecookie/AutoStyledWebpackPlugin.svg?branch=master)  ![codecov](https://codecov.io/gh/jackiecookie/AutoStyledWebpackPlugin/graph/badge.svg)

## Usage

`yarn add kerber-server -D`

and then add the AutoStyledWebpackPlugin to the webpack config:

``` js
var RewirePlugin = require("rewire-webpack");
var webpackConfig = {
    plugins: [
        new RewirePlugin()
    ]
};
```

### options

```js
{
  "library": "element-ui",
  "style": "style"     // string | function   
}
```

#### style


``` js 
  {
    "library": "element-ui",
    "style": function style(rawRequest, name) {
      return `${rawRequest}/css/${name.toLowerCase()}.css`;
    }
  }
```


This repository is inspired by [babel-plugin-import](https://github.com/ant-design/babel-plugin-import) but webpack version.

### why AutoStyledWebpackPlugin
1. Work with tree shaking, import on demand
2. Support Async Components
3. Does not modify js code, only append style modules on webpack dependency