import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import PositionCard from '../components/PositionCard';
import TransactionHistoryItem from '../components/TransactionHistoryItem';

// Mock Data
const mockPortfolio = {
  totalValue: 152340.75,
  cash: 25340.50,
  stockValue: 110000.25,
  optionsValue: 17000.00,
  positions: [
    { id: '1', symbol: 'AAPL', name: 'Apple Inc.', quantity: 50, currentPrice: 189.25, changePercent: 1.84, isOption: false },
    { id: '2', symbol: 'TSLA', name: 'Tesla, Inc.', quantity: 100, currentPrice: 198.87, changePercent: -4.30, isOption: false },
  ],
  optionPositions: [
    { id: '3', symbol: 'NVDA', name: 'NVIDIA Corp.', quantity: 10, currentPrice: 15.50, changePercent: 12.5, isOption: true, strikePrice: 850, expiryDate: '2024-12-20', optionType: 'call' as 'call' | 'put' },
  ],
  transactions: [
    { id: 't1', symbol: 'NVDA', type: 'buy' as 'buy' | 'sell', assetType: 'option' as 'stock' | 'option', quantity: 10, price: 12.00, date: '2024-05-20', optionType: 'call' as 'call' | 'put' },
    { id: 't2', symbol: 'TSLA', type: 'buy' as 'buy' | 'sell', assetType: 'stock' as 'stock' | 'option', quantity: 50, price: 205.10, date: '2024-05-18' },
    { id: 't3', symbol: 'AAPL', type: 'sell' as 'buy' | 'sell', assetType: 'stock' as 'stock' | 'option', quantity: 10, price: 190.50, date: '2024-05-15' },
  ]
};

type Tab = 'positions' | 'history';

const PortfolioScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('positions');
  const formatCurrency = (amount: number): string => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const renderPositions = () => (
    <View>
      <Text style={styles.sectionTitle}>Stocks</Text>
      <FlatList
        data={mockPortfolio.positions}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <PositionCard
            symbol={item.symbol}
            name={item.name}
            quantity={item.quantity}
            currentPrice={item.currentPrice}
            totalValue={item.quantity * item.currentPrice}
            changePercent={item.changePercent}
            isPositive={item.changePercent >= 0}
          />
        )}
      />
      <Text style={styles.sectionTitle}>Options</Text>
      <FlatList
        data={mockPortfolio.optionPositions}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <PositionCard
            symbol={item.symbol}
            name={item.name}
            quantity={item.quantity}
            currentPrice={item.currentPrice}
            totalValue={item.quantity * item.currentPrice * 100} // Option value
            changePercent={item.changePercent}
            isPositive={item.changePercent >= 0}
            isOption
            strikePrice={item.strikePrice}
            expiryDate={item.expiryDate}
            optionType={item.optionType}
          />
        )}
      />
    </View>
  );

  const renderHistory = () => (
    <FlatList
      data={mockPortfolio.transactions}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <TransactionHistoryItem
          symbol={item.symbol}
          type={item.type}
          assetType={item.assetType}
          quantity={item.quantity}
          price={item.price}
          date={item.date}
          optionType={item.optionType}
        />
      )}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.headerTitle}>Portfolio</Text>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Portfolio Value</Text>
          <Text style={styles.summaryValue}>{formatCurrency(mockPortfolio.totalValue)}</Text>
          <View style={styles.summaryDetails}>
            <View style={styles.summaryItem}>
              <Feather name="dollar-sign" size={16} color="#3B82F6" />
              <Text style={styles.summaryItemText}>Cash: {formatCurrency(mockPortfolio.cash)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Feather name="trending-up" size={16} color="#3B82F6" />
              <Text style={styles.summaryItemText}>Stocks: {formatCurrency(mockPortfolio.stockValue)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Feather name="calendar" size={16} color="#3B82F6" />
              <Text style={styles.summaryItemText}>Options: {formatCurrency(mockPortfolio.optionsValue)}</Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity onPress={() => setActiveTab('positions')} style={[styles.tab, activeTab === 'positions' && styles.activeTab]}>
            <Text style={[styles.tabText, activeTab === 'positions' && styles.activeTabText]}>Positions</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('history')} style={[styles.tab, activeTab === 'history' && styles.activeTab]}>
            <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>History</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {activeTab === 'positions' ? renderPositions() : renderHistory()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  scrollView: { paddingHorizontal: 16 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', marginTop: 16, marginBottom: 24, },
  summaryCard: { backgroundColor: '#1C1C1E', borderRadius: 12, padding: 20, marginBottom: 24, },
  summaryLabel: { fontSize: 14, color: '#AAB8C2', },
  summaryValue: { fontSize: 32, fontWeight: 'bold', color: '#FFFFFF', marginVertical: 8, },
  summaryDetails: { paddingTop: 16, borderTopWidth: 1, borderTopColor: '#374151', },
  summaryItem: { flexDirection: 'row', alignItems: 'center', marginVertical: 4, },
  summaryItemText: { fontSize: 14, color: '#E1E8ED', marginLeft: 8, },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', marginTop: 16, marginBottom: 8, },
  tabContainer: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#1C1C1E', borderRadius: 12, padding: 4, marginBottom: 16, },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 8, },
  activeTab: { backgroundColor: '#374151' },
  tabText: { textAlign: 'center', fontSize: 14, fontWeight: '600', color: '#AAB8C2', },
  activeTabText: { color: '#FFFFFF', },
});

export default PortfolioScreen;
