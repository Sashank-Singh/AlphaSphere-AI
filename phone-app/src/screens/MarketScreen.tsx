import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import MetricCard from '../components/MetricCard';
import TrendingCard from '../components/TrendingCard';
import MarketListItem from '../components/MarketListItem';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Mock data similar to the web version
const mockMarketOverview = {
  sp500: { value: 5234.18, changePercent: 0.45 },
  nasdaq: { value: 16345.67, changePercent: -0.08 },
  vix: { value: 18.24, changePercent: -3.54 },
  volume: '12.4B',
};

const mockTrendingStocks = [
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 875.43, changePercent: 5.06, isHot: true },
  { symbol: 'TSLA', name: 'Tesla, Inc.', price: 198.87, changePercent: -4.30, isHot: true },
  { symbol: 'AAPL', name: 'Apple Inc.', price: 189.25, changePercent: 1.84, isHot: false },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 421.56, changePercent: 1.91, isHot: false },
];

const mockTopStocks = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 189.25, changePercent: 1.84 },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 421.56, changePercent: 1.91 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 2847.32, changePercent: 0.55 },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 3654.21, changePercent: 0.65 },
  { symbol: 'TSLA', name: 'Tesla, Inc.', price: 198.87, changePercent: -4.30 },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 875.43, changePercent: 5.06 },
];

const mockIndices = [
  { symbol: 'SPY', name: 'S&P 500 ETF', price: 523.12, changePercent: 0.45 },
  { symbol: 'QQQ', name: 'NASDAQ 100 ETF', price: 389.67, changePercent: -0.31 },
  { symbol: 'IWM', name: 'Russell 2000 ETF', price: 198.45, changePercent: 0.45 },
];

const mockSectors = [
  { name: 'Technology', changePercent: 2.1 },
  { name: 'Healthcare', changePercent: -0.3 },
  { name: 'Financials', changePercent: 1.8 },
];

type Tab = 'stocks' | 'indices' | 'sectors';

type RootStackParamList = {
  StockDetail: { symbol: string };
  // other routes...
};

type MarketScreenNavigationProp = StackNavigationProp<RootStackParamList, 'StockDetail'>;

const MarketScreen: React.FC = () => {
  const navigation = useNavigation<MarketScreenNavigationProp>();
  const [activeTab, setActiveTab] = useState<Tab>('stocks');
  const [searchTerm, setSearchTerm] = useState('');

  // Function to filter data for the lists
  const filteredStocks = mockTopStocks.filter(stock =>
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;
  const formatPercent = (percent: number) => `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;

  const ListHeader = () => (
    <>
      <Text style={styles.headerTitle}>Market Overview</Text>
      <Text style={styles.headerSubtitle}>Real-time market data and analysis</Text>

      <View style={styles.metricsContainer}>
        <MetricCard label="S&P 500" value={mockMarketOverview.sp500.value.toFixed(2)} change={formatPercent(mockMarketOverview.sp500.changePercent)} changeColor={mockMarketOverview.sp500.changePercent >= 0 ? '#10B981' : '#EF4444'} icon="bar-chart-2" iconColor="#3B82F6" />
        <View style={{width: 12}} />
        <MetricCard label="NASDAQ" value={mockMarketOverview.nasdaq.value.toFixed(2)} change={formatPercent(mockMarketOverview.nasdaq.changePercent)} changeColor={mockMarketOverview.nasdaq.changePercent >= 0 ? '#10B981' : '#EF4444'} icon="trending-up" iconColor="#8B5CF6" />
      </View>
      <View style={styles.metricsContainer}>
        <MetricCard label="VIX" value={mockMarketOverview.vix.value.toFixed(2)} change={formatPercent(mockMarketOverview.vix.changePercent)} changeColor={mockMarketOverview.vix.changePercent >= 0 ? '#10B981' : '#EF4444'} icon="activity" iconColor="#F59E0B" />
        <View style={{width: 12}} />
        <MetricCard label="Volume" value={mockMarketOverview.volume} change="Active" changeColor="#6B7280" icon="globe" iconColor="#10B981" />
      </View>

      <Text style={styles.sectionTitle}>Trending Now</Text>
      <FlatList
        horizontal
        data={mockTrendingStocks}
        renderItem={({ item }) => (
          <TrendingCard
            symbol={item.symbol}
            name={item.name}
            price={formatPrice(item.price)}
            changePercent={formatPercent(item.changePercent)}
            isPositive={item.changePercent >= 0}
            isHot={item.isHot}
            onPress={() => navigation.navigate('StockDetail', { symbol: item.symbol })}
          />
        )}
        keyExtractor={item => item.symbol}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 8 }}
      />
      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color="#9CA3AF" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search stocks, indices..."
          placeholderTextColor="#9CA3AF"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity onPress={() => setActiveTab('stocks')} style={[styles.tab, activeTab === 'stocks' && styles.activeTab]}>
          <Text style={[styles.tabText, activeTab === 'stocks' && styles.activeTabText]}>Stocks</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('indices')} style={[styles.tab, activeTab === 'indices' && styles.activeTab]}>
          <Text style={[styles.tabText, activeTab === 'indices' && styles.activeTabText]}>Indices</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('sectors')} style={[styles.tab, activeTab === 'sectors' && styles.activeTab]}>
          <Text style={[styles.tabText, activeTab === 'sectors' && styles.activeTabText]}>Sectors</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const dataForTab = () => {
    switch (activeTab) {
      case 'stocks':
        return filteredStocks;
      case 'indices':
        return mockIndices;
      case 'sectors':
        return mockSectors;
      default:
        return [];
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={dataForTab()}
        keyExtractor={(item) => item.symbol || item.name}
        ListHeaderComponent={<ListHeader />}
        renderItem={({ item }) => (
            <MarketListItem
              symbol={item.symbol || item.name}
              name={item.name}
              price={item.price ? formatPrice(item.price) : undefined}
              changePercent={formatPercent(item.changePercent)}
              isPositive={item.changePercent >= 0}
              onPress={() => navigation.navigate('StockDetail', { symbol: item.symbol || item.name })}
            />
        )}
        contentContainerStyle={styles.scrollView}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#AAB8C2',
    marginBottom: 24,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 24,
    marginBottom: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#374151',
  },
  searchInput: {
    flex: 1,
    height: 48,
    marginLeft: 8,
    fontSize: 16,
    color: '#FFFFFF',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 4,
    marginTop: 24,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#374151',
  },
  tabText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#AAB8C2',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
});

export default MarketScreen;
