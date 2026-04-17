/**
 * @jest-environment jsdom
 *
 * Tests for browser-extension/lib/secret-item.js
 *
 * Covers buildMarkup (username presence/absence, XSS escaping)
 * and renderList (username forwarded from entry objects).
 */

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

  it('still renders the name and meta spans', () => {
    const html = buildMarkup({ classPrefix: 'sp', name: 'GitHub' });
    expect(html).toContain('sp-item-name');
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

  it('renders the / separator before the username without spaces', () => {
    const html = buildMarkup({ classPrefix: 'sp', name: 'GitHub', username: 'alice' });
    expect(html).toContain('/alice');
    expect(html).not.toContain(' / alice');
  });

  it('username span is inside the name span', () => {
    const html = buildMarkup({ classPrefix: 'sp', name: 'GitHub', username: 'alice' });
    const nameOpen = html.indexOf('sp-item-name');
    const usernamePos = html.indexOf('sp-item-username');
    const nameClose = html.indexOf('</span>', nameOpen);
    expect(usernamePos).toBeGreaterThan(nameOpen);
    expect(usernamePos).toBeLessThan(nameClose);
  });

  it('uses the classPrefix for the username span class', () => {
    const html = buildMarkup({ classPrefix: 'splitpass-recent', name: 'Site', username: 'user' });
    expect(html).toContain('class="splitpass-recent-item-username"');
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

  it('adds --deletable modifier class to the button when deletable', () => {
    const html = buildMarkup({ classPrefix: 'sp', name: 'GitHub', deletable: true });
    expect(html).toContain('sp-item--deletable');
  });

  it('delete button has correct data-entry-delete index', () => {
    const html = buildMarkup({ classPrefix: 'sp', name: 'GitHub', deletable: true, index: 2 });
    expect(html).toContain('data-entry-delete="2"');
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

  it('clicking delete calls onDelete with the entry and does not call onPrimary', async () => {
    const root = makeRoot();
    const onDelete = jest.fn();
    const onPrimary = jest.fn();
    const entry = { secret: 'pw', lastUsedAt: 0 };

    renderList({ root, classPrefix: 'sp', entries: [entry], name: 'Site', onDelete, onPrimary });

    root.querySelector('[data-entry-delete]').click();
    await Promise.resolve();

    expect(onDelete).toHaveBeenCalledWith(entry);
    expect(onPrimary).not.toHaveBeenCalled();
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
