import { QRParser } from '../QRParser';

const password = 'RkJGprL9Eh63X$Yg';
const seed12 = 'roast soon winter over sentence shaft shock side mango select screen neither';
const seed24 =
  'fluid say radar bring attend rice artefact miracle rifle afraid swarm trend afford atom dash cheap acid absorb brief add cause stadium rack moon';

const qrPassword = '144113633161838623108595650665107';
const qrSeed12 = '3149716592017126415681576158716001082156315491186';
const qrSeed24 = '3071815361414022601171482010411321486003717561857003601150446031200160007022400260293169614131149';

describe('helpers/QRParser', () => {
  test('alive', () => {
    expect(QRParser).toBeDefined();
    expect(QRParser.encode).toBeDefined();
    expect(QRParser.decode).toBeDefined();
    expect(QRParser.split).toBeDefined();
    expect(QRParser.combine).toBeDefined();
  });

  describe('encode', () => {
    test('should encode default value', () => {
      expect(QRParser.encode(password)).toEqual(qrPassword);
    });

    test('should encode seed phrase value', () => {
      expect(QRParser.encode(seed12)).toEqual(qrSeed12);
      expect(QRParser.encode(seed12.split(' '))).toEqual(qrSeed12);
      expect(QRParser.encode(seed24)).toEqual(qrSeed24);
      expect(QRParser.encode(seed24.split(' '))).toEqual(qrSeed24);
    });
  });

  describe('decode', () => {
    test('should decode default value', () => {
      expect(QRParser.decode(qrPassword)).toEqual('RkJGprL9Eh63X$Yg');
    });

    test('should decode seed phrase value', () => {
      expect(QRParser.decode(qrSeed12)).toEqual(seed12);
      expect(QRParser.decode(qrSeed24)).toEqual(seed24);
    });
  });

  describe('split', () => {
    test('should split value in 3 shards', () => {
      let shards = QRParser.split(qrPassword);
      expect(shards.length).toEqual(3);
      expect(shards[0]).toEqual('100113600161800623100595600665100');
      expect(shards[1]).toEqual('144110033160038620008590050660007');
      expect(shards[2]).toEqual('144003633001838003108005650005107');

      shards = QRParser.split(qrSeed12);
      expect(shards.length).toEqual(3);
      expect(shards[0]).toEqual('3000016592017000015681576000016001082000015491186');
      expect(shards[1]).toEqual('3149716590000126415680000158716000000156315490000');
      expect(shards[2]).toEqual('3149700002017126400001576158700001082156300001186');

      shards = QRParser.split(qrSeed24);
      expect(shards.length).toEqual(3);
      expect(shards[0]).toEqual(
        '3000015361414000001171482000011321486000017561857000001150446000000160007000000260293000014131149',
      );
      expect(shards[1]).toEqual(
        '3071815360000022601170000010411320000003717560000003601150000031200160000022400260000169614130000',
      );
      expect(shards[2]).toEqual(
        '3071800001414022600001482010400001486003700001857003600000446031200000007022400000293169600001149',
      );
    });
  });

  describe('combined', () => {
    test('should combine n shards in a value', () => {
      [qrPassword, qrSeed12, qrSeed24].forEach((qr) => {
        const shards = QRParser.split(qr);

        expect(shards.length).toEqual(3);
        expect(QRParser.combine(shards[0], shards[1])).toEqual(qr);
        expect(QRParser.combine(shards[0], shards[2])).toEqual(qr);
        expect(QRParser.combine(shards[1], shards[2])).toEqual(qr);

        expect(QRParser.combine(shards[0], shards[0])).not.toEqual(qr);
        expect(QRParser.combine(shards[1], shards[1])).not.toEqual(qr);
        expect(QRParser.combine(shards[2], shards[2])).not.toEqual(qr);
      });
    });
  });

  test('workflow', () => {
    let qr = QRParser.encode(password);

    expect(qr).toEqual(qrPassword);
    let shards = QRParser.split(qr);
    expect(QRParser.decode(QRParser.combine(shards[0], shards[1]))).toEqual(password);
    expect(QRParser.decode(qr)).toEqual(password);

    qr = QRParser.encode(seed12);
    shards = QRParser.split(qr);
    expect(QRParser.decode(QRParser.combine(shards[0], shards[1]))).toEqual(seed12);
    expect(QRParser.decode(qr)).toEqual(seed12);

    qr = QRParser.encode(seed24);
    shards = QRParser.split(qr);
    expect(QRParser.decode(QRParser.combine(shards[0], shards[1]))).toEqual(seed24);
    expect(QRParser.decode(qr)).toEqual(seed24);
  });
});
