import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

const MarketAnalytics: React.FC = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Market Analytics</Text>
            <View style={styles.cardsContainer}>
                <PlaceholderCard title="Sector Heatmap" />
                <PlaceholderCard title="Market News" />
            </View>
        </View>
    );
};

const PlaceholderCard = ({ title }) => (
    <View style={styles.card}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardMessage}>Data coming soon.</Text>
    </View>
);

const styles = StyleSheet.create({
    container: { marginTop: 24, marginBottom: 24 },
    title: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 16 },
    cardsContainer: { flexDirection: 'row', justifyContent: 'space-between' },
    card: { backgroundColor: '#1C1C1E', borderRadius: 12, padding: 16, width: '48%' },
    cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 8 },
    cardMessage: { fontSize: 12, color: '#AAB8C2' },
});

export default MarketAnalytics; 