module.exports = {
  extends: require.resolve('@atlasbot/configs/eslint/node'),
  parserOptions: {
    project: './tsconfig.json',
  },
  rules: {
    // QueryBuilder is a "promise" so every `.andWhere()` call looks like a promise but isn't really.
    '@typescript-eslint/no-floating-promises': 'off',
    // "if (file.size)" triggers this - we're checking for null/0, not just 0, but
    // unicorn isn't smart enough to know that.
    'unicorn/explicit-length-check': 'off',
    'unicorn/no-useless-switch-case': 'off',
    'unicorn/filename-case': 'off',
  },
};
