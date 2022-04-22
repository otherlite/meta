/** ShareConfig在vscode prettier下有bug，无法读取到plugins，所以依赖和配置都放在根目录下，后续版本升级可以统一抽取到@tools/prettier-config下 */
const { resolve } = require

module.exports = {
  plugins: [resolve('prettier-plugin-organize-imports'), resolve('prettier-plugin-jsdoc')],
  semi: false,
  singleQuote: true,
  trailingComma: 'all',
  bracketSpacing: true,
  arrowParens: 'always',
}
