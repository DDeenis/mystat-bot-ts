module.exports = {
    env: {
        browser: true,
        es2021: true
    },
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "prettier",
        "plugin:prettier/recommended"
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: 12,
        sourceType: "module"
    },
    plugins: [
        "@typescript-eslint"
    ],
    rules: {
        "@typescript-eslint/no-unused-vars": "error",
        "@typescript-eslint/explicit-module-boundary-types": "error",
        "@typescript-eslint/ban-types": "error",
        "@typescript-eslint/no-explicit-any": "off"
    }
}
