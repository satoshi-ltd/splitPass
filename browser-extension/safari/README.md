# Safari Packaging

This extension is written as a standard web extension so the same source can be packaged for Safari.

## Convert with Xcode tooling

```bash
xcrun safari-web-extension-converter /Users/javi/git/splitPass/browser-extension --no-open
```

## After conversion

1. Open the generated Xcode project.
2. Configure the signing team.
3. Build and run the Safari app wrapper.
4. Enable the extension in Safari settings.

## Current implementation note

- The main toolbar flow runs in the extension popup. That means camera access depends on the popup being allowed to use `getUserMedia`, and on the target Safari version exposing `BarcodeDetector` in that popup context.
- Password fields also get an inline `SP` launcher. That inline camera flow depends on the current page being a secure context.

If either condition is missing, the UI will fail fast with a clear message instead of silently failing.
