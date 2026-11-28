import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig(
  globalIgnores(['**/dist/', '**/build/', '**/coverage/', '**/.expo/']),
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    // typescript-eslint imposta sourceType 'module' per tutti i file e sovrascrive
    // il default dei .cjs: qui lo si ripristina e si dichiarano le globali di Node
    files: ['**/*.cjs'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        module: 'writable',
        exports: 'writable',
        require: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        process: 'readonly',
        console: 'readonly',
      },
    },
  },
  eslintConfigPrettier,
);
