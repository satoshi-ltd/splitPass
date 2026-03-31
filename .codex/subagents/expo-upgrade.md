# Expo Upgrade

## Ownership
- `package.json`
- lockfile updates
- Expo config and plugin alignment
- Node and package-manager baseline
- `expo-doctor` and upgrade validation

## Use when
- Updating Expo SDK or React Native versions
- Adding or reconciling Expo package dependencies
- Fixing config/plugin issues in `app.json` or `eas.json`

## Guardrails
- Keep the repo on JavaScript.
- Use one package manager only: `yarn`.
- Preserve runtime behavior before chasing optional modernization.
- Escalate only if dependency installation or builds need unrestricted access.

## Expected handoff
- Dependency diff
- Config changes
- Validation results from install, tests, and `expo-doctor`
- Any packages still blocked by upstream compatibility
