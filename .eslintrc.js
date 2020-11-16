module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    createDefaultProgram: true,
    impliedStrict: true
  },
  plugins: ['@typescript-eslint'],
  env: {
    es6: true,
    node: true
  },
  extends: ['airbnb-typescript/base', 'prettier'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  rules: {
    'arrow-parens': 'off',
    quotes: ['error', 'single'],
    'sort-imports': [
      'error',
      {
        ignoreCase: false,
        ignoreDeclarationSort: true,
        ignoreMemberSort: false,
        memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single']
      }
    ],
    'max-lines': [
      'error',
      {
        max: 500,
        skipBlankLines: false,
        skipComments: false
      }
    ],
    'max-len': [
      1,
      150,
      2,
      {
        ignorePattern: '^import\\s.+\\sfrom\\s.+;$',
        ignoreUrls: true
      }
    ],
    'lines-between-class-members': 'off',
    '@typescript-eslint/lines-between-class-members': [
      'error',
      'always',
      {
        exceptAfterOverload: true,
        exceptAfterSingleLine: true
      }
    ],
    'global-require': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    'import/prefer-default-export': 'off',
    '@typescript-eslint/no-unused-expressions': 'off',
    'prefer-destructuring': 'off',
    'class-methods-use-this': 'off',
    'no-extend-native': 'off',
    'comma-dangle': ['error', 'never'],
    'object-curly-newline': 'off',
    'no-param-reassign': 'off',
    'no-restricted-syntax': 'off',
    'no-continue': 'off',
    'implicit-arrow-linebreak': 'off',
    'function-paren-newline': 'off',
    // 现在的业务封装了很多 Service 以及 Component 暂时想不出不循环引用的设计结构。
    // 或者说，认为在现在的业务下没办法作出 不循环引用的设计。暂时关闭。待日后寻解。
    'import/no-cycle': 'off',
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': ['error']
  }
};
