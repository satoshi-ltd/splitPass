import { QRParser } from '../QRParser';

const password = 'RkJGprL9Eh63X$Yg';
const seed12 = 'roast soon winter over sentence shaft shock side mango select screen neither';
const seed24 =
  'fluid say radar bring attend rice artefact miracle rifle afraid swarm trend afford atom dash cheap acid absorb brief add cause stadium rack moon';

const passwordDigits = '144113633161838623108595650665107';
const seed12Digits = '3149716592017126415681576158716001082156315491186';
const seed24Digits =
  '3071815361414022601171482010411321486003717561857003601150446031200160007022400260293169614131149';

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
      expect(QRParser.encode(password)).toEqual('44113633161838623108595650665107');
    });

    test('should encode seed phrase value', () => {
      expect(QRParser.encode(seed12)).toEqual('149716592017126415681576158716001082156315491186');
      expect(QRParser.encode(seed12.split(' '))).toEqual('149716592017126415681576158716001082156315491186');
      expect(QRParser.encode(seed24)).toEqual(
        '071815361414022601171482010411321486003717561857003601150446031200160007022400260293169614131149',
      );
      expect(QRParser.encode(seed24.split(' '))).toEqual(
        '071815361414022601171482010411321486003717561857003601150446031200160007022400260293169614131149',
      );
    });
  });

  describe('decode', () => {
    test('should decode default value', () => {
      expect(QRParser.decode(passwordDigits)).toEqual('RkJGprL9Eh63X$Yg');
    });

    test('should decode seed phrase value', () => {
      expect(QRParser.decode(seed12Digits)).toEqual(
        'roast soon winter over sentence shaft shock side mango select screen neither',
      );
      expect(QRParser.decode(seed24Digits)).toEqual(
        'fluid say radar bring attend rice artefact miracle rifle afraid swarm trend afford atom dash cheap acid absorb brief add cause stadium rack moon',
      );
    });
  });

  describe('split', () => {
    test('should split value in 3 shards', () => {
      let shards = QRParser.split(passwordDigits);
      expect(shards.length).toEqual(3);
      expect(shards[0]).toEqual('044013033061038023008095050065007');
      expect(shards[1]).toEqual('140110630160830620100590650660100');
      expect(shards[2]).toEqual('104103603101808603108505600605107');

      shards = QRParser.split(seed12Digits);
      expect(shards.length).toEqual(3);
      expect(shards[0]).toEqual('0140710590010120410680570150710000080150310490180');
      expect(shards[1]).toEqual('3109706502007106405601506108706001002106305401106');
      expect(shards[2]).toEqual('3049016092017026015081076058016001082056015091086');

      shards = QRParser.split(seed24Digits);
      expect(shards.length).toEqual(3);
      expect(shards[0]).toEqual(
        '0070810360410020600170480010410320480000710560850000600150440030200160000020400260290160610130140',
      );
      expect(shards[1]).toEqual(
        '3001805301404002601101402000401301406003707501807003601100406001200100007002400200203109604101109',
      );
      expect(shards[2]).toEqual(
        '3071015061014022001071082010011021086003017061057003001050046031000060007022000060093069014031049',
      );
    });
  });

  describe('combined', () => {
    test('should combine n shards in a value', () => {
      [passwordDigits, seed12Digits, seed24Digits].forEach((digits) => {
        const shards = QRParser.split(digits);

        expect(shards.length).toEqual(3);
        expect(QRParser.combine(shards[0], shards[1])).toEqual(digits);
        expect(QRParser.combine(shards[0], shards[2])).toEqual(digits);
        expect(QRParser.combine(shards[1], shards[2])).toEqual(digits);

        expect(QRParser.combine(shards[0], shards[0])).not.toEqual(digits);
        expect(QRParser.combine(shards[1], shards[1])).not.toEqual(digits);
        expect(QRParser.combine(shards[2], shards[2])).not.toEqual(digits);
      });
    });
  });
});
