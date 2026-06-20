import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default function Dashboard({ payments, members }) {
  // 1. Calculate Statistics
  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

  const currentMonthYear = new Date().toISOString().substring(0, 7); // e.g. "2026-06"
  const thisMonthRevenue = payments
    .filter(p => p.payment_date && p.payment_date.startsWith(currentMonthYear))
    .reduce((sum, p) => sum + p.amount, 0);

  const activeMembersCount = members.filter(m => m.status === 'Active').length;
  const newJoinsThisMonth = members.filter(m => m.joined_date && m.joined_date.startsWith(currentMonthYear)).length;

  // 2. Calculate Payment Method Breakdown
  const methodTotals = {};
  payments.forEach(p => {
    const method = p.payment_method || 'Other';
    methodTotals[method] = (methodTotals[method] || 0) + p.amount;
  });

  const methodBreakdown = Object.keys(methodTotals).map(method => ({
    name: method,
    amount: methodTotals[method],
    percentage: totalRevenue > 0 ? (methodTotals[method] / totalRevenue) * 100 : 0
  })).sort((a, b) => b.amount - a.amount);

  // Helper for payment method colors
  const getMethodColor = (method) => {
    switch (method.toLowerCase()) {
      case 'gpay': return '#4285F4';       // GPay Blue
      case 'phonepe': return '#5f259f';    // PhonePe Purple
      case 'paytm': return '#00baf2';      // Paytm Cyan
      case 'cash': return '#25D366';       // Cash Green
      case 'card': return '#FFC107';       // Card Gold
      case 'bank transfer': return '#e8814a'; // Ember Orange
      default: return '#8a8f94';           // Steel Grey
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.welcomeText}>Partner Overview</Text>
      <Text style={styles.subText}>Live revenue metrics and payment distributions</Text>

      {/* ============ OVERALL REVENUE CARDS ============ */}
      <View style={styles.statsRow}>
        <View style={styles.mainCard}>
          <Text style={styles.cardTitle}>Total Revenue</Text>
          <Text style={styles.cardValue}>₹{totalRevenue.toLocaleString('en-IN')}</Text>
          <Text style={styles.cardFooter}>All-time gross collection</Text>
        </View>

        <View style={[styles.mainCard, styles.emberCard]}>
          <Text style={[styles.cardTitle, styles.emberCardTitle]}>This Month</Text>
          <Text style={[styles.cardValue, styles.emberCardValue]}>₹{thisMonthRevenue.toLocaleString('en-IN')}</Text>
          <Text style={[styles.cardFooter, styles.emberCardFooter]}>Current billing cycle</Text>
        </View>
      </View>

      {/* ============ QUICK COUNTERS ============ */}
      <View style={styles.gridRow}>
        <View style={styles.gridCard}>
          <Text style={styles.gridCardTitle}>Active Members</Text>
          <Text style={styles.gridCardValue}>{activeMembersCount}</Text>
          <Text style={styles.gridCardFooter}>Active packages on floor</Text>
        </View>

        <View style={styles.gridCard}>
          <Text style={styles.gridCardTitle}>New Registrations</Text>
          <Text style={styles.gridCardValue}>{newJoinsThisMonth}</Text>
          <Text style={styles.gridCardFooter}>Joined this month</Text>
        </View>
      </View>

      {/* ============ PAYMENT METHODS BREAKDOWN ============ */}
      <View style={styles.breakdownCard}>
        <Text style={styles.sectionHeader}>Revenue by Payment Method</Text>
        
        {methodBreakdown.length === 0 ? (
          <Text style={styles.noDataText}>No payments logged yet.</Text>
        ) : (
          <View style={styles.breakdownList}>
            {/* Visual Bar representation */}
            <View style={styles.progressBarWrapper}>
              {methodBreakdown.map((item, index) => (
                <View 
                  key={item.name}
                  style={{
                    height: 12,
                    width: `${item.percentage}%`,
                    backgroundColor: getMethodColor(item.name),
                    borderTopLeftRadius: index === 0 ? 6 : 0,
                    borderBottomLeftRadius: index === 0 ? 6 : 0,
                    borderTopRightRadius: index === methodBreakdown.length - 1 ? 6 : 0,
                    borderBottomRightRadius: index === methodBreakdown.length - 1 ? 6 : 0,
                  }}
                />
              ))}
            </View>

            {/* List entries with details */}
            {methodBreakdown.map(item => (
              <View key={item.name} style={styles.methodItem}>
                <View style={styles.methodLeft}>
                  <View style={[styles.colorDot, { backgroundColor: getMethodColor(item.name) }]} />
                  <Text style={styles.methodName}>{item.name}</Text>
                </View>
                <View style={styles.methodRight}>
                  <Text style={styles.methodAmount}>₹{item.amount.toLocaleString('en-IN')}</Text>
                  <Text style={styles.methodPct}>{item.percentage.toFixed(1)}%</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0b0c', // Void black
  },
  contentContainer: {
    padding: 18,
    paddingBottom: 32,
  },
  welcomeText: {
    fontFamily: 'System',
    fontSize: 24,
    fontWeight: '800',
    color: '#ede8de', // Bone White
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  subText: {
    fontFamily: 'System',
    fontSize: 13,
    color: '#8a8f94', // Steel grey
    marginBottom: 20,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'column',
    gap: 12,
    marginBottom: 12,
  },
  mainCard: {
    backgroundColor: '#171613', // Panel Charcoal
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(237, 232, 222, 0.08)',
  },
  emberCard: {
    borderColor: '#c4602a', // Ember Border
    backgroundColor: '#1f1d19',
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8a8f94',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  emberCardTitle: {
    color: '#e8814a',
  },
  cardValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ede8de',
    letterSpacing: -0.5,
  },
  emberCardValue: {
    color: '#e8814a',
  },
  cardFooter: {
    fontSize: 10,
    color: '#8a8f94',
    marginTop: 6,
  },
  emberCardFooter: {
    color: '#b7bbbe',
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  gridCard: {
    flex: 1,
    backgroundColor: '#171613',
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(237, 232, 222, 0.05)',
  },
  gridCardTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8a8f94',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  gridCardValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ede8de',
  },
  gridCardFooter: {
    fontSize: 9,
    color: '#8a8f94',
    marginTop: 4,
  },
  breakdownCard: {
    backgroundColor: '#171613',
    borderRadius: 8,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(237, 232, 222, 0.05)',
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ede8de',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  progressBarWrapper: {
    flexDirection: 'row',
    height: 12,
    backgroundColor: '#242019',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 16,
    width: '100%',
  },
  breakdownList: {
    flexDirection: 'column',
    gap: 12,
  },
  methodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderColor: 'rgba(237, 232, 222, 0.04)',
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  methodName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ede8de',
  },
  methodRight: {
    alignItems: 'flex-end',
  },
  methodAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ede8de',
  },
  methodPct: {
    fontSize: 10,
    color: '#8a8f94',
    fontWeight: '500',
  },
  noDataText: {
    color: '#8a8f94',
    textAlign: 'center',
    marginVertical: 10,
    fontSize: 13,
  }
});
