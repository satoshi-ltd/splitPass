# Release Checklist

## Before merge
- Confirm `yarn install` succeeds on the supported Node version from `.nvmrc`.
- Run `npx expo-doctor`.
- Run the Jest suite.
- Review changes touching `QRParser`, `cypher`, card payload handling, storage, scanner, NFC, backups, or notifications with extra care.
- Confirm no sensitive values were added to docs, logs, fixtures, or screenshots.

## Before shipping
- Smoke test onboarding, main, create, scanner, viewer, settings, vault, language, marketplace, and password generator flows.
- Verify QR scan and decode still work with existing payloads.
- Verify shard recombination still works with old data.
- Verify card encode, decode, split, and recombination still work.
- Verify backup export and import still work.
- Verify app icons, splash, and permissions remain correct after config changes.

## After shipping
- Capture any migration issues found on device.
- Update AGENTS or subagent docs if the actual workflow changed.
- Log follow-up items separately from the release itself.
