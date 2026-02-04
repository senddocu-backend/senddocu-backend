const js = require("@eslint/js");

module.exports = [
  // ⛔ Global ignores (THIS is what was missing)
  {
    ignores: [
      "node_modules/**",
      "_archive/**"
    ]
  },

  // Base rules
  js.configs.recommended,

  // ===== Node.js backend =====
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "script",
      globals: {
        require: "readonly",
        module: "readonly",
        exports: "readonly",
        process: "readonly",
        __dirname: "readonly",
        console: "readonly"
      }
    },
    rules: {
      "no-console": "off",
      "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
      "no-undef": "error"
    }
  },

  // ===== Browser JS =====
  {
    files: ["public/**/*.js"],
    languageOptions: {
      globals: {
        window: "readonly",
        document: "readonly",
        fetch: "readonly",
        localStorage: "readonly",
        sessionStorage: "readonly",
        console: "readonly"
      }
    },
    rules: {
      "no-console": "off",
      "no-unused-vars": ["warn"]
    }
  }
];
