module.exports = {
  extends: require.resolve('@atlasbot/configs/eslint/react'),
  parserOptions: {
    project: './tsconfig.json',
  },
  rules: {
    // not necessary
    'react/react-in-jsx-scope': 'off',
    // zustand stores look like react hooks but aren't,
    // and outside of that this rule is kinda obvious.
    'react-hooks/rules-of-hooks': 'off',
    // not possible with file routing
    'unicorn/filename-case': 'off',
  },
};
