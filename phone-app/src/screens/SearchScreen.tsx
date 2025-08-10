import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { stockDataService } from '../services/stockDataService';

type Result = {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  volume: number;
};

const formatCurrency = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

const SearchScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [results, setResults] = useState<Result[]>([]);

  useEffect(() => {
    const run = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const pool = ['AAPL','MSFT','GOOGL','AMZN','TSLA','NVDA','META','NFLX','AMD','INTC','JPM','BAC','WFC','GS','MS'];
        const filtered = pool.filter(s => s.toLowerCase().includes(query.toLowerCase())).slice(0, 10);
        const quotes = await Promise.all(filtered.map(s => stockDataService.getStockQuote(s)));
        setResults(quotes.map(q => ({
          symbol: q.symbol,
          name: q.symbol,
          price: q.price,
          changePercent: q.changePercent,
          volume: q.volume,
        })));
      } catch (e) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    };
    const id = setTimeout(run, 300);
    return () => clearTimeout(id);
  }, [query]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.searchBar}>
        <Feather name="search" size={18} color="#9CA3AF" />
        <TextInput
          style={styles.input}
          placeholder="Search stocks..."
          placeholderTextColor="#9CA3AF"
          value={query}
          onChangeText={setQuery}
          autoCapitalize="characters"
          autoCorrect={false}
        />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#3B82F6" />
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.symbol}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('StockDetail', { symbol: item.symbol })}
            >
              <View>
                <Text style={styles.symbol}>{item.symbol}</Text>
                <Text style={styles.sub}>{item.name}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.price}>{formatCurrency(item.price)}</Text>
                <Text style={[styles.change, { color: item.changePercent >= 0 ? '#10B981' : '#EF4444' }]}>
                  {item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                </Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={!!query && (
            <Text style={styles.empty}>No results</Text>
          )}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111827', borderColor: '#1F2937', borderWidth: 1, margin: 16, paddingHorizontal: 12, borderRadius: 10, height: 44 },
  input: { marginLeft: 8, color: '#FFFFFF', flex: 1 },
  center: { paddingTop: 24, alignItems: 'center' },
  list: { paddingHorizontal: 16, paddingBottom: 16 },
  card: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0F172A', borderWidth: 1, borderColor: '#1F2937', borderRadius: 12, padding: 14, marginBottom: 12 },
  symbol: { color: '#E5E7EB', fontWeight: '700', fontSize: 16 },
  sub: { color: '#9CA3AF', fontSize: 12, marginTop: 2 },
  price: { color: '#E5E7EB', fontWeight: '700' },
  change: { fontSize: 12, marginTop: 2 },
  empty: { color: '#9CA3AF', textAlign: 'center', marginTop: 24 },
});

export default SearchScreen;


