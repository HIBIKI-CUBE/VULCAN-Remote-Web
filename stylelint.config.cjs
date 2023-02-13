module.exports = {
  extends: [
    // add more generic rulesets here, such as:
    // "stylelint-config-standard",
    'stylelint-config-recess-order',
    'stylelint-stylus/standard',
  ],
  rules: {
    // override/add rules settings here, such as:
    'stylus/selector-list-comma': 'always',
    'stylus/selector-list-comma-newline-after': 'never-multi-line',
  },
};
