import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

// Import screens
import DashboardScreen from './src/screens/DashboardScreen';
import MarketScreen from './src/screens/MarketScreen';
import PortfolioScreen from './src/screens/PortfolioScreen';
import TradingScreen from './src/screens/TradingScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import StockDetailScreen from './src/screens/StockDetailScreen';
import ImprovedStockDetailScreen from './src/screens/ImprovedStockDetailScreen';
import OptionsScreen from './src/screens/OptionsScreen';
import SearchScreen from './src/screens/SearchScreen';

// Import icon component
import TabIcon from './src/components/TabIcon';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#AAB8C2',
        tabBarStyle: {
          backgroundColor: '#1C1C1E',
          borderTopWidth: 1,
          borderTopColor: '#374151',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerStyle: {
          backgroundColor: '#1C1C1E',
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
            <TabIcon name="bar-chart-2" color={color} size={size} />
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
            <TabIcon name="trending-up" color={color} size={size} />
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
  );
}

const App: React.FC = () => {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
          <Stack.Screen 
            name="StockDetail" 
            component={StockDetailScreen}
            options={{ 
              headerStyle: { backgroundColor: '#1C1C1E' },
              headerTintColor: '#FFFFFF',
              headerTitle: '',
            }} 
          />
          <Stack.Screen 
            name="ImprovedStockDetail" 
            component={ImprovedStockDetailScreen}
            options={{ 
              headerStyle: { backgroundColor: '#1C1C1E' },
              headerTintColor: '#FFFFFF',
              headerTitle: '',
            }} 
          />
          <Stack.Screen 
            name="Options" 
            component={OptionsScreen}
            options={{ 
              headerStyle: { backgroundColor: '#1C1C1E' },
              headerTintColor: '#FFFFFF',
              headerTitle: 'Options',
            }} 
          />
          <Stack.Screen 
            name="Search" 
            component={SearchScreen}
            options={{ 
              headerStyle: { backgroundColor: '#1C1C1E' },
              headerTintColor: '#FFFFFF',
              headerTitle: 'Search',
            }} 
          />
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
};

export default App;
