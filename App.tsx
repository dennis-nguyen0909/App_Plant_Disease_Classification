import React from 'react'; // <--- Thêm dòng này
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {StyleSheet} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import GetStartedScreen from './src/screens/GetStartedScreen';
import HomeScreen from './src/screens/HomeScreen';
import HomeScreen2 from './src/screens/HomeScreen2';
import CameraScreen from './src/screens/CameraScreen';
import InfoDisease from './src/screens/InfoDisease';

const Stack = createNativeStackNavigator();

function RootStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="GetStarted" component={GetStartedScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Home2" component={HomeScreen2} />
      <Stack.Screen name="Camera" component={CameraScreen} />
      <Stack.Screen
        name="InfoDisease"
        component={InfoDisease}
        options={{
          headerShown: true,
        }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider style={styles.container}>
      <NavigationContainer>
        <RootStack />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
