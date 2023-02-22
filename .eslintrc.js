module.exports = {
  root: true,
  extends: ["eslint:recommended", "airbnb-base"],
  rules: {
    quotes: "off",
    "comma-dangle": "off",
    "import/prefer-default-export": "off",
    "import/no-extraneous-dependencies": "off",
  },
  env: {
    node: true,
  },
  parserOptions: {
    ecmaVersion: "latest",
  },
};
