import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const mockSectors = [
    { name: 'Technology', change: 1.8 },
    { name: 'Healthcare', change: 0.5 },
    { name: 'Energy', change: -1.2 },
    { name: 'Financials', change: 0.3 },
];

const SectorPerformanceCard: React.FC = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Sector Performance</Text>
            {mockSectors.map(sector => (
                <View key={sector.name} style={styles.sectorRow}>
                    <Text style={styles.sectorName}>{sector.name}</Text>
                    <Text style={{ color: sector.change >= 0 ? '#10B981' : '#EF4444' }}>
                        {sector.change >= 0 ? '+' : ''}{sector.change}%
                    </Text>
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#1C1C1E',
        borderRadius: 12,
        padding: 16,
        marginTop: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 16,
    },
    sectorRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    sectorName: {
        fontSize: 14,
        color: '#E1E8ED',
    },
});

export default SectorPerformanceCard; 