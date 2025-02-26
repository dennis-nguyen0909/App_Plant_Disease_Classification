import React, { useState } from 'react';
import { View, Text, Button, Image, StyleSheet } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import axios from 'axios';

export default function App() {
  const [imageUri, setImageUri] = useState(null);
  const [prediction, setPrediction] = useState<string>('');
  const [confidence, setConfidence] = useState<string>('');

  // Hàm để chọn ảnh từ thư viện
  const selectImage = () => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (!response.didCancel && !response.error && response.assets) {
        const uri = response.assets[0].uri;
        setImageUri(uri);
      }
    });
  };

  // Hàm để chụp ảnh bằng camera
  const takePhoto = () => {
  launchCamera({ mediaType: 'photo' }, (response) => {
    if (response.didCancel) {
      console.log('User cancelled camera');
    } else if (response.errorCode) {
      console.log('Camera error: ', response.errorMessage);
    } else if (response.assets) {
      const uri = response.assets[0].uri;
      setImageUri(uri);
    }
  });
};


  // Hàm để gọi API dự đoán
  const predictImage = async () => {
    if (!imageUri) return;

    const formData = new FormData();
    
    // Đảm bảo rằng đường dẫn URI có tiền tố "file://"
    formData.append('image', {
      uri: imageUri.startsWith('file://') ? imageUri : `file://${imageUri}`,
      type: 'image/jpeg',
      name: 'photo.jpg',
    });

    try {
      const response = await axios.post('http://127.0.0.1:8000/predict', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setPrediction(response.data.predicted_class);
      setConfidence(response?.data?.confidence)
    } catch (error) {
      console.error(error);
      setPrediction('Error occurred during prediction');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Image Recognition App</Text>
      {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}
      <Button title="Select Image" onPress={selectImage} />
      {/* <Button title="Take Photo" onPress={takePhoto} /> */}
      <Button title="Predict" onPress={predictImage} />
      {prediction && <Text style={styles.prediction}>Tình trạng: {prediction === 'Healthy' ? 'Khỏe mạnh':prediction ==='Powdery' ? 'Bị nấm':'Rỉ sét'}</Text>}
      {confidence && <Text style={styles.prediction}>Phần trăm dự đoán: {confidence}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  image: {
    width: 300,
    height: 300,
    marginBottom: 20,
  },
  prediction: {
    fontSize: 18,
    color: 'green',
    marginTop: 20,
  },
});
