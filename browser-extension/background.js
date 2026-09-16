importScripts('lib/browser-api.js', 'lib/totp.js', 'lib/vault.js');

(function attachSplitPassBackground(globalScope) {
  const runtime = globalScope.browser?.runtime || globalScope.chrome?.runtime;
  const vault = globalScope.SplitPassVault;
  const totp = globalScope.SplitPassTotp;

  if (!runtime?.onMessage || !vault) return;

  const alarms = globalScope.browser?.alarms || globalScope.chrome?.alarms;
  const PURGE_ALARM = 'splitpass.purgeExpiredVault';

  if (alarms?.create && alarms?.onAlarm) {
    alarms.onAlarm.addListener((alarm) => {
      if (alarm?.name === PURGE_ALARM) vault.purgeExpiredVault().catch(() => undefined);
    });
    // alarms.create replaces a same-named alarm and restarts its period, so only create when missing.
    Promise.resolve(alarms.get(PURGE_ALARM))
      .then((existing) => existing || alarms.create(PURGE_ALARM, { periodInMinutes: 60 }))
      .catch(() => undefined);
    vault.purgeExpiredVault().catch(() => undefined);
  }

  function redactEntry(entry) {
    if (!entry) return null;
    const { secret, ...safeEntry } = entry;
    return { ...safeEntry, isTotp: totp.isTotpUri(secret), totpPeriod: totp.getTotpPeriod(secret) };
  }

  const handlers = {
    'splitpass.getVaultStatus': async () => ({ hasVault: await vault.hasVault(), unlocked: await vault.isUnlocked() }),
    'splitpass.getRecentSecretsForDomain': async ({ domain }) => ({
      entries: (await vault.getRecentSecretsForDomain(domain)).map(redactEntry),
    }),
    'splitpass.revealSecret': async ({ id }) => ({ secret: await vault.revealSecret(id) }),
    'splitpass.touchEntry': async ({ id }) => ({ entry: redactEntry(await vault.touchEntry(id)) }),
    'splitpass.removeEntry': async ({ id }) => ({ removed: await vault.removeEntry(id) }),
    'splitpass.setRetention': async ({ id, retention }) => ({
      entry: redactEntry(await vault.setRetention(id, retention)),
    }),
  };

  runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (!message || typeof message !== 'object') return undefined;
    if (sender?.id !== runtime.id) return undefined;

    const handler = handlers[message.type];
    if (!handler) return undefined;

    handler(message)
      .then((result) => sendResponse({ ok: true, ...result }))
      .catch((error) => {
        sendResponse({
          ok: false,
          code: error?.code || '',
          message: error instanceof Error ? error.message : 'Unable to complete the request.',
        });
      });

    return true;
  });
})(globalThis);
