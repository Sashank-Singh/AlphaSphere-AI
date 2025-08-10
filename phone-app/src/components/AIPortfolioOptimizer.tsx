import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface Allocation {
  sector: string;
  current: number;
  recommended: number;
  status: 'optimal' | 'overweight' | 'underweight';
}

interface Recommendation {
  type: 'reduce' | 'add';
  action: string;
  impact: number;
}

interface Optimization {
  overallScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  diversificationScore: number;
  allocations: Allocation[];
  recommendations: Recommendation[];
}

const AIPortfolioOptimizer: React.FC = () => {
  const [optimization, setOptimization] = useState<Optimization>({
    overallScore: 78,
    riskLevel: 'medium',
    diversificationScore: 85,
    allocations: [
      { sector: 'Technology', current: 45, recommended: 35, status: 'overweight' },
      { sector: 'Healthcare', current: 15, recommended: 20, status: 'underweight' },
      { sector: 'Finance', current: 25, recommended: 25, status: 'optimal' },
      { sector: 'Energy', current: 15, recommended: 20, status: 'underweight' },
    ],
    recommendations: [
      { type: 'reduce', action: 'Reduce tech exposure', impact: 85 },
      { type: 'add', action: 'Increase healthcare allocation', impact: 70 },
    ],
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setOptimization(prev => ({
        ...prev,
        overallScore: Math.max(60, Math.min(95, prev.overallScore + (Math.random() - 0.5) * 8)),
        diversificationScore: Math.max(70, Math.min(100, prev.diversificationScore + (Math.random() - 0.5) * 6)),
      }));
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  const getRiskColor = (risk: string): string => {
    switch (risk) {
      case 'low': return '#10B981';
      case 'high': return '#EF4444';
      default: return '#F59E0B';
    }
  };

  const getStatusIcon = (status: string): keyof typeof Feather.glyphMap => {
    switch (status) {
      case 'optimal': return 'check-circle';
      case 'overweight': return 'trending-up';
      case 'underweight': return 'trending-down';
      default: return 'circle';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'optimal': return '#10B981';
      case 'overweight': return '#EF4444';
      case 'underweight': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Feather name="pie-chart" size={20} color="#3B82F6" />
        <Text style={styles.title}>Portfolio Optimizer</Text>
        <View style={styles.liveBadge}>
          <Feather name="zap" size={12} color="#FBBF24" />
          <Text style={styles.liveText}>Live</Text>
        </View>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.scoreSection}>
          <View style={styles.scoreHeader}>
            <View style={styles.scoreTitleContainer}>
              <Feather name="cpu" size={16} color="#3B82F6" />
              <Text style={styles.scoreTitle}>Optimization Score</Text>
            </View>
            <View style={styles.riskContainer}>
              <Text style={styles.riskLabel}>Risk Level</Text>
              <Text style={[styles.riskValue, { color: getRiskColor(optimization.riskLevel) }]}>
                {optimization.riskLevel}
              </Text>
            </View>
          </View>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Portfolio Score</Text>
              <Text style={styles.progressValue}>{optimization.overallScore.toFixed(0)}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${optimization.overallScore}%` }
                ]} 
              />
            </View>
          </View>
        </View>

        <View style={styles.allocationsSection}>
          <View style={styles.sectionHeader}>
            <Feather name="target" size={16} color="#3B82F6" />
            <Text style={styles.sectionTitle}>Asset Allocation</Text>
          </View>
          {optimization.allocations.map((allocation, index) => (
            <View key={index} style={styles.allocationRow}>
              <Text style={styles.allocationSector}>{allocation.sector}</Text>
              <View style={styles.allocationRight}>
                <Text style={styles.allocationCurrent}>{allocation.current.toFixed(0)}%</Text>
                <View style={styles.allocationBar}>
                  <View 
                    style={[
                      styles.allocationFill, 
                      { width: `${(allocation.current / 50) * 100}%` }
                    ]} 
                  />
                </View>
                <Feather 
                  name={getStatusIcon(allocation.status)} 
                  size={12} 
                  color={getStatusColor(allocation.status)} 
                />
              </View>
            </View>
          ))}
        </View>

        <View style={styles.recommendationsSection}>
          <Text style={styles.sectionTitle}>AI Recommendations</Text>
          {optimization.recommendations.map((rec, index) => (
            <View key={index} style={styles.recommendationRow}>
              <View style={[
                styles.recommendationBadge,
                { backgroundColor: rec.type === 'add' ? '#3B82F6' : '#EF4444' }
              ]}>
                <Feather 
                  name={rec.type === 'add' ? 'trending-up' : 'bar-chart-2'} 
                  size={12} 
                  color="#FFFFFF" 
                />
                <Text style={styles.badgeText}>{rec.type.toUpperCase()}</Text>
              </View>
              <Text style={styles.recommendationAction}>{rec.action}</Text>
              <Text style={styles.recommendationImpact}>{rec.impact}%</Text>
            </View>
          ))}
        </View>

        <View style={styles.diversificationSection}>
          <View style={styles.diversificationRow}>
            <Text style={styles.diversificationLabel}>Diversification Score</Text>
            <Text style={styles.diversificationValue}>
              {optimization.diversificationScore.toFixed(0)}%
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
    flex: 1,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#78350F',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveText: {
    fontSize: 12,
    color: '#FBBF24',
    fontWeight: '500',
    marginLeft: 4,
  },
  content: {
    maxHeight: 400,
  },
  scoreSection: {
    marginBottom: 16,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  scoreTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  riskContainer: {
    alignItems: 'flex-end',
  },
  riskLabel: {
    fontSize: 12,
    color: '#AAB8C2',
  },
  riskValue: {
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  progressContainer: {
    gap: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 14,
    color: '#AAB8C2',
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
    marginTop: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  allocationsSection: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  allocationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  allocationSector: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
  },
  allocationRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  allocationCurrent: {
    fontSize: 12,
    color: '#AAB8C2',
    width: 40,
    textAlign: 'right',
  },
  allocationBar: {
    width: 80,
    height: 6,
    backgroundColor: '#374151',
    borderRadius: 3,
  },
  allocationFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
  recommendationsSection: {
    marginTop: 16,
  },
  recommendationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  recommendationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 4,
  },
  recommendationAction: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  recommendationImpact: {
    fontSize: 12,
    color: '#AAB8C2',
    fontWeight: '500',
  },
  diversificationSection: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#374151',
    marginTop: 16,
  },
  diversificationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  diversificationLabel: {
    fontSize: 14,
    color: '#AAB8C2',
  },
  diversificationValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default AIPortfolioOptimizer;
