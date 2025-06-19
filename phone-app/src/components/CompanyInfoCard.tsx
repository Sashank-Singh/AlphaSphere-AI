import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const mockCompanyData = {
    marketCap: '2.9T',
    peRatio: '30.5',
    high52Week: '195.89',
    low52Week: '165.70',
    volume: '58.3M',
    avgVolume: '87.9M',
};

const CompanyInfoCard: React.FC = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Company Information</Text>
            <View style={styles.grid}>
                <InfoItem label="Market Cap" value={mockCompanyData.marketCap} />
                <InfoItem label="P/E Ratio" value={mockCompanyData.peRatio} />
                <InfoItem label="52W High" value={mockCompanyData.high52Week} />
                <InfoItem label="52W Low" value={mockCompanyData.low52Week} />
                <InfoItem label="Volume" value={mockCompanyData.volume} />
                <InfoItem label="Avg. Volume" value={mockCompanyData.avgVolume} />
            </View>
        </View>
    );
};

const InfoItem = ({ label, value }) => (
    <View style={styles.infoItem}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
    </View>
);

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
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    infoItem: {
        width: '48%',
        marginBottom: 12,
    },
    infoLabel: {
        fontSize: 14,
        color: '#AAB8C2',
    },
    infoValue: {
        fontSize: 16,
        fontWeight: '500',
        color: '#FFFFFF',
        marginTop: 4,
    },
});

export default CompanyInfoCard; 