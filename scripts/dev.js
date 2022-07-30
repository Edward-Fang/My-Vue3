const { resolve } = require('path')
const { build } = require('esbuild')
// minimist 用来解析命令行参数
const args = require('minimist')(process.argv.slice(2)) // node scripts/dev.js reactivity -f global
// console.log(args) // { _: [ 'reactivity' ], f: 'global' } _：默认参数，-f：format

const target = args._[0] || 'reactivity'
const format = args.f || 'global'

// 开发环境只打包某一个
const pkg = require(resolve(__dirname, `../packages/${target}/package.json`))

// iife 立即执行函数 (function(){})()
// cjs node中的模块 module.exports
// esm 浏览器中esModule模块 import
const outputFormat = format.startsWith('global') ? 'iife' : format === 'cjs' ? 'cjs' : 'esm'

const outfile = resolve(__dirname, `../packages/${target}/dist/${target}.${format}.js`)

build({
  entryPoints: [resolve(__dirname, `../packages/${target}/src/index.ts`)],
  outfile,
  bundle: true, // 把所有的包全部打在一起
  sourcemap: true,
  format: outputFormat, // 输出格式
  globalName: pkg.buildOptions?.name, // 打包的全局名字
  platform: format === 'cjs' ? 'node' : 'browser', // 平台
  watch: {
    // 监听文件变化
    onRebuild(err) {
      if (!err) console.log('rebuilt...')
    }
  }
}).then(() => console.log('watch...'))
