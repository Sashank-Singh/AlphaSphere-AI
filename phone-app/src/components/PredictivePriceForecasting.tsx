import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';

const generateMockForecastData = (timeframe: '1d' | '1w' | '1m', basePrice: number) => {
    const directionMultiplier = Math.random() > 0.5 ? 1 : -1;
    const volatility = { '1d': 0.015, '1w': 0.04, '1m': 0.09 }[timeframe];
    const confidenceScore = Math.random() * 0.4 + 0.5; // 50-90%
    const dataPoints = { '1d': 12, '1w': 14, '1m': 30 }[timeframe];

    let lastPrice = basePrice;
    const predictions = Array.from({ length: dataPoints }, (_, i) => {
        const progress = i / dataPoints;
        const trendFactor = directionMultiplier * volatility * progress;
        const randomFactor = (Math.random() - 0.5) * volatility * 0.5;
        const price = lastPrice * (1 + trendFactor + randomFactor);
        lastPrice = price;

        const boundWidth = basePrice * volatility * (progress + 0.5) * (1 - confidenceScore) * 1.5;
        return {
            price,
            upperBound: price + boundWidth,
            lowerBound: price - boundWidth,
        };
    });

    const finalPrice = predictions[predictions.length - 1].price;
    const priceChange = (finalPrice - basePrice) / basePrice;
    const direction = Math.abs(priceChange) < 0.005 ? 'Sideways' : priceChange > 0 ? 'Up' : 'Down';
    
    return {
        predictions,
        summary: {
            direction,
            confidenceScore,
            potentialUpside: Math.max(0, (Math.max(...predictions.map(p => p.upperBound)) / basePrice) - 1),
            potentialDownside: Math.max(0, 1 - (Math.min(...predictions.map(p => p.lowerBound)) / basePrice)),
            keyLevels: {
                support: Math.min(...predictions.map(p => p.lowerBound)),
                resistance: Math.max(...predictions.map(p => p.upperBound)),
            },
            lastUpdated: new Date(),
        },
    };
};

const PredictivePriceForecasting: React.FC = () => {
    const [timeframe, setTimeframe] = useState<'1d' | '1w' | '1m'>('1d');
    const [forecast, setForecast] = useState(null);
    
    const fetchForecast = () => {
        const data = generateMockForecastData(timeframe, 184.50);
        setForecast(data);
    };

    useEffect(fetchForecast, [timeframe]);

    if (!forecast) return null;

    const { summary, predictions } = forecast;

    const chartData = {
        labels: timeframe === '1d' ? ['12 AM', '3 AM', '6 AM', '9 AM'] : timeframe === '1w' ? ['Sun', 'Tue', 'Thu', 'Sat'] : ['W1', 'W2', 'W3', 'W4'],
        datasets: [
            {
                data: predictions.map(p => p.upperBound),
                color: (opacity = 1) => `rgba(52, 199, 89, ${opacity * 0.2})`,
                strokeWidth: 1,
            },
            {
                data: predictions.map(p => p.price),
                color: (opacity = 1) => `rgba(90, 200, 250, ${opacity})`,
                strokeWidth: 2,
            },
            {
                data: predictions.map(p => p.lowerBound),
                color: (opacity = 1) => `rgba(255, 69, 58, ${opacity * 0.2})`,
                strokeWidth: 1,
            }
        ],
    };

    const getConfidenceLabel = (score: number) => {
        if (score >= 0.8) return 'High';
        if (score >= 0.65) return 'Medium';
        return 'Low';
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.titleContainer}>
                    <Feather name="cpu" size={16} color="#AAB8C2" />
                    <Text style={styles.title}>AI Price Forecast</Text>
                </View>
                <View style={styles.tabs}>
                    {['1d', '1w', '1m'].map((tf) => (
                        <TouchableOpacity key={tf} onPress={() => setTimeframe(tf as '1d' | '1w' | '1m')} style={[styles.tab, timeframe === tf && styles.activeTab]}>
                            <Text style={[styles.tabText, timeframe === tf && styles.activeTabText]}>{tf.toUpperCase()}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <LineChart
                data={chartData}
                width={Dimensions.get('window').width - 48}
                height={180}
                withVerticalLines={true}
                withHorizontalLines={true}
                withShadow={false}
                withInnerLines={true}
                withOuterLines={false}
                yAxisLabel="$"
                yAxisSuffix=""
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
                fromZero={false}
            />

            <View style={styles.summaryContainer}>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Direction:</Text>
                    <Text style={[styles.summaryValue, { color: summary.direction === 'Up' ? '#34C759' : summary.direction === 'Down' ? '#FF453A' : '#FF9F0A'}]}>
                        {summary.direction}
                    </Text>
                </View>
                 <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Confidence:</Text>
                    <Text style={styles.summaryValue}>{getConfidenceLabel(summary.confidenceScore)} ({`${(summary.confidenceScore * 100).toFixed(0)}%`})</Text>
                </View>

                <View style={styles.separator} />
                
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Potential Upside</Text>
                    <Text style={[styles.summaryValue, {color: '#34C759'}]}>+{`${(summary.potentialUpside * 100).toFixed(2)}%`}</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Potential Downside</Text>
                    <Text style={[styles.summaryValue, {color: '#FF453A'}]}>-{`${(summary.potentialDownside * 100).toFixed(2)}%`}</Text>
                </View>

                <View style={styles.separator} />

                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Support Level</Text>
                    <Text style={styles.summaryValue}>${summary.keyLevels.support.toFixed(2)}</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Resistance Level</Text>
                    <Text style={styles.summaryValue}>${summary.keyLevels.resistance.toFixed(2)}</Text>
                </View>

                <View style={styles.separator} />

                <View style={styles.footer}>
                     <Text style={styles.footerText}>
                        <Feather name="calendar" size={11} /> Last updated: {summary.lastUpdated.toLocaleTimeString()}
                     </Text>
                     <TouchableOpacity onPress={fetchForecast}>
                        <Feather name="refresh-cw" size={14} color="#AAB8C2" />
                     </TouchableOpacity>
                </View>
                 <View style={styles.disclaimerBox}>
                    <Feather name="info" size={12} color="#AAB8C2" />
                    <Text style={styles.disclaimerText}>Forecasts are based on historical data and do not guarantee future results.</Text>
                 </View>
            </View>
        </View>
    );
};

const chartConfig = {
    backgroundColor: '#1C1C1E',
    backgroundGradientFrom: '#1C1C1E',
    backgroundGradientTo: '#1C1C1E',
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(170, 184, 194, ${opacity})`,
    propsForDots: { r: '0' },
    propsForBackgroundLines: {
        strokeDasharray: '3',
        stroke: '#333'
    }
};

const styles = StyleSheet.create({
    container: { backgroundColor: '#1C1C1E', borderRadius: 12, padding: 16, marginVertical: 8 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    titleContainer: { flexDirection: 'row', alignItems: 'center' },
    title: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF', marginLeft: 8 },
    tabs: { flexDirection: 'row', backgroundColor: '#2C2C2E', borderRadius: 8 },
    tab: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 6 },
    activeTab: { backgroundColor: '#555' },
    tabText: { color: '#AAB8C2', fontSize: 12, fontWeight: '600' },
    activeTabText: { color: '#FFFFFF' },
    chart: { borderRadius: 8, marginLeft: -8, marginRight: -8 },
    summaryContainer: { marginTop: 16, },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 4, },
    summaryLabel: { color: '#AAB8C2', fontSize: 14 },
    summaryValue: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
    separator: { height: 1, backgroundColor: '#2C2C2E', marginVertical: 8 },
    footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
    footerText: { fontSize: 11, color: '#AAB8C2' },
    disclaimerBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2C2C2E', borderRadius: 6, padding: 8, marginTop: 12},
    disclaimerText: { fontSize: 11, color: '#AAB8C2', marginLeft: 8, flex: 1 },
});

export default PredictivePriceForecasting; 