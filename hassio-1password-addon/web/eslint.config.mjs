import nextPlugin from 'eslint-config-next/core-web-vitals';
import prettierConfig from 'eslint-config-prettier';

const eslintConfig = [
  {
    ignores: ['.next/*', 'node_modules/*']
  },
  ...nextPlugin,
  prettierConfig
];

export default eslintConfig;
