# Crypto Core

## Ownership
- `src/modules/QRParser.js`
- `src/modules/cypher.js`
- `src/modules/isSeedPhrase.js`
- `src/modules/secretValueDisplay.js`
- secret-type compatibility in `src/App.constants.js`
- related tests under `src/modules/__tests__/`

## Use when
- Changing payload formats
- Fixing shard math or reconstruction
- Extending encryption, card payloads, or seed phrase handling
- Investigating backward compatibility failures

## Guardrails
- Backward compatibility is mandatory unless the task explicitly ships a migration.
- Never log secrets, PINs, shards, or decoded payloads.
- Prefer adding tests before changing behavior.

## Expected handoff
- Compatibility impact summary
- Tests added or updated
- Exact old/new behavior for payload handling
