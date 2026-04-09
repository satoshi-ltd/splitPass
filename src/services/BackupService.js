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

export const BackupService = {
  export: async ({ store } = {}) =>
    // eslint-disable-next-line no-undef, no-async-promise-executor
    new Promise(async (resolve, reject) => {
      try {
        const fileName = getBackupFileName();
        const payload = await store.exportBackup();
        const data = JSON.stringify(payload);

        const isSharingAvailable = await Sharing.isAvailableAsync();
        if (!isSharingAvailable) return reject(L10N.ERROR_EXPORT);

        const fileUri = FileSystem.documentDirectory + fileName;
        await FileSystem.writeAsStringAsync(fileUri, data);
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/octet-stream',
          dialogTitle: fileName,
        });
        await FileSystem.deleteAsync(fileUri, { idempotent: true });

        resolve(true);

        // BackupService.scheduleNotification();
      } catch (error) {
        reject(`${L10N.ERROR}: ${getErrorMessage(error)}`);
      }
    }),

  import: async () =>
    // eslint-disable-next-line no-undef, no-async-promise-executor
    new Promise(async (resolve, reject) => {
      try {
        const { canceled, assets = [] } = await DocumentPicker.getDocumentAsync({
          copyToCacheDirectory: true,
          multiple: false,
          type: '*/*',
        });
        const file = assets && assets[0] ? assets[0] : {};

        if (!canceled && file.uri) {
          const fileData = await FileSystem.readAsStringAsync(file.uri);
          const jsonData = JSON.parse(fileData);

          if (isEncryptedEnvelope(jsonData)) {
            resolve({ format: 'encrypted', payload: jsonData });
            return;
          }

          const { secrets = [], settings = {} } = jsonData;
          const hasSecrets = Array.isArray(secrets);
          const hasSettings = settings && typeof settings === 'object' && !Array.isArray(settings);

          if (!hasSecrets && !hasSettings) return reject(L10N.ERROR_IMPORT);

          resolve({ format: 'legacy', payload: { secrets, settings } });
        } else {
          resolve();
        }
      } catch (error) {
        reject(`${L10N.ERROR}: ${getErrorMessage(error)}`);
      }
    }),
};

export { getBackupFileName };
