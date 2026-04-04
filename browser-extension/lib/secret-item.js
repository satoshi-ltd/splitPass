(function attachSplitPassSecretItem(globalScope) {
  function escapeHtml(value = '') {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatLastUsedDate(lastUsedAt) {
    try {
      return new Intl.DateTimeFormat(undefined, {
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(new Date(Number(lastUsedAt || 0)));
    } catch {
      return '';
    }
  }

  function resolveSiteLabel(domain = '') {
    const normalizedDomain = String(domain || '').trim().replace(/^www\./, '');
    const [firstSegment = 'Site'] = normalizedDomain.split('.');
    if (!firstSegment) return 'Site';
    return firstSegment.charAt(0).toUpperCase() + firstSegment.slice(1);
  }

  function buildMarkup({ classPrefix, faviconUrl = '', index = 0, lastUsedAt = 0, name = 'Site' }) {
    const safePrefix = escapeHtml(classPrefix);
    const safeName = escapeHtml(name);
    const safeFaviconUrl = escapeHtml(faviconUrl);
    const fallbackLetter = escapeHtml(String(name || 'S').slice(0, 1).toUpperCase());
    const lastUsedLabel = escapeHtml(formatLastUsedDate(lastUsedAt));
    const iconMarkup = safeFaviconUrl
      ? `<img src="${safeFaviconUrl}" alt="" referrerpolicy="no-referrer" />`
      : `<span class="${safePrefix}-item-fallback">${fallbackLetter}</span>`;

    return `
      <button class="${safePrefix}-item" type="button" data-entry-primary="${index}">
        <span class="${safePrefix}-item-icon">
          ${iconMarkup}
        </span>
        <span class="${safePrefix}-item-body">
          <span class="${safePrefix}-item-name">${safeName}</span>
          <span class="${safePrefix}-item-meta">Last used ${lastUsedLabel}</span>
        </span>
      </button>
    `;
  }

  function renderList({
    root,
    classPrefix,
    entries = [],
    faviconUrl = '',
    name = 'Site',
    onPrimary = async () => undefined,
  } = {}) {
    if (!root) return;

    root.innerHTML = entries
      .map((entry, index) =>
        buildMarkup({
          classPrefix,
          faviconUrl,
          index,
          lastUsedAt: entry?.lastUsedAt,
          name,
        })
      )
      .join('');

    root.querySelectorAll('[data-entry-primary]').forEach((button) => {
      button.addEventListener('click', async () => {
        const entry = entries[Number(button.getAttribute('data-entry-primary'))];
        if (!entry) return;
        await onPrimary(entry);
      });
    });
  }

  globalScope.SplitPassSecretItem = {
    buildMarkup,
    formatLastUsedDate,
    renderList,
    resolveSiteLabel,
  };
})(globalThis);
