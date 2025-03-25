import React, {useState} from 'react';
import {
  View,
  Text,
  Button,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Ionicons'; // Import Ionicons

interface Prediction {
  area: number;
  box: number[];
  class: number;
  className: string;
  confidence: number;
  recommendations?: string[];
}

interface TensorflowPrediction {
  className: string;
  confidence: number;
  recommendations?: string[];
}

const App = () => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<
    Prediction[] | TensorflowPrediction | null
  >(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'tensorflow' | 'yolov8'>(
    'tensorflow',
  );
  const [recommendationYolo, setRecommendationYolo] = useState([]);

  const selectImage = () => {
    launchImageLibrary({mediaType: 'photo'}, response => {
      if (!response.didCancel && response.assets && response.assets[0]?.uri) {
        const uri = response.assets[0].uri;
        setImageUri(uri);
        setPredictions(null);
      }
    });
  };

  const predictImage = async () => {
    if (!imageUri) {
      Alert.alert('Thông báo', 'Vui lòng chọn ảnh trước.');
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
          ? 'http://localhost:8080/api/tensorflow/predict'
          : 'http://localhost:8080/api/yolov8/predict';

      const response = await axios.post(endpoint, formData, {
        headers: {'Content-Type': 'multipart/form-data'},
      });

      if (response.data) {
        setPredictions(response.data.predictions);
        if (response.data.recommendations) {
          setRecommendationYolo(response.data.recommendations);
        } else {
          setRecommendationYolo([]); // Reset if no recommendations
        }
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi', 'Không thể dự đoán ảnh.');
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
        setImageUri(result.assets[0].uri);
        setPredictions(null);
      }
    } catch (error) {
      console.error('Lỗi chụp ảnh:', error);
      Alert.alert('Lỗi', 'Không thể chụp ảnh.');
    }
  };

  const handleTabChange = (tab: 'tensorflow' | 'yolov8') => {
    setActiveTab(tab);
    setImageUri(null);
    setPredictions(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Ứng Dụng Nhận Diện Bệnh Cây</Text>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'tensorflow' && styles.activeTab]}
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

      {imageUri && (
        <Image
          source={{uri: imageUri}}
          style={styles.image}
          resizeMode="cover"
        />
      )}

      <View style={styles.buttonContainer}>
        <Button title="Chọn Ảnh" onPress={selectImage} color="#007AFF" />
        <Button title="Chụp Ảnh" onPress={taskPhoto} color="#007AFF" />
        <Button title="Dự Đoán" onPress={predictImage} color="#4CAF50" />
      </View>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Đang xử lý...</Text>
        </View>
      )}

      {predictions && !isLoading && (
        <ScrollView style={styles.resultsContainer}>
          <Text style={styles.sectionTitle}>Kết Quả Dự Đoán:</Text>
          {activeTab === 'tensorflow' ? (
            <View style={styles.predictionItem}>
              <Text style={styles.resultText}>
                Tình trạng lá: {(predictions as TensorflowPrediction).className}
              </Text>
              <Text style={styles.resultText}>
                Độ tin cậy:{' '}
                {(
                  (predictions as TensorflowPrediction).confidence * 100
                ).toFixed(2)}
                %
              </Text>
            </View>
          ) : (
            Array.isArray(predictions) &&
            (predictions as Prediction[]).map((item, index) => (
              <View key={index} style={styles.predictionItem}>
                {/* {console.log('duydeptrai', item)} */}
                <Text style={styles.resultText}>Lớp: {item.className}</Text>
                <Text style={styles.resultText}>
                  Độ tin cậy: {(item.confidence * 100).toFixed(2)}%
                </Text>
                {/* <Text style={styles.resultText}>Diện tích: {item.area?.toFixed(2)}</Text> */}
              </View>
            ))
          )}

          {predictions &&
            (predictions as TensorflowPrediction).recommendations && (
              <View style={styles.recommendationContainer}>
                <Text style={styles.sectionTitle}>Gợi Ý Chăm Sóc:</Text>
                {(predictions as TensorflowPrediction).recommendations?.map(
                  (rec, index) => (
                    <Text key={index} style={styles.recommendationText}>
                      • {rec}
                    </Text>
                  ),
                )}
              </View>
            )}
          {recommendationYolo && recommendationYolo.length > 0 && (
            <View style={styles.recommendationContainer}>
              <Text style={styles.sectionTitle}>Gợi Ý Chăm Sóc:</Text>
              {recommendationYolo.map((rec, index) => (
                <Text key={index} style={styles.recommendationText}>
                  • {rec}
                </Text>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 25,
    color: '#333',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#e9e9e9',
    borderRadius: 10,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#d0d0d0',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    color: '#555',
  },
  activeTabText: {
    color: 'white',
    fontWeight: 'bold',
  },
  image: {
    width: '100%',
    height: 220,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 25,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#777',
  },
  resultsContainer: {
    marginTop: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  predictionItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
    marginBottom: 10,
  },
  resultText: {
    fontSize: 16,
    color: '#555',
  },
  recommendationContainer: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  recommendationText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
    lineHeight: 22,
  },
});

export default App;
