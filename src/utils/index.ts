import {PermissionsAndroid} from 'react-native';
import ImageResizer from 'react-native-image-resizer';

async function requestCameraPermission() {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: 'Camera Permission',
        message: 'This app needs access to your camera to take photos.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('You can use the camera');
    } else {
      console.log('Camera permission denied');
    }
  } catch (err) {
    console.warn(err);
  }
}
export default requestCameraPermission;

export const resizeImage = async (uri) => {
  try {
    const resizedImage = await ImageResizer.createResizedImage(
      uri,
      800,   // new width
      600,   // new height
      'JPEG',
      80     // quality percentage
    );
    return resizedImage.uri;
  } catch (error) {
    console.error('Resize image error:', error);
    return uri; // nếu lỗi, trả về ảnh gốc
  }
};