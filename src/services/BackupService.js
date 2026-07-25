import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

import { isEncryptedEnvelope, L10N } from '../modules';

const getErrorMessage = (error) => error?.message || String(error) || 'Unknown error';
const formatBackupTimestamp = (value = new Date()) =>
  value
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z$/, 'Z');
const getBackupSuffix = () => Math.random().toString(36).slice(2, 8).padEnd(6, '0').slice(0, 6);
const getBackupFileName = () => `archive-${formatBackupTimestamp()}-${getBackupSuffix()}.dat`;
const MAX_BACKUP_BYTES = 10 * 1024 * 1024;

export const BackupService = {
  export: async ({ store, passphrase } = {}) => {
    let fileUri;

    try {
      const fileName = getBackupFileName();
      const payload = await store.exportBackup(passphrase);
      const data = JSON.stringify(payload);

      const isSharingAvailable = await Sharing.isAvailableAsync();
      if (!isSharingAvailable) throw L10N.ERROR_EXPORT;

      fileUri = `${FileSystem.cacheDirectory || FileSystem.documentDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(fileUri, data);
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/octet-stream',
        dialogTitle: fileName,
      });

      return true;

      // BackupService.scheduleNotification();
    } catch (error) {
      if (error === L10N.ERROR_EXPORT) throw error;
      throw `${L10N.ERROR}: ${getErrorMessage(error)}`;
    } finally {
      if (fileUri) await FileSystem.deleteAsync(fileUri, { idempotent: true });
    }
  },

  import: async () => {
    let fileUri;

    try {
      const { canceled, assets = [] } = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        multiple: false,
        type: '*/*',
      });
      const file = assets && assets[0] ? assets[0] : {};
      fileUri = file.uri;

      if (!canceled && fileUri) {
        if (Number(file.size) > MAX_BACKUP_BYTES) throw L10N.ERROR_IMPORT;

        const fileData = await FileSystem.readAsStringAsync(fileUri);
        const jsonData = JSON.parse(fileData);

        if (isEncryptedEnvelope(jsonData)) {
          return { format: 'encrypted', payload: jsonData };
        }

        const { secrets = [], settings = {} } = jsonData;
        const hasSecrets = Array.isArray(secrets);
        const hasSettings = settings && typeof settings === 'object' && !Array.isArray(settings);

        if (!hasSecrets && !hasSettings) throw L10N.ERROR_IMPORT;

        return { format: 'legacy', payload: { secrets, settings } };
      }

      return undefined;
    } catch (error) {
      if (error === L10N.ERROR_IMPORT) throw error;
      throw `${L10N.ERROR}: ${getErrorMessage(error)}`;
    } finally {
      if (fileUri) await FileSystem.deleteAsync(fileUri, { idempotent: true });
    }
  },
};

export { getBackupFileName };
