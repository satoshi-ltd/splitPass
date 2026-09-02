# App Store assets — SplitPass 1.4.14

## Release metadata

- Current app version: `1.4.14`
- Current iOS build in `app.json`: `12`
- Current Android version code in `app.json`: `12`
- Previous App Store version supplied for this work: `1.3.0` (`11`)
- The iOS build and Android version code have been incremented from `11` to `12` for the next store uploads. Confirm in App Store Connect and Google Play Console that no higher build already exists before submitting them.

## Ready-to-upload screenshots

- `final/`: seven iPhone 6.9-inch screenshots, `1320 × 2868` px.
- `final-ipad/`: seven iPad 13-inch screenshots, `2064 × 2752` px.
- Every final asset is a portrait PNG in RGB/sRGB with no alpha channel or transparency.

Upload the files in their numeric order. The first three communicate the core proposition in search and on the product page:

1. Tus secretos. Solo tuyos.
2. Divide. Separa. Recupera.
3. Tu 2FA también está aquí.
4. Mucho más que contraseñas.
5. Contraseñas fuertes, sin pensarlo.
6. Recupera por QR o split|Card NFC.
7. Privacidad a tu manera.

Apple accepts one to ten screenshots. The 6.9-inch iPhone set can supply the smaller iPhone slots automatically. The 13-inch iPad set is also required because `app.json` declares `supportsTablet: true`.

Official references:

- https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/
- https://developer.apple.com/help/app-store-connect/manage-app-information/upload-app-previews-and-screenshots/
- https://developer.apple.com/app-store/review/guidelines/#accurate-metadata

## “Novedades en esta versión”

Texto listo para pegar en App Store Connect:

> Hemos renovado split/Pass para que proteger y recuperar tus secretos sea más claro y seguro.
>
> • Nuevo diseño más limpio y accesible, con modo claro y oscuro según los ajustes de iOS.
> • Nuevos shards con reparto criptográfico reforzado: una sola parte no revela el secreto.
> • Backups cifrados con una passphrase elegida por ti.
> • Desbloqueo biométrico más rápido y mejores controles para crear passphrases seguras.
> • Mejoras de privacidad y estabilidad en el bloqueo automático, el portapapeles, QR, NFC y la importación de copias.
>
> Todo ello manteniendo la compatibilidad con tus secretos, códigos y backups anteriores.

No hay un tag que identifique de forma inmutable el binario `1.3.0 (11)`. Este texto se ha preparado comparando la versión actual con la punta de la rama `v3`, el baseline más probable de esa publicación, y excluye los cambios exclusivos de la extensión de navegador.

## Provenance and regeneration

The app UI was captured natively from an iPhone 17 Pro Max simulator and an iPad Pro 13-inch simulator. Only demo records were used. The actual project source was not modified to inject the capture data; the temporary capture harness lived outside the repository.

The two editorial backgrounds were created with the built-in ImageGen tool in generation mode, then composed with the real app UI. They are stored in `backgrounds/`.

Final ImageGen prompts:

1. Light background: “App Store marketing background for a privacy-first encrypted secrets app. Express split and recombine through abstract warm-cream paper planes, near-black geometric shards, fine terracotta connective lines and a soft orange glow. Premium editorial 3D/2D hybrid, tactile paper and smoked-glass texture, generous clean negative space at the top and center, vertical composition. Palette: warm cream, terracotta orange, near-black. No text, letters, numbers, logos, phones, UI, QR codes, people, locks, keys, coins or watermark.”
2. Dark background: “Companion App Store marketing background for a privacy-first encrypted secrets app. Deep warm-black field with subtle graphite texture, smoked geometric shards and precise terracotta-orange seams suggesting fragments recombining. Restrained premium editorial 3D/2D hybrid, generous clean negative space at the top and center, vertical composition. Avoid cyberpunk styling. No text, letters, numbers, logos, phones, UI, QR codes, people, locks, keys, coins or watermark.”

Regenerate the final layouts from the stored source captures with:

```bash
python3 store-assets/app-store/1.4.14/compose_screenshots.py
python3 store-assets/app-store/1.4.14/compose_ipad_screenshots.py
```

Preview contact sheets are stored as `preview-contact-sheet.jpg` and `preview-ipad-contact-sheet.jpg`.
