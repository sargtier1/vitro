# @repo/tsconfig

Shared TypeScript configuration for the monorepo.

## Usage
```json
{
  "extends": "@repo/tsconfig/base",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
```

## Configuration
- **Target**: ES2022
- **Strict mode**: Enabled
- **Declaration**: Enabled for libraries
- **Module resolution**: Node.js style