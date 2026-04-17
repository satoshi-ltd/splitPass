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
    const normalizedDomain = String(domain || '').trim();
    if (!normalizedDomain) return 'Site';

    const segments = normalizedDomain.split('.');
    if (segments.length >= 2) {
      const secondFromRight = segments[segments.length - 2];
      const is2PartTld = secondFromRight.length <= 3;
      const domainIdx = is2PartTld ? Math.max(0, segments.length - 3) : segments.length - 2;
      const brandSegment = segments[domainIdx];
      if (brandSegment) return brandSegment.charAt(0).toUpperCase() + brandSegment.slice(1);
    }

    const [firstSegment = ''] = segments;
    if (!firstSegment) return 'Site';
    return firstSegment.charAt(0).toUpperCase() + firstSegment.slice(1);
  }

  function isTotpEntry(entry) {
    return /^otpauth:\/\/totp\//i.test(String(entry?.secret || ''));
  }

  function buildMarkup({ badge = '', classPrefix, deletable = false, faviconUrl = '', index = 0, lastUsedAt = 0, name = 'Site', username = '' }) {
    const safePrefix = escapeHtml(classPrefix);
    const safeName = escapeHtml(name);
    const safeFaviconUrl = escapeHtml(faviconUrl);
    const fallbackLetter = escapeHtml(String(name || 'S').slice(0, 1).toUpperCase());
    const safeUsername = escapeHtml(username);
    const lastUsedLabel = `Last used ${escapeHtml(formatLastUsedDate(lastUsedAt))}`;
    const imageMarkup = safeFaviconUrl
      ? `<img src="${safeFaviconUrl}" alt="" referrerpolicy="no-referrer" />`
      : `<span class="${safePrefix}-item-fallback">${fallbackLetter}</span>`;
    const typeMarkup = badge ? `<span class="${safePrefix}-item-type" aria-label="${escapeHtml(badge)}">${escapeHtml(badge)}</span>` : '';
    const iconMarkup = `${imageMarkup}${typeMarkup}`;
    const nameMarkup = safeUsername
      ? `${safeName}<span class="${safePrefix}-item-username">/${safeUsername}</span>`
      : safeName;
    const itemClass = deletable
      ? `${safePrefix}-item ${safePrefix}-item--deletable`
      : `${safePrefix}-item`;
    const deleteButton = deletable
      ? `<button class="${safePrefix}-item-delete" type="button" data-entry-delete="${index}" aria-label="Remove">X</button>`
      : '';

    return `
      <div class="${safePrefix}-item-wrap">
        <button class="${itemClass}" type="button" data-entry-primary="${index}">
          <span class="${safePrefix}-item-icon">
            ${iconMarkup}
          </span>
          <span class="${safePrefix}-item-body">
            <span class="${safePrefix}-item-name">${nameMarkup}</span>
            <span class="${safePrefix}-item-meta">${lastUsedLabel}</span>
          </span>
        </button>
        ${deleteButton}
      </div>
    `;
  }

  function renderList({
    root,
    classPrefix,
    entries = [],
    faviconUrl = '',
    name = 'Site',
    onDelete,
    onPrimary = async () => undefined,
  } = {}) {
    if (!root) return;

    root.innerHTML = entries
      .map((entry, index) =>
        buildMarkup({
          badge: isTotpEntry(entry) ? '2FA' : '',
          classPrefix,
          deletable: !!onDelete,
          faviconUrl,
          index,
          lastUsedAt: entry?.lastUsedAt,
          name,
          username: entry?.username || '',
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

    if (onDelete) {
      root.querySelectorAll('[data-entry-delete]').forEach((button) => {
        button.addEventListener('click', async (event) => {
          event.stopPropagation();
          const entry = entries[Number(button.getAttribute('data-entry-delete'))];
          if (!entry) return;
          await onDelete(entry);
        });
      });
    }
  }

  globalScope.SplitPassSecretItem = {
    buildMarkup,
    formatLastUsedDate,
    renderList,
    resolveSiteLabel,
  };
})(globalThis);
