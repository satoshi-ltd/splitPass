import { SECRET_TYPE } from '../../App.constants';
import { Cypher } from '../cypher';
import { QRParser } from '../QRParser';
import { buildCardValue } from '../secretValueDisplay';

const PIN = '246813';
const SEED = 'abandon ability able about above absent absorb abstract absurd abuse access accident';

const legacySecure = (qr, secureType) => {
  const [, ...digits] = qr;

  return `${secureType}${Cypher.encrypt(digits.join(''), PIN)}`;
};

describe('QRParser backward compatibility — legacy QR/NFC still decode', () => {
  it('decodes a legacy password QR (type 1)', () => {
    const pw = 'dChz3@t6Nd3G#8K$';
    const qr = QRParser.encode(pw);

    expect(qr[0]).toBe(SECRET_TYPE.PASSWORD);
    expect(QRParser.decode(qr)).toBe(pw);
  });

  it('decodes a legacy secure password QR (type 2) with its PIN', () => {
    const pw = 'dChz3@t6Nd3G#8K$';
    const secureQr = legacySecure(QRParser.encode(pw), SECRET_TYPE.PASSWORD_SECURE);

    expect(secureQr[0]).toBe(SECRET_TYPE.PASSWORD_SECURE);
    expect(QRParser.decode(secureQr, PIN)).toBe(pw);
    expect(QRParser.decode(secureQr, '000000')).not.toBe(pw);
  });

  it('decodes a legacy seed-phrase QR (type 4)', () => {
    const qr = QRParser.encode(SEED);

    expect(qr[0]).toBe(SECRET_TYPE.SEED_PHRASE);
    expect(QRParser.decode(qr)).toBe(SEED);
  });

  it('decodes a legacy secure seed-phrase QR (type 5) with its PIN', () => {
    const secureQr = legacySecure(QRParser.encode(SEED), SECRET_TYPE.SEED_PHRASE_SECURE);

    expect(secureQr[0]).toBe(SECRET_TYPE.SEED_PHRASE_SECURE);
    expect(QRParser.decode(secureQr, PIN)).toBe(SEED);
  });

  it('decodes a legacy card QR (type 7) and secure card (type 8)', () => {
    const card = buildCardValue('4111111111111111', '12/29', '123');
    const qr = QRParser.encode(card, { type: 'card' });

    expect(qr[0]).toBe(SECRET_TYPE.CARD);
    expect(QRParser.decode(qr)).toBe(card);
    expect(QRParser.decode(legacySecure(qr, SECRET_TYPE.CARD_SECURE), PIN)).toBe(card);
  });

  it('decodes a legacy TOTP QR (type A)', () => {
    const uri = 'otpauth://totp/Acme:me?secret=JBSWY3DPEHPK3PXP&issuer=Acme';
    const qr = QRParser.encode(uri, { type: 'totp' });

    expect(qr[0]).toBe(SECRET_TYPE.TOTP);
    expect(QRParser.decode(qr)).toBe(uri);
  });

  it('decodes a legacy username envelope (type B)', () => {
    const wrapped = QRParser.encodeWithUsername('10203040', 'alice@site.com');
    const { username, value } = QRParser.decodeWithUsername(wrapped);

    expect(wrapped[0]).toBe('B');
    expect(username).toBe('alice@site.com');
    expect(value).toBe('10203040');
  });
});
