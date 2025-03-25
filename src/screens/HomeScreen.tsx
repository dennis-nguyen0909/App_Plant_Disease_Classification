import axios from 'axios';
import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Alert,
  Animated,
} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Import Ionicons
// import { toast } from 'sonner-native'; // Xóa import này

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

const {width} = Dimensions.get('window');

export default function HomeScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<
    Prediction[] | TensorflowPrediction | null
  >(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'tensorflow' | 'yolov8'>(
    'tensorflow',
  );
  const [recommendationYolo, setRecommendationYolo] = useState([]);

  // Store images for each tab
  const [tensorflowImage, setTensorflowImage] = useState<string | null>(null);
  const [yoloImage, setYoloImage] = useState<string | null>(null);

  // Animation values
  const tabAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Update the appropriate image state based on active tab
  useEffect(() => {
    if (activeTab === 'tensorflow') {
      setImageUri(tensorflowImage);
    } else {
      setImageUri(yoloImage);
    }
  }, [activeTab, tensorflowImage, yoloImage]);

  const selectImage = () => {
    launchImageLibrary({mediaType: 'photo'}, response => {
      if (!response.didCancel && response.assets && response.assets[0]?.uri) {
        const uri = response.assets[0].uri;
        setImageUri(uri);

        // Save image to the appropriate tab state
        if (activeTab === 'tensorflow') {
          setTensorflowImage(uri);
        } else {
          setYoloImage(uri);
        }

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
          setRecommendationYolo([]);
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

  const handleTabChange = (tab: 'tensorflow' | 'yolov8') => {
    // Don't change if already on this tab
    if (tab === activeTab) return;

    // Animate content fade out
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 80, // Giảm thời lượng fade out
      useNativeDriver: true,
    }).start(() => {
      // Change tab
      setActiveTab(tab);
      setPredictions(null);

      // Animate tab indicator
      Animated.timing(tabAnimation, {
        toValue: tab === 'tensorflow' ? 0 : 1,
        duration: 250, // Giảm thời lượng chuyển tab indicator
        useNativeDriver: true,
        // easing: Easing.bezier(0.4, 0, 0.2, 1), // Thêm easing function (tùy chọn)
      }).start();

      // Animate content fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 80, // Giảm thời lượng fade in
        useNativeDriver: true,
      }).start();
    });
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
        const uri = result.assets[0].uri;
        setImageUri(uri);

        // Save image to the appropriate tab state
        if (activeTab === 'tensorflow') {
          setTensorflowImage(uri);
        } else {
          setYoloImage(uri);
        }

        setPredictions(null);
      }
    } catch (error) {
      console.error('Lỗi chụp ảnh:', error);
      Alert.alert('Lỗi', 'Không thể chụp ảnh.');
    }
  };
  console.log('predictions', predictions);

  // Calculate tab indicator position
  const translateX = tabAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width / 2 - 8], // Adjust based on tab width
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Plant Disease Detection</Text>
        <Text style={styles.subtitle}>
          Upload a photo to analyze plant health
        </Text>
      </View>

      <View style={styles.tabContainer}>
        <Animated.View
          style={[styles.tabIndicator, {transform: [{translateX}]}]}
        />
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

      <Animated.View style={[styles.contentContainer]}>
        <View style={styles.imageContainer}>
          {imageUri ? (
            <Image
              source={{uri: imageUri}}
              style={styles.image}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.placeholderContainer}>
              <Icon name="leaf" size={48} color="#666" />
              <Text style={styles.placeholderText}>No image selected</Text>
            </View>
          )}
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.button} onPress={selectImage}>
            <Icon name="comments" size={24} color="white" />
            <Text style={styles.buttonText}>Select Image</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={taskPhoto}>
            <Icon name="camera-outline" size={24} color="white" />
            <Text style={styles.buttonText}>Take Photo</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.analyzeButton, !imageUri && styles.disabledButton]}
          onPress={predictImage}
          disabled={!imageUri}>
          <Text style={styles.analyzeButtonText}>Analyze Plant</Text>
        </TouchableOpacity>

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#000" />
            <Text style={styles.loadingText}>Analyzing image...</Text>
          </View>
        )}

        {predictions && !isLoading && (
          <ScrollView style={styles.resultsContainer}>
            <Text style={styles.resultTitle}>Analysis Results</Text>
            {activeTab === 'tensorflow' ? (
              <View style={styles.resultCard}>
                <Text style={styles.resultLabel}>
                  Condition: {(predictions as TensorflowPrediction).className}
                </Text>
                {/* <Text style={styles.resultValue}>
                  {(predictions as TensorflowPrediction).className}
                </Text> */}
                <Text style={styles.resultLabel}>
                  Confidence:{' '}
                  {(
                    (predictions as TensorflowPrediction).confidence * 100
                  ).toFixed(2)}
                  %
                </Text>
                {/* <Text style={styles.resultValue}>
                  {(
                    (predictions as TensorflowPrediction).confidence * 100
                  ).toFixed(2)}
                  %
                </Text> */}
              </View>
            ) : (
              Array.isArray(predictions) &&
              (predictions as Prediction[]).map((item, index) => (
                <View key={index} style={styles.resultCard}>
                  <Text style={styles.resultLabel}>
                    Condition: {item.className}
                  </Text>
                  {/* <Text style={styles.resultValue}>{item.className}</Text> */}
                  <Text style={styles.resultLabel}>
                    Confidence: {(item.confidence * 100).toFixed(2)}%
                  </Text>
                  {/* <Text style={styles.resultValue}>
                    {(item.confidence * 100).toFixed(2)}%
                  </Text> */}
                </View>
              ))
            )}

            {(predictions as TensorflowPrediction)?.recommendations && (
              <View style={styles.recommendationsContainer}>
                <Text style={styles.recommendationsTitle}>
                  Care Recommendations
                </Text>
                {(predictions as TensorflowPrediction)?.recommendations?.map(
                  (rec, index) => (
                    <View key={index} style={styles.recommendationItem}>
                      <Icon
                        name="checkmark-circle-outline"
                        size={20}
                        color="#000"
                      />
                      <Text style={styles.recommendationText}>{rec}</Text>
                    </View>
                  ),
                )}
              </View>
            )}
            {recommendationYolo && recommendationYolo.length > 0 && (
              <View style={styles.recommendationsContainer}>
                <Text style={styles.recommendationsTitle}>Gợi Ý Chăm Sóc:</Text>
                {recommendationYolo.map((rec, index) => (
                  <View key={index} style={styles.recommendationItem}>
                    <Icon
                      name="checkmark-circle-outline"
                      size={20}
                      color="#000"
                    />
                    <Text style={styles.recommendationText}>{rec}</Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    backgroundColor: '#000',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 4,
    margin: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    position: 'relative',
  },
  tabIndicator: {
    position: 'absolute',
    width: '50%',
    height: '100%',
    backgroundColor: '#000',
    borderRadius: 8,
    top: 4,
    left: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    zIndex: 1,
  },
  activeTab: {},
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#fff',
  },
  contentContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    marginBottom: 20,
    height: 200,
    width: 200,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    // borderColor: '#eee',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    justifyContent: 'center', //
    marginRight: 10,
    marginLeft: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '600',
  },
  analyzeButton: {
    backgroundColor: '#000',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  analyzeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  resultsContainer: {
    padding: 20,
    width: '100%',
    marginBottom: 0,
    height: 230,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  resultCard: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  resultLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  resultValue: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  recommendationsContainer: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
  },
  recommendationsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 16,
    marginLeft: 8,
    flex: 1,
  },
});
