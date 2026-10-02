import fs from 'node:fs';
import path from 'node:path';

const { expo } = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'app.json'), 'utf8'));

describe('app config', () => {
  it('asks Android only for the camera and NFC', () => {
    expect(expo.android.permissions).toEqual(['android.permission.CAMERA', 'android.permission.NFC']);
  });

  it('blocks the photo and storage permissions expo-screen-capture declares for screenshot detection', () => {
    expect(expo.android.blockedPermissions).toEqual(
      expect.arrayContaining([
        'android.permission.READ_EXTERNAL_STORAGE',
        'android.permission.READ_MEDIA_IMAGES',
        'android.permission.READ_MEDIA_VIDEO',
      ]),
    );
  });
});
