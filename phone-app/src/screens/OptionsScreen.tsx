import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { stockDataService } from '../services/stockDataService';

type OptionContract = {
  contractSymbol: string;
  strike: number;
  bid: number;
  ask: number;
  volume: number;
  openInterest: number;
  expiration?: string;
  type?: 'call' | 'put';
};

type OptionsData = {
  options: OptionContract[];
  underlying: { price: number };
};

const formatCurrency = (n: number) => `$${n.toFixed(2)}`;

const OptionsScreen: React.FC<{ route: any }> = ({ route }) => {
  const initialSymbol = route?.params?.symbol || 'AAPL';
  const [symbol, setSymbol] = useState<string>(initialSymbol);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<OptionsData | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await stockDataService.getOptionsData(symbol);
        if (!mounted) return;
        setData(resp as OptionsData);
      } catch (e) {
        if (!mounted) return;
        setError('Failed to load options data');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [symbol]);

  const [calls, puts] = useMemo(() => {
    const list = data?.options || [];
    const calls = list.filter(o => (o.type || o.contractSymbol.includes('C')));
    const puts = list.filter(o => (o.type === 'put') || o.contractSymbol.includes('P'));
    // Sort by strike nearest underlying
    const ref = data?.underlying?.price || 0;
    const sortByMoneyness = (a: OptionContract, b: OptionContract) => Math.abs(a.strike - ref) - Math.abs(b.strike - ref);
    return [calls.slice().sort(sortByMoneyness).slice(0, 20), puts.slice().sort(sortByMoneyness).slice(0, 20)];
  }, [data]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Options: {symbol}</Text>
          <TouchableOpacity onPress={() => setSymbol(symbol)} style={styles.refreshBtn}>
            <Feather name="refresh-ccw" size={18} color="#E5E7EB" />
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={styles.center}>
            <ActivityIndicator color="#3B82F6" />
          </View>
        )}
        {!!error && (
          <View style={styles.errorBox}>
            <Feather name="alert-triangle" color="#F87171" size={16} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {!!data && !loading && (
          <>
            <View style={styles.underlyingCard}>
              <Text style={styles.cardLabel}>Underlying</Text>
              <Text style={styles.cardValue}>{formatCurrency(data.underlying.price)}</Text>
            </View>

            <View style={styles.grid}>
              <View style={styles.col}>
                <Text style={styles.sectionTitle}>Calls</Text>
                {calls.map((o) => (
                  <View key={o.contractSymbol} style={styles.row}>
                    <Text style={[styles.cell, styles.left]}>{o.strike.toFixed(2)}</Text>
                    <Text style={styles.cell}>{formatCurrency(o.bid)}</Text>
                    <Text style={styles.cell}>{formatCurrency(o.ask)}</Text>
                    <Text style={[styles.cell, styles.right]}>{o.volume}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.col}>
                <Text style={styles.sectionTitle}>Puts</Text>
                {puts.map((o) => (
                  <View key={o.contractSymbol} style={styles.row}>
                    <Text style={[styles.cell, styles.left]}>{o.strike.toFixed(2)}</Text>
                    <Text style={styles.cell}>{formatCurrency(o.bid)}</Text>
                    <Text style={styles.cell}>{formatCurrency(o.ask)}</Text>
                    <Text style={[styles.cell, styles.right]}>{o.volume}</Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  content: { padding: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
  refreshBtn: { padding: 8, backgroundColor: '#1F2937', borderRadius: 8, borderWidth: 1, borderColor: '#374151' },
  center: { paddingVertical: 24, alignItems: 'center' },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#1F2937', borderColor: '#374151', borderWidth: 1, padding: 12, borderRadius: 8 },
  errorText: { color: '#F87171', marginLeft: 8 },
  underlyingCard: { backgroundColor: '#111827', borderColor: '#1F2937', borderWidth: 1, borderRadius: 12, padding: 16, marginBottom: 16 },
  cardLabel: { color: '#9CA3AF', fontSize: 12 },
  cardValue: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', marginTop: 4 },
  grid: { flexDirection: 'row', gap: 12 },
  col: { flex: 1, backgroundColor: '#0F172A', borderRadius: 12, borderWidth: 1, borderColor: '#1F2937', padding: 12 },
  sectionTitle: { color: '#E5E7EB', fontWeight: '700', marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#1F2937' },
  cell: { flex: 1, color: '#D1D5DB', fontSize: 12 },
  left: { textAlign: 'left' },
  right: { textAlign: 'right' },
});

export default OptionsScreen;


