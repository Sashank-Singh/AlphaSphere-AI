
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PortfolioOverview from '../components/PortfolioOverview';
import MarketPulse from '../components/MarketPulse';
import AIPortfolioOptimizer from '../components/AIPortfolioOptimizer';
import QuickActions from '../components/QuickActions';
import WelcomeHeader from '../components/WelcomeHeader';

interface DashboardScreenProps {
  navigation: { navigate: (screen: string) => void };
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <WelcomeHeader />
        <QuickActions navigation={navigation} />
        <PortfolioOverview />
        <MarketPulse />
        <AIPortfolioOptimizer />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
});

export default DashboardScreen;
