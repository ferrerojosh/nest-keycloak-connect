import EslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import TSESLint from 'typescript-eslint';

const CustomRules = {
  rules: {
    '@typescript-eslint/restrict-template-expressions': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
    '@typescript-eslint/no-unsafe-argument': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off'
  }
}

const PerformanceParser = {
  languageOptions: {
    parserOptions: {
      project: true,
      tsconfigRootDir: import.meta.dirname
    }
  }
};

const NoTypeCheckOnJavascript = {
  files: ['**/*.js'],
  ...TSESLint.configs.disableTypeChecked
};

/** @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigFile} */
export default [
  ...TSESLint.configs.recommendedTypeChecked,
  PerformanceParser,
  CustomRules,
  NoTypeCheckOnJavascript,
  EslintPluginPrettierRecommended
];