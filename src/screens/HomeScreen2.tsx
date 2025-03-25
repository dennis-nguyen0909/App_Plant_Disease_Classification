import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';

export default function HomeScreen2() {
  const navigation = useNavigation();

  const handleScanPlant = () => {
    console.log('Open camera to scan plant');
    navigation.navigate('Camera' as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Plant Scanner</Text>
        <TouchableOpacity style={styles.profileButton}>
          <Icon name="account-circle" size={32} color="black" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <TouchableOpacity style={styles.scanButton} onPress={handleScanPlant}>
          <Icon name="camera" size={32} color="white" />
          <Text style={styles.scanButtonText}>Scan Plant</Text>
        </TouchableOpacity>

        <View style={styles.recentScans}>
          <Text style={styles.sectionTitle}>Recent Scans</Text>
          <View style={styles.emptyState}>
            <Icon name="leaf" size={48} color="#ccc" />
            <Text style={styles.emptyStateText}>No recent scans</Text>
            <Text style={styles.emptyStateSubtext}>
              Take a photo of a plant to identify potential diseases
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
  },
  profileButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  scanButton: {
    backgroundColor: 'black',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 15,
    marginVertical: 20,
  },
  scanButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  recentScans: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    color: 'black',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 15,
    padding: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 15,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 5,
    maxWidth: '80%',
  },
});
