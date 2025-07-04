import React, { useState, useCallback } from 'react';
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
import QuickActions from '../components/QuickActions';
import WelcomeHeader from '../components/WelcomeHeader';
import MainContentTabs from '../components/MainContentTabs';
import MarketIntelligence from '../components/MarketIntelligence';
import MarketAnalytics from '../components/MarketAnalytics';
import TouchGestureHandler, { PullToRefreshWrapper } from '../components/TouchGestureHandler';

interface DashboardScreenProps {
  navigation: { navigate: (screen: string) => void };
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);

  const sections = [
    'Overview',
    'Market',
    'Analytics',
    'Intelligence'
  ];

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate data refresh
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  }, []);

  const handleSwipeLeft = useCallback(() => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(prev => prev + 1);
    }
  }, [currentSection, sections.length]);

  const handleSwipeRight = useCallback(() => {
    if (currentSection > 0) {
      setCurrentSection(prev => prev - 1);
    }
  }, [currentSection]);

  const renderSectionContent = () => {
    switch (currentSection) {
      case 0:
        return (
          <>
            <WelcomeHeader />
            <QuickActions navigation={navigation} />
            <PortfolioOverview />
          </>
        );
      case 1:
        return (
          <>
            <WelcomeHeader />
            <MarketPulse />
            <MainContentTabs />
          </>
        );
      case 2:
        return (
          <>
            <WelcomeHeader />
            <MarketAnalytics />
          </>
        );
      case 3:
        return (
          <>
            <WelcomeHeader />
            <MarketIntelligence />
          </>
        );
      default:
        return (
          <>
            <WelcomeHeader />
            <QuickActions navigation={navigation} />
            <PortfolioOverview />
            <MarketPulse />
            <MainContentTabs />
            <MarketIntelligence />
            <MarketAnalytics />
          </>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Section Indicator */}
      <View style={styles.sectionIndicator}>
        {sections.map((section, index) => (
          <TouchableOpacity
            key={section}
            style={[
              styles.sectionDot,
              currentSection === index && styles.activeSectionDot
            ]}
            onPress={() => setCurrentSection(index)}
          >
            <Text style={[
              styles.sectionText,
              currentSection === index && styles.activeSectionText
            ]}>
              {section}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchGestureHandler
        style={styles.gestureContainer}
        onSwipeLeft={handleSwipeLeft}
        onSwipeRight={handleSwipeRight}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        enableSwipeGestures={true}
        enablePullToRefresh={true}
      >
        <View style={styles.content}>
          {renderSectionContent()}
        </View>
      </TouchGestureHandler>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  sectionIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  sectionDot: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  activeSectionDot: {
    backgroundColor: '#007AFF',
  },
  sectionText: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
  activeSectionText: {
    color: '#ffffff',
  },
  gestureContainer: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
});

export default DashboardScreen;
