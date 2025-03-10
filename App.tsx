import React, {useState} from 'react';
import {
  View,
  Text,
  Button,
  Image,
  StyleSheet,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  Animated,
} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import axios from 'axios';
import {resizeImage} from './src/utils';
export default function App() {
  const [imageUri, setImageUri] = useState(null);
  const [prediction, setPrediction] = useState<string>('');
  const [confidence, setConfidence] = useState<string>('');
  const [recommendation, setRecommendation] = useState<string>('');
  const [advice, setAdvice] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [listData, setListData] = useState<string[]>([]);

  // Hàm để chọn ảnh từ thư viện
  const selectImage = () => {
    launchImageLibrary({mediaType: 'photo'}, response => {
      if (!response.didCancel && !response.error && response.assets) {
        const uri = response.assets[0].uri;
        console.log('uri', uri);

        // Clear the previous state before setting the new image
        setImageUri(uri);
        setPrediction('');
        setConfidence('');
        setAdvice('');
        setListData([]); // Clear the list when a new image is selected
      }
    });
  };

  // Hàm để gọi API dự đoán
  const predictImage = async () => {
    if (!imageUri) return;

    const formData = new FormData();

    formData.append('image', {
      uri: imageUri.startsWith('file://') ? imageUri : `file://${imageUri}`,
      type: 'image/jpeg',
      name: 'photo.jpg',
    });

    console.log('formData', formData);

    try {
      setIsLoading(true);
      const response = await axios.post(
        // 'http://127.0.0.1:8080/api/v1/predict',
        'https://hiredev-api.shop/api/v1/predict',
        formData,
        {
          headers: {'Content-Type': 'multipart/form-data'},
        },
      );
      console.log('response', response);
      if (response.data) {
        await handleAskGeminiAI(
          `Tình trạng lá cây đang bị ${response?.data?.predicted_class}. Bạn hãy đưa ra lời khuyên`,
        );
        setPrediction(response.data.predicted_class);
        setConfidence(response?.data?.confidence);
        setRecommendation(response?.data?.recommendation);

        // Add prediction and confidence to the list
        setListData(prevList => [
          ...prevList,
          `Tình trạng: ${response.data.predicted_class}`,
          `Phần trăm dự đoán: ${response?.data?.confidence}`,
        ]);
      }
    } catch (error) {
      console.error(error);
      console.log('duydeptrai', error);
      setPrediction('Error occurred during prediction');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAskGeminiAI = async (question: string) => {
    const url =
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyBCc-hUh7vGCWQ6W6MO4Cosq0qM6MyljKg';

    try {
      const data = {
        contents: [
          {
            parts: [{text: question}],
          },
        ],
      };

      const res = await axios.post(url, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (res?.data) {
        setAdvice(res?.data?.candidates[0].content?.parts[0]?.text);

        // setListData(prevList => [
        //   ...prevList,
        //   `Lời khuyên: ${res?.data?.candidates[0].content?.parts[0]?.text}`,
        // ]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Render function for FlatList
  const renderItem = ({item}: {item: string}) => (
    <Text style={styles.listItem}>{item}</Text>
  );

  const taskPhoto = async () => {
    try {
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 1,
        maxWidth: 800,
        maxHeight: 600,
      });

      if (result.assets && result.assets[0]?.uri) {
        console.log('result', result.assets[0].uri);
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      {isLoading ? (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Animated.Text
            style={{
              color: 'red',
              marginTop: 10,
              opacity: new Animated.Value(0.3),
              transform: [
                {
                  scale: new Animated.Value(1),
                },
              ],
            }}
            onLayout={() => {
              Animated.loop(
                Animated.sequence([
                  Animated.parallel([
                    Animated.timing(new Animated.Value(0.3), {
                      toValue: 1,
                      duration: 1000,
                      useNativeDriver: true,
                    }),
                    Animated.timing(new Animated.Value(1.2), {
                      toValue: 1.2,
                      duration: 1000,
                      useNativeDriver: true,
                    }),
                  ]),
                  Animated.parallel([
                    Animated.timing(new Animated.Value(0.3), {
                      toValue: 0.3,
                      duration: 1000,
                      useNativeDriver: true,
                    }),
                    Animated.timing(new Animated.Value(1), {
                      toValue: 1,
                      duration: 1000,
                      useNativeDriver: true,
                    }),
                  ]),
                ]),
              ).start();
            }}>
            Loading...
          </Animated.Text>
        </View>
      ) : (
        <View style={styles.container}>
          <Text style={styles.title}>Image Recognition App</Text>
          {imageUri && <Image source={{uri: imageUri}} style={styles.image} />}
          <Button title="Select Image" onPress={selectImage} />
          <Button title="Task photo" onPress={taskPhoto} />
          <Button title="Predict" onPress={predictImage} />
          <View style={{marginTop: 20}}>
            {prediction && <Text>Leaf condition: {prediction}</Text>}
            {confidence && <Text>Percentage: {confidence}</Text>}
            {recommendation && <Text>Recomandation: {recommendation}</Text>}
          </View>
          {/* {listData && (
        <FlatList
          data={listData}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          style={styles.list}
        />
      )} */}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 50,
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
    borderRadius: 10,
  },
  list: {
    marginTop: 20,
    width: '80%',
  },
  listItem: {
    fontSize: 16,
    color: '#000',
    marginVertical: 5,
  },
});
