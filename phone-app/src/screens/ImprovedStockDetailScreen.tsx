import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Chart from '../components/Chart';
import { stockDataService } from '../services/stockDataService';

interface ChartData { labels: string[]; datasets: { data: number[] }[] }

const formatCurrency = (n: number) => `$${n.toFixed(2)}`;
const formatPercent = (p: number) => `${p >= 0 ? '+' : ''}${p.toFixed(2)}%`;

const ImprovedStockDetailScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const symbol: string = route?.params?.symbol || 'AAPL';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quote, setQuote] = useState<any>(null);
  const [chart, setChart] = useState<ChartData>({ labels: [], datasets: [{ data: [] }] });
  const [tab, setTab] = useState<'overview' | 'news' | 'options' | 'analysis'>('overview');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [q, hist] = await Promise.all([
          stockDataService.getStockQuote(symbol),
          stockDataService.getHistoricalPrices(symbol, 30),
        ]);
        if (!mounted) return;
        setQuote(q);
        if (hist && hist.length) {
          setChart({
            labels: hist.map((d: any) => d.date).slice(-12),
            datasets: [{ data: hist.map((d: any) => d.close).slice(-12) }],
          });
        }
      } catch (e) {
        if (!mounted) return;
        setError('Failed to load stock data');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [symbol]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.center}><ActivityIndicator color="#3B82F6" /></View>
      </SafeAreaView>
    );
  }

  if (error || !quote) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorBox}>
          <Feather name="alert-triangle" color="#F87171" size={16} />
          <Text style={styles.errorText}>{error || 'No data'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isPositive = quote.changePercent >= 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>{symbol}</Text>
            <Text style={styles.sub}>{quote.symbol}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.price}>{formatCurrency(quote.price)}</Text>
            <Text style={[styles.change, { color: isPositive ? '#10B981' : '#EF4444' }]}>
              {formatCurrency(quote.change)} ({formatPercent(quote.changePercent)})
            </Text>
          </View>
        </View>

        {/* Chart */}
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.cardTitle}>Price Chart</Text>
            <View style={styles.tfRow}>
              {['1D','1W','1M'].map(tf => (
                <View key={tf} style={styles.tfPill}><Text style={styles.tfText}>{tf}</Text></View>
              ))}
            </View>
          </View>
          <Chart data={chart} />
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {(['overview','options','analysis'] as const).map(t => (
            <TouchableOpacity key={t} onPress={() => setTab(t)} style={[styles.tab, tab === t && styles.tabActive]}>
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {tab === 'overview' && (
          <View style={styles.grid}>
            <Info label="Open" value={formatCurrency(quote.open)} />
            <Info label="High" value={formatCurrency(quote.high)} />
            <Info label="Low" value={formatCurrency(quote.low)} />
            <Info label="Volume" value={`${(quote.volume/1_000_000).toFixed(2)}M`} />
          </View>
        )}

        {tab === 'options' && (
          <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('Options', { symbol })}>
            <Feather name="layers" size={16} color="#FFFFFF" />
            <Text style={styles.primaryBtnText}>View Options Chain</Text>
          </TouchableOpacity>
        )}

        {tab === 'analysis' && (
          <View style={styles.card}><Text style={{ color: '#9CA3AF' }}>AI analysis coming soon.</Text></View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const Info = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.infoCard}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  content: { padding: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  title: { color: '#FFFFFF', fontSize: 24, fontWeight: '700' },
  sub: { color: '#9CA3AF', marginTop: 2 },
  price: { color: '#FFFFFF', fontSize: 24, fontWeight: '700' },
  change: { marginTop: 4 },
  card: { backgroundColor: '#0F172A', borderWidth: 1, borderColor: '#1F2937', borderRadius: 12, padding: 12, marginBottom: 12 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle: { color: '#E5E7EB', fontWeight: '700' },
  tfRow: { flexDirection: 'row', gap: 6 },
  tfPill: { backgroundColor: '#111827', borderColor: '#1F2937', borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  tfText: { color: '#9CA3AF', fontSize: 12 },
  tabs: { flexDirection: 'row', backgroundColor: '#111827', borderColor: '#1F2937', borderWidth: 1, borderRadius: 12, padding: 4, marginBottom: 12 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 8 },
  tabActive: { backgroundColor: '#1F2937' },
  tabText: { color: '#9CA3AF', fontWeight: '700', fontSize: 12 },
  tabTextActive: { color: '#FFFFFF' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  infoCard: { width: '48%', backgroundColor: '#0F172A', borderWidth: 1, borderColor: '#1F2937', borderRadius: 12, padding: 12, marginBottom: 12 },
  infoLabel: { color: '#9CA3AF', fontSize: 12 },
  infoValue: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', marginTop: 4 },
  primaryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#3B82F6', borderRadius: 10, height: 44 },
  primaryBtnText: { color: '#FFFFFF', fontWeight: '700', marginLeft: 8 },
  errorBox: { margin: 16, padding: 12, backgroundColor: '#111827', borderColor: '#374151', borderWidth: 1, borderRadius: 10, flexDirection: 'row', alignItems: 'center' },
  errorText: { color: '#F87171', marginLeft: 8 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

export default ImprovedStockDetailScreen;


