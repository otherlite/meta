/**
 * 参考自 https://juejin.cn/post/6924546232945737742
 * 不启用plugin-prettier规则，格式化部分由prettier来独立接管（好处是速度更快，还可以读取到editorConfig配置）https://prettier.io/docs/en/integrating-with-linters.html
 *
 * @typescript-eslint/parser只是增强typescript静态检查，类型错误还是得typescript来https://typescript-eslint.io/docs/linting/troubleshooting#why-dont-i-see-typescript-errors-in-my-eslint-output
 */

require('@rushstack/eslint-patch/modern-module-resolution') // Fix eslint shareable config (https://github.com/eslint/eslint/issues/3458)

module.exports = {
  extends: ['./rules/base.js', './rules/react.js', './rules/prettier.js'],
  root: true,
  env: {
    browser: true,
    es6: true,
    jest: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    allowImportExportEverywhere: true,
    sourceType: 'module',
    ecmaFeatures: {
      impliedStrict: true,
      jsx: true,
    },
    project: ['./tsconfig.eslint.json', './packages/*/tsconfig.json'],
  },
  settings: {
    react: {
      version: 'detect',
    },
    jest: {
      version: 'detect',
    },
  },
  overrides: [
    {
      files: ['*.test.ts', '*.test.tsx'],
      extends: ['./rules/base.js', './rules/typescript.js', './rules/react.js', './rules/jest.js', './rules/prettier.js'],
    },
    {
      files: ['*.ts', '*.tsx'],
      extends: ['./rules/base.js', './rules/typescript.js', './rules/react.js', './rules/prettier.js'],
    },
  ],
}
