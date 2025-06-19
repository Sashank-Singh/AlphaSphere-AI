import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Chart from '../components/Chart';
import TradeInput from '../components/TradeInput';
import OrderTypeSelector from '../components/OrderTypeSelector';
import PredictivePriceForecasting from '../components/PredictivePriceForecasting';
import AIAnalysisGrid from '../components/AIAnalysisGrid';
import { stockDataService } from '../services/stockDataService';
import { StockQuote } from '../services/mockStockService';

const { width } = Dimensions.get('window');

interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
  }[];
}

type OrderType = 'Market' | 'Limit' | 'Stop';

const TradingScreen: React.FC = () => {
  const [symbol, setSymbol] = useState('AAPL');
  const [searchQuery, setSearchQuery] = useState('AAPL');
  const [stockQuote, setStockQuote] = useState<StockQuote | null>(null);
  const [quantity, setQuantity] = useState('1');
  const [orderType, setOrderType] = useState<OrderType>('Market');
  const [chartData, setChartData] = useState<ChartData>({
    labels: [],
    datasets: [{ data: [] }],
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      const quote = await stockDataService.getStockQuote(symbol);
      setStockQuote(quote);

      const historicalData = await stockDataService.getHistoricalPrices(symbol, 30);
      if (historicalData.length > 0) {
        setChartData({
          labels: historicalData.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })).slice(-7),
          datasets: [{ data: historicalData.map(d => d.close).slice(-7) }],
        });
      }
    };

    fetchInitialData();

    const unsubscribe = stockDataService.subscribe(symbol, (quote) => {
      setStockQuote(quote);
    });

    return () => {
      unsubscribe();
    };
  }, [symbol]);

  const handleSearch = async () => {
    const newSymbol = searchQuery.toUpperCase();
    setSymbol(newSymbol);
  };

  const handleExecuteTrade = (type: 'Buy' | 'Sell') => {
    Alert.alert(
      `${type} Order`,
      `Successfully placed a ${orderType.toLowerCase()} order to ${type.toLowerCase()} ${quantity} shares of ${symbol}.`,
      [{ text: 'OK' }]
    );
  };
  
  if (!stockQuote) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { price, changePercent } = stockQuote;
  const isPositive = changePercent > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
      
      {/* Header Section */}
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={['#1A1A1A', '#0A0A0A']}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <Text style={styles.header}>Trading</Text>
            <TouchableOpacity style={styles.notificationButton}>
              <Feather name="bell" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Search Section */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Feather name="search" size={18} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search symbol..."
              placeholderTextColor="#666"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
            />
          </View>
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Feather name="arrow-right" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Stock Info Card */}
        <View style={styles.stockInfoCard}>
          <View style={styles.stockHeader}>
            <View>
              <Text style={styles.stockSymbol}>{symbol}</Text>
              <Text style={styles.stockName}>Apple Inc.</Text>
            </View>
            <View style={styles.stockPriceContainer}>
              <Text style={styles.stockPrice}>${price.toFixed(2)}</Text>
              <View style={[styles.changeContainer, { backgroundColor: isPositive ? '#00C851' : '#FF4444' }]}>
                <Feather 
                  name={isPositive ? 'trending-up' : 'trending-down'} 
                  size={12} 
                  color="#FFF" 
                />
                <Text style={styles.changeText}>
                  {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Chart Section */}
        <View style={styles.chartContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Price Chart</Text>
            <View style={styles.timeframeButtons}>
              {['1D', '1W', '1M', '1Y'].map((timeframe) => (
                <TouchableOpacity 
                  key={timeframe}
                  style={[styles.timeframeButton, timeframe === '1D' && styles.activeTimeframe]}
                >
                  <Text style={[styles.timeframeText, timeframe === '1D' && styles.activeTimeframeText]}>
                    {timeframe}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <Chart data={chartData} />
        </View>

        {/* Trading Controls */}
        <View style={styles.tradingSection}>
          <Text style={styles.sectionTitle}>Place Order</Text>
          
          <TradeInput
            label="Quantity"
            value={quantity}
            onChange={setQuantity}
            onIncrement={() => setQuantity(q => String(parseInt(q || '0') + 1))}
            onDecrement={() => setQuantity(q => String(Math.max(0, parseInt(q || '0') - 1)))}
          />
          
          <OrderTypeSelector 
            options={['Market', 'Limit', 'Stop']} 
            selected={orderType}
            onSelect={setOrderType}
          />

          {/* Trade Buttons */}
          <View style={styles.tradeButtonsContainer}>
            <TouchableOpacity 
              style={[styles.tradeButton, styles.buyButton]}
              onPress={() => handleExecuteTrade('Buy')}
            >
              <Text style={styles.tradeButtonText}>Buy</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tradeButton, styles.sellButton]}
              onPress={() => handleExecuteTrade('Sell')}
            >
              <Text style={styles.tradeButtonText}>Sell</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* AI Analysis Section */}
        <View style={styles.aiSection}>
          <Text style={styles.sectionTitle}>AI Analysis</Text>
          <PredictivePriceForecasting />
          <AIAnalysisGrid />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: '#0A0A0A' 
  },
  headerContainer: {
    marginBottom: 8,
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  header: { 
    fontSize: 28, 
    fontWeight: '700', 
    color: '#FFF',
    letterSpacing: -0.5,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: { 
    flex: 1, 
    backgroundColor: '#0A0A0A',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: '#333',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
  searchButton: {
    width: 48,
    height: 48,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stockInfoCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  stockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  stockSymbol: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  stockName: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
  stockPriceContainer: {
    alignItems: 'flex-end',
  },
  stockPrice: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 8,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  changeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  chartContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
  timeframeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  timeframeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  activeTimeframe: {
    backgroundColor: '#007AFF',
  },
  timeframeText: {
    color: '#999',
    fontSize: 12,
    fontWeight: '600',
  },
  activeTimeframeText: {
    color: '#FFF',
  },
  tradingSection: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  tradeButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  tradeButton: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buyButton: {
    backgroundColor: '#00C851',
  },
  sellButton: {
    backgroundColor: '#FF4444',
  },
  tradeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  aiSection: {
    gap: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFF',
    fontSize: 18,
  },
});

export default TradingScreen;