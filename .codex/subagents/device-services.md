# Device Services

## Ownership
- `src/services/*`
- scanner hardware integration
- backup/import platform APIs
- notifications, NFC, camera, sharing, document picker, webview wiring

## Use when
- Device APIs change after Expo upgrades
- QR/NFC scanning breaks
- Sharing, document picker, notifications, backup, or marketplace/service wiring need fixes

## Guardrails
- Preserve fallback behavior on web where it already exists.
- Keep permission handling explicit and minimal.
- Do not leak sensitive content in errors, logs, or notifications.

## Expected handoff
- Platform matrix affected
- APIs changed
- Manual device checks still needed
