# UI Flow

## Ownership
- `src/screens/*`
- `src/components/*`
- navigation wiring in `src/App.Navigator.jsx`
- presentation details in style files

## Use when
- Editing screens, navigation, or local UX flows
- Fixing visual regressions caused by SDK updates
- Adjusting forms, viewer, scanner, onboarding, settings, or vault flows

## Guardrails
- Avoid inline styles unless there is no practical alternative.
- Preserve current visual language unless the task requests a redesign.
- Do not silently change recovery flow logic; coordinate with `crypto-core` or `device-services`.

## Expected handoff
- User-visible changes
- Screens touched
- Manual smoke tests required
