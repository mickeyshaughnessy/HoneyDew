import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';

import { colors } from './src/theme';
import * as api from './src/api';

import AuthScreen      from './src/screens/AuthScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import PostJobScreen   from './src/screens/PostJobScreen';
import JobDetailScreen from './src/screens/JobDetailScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [authed,  setAuthed]  = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.me().then(({ ok }) => {
      setAuthed(ok);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color={colors.honey} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {authed ? (
          <>
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="PostJob"   component={PostJobScreen} />
            <Stack.Screen name="JobDetail" component={JobDetailScreen} />
          </>
        ) : (
          <Stack.Screen name="Auth">
            {props => <AuthScreen {...props} onAuth={() => setAuthed(true)} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
