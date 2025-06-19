import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Chart from '../components/Chart';
import { RouteProp, NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { stockDataService } from '../services/stockDataService';
import { StockQuote, CompanyInfo } from '../services/mockStockService';

const mockStockData = {
    'AAPL': { name: 'Apple Inc.', price: 189.25, change: 3.45, changePercent: 1.84, high: 190.10, low: 188.50, open: 189.00, volume: 12345678 },
    'MSFT': { name: 'Microsoft Corp.', price: 421.56, change: 7.89, changePercent: 1.91, high: 422.00, low: 420.00, open: 420.50, volume: 87654321 },
    'NVDA': { name: 'NVIDIA Corp.', price: 875.43, change: 42.12, changePercent: 5.06, high: 880.00, low: 870.00, open: 872.00, volume: 98765432 },
    'TSLA': { name: 'Tesla, Inc.', price: 198.87, change: -8.90, changePercent: -4.30, high: 205.00, low: 195.00, open: 203.00, volume: 123456789 },
    'SPY': { name: 'S&P 500 ETF', price: 523.12, change: 2.34, changePercent: 0.45, high: 524.00, low: 522.00, open: 523.00, volume: 54321098 },
    'QQQ': { name: 'NASDAQ 100 ETF', price: 389.67, change: -1.21, changePercent: -0.31, high: 391.00, low: 388.00, open: 390.00, volume: 65432109 },
    'IWM': { name: 'Russell 2000 ETF', price: 198.45, change: 0.89, changePercent: 0.45, high: 199.00, low: 197.00, open: 198.00, volume: 76543210 },
};

const mockSectorData = {
    'Technology': { changePercent: 2.1 },
    'Healthcare': { changePercent: -0.3 },
    'Financials': { changePercent: 1.8 },
};

type TabParamList = {
  Dashboard: undefined;
  Market: undefined;
  Portfolio: undefined;
  Trading: undefined;
  Settings: undefined;
};

type RootStackParamList = { 
  Main: NavigatorScreenParams<TabParamList>;
  StockDetail: { symbol: string };
};

type StockDetailScreenRouteProp = RouteProp<RootStackParamList, 'StockDetail'>;
type StockDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'StockDetail'>;

type Props = {
  route: StockDetailScreenRouteProp;
  navigation: StockDetailScreenNavigationProp;
};

interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
  }[];
}

const StockDetailScreen: React.FC<Props> = ({ route, navigation }) => {
    const { symbol } = route.params;
    
    const [stockQuote, setStockQuote] = useState<StockQuote | null>(null);
    const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
    const [isSector, setIsSector] = useState(false);
    const [sectorData, setSectorData] = useState<{ changePercent: number } | null>(null);
    
    const [interval, setInterval] = useState('1D');
    const [showOptions, setShowOptions] = useState(false);
    const [chartData, setChartData] = useState<ChartData>({
      labels: [],
      datasets: [{ data: [] }],
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const loadData = async () => {
        setLoading(true);

        if (mockSectorData[symbol]) {
          setIsSector(true);
          setSectorData(mockSectorData[symbol]);
          setLoading(false);
          return;
        }

        setIsSector(false);
        const quote = await stockDataService.getStockQuote(symbol);
        const info = await stockDataService.getCompanyInfo(symbol);
        setStockQuote(quote);
        setCompanyInfo(info);

        const historicalData = await stockDataService.getHistoricalPrices(symbol, 30);
        if (historicalData.length > 0) {
          setChartData({
            labels: historicalData.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })).slice(-7),
            datasets: [{ data: historicalData.map(d => d.close).slice(-7) }],
          });
        }
        
        setLoading(false);
      };

      loadData();

      const unsubscribe = stockDataService.subscribe(symbol, (quote) => {
        setStockQuote(quote);
      });

      return () => unsubscribe();
    }, [symbol]);

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: isSector ? symbol : `${symbol} - ${companyInfo?.name || ''}`,
        });
    }, [navigation, symbol, companyInfo, isSector]);

    const formatCurrency = (value: number) => `$${value.toFixed(2)}`;
    const formatVolume = (value: number) => `${(value / 1_000_000).toFixed(2)}M`;

    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      );
    }

    return (
        <ScrollView style={styles.container}>
            {!isSector && stockQuote && (
                 <>
                    <View style={styles.header}>
                        <Text style={styles.price}>{formatCurrency(stockQuote.price)}</Text>
                        <Text style={[styles.change, { color: stockQuote.change >= 0 ? '#10B981' : '#EF4444' }]}>
                            {stockQuote.change >= 0 ? '+' : ''}{formatCurrency(stockQuote.change)} ({stockQuote.changePercent.toFixed(2)}%)
                        </Text>
                    </View>
                    <Chart data={chartData} />
                 </>
            )}

            {isSector && sectorData && (
                <View style={styles.header}>
                    <Text style={styles.price}>{sectorData.changePercent >= 0 ? '+' : ''}{sectorData.changePercent.toFixed(2)}%</Text>
                    <Text style={styles.change}>Today's Change</Text>
                </View>
            )}

            <View style={styles.intervalContainer}>
                {['1H', '1D', '1W', '1M', '1Y', 'ALL'].map(item => (
                    <TouchableOpacity key={item} onPress={() => setInterval(item)} style={[styles.intervalButton, interval === item && styles.activeInterval]}>
                        <Text style={[styles.intervalText, interval === item && styles.activeIntervalText]}>{item}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {!isSector && stockQuote && (
                <View style={styles.infoGrid}>
                    <InfoCard label="Open" value={formatCurrency(stockQuote.open)} />
                    <InfoCard label="High" value={formatCurrency(stockQuote.high)} />
                    <InfoCard label="Low" value={formatCurrency(stockQuote.low)} />
                    <InfoCard label="Volume" value={formatVolume(stockQuote.volume)} />
                </View>
            )}

            <View style={styles.buttonGrid}>
                <TouchableOpacity style={[styles.tradeButton, styles.buyButton]} onPress={() => navigation.navigate('Main', { screen: 'Trading' })}>
                    <Feather name="bar-chart-2" size={16} color="#FFFFFF" />
                    <Text style={styles.tradeButtonText}>Trade Stock</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.tradeButton, styles.aiButton]} onPress={() => navigation.navigate('Main', { screen: 'Trading' })}>
                    <Feather name="cpu" size={16} color="#FFFFFF" />
                    <Text style={styles.tradeButtonText}>Trade with AI</Text>
                </TouchableOpacity>
            </View>

             <TouchableOpacity style={styles.optionsToggle} onPress={() => setShowOptions(!showOptions)}>
                <Feather name={showOptions ? "chevrons-up" : "chevrons-down"} size={20} color="#AAB8C2" />
                <Text style={styles.optionsToggleText}>{showOptions ? 'Hide' : 'Show'} Options Chain</Text>
            </TouchableOpacity>

            {showOptions && (
                <View style={styles.optionsContainer}>
                    <Text style={styles.optionsPlaceholder}>Options chain data will be displayed here.</Text>
                </View>
            )}
        </ScrollView>
    );
};

const InfoCard = ({ label, value }: { label: string, value: string }) => (
    <View style={styles.infoCard}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000000', padding: 16 },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#000000',
    },
    header: { alignItems: 'center', marginVertical: 16 },
    price: { fontSize: 36, fontWeight: 'bold', color: '#FFFFFF' },
    change: { fontSize: 16, color: '#AAB8C2', marginTop: 4 },
    intervalContainer: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#1C1C1E', borderRadius: 12, padding: 4, marginVertical: 16, },
    intervalButton: { flex: 1, paddingVertical: 10, borderRadius: 8, },
    activeInterval: { backgroundColor: '#374151' },
    intervalText: { textAlign: 'center', fontSize: 14, fontWeight: '600', color: '#AAB8C2', },
    activeIntervalText: { color: '#FFFFFF' },
    infoGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24, },
    infoCard: { backgroundColor: '#1C1C1E', borderRadius: 12, padding: 16, width: '48%', marginBottom: 12, },
    infoLabel: { fontSize: 14, color: '#AAB8C2', marginBottom: 4 },
    infoValue: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
    buttonGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, },
    tradeButton: { flexDirection: 'row', flex: 1, paddingVertical: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', },
    buyButton: { backgroundColor: '#3B82F6', marginRight: 8 },
    aiButton: { backgroundColor: '#10B981', marginLeft: 8 },
    tradeButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
    optionsToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#374151', marginVertical: 16 },
    optionsToggleText: { color: '#AAB8C2', fontSize: 16, marginLeft: 8 },
    optionsContainer: { backgroundColor: '#1C1C1E', borderRadius: 12, padding: 20, alignItems: 'center', justifyContent: 'center', minHeight: 150 },
    optionsPlaceholder: { color: '#AAB8C2', fontSize: 14 },
});

export default StockDetailScreen; 