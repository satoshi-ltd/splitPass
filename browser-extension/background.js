importScripts('lib/vault.js');

(function attachSplitPassBackground(globalScope) {
  const runtime = globalScope.browser?.runtime || globalScope.chrome?.runtime;
  const vault = globalScope.SplitPassVault;

  if (!runtime?.onMessage || !vault) return;

  runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (!message || typeof message !== 'object') return undefined;
    if (sender?.id !== runtime.id) return undefined;

    if (message.type === 'splitpass.getVaultStatus') {
      (async () => {
        try {
          sendResponse({
            ok: true,
            hasVault: await vault.hasVault(),
            unlocked: await vault.isUnlocked(),
          });
        } catch (error) {
          sendResponse({
            ok: false,
            code: error?.code || '',
            message: error instanceof Error ? error.message : 'Unable to read vault status.',
          });
        }
      })();

      return true;
    }

    if (message.type === 'splitpass.saveRecentSecret') {
      (async () => {
        try {
          const entry = await vault.saveRecentSecret(message.domain, message.secret, message.source || 'inline_fill', message.username || '');
          sendResponse({ ok: true, entry });
        } catch (error) {
          sendResponse({
            ok: false,
            code: error?.code || '',
            message: error instanceof Error ? error.message : 'Unable to save recent secret.',
          });
        }
      })();

      return true;
    }

    if (message.type === 'splitpass.getRecentSecretsForDomain') {
      (async () => {
        try {
          const entries = await vault.getRecentSecretsForDomain(message.domain);
          sendResponse({ ok: true, entries });
        } catch (error) {
          sendResponse({
            ok: false,
            code: error?.code || '',
            message: error instanceof Error ? error.message : 'Unable to read recent secrets.',
          });
        }
      })();

      return true;
    }

    if (message.type === 'splitpass.removeRecentSecret') {
      (async () => {
        try {
          const removed = await vault.removeRecentSecret(message.domain, message.secret, message.username || '');
          sendResponse({ ok: true, removed });
        } catch (error) {
          sendResponse({
            ok: false,
            code: error?.code || '',
            message: error instanceof Error ? error.message : 'Unable to remove recent secret.',
          });
        }
      })();

      return true;
    }

    return undefined;
  });
})(globalThis);
