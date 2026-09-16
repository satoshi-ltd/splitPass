(function attachSplitPassSecretItem(globalScope) {
  const RETENTION_CYCLE = ['auto', 'extended', 'pinned'];
  const RETENTION_ACTION = {
    auto: 'Click to keep by use',
    extended: 'Click to keep for 1 year',
    pinned: 'Click to keep with no expiry',
  };
  const MINUTE_MS = 60 * 1000;
  const HOUR_MS = 60 * MINUTE_MS;
  const DAY_MS = 24 * HOUR_MS;

  function nextRetention(current = 'auto') {
    const index = RETENTION_CYCLE.indexOf(current);
    return RETENTION_CYCLE[(index + 1) % RETENTION_CYCLE.length];
  }

  function formatExpiry(expiresAt, timestamp = Date.now()) {
    if (expiresAt === null) return 'No expiry';

    const remaining = Number(expiresAt) - timestamp;
    if (Number.isNaN(remaining)) return '';
    if (remaining <= 0) return 'Expired';
    if (remaining < HOUR_MS) return `Expires in ${Math.max(1, Math.round(remaining / MINUTE_MS))}m`;
    if (remaining < 2 * DAY_MS) return `Expires in ${Math.round(remaining / HOUR_MS)}h`;
    if (remaining < 60 * DAY_MS) return `Expires in ${Math.round(remaining / DAY_MS)}d`;
    if (remaining < 365 * DAY_MS) return `Expires in ${Math.round(remaining / (30 * DAY_MS))}mo`;
    return `Expires in ${Math.round(remaining / (365 * DAY_MS))}y`;
  }

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
    if (typeof entry?.isTotp === 'boolean') return entry.isTotp;
    return !!globalScope.SplitPassTotp?.isTotpUri(entry?.secret);
  }

  function resolveTotpPeriod(entry) {
    if (Number(entry?.totpPeriod) > 0) return Number(entry.totpPeriod);
    return globalScope.SplitPassTotp?.getTotpPeriod(entry?.secret) || 30;
  }

  function buildMarkup({
    badge = '',
    badgePeriod = 30,
    classPrefix,
    deletable = false,
    expiresAt,
    faviconUrl = '',
    index = 0,
    lastUsedAt = 0,
    name = 'Site',
    retention = 'auto',
    retentionToggle = false,
    username = '',
  }) {
    const safePrefix = escapeHtml(classPrefix);
    const safeName = escapeHtml(name);
    const safeFaviconUrl = escapeHtml(faviconUrl);
    const fallbackLetter = escapeHtml(String(name || 'S').slice(0, 1).toUpperCase());
    const safeUsername = escapeHtml(username);
    const lastUsedLabel = `Last used ${escapeHtml(formatLastUsedDate(lastUsedAt))}`;
    const expiryLabel = escapeHtml(formatExpiry(expiresAt));
    const metaMarkup = retentionToggle
      ? `<span class="${safePrefix}-item-meta ${safePrefix}-item-retention" data-entry-retention="${index}" title="${escapeHtml(RETENTION_ACTION[nextRetention(retention)])}">${expiryLabel}</span>`
      : `<span class="${safePrefix}-item-meta">${expiryLabel}</span>`;
    const imageMarkup = safeFaviconUrl
      ? `<img src="${safeFaviconUrl}" alt="" referrerpolicy="no-referrer" />`
      : `<span class="${safePrefix}-item-fallback">${fallbackLetter}</span>`;
    const typeMarkup = badge
      ? `<span class="${safePrefix}-item-type" aria-label="${escapeHtml(badge)}" data-period="${Number(badgePeriod) || 30}">${escapeHtml(badge)}</span>`
      : '';
    const iconMarkup = `${imageMarkup}${typeMarkup}`;
    const titleMarkup = safeUsername
      ? `<span class="${safePrefix}-item-title ${safePrefix}-item-username">${safeUsername}</span>`
      : `<span class="${safePrefix}-item-title">${safeName}</span>`;
    const detailNameMarkup = safeUsername ? `<span class="${safePrefix}-item-name">${safeName}</span>` : '';
    const deleteMarkup = deletable
      ? `<button class="${safePrefix}-item-delete" type="button" data-entry-delete="${index}" aria-label="Remove">X</button>
        <div class="${safePrefix}-item-confirm" data-entry-confirm="${index}">
          <span class="${safePrefix}-item-confirm-copy">Remove this secret?</span>
          <button class="${safePrefix}-item-confirm-cancel" type="button" data-entry-cancel="${index}">Cancel</button>
          <button class="${safePrefix}-item-confirm-remove" type="button" data-entry-remove="${index}">Remove</button>
        </div>`
      : '';

    return `
      <div class="${safePrefix}-item-wrap">
        <button class="${safePrefix}-item" type="button" data-entry-primary="${index}">
          <span class="${safePrefix}-item-icon" title="${lastUsedLabel}">
            ${iconMarkup}
          </span>
          <span class="${safePrefix}-item-body">
            ${titleMarkup}
            <span class="${safePrefix}-item-detail">
              ${detailNameMarkup}
              ${metaMarkup}
            </span>
          </span>
        </button>
        ${deleteMarkup}
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
    onRetention,
  } = {}) {
    if (!root) return;

    root.innerHTML = entries
      .map((entry, index) =>
        buildMarkup({
          badge: isTotpEntry(entry) ? '2FA' : '',
          badgePeriod: resolveTotpPeriod(entry),
          classPrefix,
          deletable: !!onDelete,
          expiresAt: entry?.expiresAt,
          faviconUrl,
          index,
          lastUsedAt: entry?.lastUsedAt,
          name,
          retention: entry?.retention || 'auto',
          retentionToggle: !!onRetention,
          username: entry?.username || '',
        })
      )
      .join('');

    root.querySelectorAll('[data-entry-primary]').forEach((button) => {
      button.addEventListener('click', async (event) => {
        const entry = entries[Number(button.getAttribute('data-entry-primary'))];
        if (!entry) return;
        if (onRetention && event.target instanceof Element && event.target.closest('[data-entry-retention]')) {
          await onRetention(entry, nextRetention(entry.retention || 'auto'));
          return;
        }
        await onPrimary(entry);
      });
    });

    if (onDelete) {
      const wrapOf = (element) => element.closest(`.${classPrefix}-item-wrap`);
      const closeConfirm = (element) => wrapOf(element)?.classList.remove('is-confirming');

      root.querySelectorAll('[data-entry-delete]').forEach((button) => {
        button.addEventListener('click', (event) => {
          event.stopPropagation();
          const wrap = wrapOf(button);
          if (!wrap) return;
          wrap.classList.add('is-confirming');
          wrap.querySelector('[data-entry-cancel]')?.focus();
        });
      });

      root.querySelectorAll('[data-entry-cancel]').forEach((button) => {
        button.addEventListener('click', (event) => {
          event.stopPropagation();
          closeConfirm(button);
        });
      });

      root.querySelectorAll('[data-entry-remove]').forEach((button) => {
        button.addEventListener('click', async (event) => {
          event.stopPropagation();
          const entry = entries[Number(button.getAttribute('data-entry-remove'))];
          if (!entry) return;
          await onDelete(entry);
        });
      });

      root.querySelectorAll('[data-entry-confirm]').forEach((confirm) => {
        confirm.addEventListener('keydown', (event) => {
          if (event.key === 'Escape') closeConfirm(confirm);
        });
      });
    }
  }

  globalScope.SplitPassSecretItem = {
    RETENTION_CYCLE,
    buildMarkup,
    formatExpiry,
    formatLastUsedDate,
    nextRetention,
    renderList,
    resolveSiteLabel,
  };
})(globalThis);
