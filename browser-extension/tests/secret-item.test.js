/**
 * @jest-environment jsdom
 *
 * Tests for browser-extension/lib/secret-item.js
 *
 * Covers buildMarkup (username presence/absence, XSS escaping)
 * and renderList (username forwarded from entry objects).
 */

require('../lib/totp.js');
require('../lib/secret-item.js');

const { buildMarkup, renderList, resolveSiteLabel } = globalThis.SplitPassSecretItem;

// ---------------------------------------------------------------------------
// resolveSiteLabel — subdomain handling
// ---------------------------------------------------------------------------

describe('resolveSiteLabel', () => {
  it('returns the brand name for a simple domain', () => {
    expect(resolveSiteLabel('google.com')).toBe('Google');
  });

  it('skips www subdomain', () => {
    expect(resolveSiteLabel('www.google.com')).toBe('Google');
  });

  it('skips arbitrary subdomain (member.lazada.co.th → Lazada)', () => {
    expect(resolveSiteLabel('member.lazada.co.th')).toBe('Lazada');
  });

  it('handles compound TLD co.uk', () => {
    expect(resolveSiteLabel('www.bbc.co.uk')).toBe('Bbc');
  });

  it('handles compound TLD com.au', () => {
    expect(resolveSiteLabel('app.example.com.au')).toBe('Example');
  });

  it('handles already-normalized domain (lazada.co.th → Lazada)', () => {
    expect(resolveSiteLabel('lazada.co.th')).toBe('Lazada');
  });

  it('returns Site for empty input', () => {
    expect(resolveSiteLabel('')).toBe('Site');
  });

  it('capitalizes the first letter', () => {
    expect(resolveSiteLabel('github.com')).toBe('Github');
  });
});

// ---------------------------------------------------------------------------
// buildMarkup — username absent (legacy entries)
// ---------------------------------------------------------------------------

describe('buildMarkup — no username (legacy entry)', () => {
  it('renders a button with the item class', () => {
    const html = buildMarkup({ classPrefix: 'sp', name: 'GitHub' });
    expect(html).toContain('class="sp-item"');
  });

  it('does not render the username span when username is empty string', () => {
    const html = buildMarkup({ classPrefix: 'sp', name: 'GitHub', username: '' });
    expect(html).not.toContain('sp-item-username');
  });

  it('does not render the username span when username is omitted', () => {
    const html = buildMarkup({ classPrefix: 'sp', name: 'GitHub' });
    expect(html).not.toContain('sp-item-username');
  });

  it('does not render the username span when username is undefined', () => {
    const html = buildMarkup({ classPrefix: 'sp', name: 'GitHub', username: undefined });
    expect(html).not.toContain('sp-item-username');
  });

  it('promotes the name to the title line and keeps the meta span', () => {
    const html = buildMarkup({ classPrefix: 'sp', name: 'GitHub' });
    expect(html).toContain('sp-item-title');
    expect(html).not.toContain('sp-item-name');
    expect(html).toContain('sp-item-meta');
  });
});

// ---------------------------------------------------------------------------
// buildMarkup — username present (new entries)
// ---------------------------------------------------------------------------

describe('buildMarkup — with username', () => {
  it('renders the username span when username is provided', () => {
    const html = buildMarkup({ classPrefix: 'sp', name: 'GitHub', username: 'alice@example.com' });
    expect(html).toContain('sp-item-username');
  });

  it('renders the username text inside the span', () => {
    const html = buildMarkup({ classPrefix: 'sp', name: 'GitHub', username: 'alice@example.com' });
    expect(html).toContain('alice@example.com');
  });

  it('does not join the name and username with a separator', () => {
    const html = buildMarkup({ classPrefix: 'sp', name: 'GitHub', username: 'alice' });
    expect(html).not.toContain('/alice');
  });

  it('puts the username on the title line and the name on the detail line below', () => {
    const html = buildMarkup({ classPrefix: 'sp', name: 'GitHub', username: 'alice' });
    const usernamePos = html.indexOf('sp-item-username');
    const detailPos = html.indexOf('sp-item-detail');
    const namePos = html.indexOf('sp-item-name');
    expect(usernamePos).toBeGreaterThan(-1);
    expect(detailPos).toBeGreaterThan(usernamePos);
    expect(namePos).toBeGreaterThan(detailPos);
  });

  it('uses the classPrefix for the username span class', () => {
    const html = buildMarkup({ classPrefix: 'splitpass-recent', name: 'Site', username: 'user' });
    expect(html).toContain('splitpass-recent-item-username');
  });

  it('different classPrefixes produce different class names', () => {
    const siteHtml = buildMarkup({ classPrefix: 'splitpass-site', name: 'S', username: 'u' });
    const recentHtml = buildMarkup({ classPrefix: 'splitpass-recent', name: 'S', username: 'u' });
    expect(siteHtml).toContain('splitpass-site-item-username');
    expect(recentHtml).toContain('splitpass-recent-item-username');
  });

  it('does not use --has-username modifier class on the body', () => {
    const html = buildMarkup({ classPrefix: 'sp', name: 'GitHub', username: 'alice' });
    expect(html).not.toContain('--has-username');
  });
});

// ---------------------------------------------------------------------------
// buildMarkup — delete button
// ---------------------------------------------------------------------------

describe('buildMarkup — delete button', () => {
  it('does not render delete button by default', () => {
    const html = buildMarkup({ classPrefix: 'sp', name: 'GitHub' });
    expect(html).not.toContain('data-entry-delete');
    expect(html).not.toContain('sp-item-delete');
  });

  it('renders delete button when deletable is true', () => {
    const html = buildMarkup({ classPrefix: 'sp', name: 'GitHub', deletable: true });
    expect(html).toContain('data-entry-delete');
    expect(html).toContain('sp-item-delete');
  });

  it('wraps item in sp-item-wrap when deletable', () => {
    const html = buildMarkup({ classPrefix: 'sp', name: 'GitHub', deletable: true });
    expect(html).toContain('sp-item-wrap');
  });

  it('keeps the item width intact when deletable so the X floats over the row', () => {
    const html = buildMarkup({ classPrefix: 'sp', name: 'GitHub', deletable: true });
    expect(html).toContain('class="sp-item"');
    expect(html).not.toContain('--deletable');
  });

  it('delete button has correct data-entry-delete index', () => {
    const html = buildMarkup({ classPrefix: 'sp', name: 'GitHub', deletable: true, index: 2 });
    expect(html).toContain('data-entry-delete="2"');
  });

  it('renders an inline confirm with cancel and remove actions when deletable', () => {
    const html = buildMarkup({ classPrefix: 'sp', name: 'GitHub', deletable: true, index: 2 });
    expect(html).toContain('data-entry-confirm="2"');
    expect(html).toContain('data-entry-cancel="2"');
    expect(html).toContain('data-entry-remove="2"');
    expect(buildMarkup({ classPrefix: 'sp', name: 'GitHub' })).not.toContain('data-entry-confirm');
  });
});

// ---------------------------------------------------------------------------
// renderList — delete callback
// ---------------------------------------------------------------------------

describe('renderList — onDelete callback', () => {
  function makeRoot() {
    const root = document.createElement('div');
    document.body.appendChild(root);
    return root;
  }

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders delete buttons when onDelete is provided', () => {
    const root = makeRoot();
    renderList({
      root,
      classPrefix: 'sp',
      entries: [{ secret: 'pw', lastUsedAt: 0 }],
      name: 'Site',
      onDelete: jest.fn(),
    });
    expect(root.querySelector('[data-entry-delete]')).not.toBeNull();
  });

  it('does not render delete buttons when onDelete is not provided', () => {
    const root = makeRoot();
    renderList({
      root,
      classPrefix: 'sp',
      entries: [{ secret: 'pw', lastUsedAt: 0 }],
      name: 'Site',
    });
    expect(root.querySelector('[data-entry-delete]')).toBeNull();
  });

  it('clicking delete asks for confirmation instead of deleting', async () => {
    const root = makeRoot();
    const onDelete = jest.fn();
    const onPrimary = jest.fn();
    const entry = { secret: 'pw', lastUsedAt: 0 };

    renderList({ root, classPrefix: 'sp', entries: [entry], name: 'Site', onDelete, onPrimary });

    root.querySelector('[data-entry-delete]').click();
    await Promise.resolve();

    expect(onDelete).not.toHaveBeenCalled();
    expect(onPrimary).not.toHaveBeenCalled();
    expect(root.querySelector('.sp-item-wrap').classList.contains('is-confirming')).toBe(true);
    expect(document.activeElement).toBe(root.querySelector('[data-entry-cancel]'));
  });

  it('cancelling backs out and confirming removes the entry', async () => {
    const root = makeRoot();
    const onDelete = jest.fn();
    const onPrimary = jest.fn();
    const entry = { secret: 'pw', lastUsedAt: 0 };

    renderList({ root, classPrefix: 'sp', entries: [entry], name: 'Site', onDelete, onPrimary });
    const wrap = root.querySelector('.sp-item-wrap');

    root.querySelector('[data-entry-delete]').click();
    root.querySelector('[data-entry-cancel]').click();
    await Promise.resolve();
    expect(wrap.classList.contains('is-confirming')).toBe(false);
    expect(onDelete).not.toHaveBeenCalled();

    root.querySelector('[data-entry-delete]').click();
    root.querySelector('[data-entry-remove]').click();
    await Promise.resolve();
    expect(onDelete).toHaveBeenCalledWith(entry);
    expect(onPrimary).not.toHaveBeenCalled();
  });

  it('escape backs out of the confirmation', () => {
    const root = makeRoot();
    renderList({ root, classPrefix: 'sp', entries: [{ secret: 'pw', lastUsedAt: 0 }], name: 'Site', onDelete: jest.fn() });
    const wrap = root.querySelector('.sp-item-wrap');

    root.querySelector('[data-entry-delete]').click();
    expect(wrap.classList.contains('is-confirming')).toBe(true);

    root.querySelector('[data-entry-confirm]').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(wrap.classList.contains('is-confirming')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// buildMarkup — XSS escaping on username
// ---------------------------------------------------------------------------

describe('buildMarkup — username XSS escaping', () => {
  it('escapes < and > in username', () => {
    const html = buildMarkup({ classPrefix: 'sp', name: 'Site', username: '<script>alert(1)</script>' });
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('escapes & in username', () => {
    const html = buildMarkup({ classPrefix: 'sp', name: 'Site', username: 'alice&bob' });
    expect(html).toContain('alice&amp;bob');
  });

  it('escapes double quotes in username', () => {
    const html = buildMarkup({ classPrefix: 'sp', name: 'Site', username: 'al"ice' });
    expect(html).toContain('al&quot;ice');
  });

  it('escapes single quotes in username', () => {
    const html = buildMarkup({ classPrefix: 'sp', name: 'Site', username: "al'ice" });
    expect(html).toContain('al&#39;ice');
  });

  it('a normal email address is not altered', () => {
    const html = buildMarkup({ classPrefix: 'sp', name: 'Site', username: 'alice@example.com' });
    expect(html).toContain('alice@example.com');
  });
});

// ---------------------------------------------------------------------------
// renderList — username forwarded from entry objects
// ---------------------------------------------------------------------------

describe('renderList — username forwarded from entries', () => {
  function makeRoot() {
    const root = document.createElement('div');
    // renderList uses querySelectorAll — needs to be in document
    document.body.appendChild(root);
    return root;
  }

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('shows username for entries that have one', () => {
    const root = makeRoot();
    renderList({
      root,
      classPrefix: 'sp',
      entries: [{ secret: 'pw', username: 'alice@example.com', lastUsedAt: 0 }],
      name: 'Site',
    });
    expect(root.innerHTML).toContain('alice@example.com');
    expect(root.innerHTML).toContain('sp-item-username');
  });

  it('does not show username span for legacy entries without username', () => {
    const root = makeRoot();
    renderList({
      root,
      classPrefix: 'sp',
      entries: [{ secret: 'pw', lastUsedAt: 0 }],
      name: 'Site',
    });
    expect(root.innerHTML).not.toContain('sp-item-username');
  });

  it('handles a mixed list — some entries with username, some without', () => {
    const root = makeRoot();
    renderList({
      root,
      classPrefix: 'sp',
      entries: [
        { secret: 'pw1', username: 'alice', lastUsedAt: 1000 },
        { secret: 'pw2', lastUsedAt: 500 },
        { secret: 'pw3', username: 'bob@test.com', lastUsedAt: 200 },
      ],
      name: 'Site',
    });
    const buttons = root.querySelectorAll('[data-entry-primary]');
    expect(buttons).toHaveLength(3);
    expect(root.innerHTML).toContain('alice');
    expect(root.innerHTML).toContain('bob@test.com');
    // Second entry has no username — should not have the username class between its own spans
    const secondButton = buttons[1];
    expect(secondButton.innerHTML).not.toContain('sp-item-username');
  });

  it('clicking an entry calls onPrimary with the full entry object including username', async () => {
    const root = makeRoot();
    const onPrimary = jest.fn();
    const entry = { secret: 'pw', username: 'alice@example.com', lastUsedAt: 0 };

    renderList({ root, classPrefix: 'sp', entries: [entry], name: 'Site', onPrimary });

    root.querySelector('[data-entry-primary]').click();
    await Promise.resolve(); // flush async handler

    expect(onPrimary).toHaveBeenCalledWith(entry);
    expect(onPrimary.mock.calls[0][0].username).toBe('alice@example.com');
  });

  it('clicking a legacy entry calls onPrimary with no username field', async () => {
    const root = makeRoot();
    const onPrimary = jest.fn();
    const entry = { secret: 'pw', lastUsedAt: 0 };

    renderList({ root, classPrefix: 'sp', entries: [entry], name: 'Site', onPrimary });

    root.querySelector('[data-entry-primary]').click();
    await Promise.resolve();

    expect(onPrimary).toHaveBeenCalledWith(entry);
    expect(onPrimary.mock.calls[0][0].username).toBeUndefined();
  });
});

describe('formatExpiry', () => {
  const { formatExpiry } = globalThis.SplitPassSecretItem;
  const NOW = 1800000000000;
  const HOUR = 60 * 60 * 1000;
  const DAY = 24 * HOUR;

  it('labels pinned, unknown and past values', () => {
    expect(formatExpiry(null, NOW)).toBe('No expiry');
    expect(formatExpiry(undefined, NOW)).toBe('');
    expect(formatExpiry(NOW - 1, NOW)).toBe('Expired');
  });

  it('picks the coarsest unit that still reads naturally', () => {
    expect(formatExpiry(NOW + 5 * 60 * 1000, NOW)).toBe('Expires in 5m');
    expect(formatExpiry(NOW + 3 * HOUR, NOW)).toBe('Expires in 3h');
    expect(formatExpiry(NOW + 36 * HOUR, NOW)).toBe('Expires in 36h');
    expect(formatExpiry(NOW + 7 * DAY, NOW)).toBe('Expires in 7d');
    expect(formatExpiry(NOW + 30 * DAY, NOW)).toBe('Expires in 30d');
    expect(formatExpiry(NOW + 90 * DAY, NOW)).toBe('Expires in 3mo');
    expect(formatExpiry(NOW + 365 * DAY, NOW)).toBe('Expires in 1y');
  });
});

describe('nextRetention', () => {
  const { nextRetention } = globalThis.SplitPassSecretItem;

  it('cycles auto, extended, pinned and tolerates unknown input', () => {
    expect(nextRetention('auto')).toBe('extended');
    expect(nextRetention('extended')).toBe('pinned');
    expect(nextRetention('pinned')).toBe('auto');
    expect(nextRetention(undefined)).toBe('extended');
    expect(nextRetention('bogus')).toBe('auto');
  });
});

describe('buildMarkup — retention control', () => {
  it('renders the expiry as plain meta by default', () => {
    const html = buildMarkup({ classPrefix: 'sp', name: 'Site', expiresAt: null });
    expect(html).toContain('No expiry');
    expect(html).not.toContain('data-entry-retention');
    expect(html).not.toContain('sp-item-retention');
  });

  it('turns the expiry into a toggle that announces the next level', () => {
    const html = buildMarkup({ classPrefix: 'sp', name: 'Site', expiresAt: null, retention: 'pinned', retentionToggle: true, index: 3 });
    expect(html).toContain('data-entry-retention="3"');
    expect(html).toContain('sp-item-retention');
    expect(html).toContain('title="Click to keep by use"');
  });

  it('keeps the last-used date as a tooltip on the icon only', () => {
    const html = buildMarkup({ classPrefix: 'sp', name: 'Site', lastUsedAt: 0 });
    expect(html).toMatch(/sp-item-icon" title="Last used /);
    expect(html).not.toMatch(/data-entry-primary="0" title=/);
  });
});

describe('renderList — onRetention callback', () => {
  function makeRoot() {
    const root = document.createElement('div');
    document.body.appendChild(root);
    return root;
  }

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('clicking the expiry cycles retention instead of filling', async () => {
    const root = makeRoot();
    const onPrimary = jest.fn();
    const onRetention = jest.fn();
    const entry = { secret: 'pw', retention: 'auto', expiresAt: Date.now() + 1000, lastUsedAt: 0 };

    renderList({ root, classPrefix: 'sp', entries: [entry], name: 'Site', onPrimary, onRetention });
    root.querySelector('[data-entry-retention]').click();
    await Promise.resolve();

    expect(onRetention).toHaveBeenCalledWith(entry, 'extended');
    expect(onPrimary).not.toHaveBeenCalled();
  });

  it('clicking the name still fills', async () => {
    const root = makeRoot();
    const onPrimary = jest.fn();
    const onRetention = jest.fn();
    const entry = { secret: 'pw', retention: 'pinned', expiresAt: null, lastUsedAt: 0 };

    renderList({ root, classPrefix: 'sp', entries: [entry], name: 'Site', onPrimary, onRetention });
    root.querySelector('.sp-item-title').click();
    await Promise.resolve();

    expect(onPrimary).toHaveBeenCalledWith(entry);
    expect(onRetention).not.toHaveBeenCalled();
  });

  it('without onRetention the expiry is inert and the click fills', async () => {
    const root = makeRoot();
    const onPrimary = jest.fn();
    const entry = { secret: 'pw', expiresAt: Date.now() + 1000, lastUsedAt: 0 };

    renderList({ root, classPrefix: 'sp', entries: [entry], name: 'Site', onPrimary });
    expect(root.querySelector('[data-entry-retention]')).toBeNull();

    root.querySelector('.sp-item-meta').click();
    await Promise.resolve();

    expect(onPrimary).toHaveBeenCalledWith(entry);
  });
});

describe('TOTP badge period', () => {
  const { syncTotpBadges } = globalThis.SplitPassTotp;

  function makeRoot() {
    const root = document.createElement('div');
    document.body.appendChild(root);
    return root;
  }

  afterEach(() => {
    document.body.innerHTML = '';
    jest.restoreAllMocks();
  });

  it('carries the URI period on the badge and defaults to 30', () => {
    const root = makeRoot();
    renderList({
      root,
      classPrefix: 'splitpass',
      entries: [
        { secret: 'otpauth://totp/Acme:alice?secret=JBSWY3DPEHPK3PXP&period=60', lastUsedAt: 0 },
        { secret: 'otpauth://totp/Acme:bob?secret=JBSWY3DPEHPK3PXP', lastUsedAt: 0 },
        { secret: 'plain-password', lastUsedAt: 0 },
      ],
      name: 'Acme',
    });

    const badges = root.querySelectorAll('.splitpass-item-type');
    expect(badges).toHaveLength(2);
    expect(badges[0].dataset.period).toBe('60');
    expect(badges[1].dataset.period).toBe('30');
  });

  it('trusts redacted entries that carry isTotp and totpPeriod instead of a secret', () => {
    const root = makeRoot();
    renderList({
      root,
      classPrefix: 'splitpass',
      entries: [
        { id: 'a', isTotp: true, totpPeriod: 45, lastUsedAt: 0 },
        { id: 'b', isTotp: false, lastUsedAt: 0 },
      ],
      name: 'Acme',
    });

    const badges = root.querySelectorAll('.splitpass-item-type');
    expect(badges).toHaveLength(1);
    expect(badges[0].dataset.period).toBe('45');
  });

  it('aligns the countdown to the badge period through custom properties', () => {
    const root = makeRoot();
    renderList({
      root,
      classPrefix: 'splitpass',
      entries: [{ secret: 'otpauth://totp/Acme:alice?secret=JBSWY3DPEHPK3PXP&period=60', lastUsedAt: 0 }],
      name: 'Acme',
    });
    jest.spyOn(Date, 'now').mockReturnValue(1800000015000);

    syncTotpBadges(root);

    const badge = root.querySelector('.splitpass-item-type');
    expect(badge.style.getPropertyValue('--totp-period')).toBe('60s');
    expect(badge.style.getPropertyValue('--totp-delay')).toBe('-15.000s');
  });
});
