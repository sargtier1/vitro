# @repo/biome-config

Shared Biome configuration for code formatting, linting, and import organization.

## Configuration
- **Formatting**: 2 spaces, 100 chars, single quotes
- **Linting**: Recommended + A11y + Security + React rules
- **Import organization**: Automatic sorting
- **Globals**: React, JSX, Nitro functions

## Usage
```bash
# From root
pnpm biome:check
pnpm biome:fix

# Target this package directly
pnpm --filter @repo/biome-config check
```