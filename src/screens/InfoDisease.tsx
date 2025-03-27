import {useNavigation} from '@react-navigation/native';
import React, {useEffect} from 'react';
import {View, Text, SafeAreaView, StyleSheet, ScrollView} from 'react-native';

const InfoDisease = ({route}: {route: any}) => {
  const {diseaseInfo, diseaseName} = route.params;
  const navigation = useNavigation();
  const reversedDiseaseInfo = diseaseInfo
    ? Object.entries(diseaseInfo).reverse()
    : [];
  useEffect(() => {
    navigation.setOptions({
      title: diseaseName,
    });
  }, [diseaseName]);
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        {reversedDiseaseInfo.map(([key, value]) => (
          <View key={key} style={styles.infoItem}>
            <Text style={styles.label}>{key}:</Text>
            <Text style={styles.value}>{value}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  infoItem: {
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  value: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
});

export default InfoDisease;
