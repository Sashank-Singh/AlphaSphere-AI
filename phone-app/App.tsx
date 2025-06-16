
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

// Import screens
import DashboardScreen from './src/screens/DashboardScreen';
import MarketScreen from './src/screens/MarketScreen';
import PortfolioScreen from './src/screens/PortfolioScreen';
import TradingScreen from './src/screens/TradingScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// Import icon component
import TabIcon from './src/components/TabIcon';

const Tab = createBottomTabNavigator();

export default function App(): JSX.Element {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor: '#3B82F6',
            tabBarInactiveTintColor: '#6B7280',
            tabBarStyle: {
              backgroundColor: '#FFFFFF',
              borderTopWidth: 1,
              borderTopColor: '#E5E7EB',
              paddingBottom: 5,
              paddingTop: 5,
              height: 60,
            },
            headerStyle: {
              backgroundColor: '#1F2937',
            },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Tab.Screen
            name="Dashboard"
            component={DashboardScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <TabIcon name="home" color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen
            name="Market"
            component={MarketScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <TabIcon name="trending-up" color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen
            name="Portfolio"
            component={PortfolioScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <TabIcon name="pie-chart" color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen
            name="Trading"
            component={TradingScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <TabIcon name="activity" color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <TabIcon name="settings" color={color} size={size} />
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}
