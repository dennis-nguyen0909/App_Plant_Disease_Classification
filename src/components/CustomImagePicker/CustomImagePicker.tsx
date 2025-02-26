import React from 'react';
import {StyleSheet, View, Image, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; // Ionicons
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import * as ImagePicker from 'react-native-image-picker';
import {PermissionsAndroid, Alert} from 'react-native';

const CustomImagePicker = ({ onImageSelected }) => {
  const [responseCamera, setResponseCamera] = React.useState(null);
  const [responseGallery, setResponseGallery] = React.useState(null);

  const openCameraWithPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'App Camera Permission',
          message: 'App needs access to your camera',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        ImagePicker.launchCamera(
          {
            mediaType: 'photo',
            includeBase64: false,
            maxHeight: 200,
            maxWidth: 200,
          },
          (response) => {
            if (response.didCancel) {
              console.log('User cancelled camera picker');
            } else if (response.errorCode) {
              console.log('Camera Error: ', response.errorMessage);
              Alert.alert('Error', 'Unable to open camera');
            } else {
              const uri = response.assets ? response.assets[0].uri : null;
              setResponseCamera(uri);
              setResponseGallery(null);
              if (uri) {
                onImageSelected(uri); // Gọi callback với URI ảnh camera
              }
            }
          },
        );
      } else {
        console.log('Camera permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const openGallery = () => {
    ImagePicker.launchImageLibrary(
      {
        mediaType: 'photo',
        includeBase64: false,
        maxHeight: 200,
        maxWidth: 200,
      },
      (response) => {
        if (response.didCancel) {
          console.log('User cancelled gallery picker');
        } else if (response.errorCode) {
          console.log('Gallery Error: ', response.errorMessage);
          Alert.alert('Error', 'Unable to open gallery');
        } else {
          const uri = response.assets ? response.assets[0].uri : null;
          setResponseGallery(uri);
          setResponseCamera(null);
          if (uri) {
            onImageSelected(uri); // Gọi callback với URI ảnh từ gallery
          }
        }
      },
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={openCameraWithPermission}>
        {responseCamera === null ? (
            <Icon name="camera" size={30} color="black" /> 
        ) : (
          <Image style={styles.icon} source={{ uri: responseCamera }} />
        )}
      </TouchableOpacity>
      <TouchableOpacity onPress={openGallery}>
        {responseGallery === null ? (
            <MaterialIcon name="photo-library" size={30} color="black" />
        ) : (
          <Image style={styles.icon} source={{ uri: responseGallery }} />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    margin: 4,
  },
  icon: {
    height: 50,
    width: 50,
  },
});

export default CustomImagePicker;
