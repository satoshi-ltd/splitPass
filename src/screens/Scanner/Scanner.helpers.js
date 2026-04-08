import { READER_TYPE, SECRET_TYPE, SHARD_TYPES } from '../../App.constants';
import { L10N } from '../../modules/l10n';
import { isTOTPURI, parseTOTPURI } from '../../modules/totp';

const getScannedValue = (payload = '') => (typeof payload === 'string' ? payload : payload?.value || '');

const resolveScannerPayload = (payload = '') => {
  const scannedValue = getScannedValue(payload);
  const externalTOTP = scannedValue && isTOTPURI(scannedValue) ? parseTOTPURI(scannedValue) : undefined;

  if (externalTOTP) {
    return { kind: 'totp', scannedValue, totp: externalTOTP };
  }

  const type = scannedValue[0];

  if (!Object.values(SECRET_TYPE).includes(type)) {
    return { kind: 'unsupported', scannedValue, type };
  }

  return { kind: 'secret', scannedValue, type };
};

const getScannerInstructions = ({ readerType = READER_TYPE.QR, showPasscodePrompt = false, values = [] } = {}) => {
  const [type] = values[0] || [];
  const isShard = SHARD_TYPES.includes(type);
  const isComplete = values.length > 0 && (!isShard || values.length > 1);

  if (showPasscodePrompt) {
    return {
      caption: L10N.SCANNER_PASSCODE_CAPTION,
      title: L10N.PASSCODE,
    };
  }

  if (isShard && values.length === 1) {
    return {
      caption: L10N.SCANNER_SHARD_PROGRESS_CAPTION,
      title: L10N.SCANNER_SHARD_PROGRESS_TITLE,
    };
  }

  if (isComplete) {
    return {
      caption: L10N.SCANNER_SECRET_READY_CAPTION,
      title: L10N.SCANNER_SECRET_READY,
    };
  }

  return readerType === READER_TYPE.NFC
    ? { caption: L10N.SCANNER_NFC_CAPTION, title: L10N.SCANNER_NFC }
    : { caption: L10N.SCANNER_QR_CAPTION, title: L10N.SCANNER_QR };
};

export { getScannedValue, getScannerInstructions, resolveScannerPayload };
