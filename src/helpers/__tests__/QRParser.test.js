import { QRParser } from '../QRParser';

describe('helpers/QRParser', () => {
  test('alive', () => {
    expect(QRParser).toBeDefined();
    expect(QRParser.encode).toBeDefined();
    expect(QRParser.decode).toBeDefined();
  });

  describe('encode', () => {
    const password = 'RkJGprL9Eh63X$Yg';
    const pin = '123456';
    const seedPhrase12 = 'roast soon winter over sentence shaft shock side mango select screen neither';
    const seedPhrase24 =
      'fluid say radar bring attend rice artefact miracle rifle afraid swarm trend afford atom dash cheap acid absorb brief add cause stadium rack moon';

    test('should encode default value without PIN', () => {
      expect(QRParser.encode(password)).toEqual('143103532151737613007585549655006');
    });

    test('should encode default value with PIN', () => {
      expect(QRParser.encode(password, pin)).toEqual('255448144496349958619820151990618');
    });

    test('should encode seed phrase value without PIN', () => {
      expect(QRParser.encode(seedPhrase12)).toEqual('3149716592017126415681576158716001082156315491186');
      expect(QRParser.encode(seedPhrase12.split(' '))).toEqual('3149716592017126415681576158716001082156315491186');
      expect(QRParser.encode(seedPhrase24)).toEqual(
        '3071815361414022601171482010411321486003717561857003601150446031200160007022400260293169614131149',
      );
      expect(QRParser.encode(seedPhrase24.split(' '))).toEqual(
        '3071815361414022601171482010411321486003717561857003601150446031200160007022400260293169614131149',
      );
    });

    test('should encode seed phrase value with PIN', () => {
      expect(QRParser.encode(seedPhrase12, pin)).toEqual('4262162615463249861704922271162124438279761514532');
      expect(QRParser.encode(seedPhrase12.split(' '), pin)).toEqual(
        '4262162615463249861704922271162124438279761514532',
      );
      expect(QRParser.encode(seedPhrase24, pin)).toEqual(
        '4194261484860145057294838133867444832126163684203126057273892154656283453145856383649282060254595',
      );
      expect(QRParser.encode(seedPhrase24.split(' '), pin)).toEqual(
        '4194261484860145057294838133867444832126163684203126057273892154656283453145856383649282060254595',
      );
    });
  });

  describe('decode', () => {
    const password = '143103532151737613007585549655006';
    const passwordEncrypted = '255448144496349958619820151990618';
    const pin = '123456';
    const seedPhrase12 = '3149716592017126415681576158716001082156315491186';
    const seedPhrase12Encrypted = '4262162615463249861704922271162124438279761514532';
    const seedPhrase24 =
      '3071815361414022601171482010411321486003717561857003601150446031200160007022400260293169614131149';
    const seedPhrase24Encrypted =
      '4194261484860145057294838133867444832126163684203126057273892154656283453145856383649282060254595';

    test('should decode default value without PIN', () => {
      expect(QRParser.decode(password)).toEqual('RkJGprL9Eh63X$Yg');
    });

    test('should decode default value with PIN', () => {
      expect(QRParser.decode(passwordEncrypted, pin)).toEqual('RkJGprL9Eh63X$Yg');
    });

    test('should decode seed phrase value without PIN', () => {
      expect(QRParser.decode(seedPhrase12)).toEqual(
        'roast soon winter over sentence shaft shock side mango select screen neither',
      );
      expect(QRParser.decode(seedPhrase24)).toEqual(
        'fluid say radar bring attend rice artefact miracle rifle afraid swarm trend afford atom dash cheap acid absorb brief add cause stadium rack moon',
      );
    });

    test('should decode seed phrase value with PIN', () => {
      expect(QRParser.decode(seedPhrase12Encrypted, pin)).toEqual(
        'roast soon winter over sentence shaft shock side mango select screen neither',
      );
      expect(QRParser.decode(seedPhrase24Encrypted, pin)).toEqual(
        'fluid say radar bring attend rice artefact miracle rifle afraid swarm trend afford atom dash cheap acid absorb brief add cause stadium rack moon',
      );
    });
  });
});
