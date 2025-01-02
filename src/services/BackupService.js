import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import { L10N } from '../modules';

const IS_WEB = Platform.OS === 'web';

export const BackupService = {
  export: async ({ secrets = [], settings = {} } = {}) =>
    // eslint-disable-next-line no-undef, no-async-promise-executor
    new Promise(async (resolve, reject) => {
      try {
        const fileName = `secret-qr-${new Date().toISOString()}.json`;
        const data = JSON.stringify({ secrets, settings });

        if (IS_WEB) {
          const el = document.createElement('a');
          el.href = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
          el.download = fileName;
          return el.click();
        }

        const isSharingAvailable = await Sharing.isAvailableAsync();
        if (!isSharingAvailable) return reject(L10N.ERROR_EXPORT);

        const fileUri = FileSystem.documentDirectory + fileName;
        await FileSystem.writeAsStringAsync(fileUri, data);
        await Sharing.shareAsync(fileUri);

        resolve(true);

        BackupService.scheduleNotification();
      } catch (error) {
        reject(`${L10N.ERROR}: ${JSON.stringify(error)}`);
      }
    }),

  import: async () =>
    // eslint-disable-next-line no-undef, no-async-promise-executor
    new Promise(async (resolve, reject) => {
      try {
        const { cancelled, assets = [] } = await DocumentPicker.getDocumentAsync({
          multiple: false,
          type: 'application/json',
        });
        const file = assets && assets[0] ? assets[0] : {};

        if (!cancelled && file.uri) {
          let jsonData = {};

          if (IS_WEB) {
            jsonData = await fetch(file.uri).then((res) => res.json());
          } else {
            const fileData = await FileSystem.readAsStringAsync(file.uri);
            jsonData = JSON.parse(fileData);
          }

          const { secrets = [], settings = {} } = jsonData;

          if (!secrets.length || !Object.keys(settings).length) return reject(L10N.ERROR_IMPORT);

          resolve({ secrets, settings });
        }
      } catch (error) {
        reject(`${L10N.ERROR}: ${JSON.stringify(error)}`);
      }
    }),
};
