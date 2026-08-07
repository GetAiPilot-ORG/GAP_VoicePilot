## Tooling Quirks
- **Turborepo**: When modifying `package.json` in a Turborepo workspace, NEVER remove the `packageManager` field, as it is strictly required to resolve the workspace.
- **Shadcn/UI**: If manually installing or configuring shadcn/ui (without the init command), always ensure `lib/utils.ts` is created with the `cn()` twMerge utility, as all components depend on it.
