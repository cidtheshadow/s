import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../src/i18n/i18n';
import '../global.css';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor="#0F5132" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#0F5132',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: '600',
          },
          contentStyle: {
            backgroundColor: '#F8F9FA',
          }
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'Kisanify | किसानिफाई',
            headerShown: true
          }}
        />
        <Stack.Screen
          name="(auth)/login"
          options={{
            title: 'Login | लॉगिन',
            headerBackTitle: 'Back'
          }}
        />
        <Stack.Screen
          name="(auth)/profile"
          options={{
            title: 'Farmer Profile | किसान प्रोफ़ाइल',
            headerBackTitle: 'Back'
          }}
        />
        <Stack.Screen
          name="(farmer)/home"
          options={{
            title: 'Farmer Dashboard | किसान डैशबोर्ड',
            headerLeft: () => null
          }}
        />
        <Stack.Screen
          name="(farmer)/centres"
          options={{
            title: 'Procurement Centres | मंडी केंद्र',
            headerBackTitle: 'Back'
          }}
        />
        <Stack.Screen
          name="(farmer)/book-slot"
          options={{
            title: 'Book Slot | स्लॉट बुक करें',
            headerBackTitle: 'Back'
          }}
        />
        <Stack.Screen
          name="(farmer)/queue"
          options={{
            title: 'Live Queue | लाइव कतार',
            headerBackTitle: 'Back'
          }}
        />
        <Stack.Screen
          name="(farmer)/prices"
          options={{
            title: 'Mandi Prices & MSP | मंडी भाव',
            headerBackTitle: 'Back'
          }}
        />
        <Stack.Screen
          name="(farmer)/status"
          options={{
            title: 'Procurement Status | स्टेटस',
            headerBackTitle: 'Back'
          }}
        />
        <Stack.Screen
          name="(farmer)/grievance"
          options={{
            title: 'Grievance Redressal | शिकायत',
            headerBackTitle: 'Back'
          }}
        />
        <Stack.Screen
          name="(farmer)/assistant"
          options={{
            title: 'AI Kisan Assistant | AI सहायक',
            headerBackTitle: 'Back'
          }}
        />
        <Stack.Screen
          name="(officer)/dashboard"
          options={{
            title: 'Officer Portal | अधिकारी पोर्टल'
          }}
        />
        <Stack.Screen
          name="(admin)/dashboard"
          options={{
            title: 'Admin Control Room | एडमिन पोर्टल'
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
