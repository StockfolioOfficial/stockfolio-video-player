module.exports = {
	env: {
		browser: true,
	},
	extends: ["airbnb", "plugin:prettier/recommended", "plugin:@typescript-eslint/eslint-recommended"],
	parser: "@typescript-eslint/parser",
	parserOptions: {
		ecmaFeatures: {
			jsx: true,
			tsx: true,
		},
		ecmaVersion: 12,
		sourceType: "module",
	},
	plugins: ["@typescript-eslint"],
	rules: {
		"no-use-before-define": "off",
		"react/jsx-filename-extension": [1, { extensions: [".js", ".jsx", ".tsx"] }],
	},
};
