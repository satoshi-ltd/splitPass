import { SECRET_TYPE } from '../../App.constants';
import { Cypher } from '../cypher';
import { QRParser } from '../QRParser';
import { buildCardValue, getMaskedCardValue, parseCardValue } from '../secretValueDisplay';

const CARD_NUMBER = '4111111111111111';
const CARD_EXPIRE = '12/29';
const CARD_CVV = '123';
const CARD_VALUE = buildCardValue(CARD_NUMBER, CARD_EXPIRE, CARD_CVV);
const PASSCODE = '123456';

describe('QRParser card support', () => {
  it('round-trips a card qr', () => {
    const qr = QRParser.encode(CARD_VALUE, { type: 'card' });

    expect(qr[0]).toBe(SECRET_TYPE.CARD);
    expect(QRParser.decode(qr)).toBe(CARD_VALUE);
  });

  it('round-trips a secure card qr with the correct passcode', () => {
    const qr = QRParser.encode(CARD_VALUE, { type: 'card' });
    const [, ...digits] = qr;
    const secureQr = `${SECRET_TYPE.CARD_SECURE}${Cypher.encrypt(digits.join(''), PASSCODE)}`;

    expect(QRParser.decode(secureQr, PASSCODE)).toBe(CARD_VALUE);
    expect(QRParser.decode(secureQr, '000000')).toBeUndefined();
  });

  it('creates 3 secure card shards that reconstruct from any pair', () => {
    const qr = QRParser.encode(CARD_VALUE, { type: 'card' });
    const shards = QRParser.split(qr);

    expect(shards).toHaveLength(3);
    shards.forEach((shard) => expect(shard[0]).toBe(SECRET_TYPE.CARD_SHARD_V2));

    const pairs = [
      [shards[0], shards[1]],
      [shards[0], shards[2]],
      [shards[1], shards[2]],
    ];

    pairs.forEach((pair) => {
      const combined = QRParser.combine(...pair);
      expect(combined[0]).toBe(SECRET_TYPE.CARD);
      expect(QRParser.decode(combined)).toBe(CARD_VALUE);
    });
  });

  it('never exposes card details in a single shard', () => {
    const qr = QRParser.encode(CARD_VALUE, { type: 'card' });
    const [firstShard] = QRParser.split(qr);

    expect(firstShard.slice(1)).not.toContain(CARD_NUMBER);
    expect(QRParser.decode(firstShard.slice(1))).not.toBe(CARD_VALUE);
    expect(QRParser.combine(firstShard)).not.toBe(qr);
  });
});

describe('card display helpers', () => {
  it('parses canonical card values and masks details coherently', () => {
    expect(parseCardValue(CARD_VALUE)).toEqual({
      canonical: CARD_VALUE,
      cvv: CARD_CVV,
      expire: CARD_EXPIRE,
      number: CARD_NUMBER,
    });

    expect(getMaskedCardValue(CARD_VALUE)).toEqual({
      cvv: '***',
      expire: '**/**',
      number: '**** **** **** ****',
    });
  });
});
