import { QRParser } from '../QRParser';

const password = 'RkJGprL9Eh63X$Yg';
const seed12 = 'roast soon winter over sentence shaft shock side mango select screen neither';
const seed24 =
  'fluid say radar bring attend rice artefact miracle rifle afraid swarm trend afford atom dash cheap acid absorb brief add cause stadium rack moon';

const qrPassword = '144113633161838623108595650665107';
const qrPasswordSecure = '244113633161838623108595650665107';
const qrPasswordShard = '344113633161838623108595650665107';
const qrSeed12 = '4149716592017126415681576158716001082156315491186';
const qrSeed12Secure = '5149716592017126415681576158716001082156315491186';
const qrSeed12Shard = '6149716592017126415681576158716001082156315491186';
const qrSeed24 = '4071815361414022601171482010411321486003717561857003601150446031200160007022400260293169614131149';
const qrSeed24Secure =
  '5071815361414022601171482010411321486003717561857003601150446031200160007022400260293169614131149';
const qrSeed24Shard =
  '6071815361414022601171482010411321486003717561857003601150446031200160007022400260293169614131149';

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

    describe('secure mode', () => {
      const secure = true;
      test('should encode default value', () => {
        expect(QRParser.encode(password, secure)).toEqual(qrPasswordSecure);
      });

      test('should encode seed phrase value', () => {
        expect(QRParser.encode(seed12, secure)).toEqual(qrSeed12Secure);
        expect(QRParser.encode(seed12.split(' '), secure)).toEqual(qrSeed12Secure);
        expect(QRParser.encode(seed24, secure)).toEqual(qrSeed24Secure);
        expect(QRParser.encode(seed24.split(' '), secure)).toEqual(qrSeed24Secure);
      });
    });
  });

  describe('decode', () => {
    test('should decode default value', () => {
      expect(QRParser.decode(qrPassword)).toEqual(password);
      expect(QRParser.decode(qrPasswordSecure)).toEqual(password);
    });

    test('should decode seed phrase value', () => {
      expect(QRParser.decode(qrSeed12)).toEqual(seed12);
      expect(QRParser.decode(qrSeed24)).toEqual(seed24);
      expect(QRParser.decode(qrSeed12Secure)).toEqual(seed12);
      expect(QRParser.decode(qrSeed24Secure)).toEqual(seed24);
    });
  });

  describe('split', () => {
    test('should split value in 3 shards', () => {
      let shards = QRParser.split(qrPassword);
      expect(shards.length).toEqual(3);
      expect(shards[0]).toEqual('300113600161800623100595600665100');
      expect(shards[1]).toEqual('344110033160038620008590050660007');
      expect(shards[2]).toEqual('344003633001838003108005650005107');

      shards = QRParser.split(qrSeed12);
      expect(shards.length).toEqual(3);
      expect(shards[0]).toEqual('6000016592017000015681576000016001082000015491186');
      expect(shards[1]).toEqual('6149716590000126415680000158716000000156315490000');
      expect(shards[2]).toEqual('6149700002017126400001576158700001082156300001186');

      shards = QRParser.split(qrSeed24);
      expect(shards.length).toEqual(3);
      expect(shards[0]).toEqual(
        '6000015361414000001171482000011321486000017561857000001150446000000160007000000260293000014131149',
      );
      expect(shards[1]).toEqual(
        '6071815360000022601170000010411320000003717560000003601150000031200160000022400260000169614130000',
      );
      expect(shards[2]).toEqual(
        '6071800001414022600001482010400001486003700001857003600000446031200000007022400000293169600001149',
      );
    });
  });

  describe('combined', () => {
    test('should combine n shards in a value', () => {
      [
        [qrPassword, qrPasswordShard],
        [qrSeed12, qrSeed12Shard],
        [qrSeed24, qrSeed24Shard],
      ].forEach(([qr, qrCombined]) => {
        const shards = QRParser.split(qr);

        expect(shards.length).toEqual(3);
        expect(QRParser.combine(shards[0], shards[1])).toEqual(qrCombined);
        expect(QRParser.combine(shards[0], shards[2])).toEqual(qrCombined);
        expect(QRParser.combine(shards[1], shards[2])).toEqual(qrCombined);

        expect(QRParser.combine(shards[0], shards[0])).not.toEqual(qrCombined);
        expect(QRParser.combine(shards[1], shards[1])).not.toEqual(qrCombined);
        expect(QRParser.combine(shards[2], shards[2])).not.toEqual(qrCombined);
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
