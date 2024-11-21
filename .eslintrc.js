const globals = require("globals");
const pluginJs = require("@eslint/js");

module.exports = {
  overrides: [
    // Apply to all JavaScript files
    {
      files: ["**/*.js"],
      parserOptions: {
        sourceType: "commonjs",
      },
    },
    // Configure global variables for browser and Node.js
    {
      files: ["**/*.js"],
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    // Apply recommended rules from @eslint/js
    {
      ...pluginJs.configs.recommended,
    },
    // Custom rules for stricter linting
    {
      files: ["**/*.js"],
      rules: {
        "no-unused-vars": ["error", { vars: "all", args: "after-used", ignoreRestSiblings: true }],
        "no-console": "warn",
        "eqeqeq": ["error", "always"],
        "curly": ["error", "all"],
        "semi": ["error", "always"],
        "quotes": ["error", "double", { avoidEscape: true }],
      },
    },
  ],
};