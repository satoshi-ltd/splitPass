import { SECRET_TYPE } from '../../App.constants';
import { getUnsupportedChars, QRParser } from '../QRParser';
import { chars } from '../repositories/chars';

describe('QRParser password support', () => {
  it('round-trips passwords that include tilde', () => {
    const secret = 'hy,E-*xj5_~H';
    const qr = QRParser.encode(secret);

    expect(qr[0]).toBe(SECRET_TYPE.PASSWORD);
    expect(QRParser.decode(qr)).toBe(secret);
  });

  it('round-trips passwords that end with apostrophe', () => {
    const secret = "D<SpL}~%@C~39pj'";
    const qr = QRParser.encode(secret);

    expect(qr[0]).toBe(SECRET_TYPE.PASSWORD);
    expect(QRParser.decode(qr)).toBe(secret);
  });

  it('round-trips passwords with all previously missing ascii symbols', () => {
    const secret = 'Aa0 !"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~ Z';
    const qr = QRParser.encode(secret);

    expect(qr[0]).toBe(SECRET_TYPE.PASSWORD);
    expect(QRParser.decode(qr)).toBe(secret);
  });

  it('trims leading and trailing spaces', () => {
    const secret = '  keep edge spaces  ';
    const qr = QRParser.encode(secret);

    expect(qr[0]).toBe(SECRET_TYPE.PASSWORD);
    expect(QRParser.decode(qr)).toBe('keep edge spaces');
  });

  it('includes full printable ascii set in password charset', () => {
    const printableAscii = Array.from({ length: 95 }, (_, index) => String.fromCharCode(index + 32));

    expect(new Set(chars).size).toBe(chars.length);
    printableAscii.forEach((character) => expect(chars.includes(character)).toBe(true));
  });

  it('round-trips a corpus of common app-style passwords', () => {
    const corpus = [
      'G7m#2vP@4k!L9qN$',
      'mE!2$-pA_9+Tq=7v',
      "Q4'vR8~kP2@zM6!s",
      'N0rdPass style 2026!',
      'Bitwarden_like-value.42',
      '1Password/entry?ok=yes',
      'KeepassXC{vault}|safe',
      'dash-lower_UPPER.1234',
      'path\\to\\secret\\value',
      'backtick`quote"apostrophe\'',
    ];

    corpus.forEach((secret) => {
      const qr = QRParser.encode(secret);
      expect(qr[0]).toBe(SECRET_TYPE.PASSWORD);
      expect(QRParser.decode(qr)).toBe(secret);
    });
  });

  describe('characters outside the encoding table', () => {
    it.each([
      ['contrasena with a tilde', 'contrase\u00f1a'],
      ['an accented vowel', 'caf\u00e92026!'],
      ['a non-latin letter', '\u03a9-secret'],
      ['an emoji', 'wallet\ud83d\udd11'],
    ])('refuses to encode %s instead of dropping it', (_label, secret) => {
      expect(QRParser.encode(secret)).toBeUndefined();
    });

    it('reports every unsupported character once', () => {
      expect(getUnsupportedChars('contrase\u00f1a con \u00e1cento y \u00f1')).toEqual(['\u00f1', '\u00e1']);
      expect(getUnsupportedChars('plain-ascii-2026!')).toEqual([]);
    });

    it('keeps encoding every character the table does support', () => {
      const supported = chars.join('');

      expect(QRParser.decode(QRParser.encode(supported))).toEqual(supported);
    });
  });
});
