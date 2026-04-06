import { SECRET_TYPE } from '../../App.constants';
import { QRParser } from '../QRParser';
import { getSecretRiskMap } from '../secretRisk';

describe('getSecretRiskMap', () => {
  it('marks mediocre secrets based on current strength evaluation', () => {
    const riskMap = getSecretRiskMap([
      { hash: 'strong', value: QRParser.encode('dChz3@t6Nd3G#8K$') },
      { hash: 'weak', value: QRParser.encode('password') },
    ]);

    expect(riskMap.strong.isMediocre).toBe(false);
    expect(riskMap.weak.isMediocre).toBe(true);
  });

  it('marks repeated password secrets when decoded values match', () => {
    const shared = QRParser.encode('same-password');
    const riskMap = getSecretRiskMap([
      { hash: 'a', value: shared },
      { hash: 'b', value: shared },
      { hash: 'c', value: QRParser.encode('different-password') },
    ]);

    expect(riskMap.a.isRepeated).toBe(true);
    expect(riskMap.b.isRepeated).toBe(true);
    expect(riskMap.c.isRepeated).toBe(false);
  });

  it('does not mark non-password types as repeated', () => {
    const seed = QRParser.encode(
      'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
    );
    const totpUri = 'otpauth://totp/GitHub:satoshi?secret=JBSWY3DPEHPK3PXP&issuer=GitHub';
    const riskMap = getSecretRiskMap([
      { hash: 'seed-a', value: seed },
      { hash: 'seed-b', value: seed },
      { hash: 'totp-a', value: QRParser.encode(totpUri, { type: 'totp' }) },
      { hash: 'totp-b', value: QRParser.encode(totpUri, { type: 'totp' }) },
    ]);

    expect(riskMap['seed-a'].isRepeated).toBe(false);
    expect(riskMap['seed-b'].isRepeated).toBe(false);
    expect(riskMap['totp-a'].isRepeated).toBe(false);
    expect(riskMap['totp-b'].isRepeated).toBe(false);
  });

  it('ignores empty values after trim for repeated detection', () => {
    const riskMap = getSecretRiskMap([
      { hash: 'empty-a', value: QRParser.encode('   ') },
      { hash: 'empty-b', value: QRParser.encode('') },
      { hash: 'real', value: QRParser.encode('safe-value') },
    ]);

    expect(riskMap['empty-a'].isRepeated).toBe(false);
    expect(riskMap['empty-b'].isRepeated).toBe(false);
    expect(riskMap.real.isRepeated).toBe(false);
  });

  it('supports a secret being both mediocre and repeated', () => {
    const weak = QRParser.encode('password');
    const riskMap = getSecretRiskMap([
      { hash: 'first', value: weak },
      { hash: 'second', value: weak },
    ]);

    expect(riskMap.first).toEqual({ isMediocre: true, isRepeated: true });
    expect(riskMap.second).toEqual({ isMediocre: true, isRepeated: true });
  });

  it('does not mark secure password payloads as repeated candidates', () => {
    const riskMap = getSecretRiskMap([
      { hash: 'secure-a', value: `${SECRET_TYPE.PASSWORD_SECURE}01020304` },
      { hash: 'secure-b', value: `${SECRET_TYPE.PASSWORD_SECURE}01020304` },
    ]);

    expect(riskMap['secure-a'].isRepeated).toBe(false);
    expect(riskMap['secure-b'].isRepeated).toBe(false);
  });
});
