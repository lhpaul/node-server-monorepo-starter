/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ['@repo/configs/eslint/base.js'],
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
};
