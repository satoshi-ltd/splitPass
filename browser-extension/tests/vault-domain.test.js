/**
 * @jest-environment node
 */

require('../lib/vault.js');

const { normalizeDomain } = globalThis.SplitPassVault;

describe('normalizeDomain — registrable domain scoping', () => {
  it('collapses subdomains of a normal registrable domain', () => {
    expect(normalizeDomain('www.google.com')).toBe('google.com');
    expect(normalizeDomain('mail.google.com')).toBe('google.com');
    expect(normalizeDomain('accounts.google.com')).toBe('google.com');
    expect(normalizeDomain('https://member.lazada.co.th/x')).toBe('lazada.co.th');
  });

  it('keeps sibling tenants of a shared multi-tenant host on distinct keys', () => {
    expect(normalizeDomain('alice.github.io')).toBe('alice.github.io');
    expect(normalizeDomain('bob.github.io')).toBe('bob.github.io');
    expect(normalizeDomain('myapp.herokuapp.com')).toBe('myapp.herokuapp.com');
    expect(normalizeDomain('evil.herokuapp.com')).toBe('evil.herokuapp.com');

    expect(normalizeDomain('myapp.herokuapp.com')).not.toBe(normalizeDomain('evil.herokuapp.com'));
    expect(normalizeDomain('alice.github.io')).not.toBe(normalizeDomain('bob.github.io'));
  });

  it('handles private suffixes across providers', () => {
    expect(normalizeDomain('team.vercel.app')).toBe('team.vercel.app');
    expect(normalizeDomain('foo.pages.dev')).toBe('foo.pages.dev');
    expect(normalizeDomain('app.web.app')).toBe('app.web.app');
  });

  it('handles compound ICANN suffixes', () => {
    expect(normalizeDomain('shop.example.co.uk')).toBe('example.co.uk');
    expect(normalizeDomain('a.b.example.com.au')).toBe('example.com.au');
  });

  it('no longer misfires on 3-char SLDs (bar.io is the registrable domain)', () => {
    expect(normalizeDomain('foo.bar.io')).toBe('bar.io');
  });

  it('scopes compound country suffixes that are not in the list', () => {
    expect(normalizeDomain('banesco.com.ve')).toBe('banesco.com.ve');
    expect(normalizeDomain('www.banesco.com.ve')).toBe('banesco.com.ve');
    expect(normalizeDomain('iitb.ac.in')).toBe('iitb.ac.in');
    expect(normalizeDomain('portal.gov.in')).toBe('portal.gov.in');

    expect(normalizeDomain('banesco.com.ve')).not.toBe(normalizeDomain('otrobanco.com.ve'));
  });

  it('still collapses subdomains of short registrable domains', () => {
    expect(normalizeDomain('mail.bbc.com')).toBe('bbc.com');
    expect(normalizeDomain('www.ibm.com')).toBe('ibm.com');
  });

  it('leaves bare registrable domains and single labels untouched', () => {
    expect(normalizeDomain('google.com')).toBe('google.com');
    expect(normalizeDomain('localhost')).toBe('localhost');
  });
});
