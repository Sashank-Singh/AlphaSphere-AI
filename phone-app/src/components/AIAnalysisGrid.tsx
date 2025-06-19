import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

const analysisData = {
    news: { title: 'AI News Impact Analysis', icon: 'message-square', sentiment: 'Positive', items: [
        { text: 'AAPL beats earnings expectations', source: 'Reuters' },
        { text: 'AAPL faces regulatory scrutiny', source: 'Bloomberg' },
        { text: 'AAPL launches new product line', source: 'CNBC' },
    ]},
    fundamentals: { title: 'AI Fundamental Score', icon: 'bar-chart-2', score: 77, details: 'Growth: 61%, Profitability: 87%, Value: 90%'},
    patterns: { title: 'AI Pattern Recognition', icon: 'git-merge', pattern: 'Bullish Engulfing', signal: 'Potential upward reversal' },
    earnings: { title: 'AI Earnings Prediction', icon: 'trending-up', date: '7/4/2025', eps: 2.43, revenue: '13.33B', forecast: 'Miss expected' },
    insider: { title: 'AI Insider Trading Analysis', icon: 'users', activity: 'Bullish', trades: [
        { role: 'CEO', action: 'Buy', amount: '5000 shares' },
        { role: 'CFO', action: 'Sell', amount: '2000 shares' },
        { role: 'Director', action: 'Buy', amount: '1000 shares' },
    ]},
    options: { title: 'AI Options Flow Analysis', icon: 'layers', score: 'Neutral (53)', trades: 'Bullish: 10, Bearish: 9', largest: 'Call 1404 contracts @ $9.93' },
};

const Card: React.FC<{ title: string; icon: any; children: React.ReactNode }> = ({ title, icon, children }) => (
    <View style={styles.card}>
        <View style={styles.cardHeader}>
            <Feather name={icon} size={16} color="#AAB8C2" />
            <Text style={styles.cardTitle}>{title}</Text>
        </View>
        <View style={styles.cardContent}>{children}</View>
    </View>
);

const AIAnalysisGrid: React.FC = () => (
    <View style={styles.grid}>
        <Card title={analysisData.news.title} icon={analysisData.news.icon}>
            <Text style={styles.baseText}>News Sentiment: <Text style={{color: '#34C759'}}>{analysisData.news.sentiment}</Text></Text>
            {analysisData.news.items.map((item, i) => <Text key={i} style={styles.newsItem}>- {item.text} ({item.source})</Text>)}
        </Card>
        <Card title={analysisData.fundamentals.title} icon={analysisData.fundamentals.icon}>
            <Text style={styles.baseText}>Fundamental Score: <Text style={{color: '#34C759'}}>{analysisData.fundamentals.score}/100</Text></Text>
            <Text style={styles.detailsText}>{analysisData.fundamentals.details}</Text>
        </Card>
        <Card title={analysisData.patterns.title} icon={analysisData.patterns.icon}>
             <Text style={styles.baseText}>Detected Pattern: <Text style={{color: '#34C759'}}>{analysisData.patterns.pattern}</Text></Text>
             <Text style={styles.detailsText}>{analysisData.patterns.signal}</Text>
        </Card>
        <Card title={analysisData.earnings.title} icon={analysisData.earnings.icon}>
             <Text style={styles.baseText}>Next Earnings: {analysisData.earnings.date}</Text>
             <Text style={styles.detailsText}>Predicted EPS: ${analysisData.earnings.eps}</Text>
             <Text style={styles.detailsText}>Predicted Revenue: ${analysisData.earnings.revenue}</Text>
             <Text style={styles.baseText}>AI Forecast: <Text style={{color: '#FF453A'}}>{analysisData.earnings.forecast}</Text></Text>
        </Card>
        <Card title={analysisData.insider.title} icon={analysisData.insider.icon}>
            <Text style={styles.baseText}>Insider Activity Score: <Text style={{color: '#34C759'}}>{analysisData.insider.activity}</Text></Text>
            {analysisData.insider.trades.map((t, i) => <Text key={i} style={styles.detailsText}>{t.role} {t.action}: {t.amount}</Text>)}
        </Card>
        <Card title={analysisData.options.title} icon={analysisData.options.icon}>
            <Text style={styles.baseText}>Flow Score: <Text style={{color: '#FF9F0A'}}>{analysisData.options.score}</Text></Text>
            <Text style={styles.detailsText}>{analysisData.options.trades}</Text>
            <Text style={styles.detailsText}>Largest Trade: {analysisData.options.largest}</Text>
        </Card>
    </View>
);

const styles = StyleSheet.create({
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 16 },
    card: { width: '48%', backgroundColor: '#1C1C1E', borderRadius: 12, padding: 12, marginBottom: 16 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    cardTitle: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13, marginLeft: 8 },
    cardContent: {},
    baseText: { color: '#FFFFFF', fontSize: 12, marginBottom: 4 },
    detailsText: { color: '#AAB8C2', fontSize: 12, marginBottom: 2 },
    newsItem: { color: '#AAB8C2', fontSize: 12, marginLeft: 4 },
});

export default AIAnalysisGrid; 