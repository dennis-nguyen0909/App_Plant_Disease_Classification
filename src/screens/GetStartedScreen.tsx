import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';

const {width} = Dimensions.get('window');

export default function GetStartedScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require('../assets/image/plant.webp')}
          style={styles.image}
          resizeMode="cover"
        />

        <View style={styles.textContainer}>
          <Text style={styles.title}>Plant Disease Recognition</Text>
          <Text style={styles.subtitle}>
            Detect and diagnose plant diseases instantly using advanced AI
            technology
          </Text>
        </View>

        <View style={styles.featuresContainer}>
          <View style={styles.featureRow}>
            <Icon name="leaf-maple" size={24} color="black" />
            <Text style={styles.featureText}>Instant Disease Detection</Text>
          </View>
          {/* <View style={styles.featureRow}>
            <Icon name="camera" size={24} color="black" />
            <Text style={styles.featureText}>Real-time Analysis</Text>
          </View> */}
          <View style={styles.featureRow}>
            <Icon name="book-open-variant" size={24} color="black" />
            <Text style={styles.featureText}>Treatment Recommendations</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Home' as never)}>
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  image: {
    width: width * 0.85,
    height: width * 0.65,
    borderRadius: 20,
    marginTop: 40,
    marginBottom: 30,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 40,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 12,
  },
  featureText: {
    marginLeft: 15,
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: 'black',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 30,
    marginTop: 'auto',
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});
