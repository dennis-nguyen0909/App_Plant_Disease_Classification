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
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import axios from 'axios';

interface Prediction {
  area: number;
  box: number[];
  class: number;
  className: string;
  confidence: number;
}

interface TensorflowPrediction {
  className: string;
  confidence: number;
}

export default function App() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<
    Prediction[] | TensorflowPrediction | null
  >(null);
  const [recommendation, setRecommendation] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'tensorflow' | 'yolov8'>(
    'tensorflow',
  );

  const selectImage = () => {
    launchImageLibrary({mediaType: 'photo'}, response => {
      if (!response.didCancel && response.assets && response.assets[0]?.uri) {
        const uri = response.assets[0].uri;
        console.log('uri', uri);
        setImageUri(uri);
        setPredictions(null);
        setRecommendation('');
      }
    });
  };

  const predictImage = async () => {
    if (!imageUri) {
      Alert.alert('Error', 'Please select an image first');
      return;
    }

    const formData = new FormData();
    formData.append('image', {
      uri: imageUri.startsWith('file://') ? imageUri : `file://${imageUri}`,
      type: 'image/jpeg',
      name: 'photo.jpg',
    });

    try {
      setIsLoading(true);
      const endpoint =
        activeTab === 'tensorflow'
          ? 'http://127.0.0.1:8080/api/tensorflow/predict'
          : 'http://127.0.0.1:8080/api/yolov8/predict';

      const response = await axios.post(endpoint, formData, {
        headers: {'Content-Type': 'multipart/form-data'},
      });

      if (response.data) {
        if (activeTab === 'tensorflow') {
          console.log('response.data', response.data?.predictions);
          setPredictions(response.data.predictions);
        } else {
          console.log('response.data', response.data?.predictions);

          setPredictions(response.data.predictions);
        }
        setRecommendation(response.data?.prediction?.recommendation || '');
      }
    } catch (error) {
      console.error(error);
      setPredictions(null);
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleTabChange = (tab: 'tensorflow' | 'yolov8') => {
    setActiveTab(tab);
    setPredictions(null);
    setRecommendation('');
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
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Image Recognition App</Text>

          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'tensorflow' && styles.activeTab,
              ]}
              onPress={() => handleTabChange('tensorflow')}>
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'tensorflow' && styles.activeTabText,
                ]}>
                Tensorflow
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'yolov8' && styles.activeTab]}
              onPress={() => handleTabChange('yolov8')}>
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'yolov8' && styles.activeTabText,
                ]}>
                YOLOv8
              </Text>
            </TouchableOpacity>
          </View>

          {imageUri && <Image source={{uri: imageUri}} style={styles.image} />}
          <View style={styles.buttonContainer}>
            <Button title="Select Image" onPress={selectImage} />
            <Button title="Task photo" onPress={taskPhoto} />
            <Button title="Predict" onPress={predictImage} />
          </View>
          <View style={{marginTop: 20, width: '100%'}}>
            {predictions && (
              <View>
                {activeTab === 'tensorflow' ? (
                  <>
                    <Text>
                      Leaf condition:{' '}
                      {(predictions as TensorflowPrediction).className}
                    </Text>
                    <Text>
                      Percentage:{' '}
                      {(
                        (predictions as TensorflowPrediction).confidence * 100
                      ).toFixed(2)}
                      %
                    </Text>
                  </>
                ) : (
                  <ScrollView style={{maxHeight: 200}}>
                    {(predictions as Prediction[]).map((item, index) => (
                      <View key={index} style={styles.predictionItem}>
                        <Text>Class: {item.className}</Text>
                        <Text>
                          Confidence: {(item.confidence * 100).toFixed(2)}%
                        </Text>
                        <Text>Area: {item.area.toFixed(2)}</Text>
                      </View>
                    ))}
                  </ScrollView>
                )}
              </View>
            )}
            {recommendation && <Text>Recommendation: {recommendation}</Text>}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  image: {
    width: '100%',
    height: undefined,
    aspectRatio: 1,
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
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  tab: {
    padding: 10,
    width: 120,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    color: '#007AFF',
    fontSize: 16,
  },
  activeTabText: {
    color: 'white',
  },
  predictionItem: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  buttonContainer: {
    width: '100%',
    flexDirection: 'column',
    gap: 10,
  },
});
