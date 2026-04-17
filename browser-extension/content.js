(function splitPassHydratorContent() {
  const runtime = (globalThis.browser && globalThis.browser.runtime) || chrome.runtime;
  const browserApi = globalThis.browser || globalThis.chrome || {};
  const secretItem = globalThis.SplitPassSecretItem;
  const { callStorage } = globalThis.SplitPassBrowserApi;
  const VAULT_STORAGE_KEY = 'splitpass.browser.vault.v1';
  const UI_STATE_STORAGE_KEY = 'splitpass.browser.ui.v1';
  const POPUP_OPEN_TTL_MS = 3000;

  const state = {
    dismissed: false,
    fontsPromise: null,
    lastFocusedPasswordInput: null,
    panel: {
      closeButton: null,
      domain: null,
      entries: [],
      list: null,
      message: null,
      root: null,
      visible: false,
    },
    panelLayer: null,
    popupOpen: false,
    refreshHandle: 0,
    refreshInFlight: false,
    refreshPending: false,
    refreshPendingOptions: {},
    retryHandles: new Set(),
    shadowHost: null,
    shadowRoot: null,
    suppressVaultRefreshUntil: 0,
  };

  function getRuntimeUrl(path) {
    return runtime.getURL(path);
  }

  async function sendRuntimeMessage(payload) {
    if (!runtime?.sendMessage) return undefined;

    try {
      const maybePromise = runtime.sendMessage(payload);
      if (maybePromise && typeof maybePromise.then === 'function') {
        return await maybePromise;
      }
    } catch (error) {
      if (!String(error?.message || '').includes('No matching signature')) {
        throw error;
      }
    }

    return await new Promise((resolve, reject) => {
      runtime.sendMessage(payload, (response) => {
        const runtimeError = runtime?.lastError;
        if (runtimeError) {
          reject(new Error(runtimeError.message));
          return;
        }

        resolve(response);
      });
    });
  }



  function createStylesheetLink(path) {
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = getRuntimeUrl(path);
    return stylesheet;
  }

  async function ensureUiFonts() {
    if (state.fontsPromise) return state.fontsPromise;

    if (!('FontFace' in globalThis) || !document.fonts) {
      state.fontsPromise = Promise.resolve();
      return state.fontsPromise;
    }

    const fonts = [
      { path: 'assets/fonts/Doto_500Medium.ttf', weight: '500' },
      { path: 'assets/fonts/Doto_700Bold.ttf', weight: '700' },
      { path: 'assets/fonts/Doto_900Black.ttf', weight: '900' },
    ];

    state.fontsPromise = Promise.all(
      fonts.map(async ({ path, weight }) => {
        const fontFace = new FontFace('Doto', `url("${getRuntimeUrl(path)}") format("truetype")`, {
          style: 'normal',
          weight,
        });

        await fontFace.load();
        document.fonts.add(fontFace);
      })
    ).catch(() => undefined);

    return state.fontsPromise;
  }

  async function ensureUiRoot() {
    if (state.shadowRoot) return;

    await ensureUiFonts();

    const host = document.createElement('splitpass-hydrator-root');
    host.dataset.splitpassOwned = 'true';

    const shadowRoot = host.attachShadow({ mode: 'open' });
    const panelLayer = document.createElement('div');

    shadowRoot.append(createStylesheetLink('theme.css'), createStylesheetLink('item.css'), createStylesheetLink('content.css'), panelLayer);
    (document.body || document.documentElement).appendChild(host);

    state.shadowHost = host;
    state.shadowRoot = shadowRoot;
    state.panelLayer = panelLayer;
  }

  function isOwnedElement(element) {
    return element instanceof Element && !!element.closest('[data-splitpass-owned="true"]');
  }

  function eventInsideUi(event) {
    return !!state.shadowHost && typeof event.composedPath === 'function' && event.composedPath().includes(state.shadowHost);
  }

  function isPasswordInput(element) {
    return (
      element instanceof HTMLInputElement &&
      !isOwnedElement(element) &&
      !element.disabled &&
      !element.readOnly &&
      String(element.type || '').toLowerCase() === 'password'
    );
  }

  function isVisible(element) {
    if (!(element instanceof Element)) return false;

    const style = globalThis.getComputedStyle(element);
    return (
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      Number(style.opacity || '1') > 0 &&
      element.getClientRects().length > 0
    );
  }

  function getVisiblePasswordInputs() {
    return Array.from(document.querySelectorAll('input[type="password"]')).filter((input) => isPasswordInput(input) && isVisible(input));
  }

  function pageHasVisiblePasswordInput() {
    return getVisiblePasswordInputs().length > 0;
  }

  function setFormFieldValue(element, value) {
    const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
    descriptor?.set?.call(element, value);
  }

  function dispatchValueEvents(element) {
    element.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    element.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  }

  function fillTarget(element, value) {
    element.focus();
    setFormFieldValue(element, value);
    dispatchValueEvents(element);
  }

  function findUsernameInput() {
    const candidates = Array.from(document.querySelectorAll('input')).filter(
      (input) =>
        !isOwnedElement(input) &&
        !input.disabled &&
        !input.readOnly &&
        String(input.type || 'text').toLowerCase() !== 'password' &&
        String(input.type || 'text').toLowerCase() !== 'hidden' &&
        isVisible(input)
    );

    return (
      candidates.find((i) => ['username', 'email'].includes(String(i.autocomplete || '').toLowerCase())) ||
      candidates.find((i) => String(i.type || '').toLowerCase() === 'email') ||
      candidates.find((i) => /user|email|login/i.test(i.name || i.id || '')) ||
      candidates.find((i) => /user|email/i.test(i.placeholder || '')) ||
      null
    );
  }

  function fillVisiblePasswordInputs(value, preferredInput) {
    const visibleInputs = getVisiblePasswordInputs();
    const uniqueInputs = [];
    const seenInputs = new Set();

    visibleInputs.forEach((input) => {
      if (seenInputs.has(input)) return;
      seenInputs.add(input);
      uniqueInputs.push(input);
    });

    if (!uniqueInputs.length) {
      const fallbackInput = resolveFillTarget(preferredInput);
      if (!fallbackInput) return [];
      fillTarget(fallbackInput, value);
      return [fallbackInput];
    }

    uniqueInputs.forEach((input) => {
      fillTarget(input, value);
    });

    return uniqueInputs;
  }

  function getFilledPasswordInputs(value, preferredInput) {
    const normalizedValue = String(value || '');
    const filledVisibleInputs = getVisiblePasswordInputs().filter((input) => String(input.value || '') === normalizedValue);
    if (filledVisibleInputs.length) return filledVisibleInputs;

    const fallbackInput = resolveFillTarget(preferredInput);
    if (fallbackInput && String(fallbackInput.value || '') === normalizedValue) {
      return [fallbackInput];
    }

    return [];
  }

  async function waitForNextPaint() {
    await new Promise((resolve) => globalThis.requestAnimationFrame(() => resolve()));
  }

  async function fillVisiblePasswordInputsStable(value, preferredInput) {
    const firstPassInputs = fillVisiblePasswordInputs(value, preferredInput);
    let filledInputs = getFilledPasswordInputs(value, preferredInput);
    if (filledInputs.length) return filledInputs;

    await waitForNextPaint();

    const secondPassInputs = fillVisiblePasswordInputs(value, preferredInput);
    filledInputs = getFilledPasswordInputs(value, preferredInput);
    if (filledInputs.length) return filledInputs;

    return secondPassInputs.length ? secondPassInputs : firstPassInputs;
  }

  function resolveFillTarget(preferredInput) {
    const activeElement = document.activeElement;
    if (isPasswordInput(activeElement) && isVisible(activeElement)) return activeElement;
    if (isPasswordInput(preferredInput) && preferredInput.isConnected && isVisible(preferredInput)) return preferredInput;
    if (
      isPasswordInput(state.lastFocusedPasswordInput) &&
      state.lastFocusedPasswordInput?.isConnected &&
      isVisible(state.lastFocusedPasswordInput)
    ) {
      return state.lastFocusedPasswordInput;
    }
    return null;
  }

  function normalizeDomainCandidate(value = '') {
    return String(value || '').trim().replace(/\.$/, '').toLowerCase();
  }

  function buildDomainCandidates(domain = '') {
    const normalizedDomain = normalizeDomainCandidate(domain);
    if (!normalizedDomain) return [];

    const candidates = [normalizedDomain];
    if (!normalizedDomain.includes('.')) return candidates;

    if (normalizedDomain.startsWith('www.')) {
      candidates.push(normalizedDomain.slice(4));
    } else {
      candidates.push(`www.${normalizedDomain}`);
    }

    return Array.from(new Set(candidates.filter(Boolean)));
  }

  function buildEntryFingerprint(entry) {
    return `${String(entry?.domain || '')}\u0000${String(entry?.secret || '')}`;
  }

  function resolveFaviconUrl() {
    const iconLink = document.querySelector(
      'link[rel="apple-touch-icon"], link[rel="apple-touch-icon-precomposed"], link[rel="icon"], link[rel="shortcut icon"]'
    );

    if (iconLink?.href) return iconLink.href;

    try {
      return new URL('/favicon.ico', globalThis.location.origin).toString();
    } catch {
      return '';
    }
  }

  async function getVaultStatus() {
    try {
      const response = await sendRuntimeMessage({ type: 'splitpass.getVaultStatus' });
      return response && typeof response === 'object' ? response : { ok: false, hasVault: false, unlocked: false };
    } catch {
      return { ok: false, hasVault: false, unlocked: false };
    }
  }

  async function refreshUiState() {
    const storageArea = browserApi?.storage?.local;
    if (!storageArea) {
      state.popupOpen = false;
      return;
    }

    try {
      const result = await callStorage(storageArea, 'get', UI_STATE_STORAGE_KEY);
      const uiState = result?.[UI_STATE_STORAGE_KEY];
      const updatedAt = Number(uiState?.updatedAt || 0);
      state.popupOpen = !!uiState?.popupOpen && now() - updatedAt <= POPUP_OPEN_TTL_MS;
    } catch {
      state.popupOpen = false;
    }
  }

  function now() {
    return Date.now();
  }

  function shouldSuppressVaultRefresh() {
    return state.suppressVaultRefreshUntil > now();
  }

  async function readRecentSecretsForDomain(domain) {
    try {
      const response = await sendRuntimeMessage({ type: 'splitpass.getRecentSecretsForDomain', domain });
      return response && response.ok ? response.entries || [] : [];
    } catch {
      return [];
    }
  }

  async function getRecentSecretsForDomain(domain) {
    const candidates = buildDomainCandidates(domain);
    if (!candidates.length) return [];

    const exactEntries = await readRecentSecretsForDomain(candidates[0]);
    if (exactEntries.length || candidates.length === 1) {
      return exactEntries;
    }

    const fallbackEntries = [];
    const fingerprints = new Set();

    for (const candidate of candidates.slice(1)) {
      const entries = await readRecentSecretsForDomain(candidate);

      entries.forEach((entry) => {
        const fingerprint = buildEntryFingerprint(entry);
        if (fingerprints.has(fingerprint)) return;

        fingerprints.add(fingerprint);
        fallbackEntries.push(entry);
      });
    }

    return fallbackEntries.sort((left, right) => Number(right.lastUsedAt || 0) - Number(left.lastUsedAt || 0));
  }

  async function touchSecret(domain, secret, source, username) {
    await sendRuntimeMessage({
      type: 'splitpass.saveRecentSecret',
      domain,
      secret,
      source,
      username: username || '',
    }).catch(() => undefined);
  }

  async function ensureSitePanel() {
    if (state.panel.root) return;

    await ensureUiRoot();

    const root = document.createElement('section');
    root.className = 'splitpass-site-panel splitpass-hidden';
    root.dataset.splitpassOwned = 'true';
    root.innerHTML = `
      <div class="splitpass-site-shell">
        <div class="splitpass-site-header">
          <div class="splitpass-site-branding">
            <p class="splitpass-site-brand">split/Pass</p>
            <p class="splitpass-site-title">Secrets</p>
          </div>
          <button class="splitpass-site-close" type="button" aria-label="Close SplitPass">X</button>
        </div>
        <p class="splitpass-site-message splitpass-hidden"></p>
        <div class="splitpass-site-list"></div>
      </div>
    `;

    state.panelLayer.appendChild(root);

    state.panel.root = root;
    state.panel.closeButton = root.querySelector('.splitpass-site-close');
    state.panel.list = root.querySelector('.splitpass-site-list');
    state.panel.message = root.querySelector('.splitpass-site-message');

    state.panel.closeButton.addEventListener('click', () => {
      state.dismissed = true;
      hideSitePanel();
    });
  }

  function hideSitePanel() {
    if (!state.panel.root) return;

    state.panel.visible = false;
    state.panel.entries = [];
    state.panel.root.classList.add('splitpass-hidden');
    state.panel.list.innerHTML = '';
    state.panel.message.textContent = '';
    state.panel.message.classList.add('splitpass-hidden');
  }

  function resetDismissedState() {
    state.dismissed = false;
  }

  async function renderEntries(entries, preferredInput) {
    await ensureSitePanel();

    const siteLabel = secretItem.resolveSiteLabel(globalThis.location.hostname);
    const faviconUrl = resolveFaviconUrl();

    state.panel.entries = entries;
    state.panel.message.textContent = '';
    state.panel.message.classList.add('splitpass-hidden');

    secretItem.renderList({
      root: state.panel.list,
      classPrefix: 'splitpass',
      entries: state.panel.entries,
      faviconUrl,
      name: siteLabel,
      onPrimary: async (entry) => {
        if (!entry?.secret) return;

        if (entry.username) {
          const usernameInput = findUsernameInput();
          if (usernameInput) fillTarget(usernameInput, entry.username);
        }

        const filledInputs = await fillVisiblePasswordInputsStable(entry.secret, preferredInput);
        if (!filledInputs.length) {
          await showMessage('No visible password field found.');
          return;
        }

        state.lastFocusedPasswordInput = filledInputs[0];
        state.dismissed = true;
        state.suppressVaultRefreshUntil = now() + 2000;
        hideSitePanel();
        await touchSecret(entry.domain || globalThis.location.hostname, entry.secret, 'site_panel_fill', entry.username);
      },
      onDelete: async (entry) => {
        if (!entry?.secret) return;
        await sendRuntimeMessage({
          type: 'splitpass.removeRecentSecret',
          domain: entry.domain || globalThis.location.hostname,
          secret: entry.secret,
          username: entry.username || '',
        }).catch(() => undefined);
        state.panel.entries = state.panel.entries.filter((e) => e !== entry);
        if (!state.panel.entries.length) {
          hideSitePanel();
          return;
        }
        await renderEntries(state.panel.entries, preferredInput);
      },
    });

    state.panel.visible = true;
    state.panel.root.classList.remove('splitpass-hidden');
  }

  async function showMessage(text) {
    await ensureSitePanel();

    state.panel.entries = [];
    state.panel.list.innerHTML = '';
    state.panel.message.textContent = text;
    state.panel.message.classList.remove('splitpass-hidden');
    state.panel.visible = true;
    state.panel.root.classList.remove('splitpass-hidden');
  }

  async function openSitePanel(preferredInput = null) {
    await ensureSitePanel();

    if (preferredInput && isPasswordInput(preferredInput)) {
      state.lastFocusedPasswordInput = preferredInput;
    }

    const vaultStatus = await getVaultStatus();
    if (!vaultStatus?.hasVault || !vaultStatus?.unlocked) {
      hideSitePanel();
      return;
    }

    const entries = await getRecentSecretsForDomain(globalThis.location.hostname);
    if (!entries.length) {
      hideSitePanel();
      return;
    }

    await renderEntries(entries, preferredInput);
  }

  async function refreshSitePanel({ storageChange = false } = {}) {
    if (requestRefresh({ storageChange })) return;
    state.refreshInFlight = true;

    try {
      await refreshUiState();

      if (state.popupOpen) {
        hideSitePanel();
        return;
      }

      if (!pageHasVisiblePasswordInput()) {
        resetDismissedState();
        hideSitePanel();
        return;
      }

      if (storageChange) {
        resetDismissedState();
      }

      if (state.dismissed) {
        hideSitePanel();
        return;
      }

      await openSitePanel(state.lastFocusedPasswordInput);
    } finally {
      state.refreshInFlight = false;
      if (state.refreshPending) {
        const pendingOptions = state.refreshPendingOptions;
        state.refreshPending = false;
        state.refreshPendingOptions = {};
        refreshSitePanel(pendingOptions).catch(() => undefined);
      }
    }
  }

  function scheduleRefresh(options = {}, delay = 120) {
    if (state.refreshHandle) {
      clearTimeout(state.refreshHandle);
    }

    state.refreshHandle = globalThis.setTimeout(() => {
      state.refreshHandle = 0;
      refreshSitePanel(options).catch(() => undefined);
    }, delay);
  }

  function clearRefreshBurst() {
    state.retryHandles.forEach((handle) => clearTimeout(handle));
    state.retryHandles.clear();
  }

  function scheduleRefreshBurst(options = {}) {
    clearRefreshBurst();

    [0, 180, 520, 1200].forEach((delay) => {
      const handle = globalThis.setTimeout(() => {
        state.retryHandles.delete(handle);
        refreshSitePanel(options).catch(() => undefined);
      }, delay);

      state.retryHandles.add(handle);
    });
  }

  function handleFocusIn(event) {
    if (isOwnedElement(event.target) || eventInsideUi(event)) return;

    if (isPasswordInput(event.target) && isVisible(event.target)) {
      resetDismissedState();
      state.lastFocusedPasswordInput = event.target;
      scheduleRefreshBurst();
      return;
    }

    scheduleRefresh();
  }

  function handleDocumentClick(event) {
    if (isOwnedElement(event.target) || eventInsideUi(event)) return;
    scheduleRefreshBurst();
  }

  function handleAnimatedUiChange(event) {
    if (isOwnedElement(event.target) || eventInsideUi(event)) return;
    scheduleRefreshBurst();
  }

  function handleStorageChange(changes, areaName) {
    if (areaName !== 'local') return;

    if (changes?.[UI_STATE_STORAGE_KEY]) {
      const uiState = changes[UI_STATE_STORAGE_KEY]?.newValue;
      const updatedAt = Number(uiState?.updatedAt || 0);
      state.popupOpen = !!uiState?.popupOpen && now() - updatedAt <= POPUP_OPEN_TTL_MS;
      if (state.popupOpen) {
        hideSitePanel();
        return;
      }
      resetDismissedState();
      scheduleRefreshBurst();
      return;
    }

    if (!changes?.[VAULT_STORAGE_KEY]) return;
    if (shouldSuppressVaultRefresh()) return;
    resetDismissedState();
    scheduleRefreshBurst({ storageChange: true });
  }

  function handleVisibilityChange() {
    if (document.visibilityState === 'visible') {
      resetDismissedState();
      scheduleRefreshBurst();
    }
  }

  function handleWindowFocus() {
    resetDismissedState();
    scheduleRefreshBurst();
  }

  function requestRefresh(options = {}) {
    if (!state.refreshInFlight) return false;
    state.refreshPending = true;
    state.refreshPendingOptions = {
      storageChange: !!state.refreshPendingOptions.storageChange || !!options.storageChange,
    };
    return true;
  }

  document.addEventListener('focusin', handleFocusIn, true);
  document.addEventListener('click', handleDocumentClick, true);
  document.addEventListener('transitionend', handleAnimatedUiChange, true);
  document.addEventListener('animationend', handleAnimatedUiChange, true);
  globalThis.addEventListener('focus', handleWindowFocus);
  globalThis.addEventListener('resize', () => scheduleRefresh());
  document.addEventListener('visibilitychange', handleVisibilityChange);

  const observer = new MutationObserver(() => {
    scheduleRefreshBurst();
  });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class', 'disabled', 'readonly', 'style', 'type'],
    childList: true,
    subtree: true,
  });

  if (browserApi?.storage?.onChanged?.addListener) {
    browserApi.storage.onChanged.addListener(handleStorageChange);
  }

  if (runtime?.onMessage?.addListener) {
    runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (!message || typeof message !== 'object') return undefined;
      if (message.type === 'splitpass.refreshSitePanel') {
        resetDismissedState();
        scheduleRefreshBurst({ storageChange: true });
        sendResponse({ ok: true });
        return true;
      }

      if (message.type !== 'splitpass.fillPassword') return undefined;

      (async () => {
        if (message.username) {
          const usernameInput = findUsernameInput();
          if (usernameInput) fillTarget(usernameInput, message.username);
        }
        const filledInputs = await fillVisiblePasswordInputsStable(String(message.secret || ''), state.lastFocusedPasswordInput);
        sendResponse({
          ok: true,
          filled: filledInputs.length > 0,
          count: filledInputs.length,
        });
      })();
      return true;
    });
  }

  scheduleRefreshBurst();
})();
