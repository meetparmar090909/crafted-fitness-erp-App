import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ScrollView,
  Alert
} from 'react-native';

export default function History({ payments, onDeletePayment }) {
  const [selectedMethodFilter, setSelectedMethodFilter] = useState('All');

  const filterMethods = ['All', 'GPay', 'PhonePe', 'Paytm', 'Cash', 'Card', 'Bank Transfer'];

  // Apply filters
  const filteredPayments = selectedMethodFilter === 'All' 
    ? payments
    : payments.filter(p => p.payment_method === selectedMethodFilter);

  const handleDeletePress = (item) => {
    Alert.alert(
      "Delete Transaction",
      `Are you sure you want to delete this payment of ₹${item.amount} for ${item.member_name}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await onDeletePayment(item.id);
              Alert.alert("Deleted", "Transaction removed.");
            } catch (err) {
              Alert.alert("Error", err.message || "Failed to delete transaction.");
            }
          }
        }
      ]
    );
  };

  // Render individual transaction row
  const renderTransactionItem = ({ item }) => {
    // Determine badge color based on method
    const getMethodBgColor = (method) => {
      switch (method.toLowerCase()) {
        case 'gpay': return 'rgba(66, 133, 244, 0.12)';
        case 'phonepe': return 'rgba(95, 37, 159, 0.12)';
        case 'paytm': return 'rgba(0, 186, 242, 0.12)';
        case 'cash': return 'rgba(37, 211, 102, 0.12)';
        case 'card': return 'rgba(255, 193, 7, 0.12)';
        case 'bank transfer': return 'rgba(232, 129, 74, 0.12)';
        default: return 'rgba(138, 143, 148, 0.12)';
      }
    };

    const getMethodTextColor = (method) => {
      switch (method.toLowerCase()) {
        case 'gpay': return '#4285F4';
        case 'phonepe': return '#af7bf0';
        case 'paytm': return '#00baf2';
        case 'cash': return '#25D366';
        case 'card': return '#FFC107';
        case 'bank transfer': return '#e8814a';
        default: return '#8a8f94';
      }
    };

    return (
      <View style={styles.txnItem}>
        <View style={styles.txnLeft}>
          <Text style={styles.memberName}>{item.member_name}</Text>
          <Text style={styles.txnMeta}>
            {item.payment_date} · {item.period_months} Month(s)
          </Text>
          {item.notes ? (
            <Text style={styles.txnNotes} numberOfLines={1}>
              "{item.notes}"
            </Text>
          ) : null}
        </View>
        
        <View style={styles.txnRight}>
          <Text style={styles.txnAmount}>+ ₹{item.amount}</Text>
          <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
            <View style={[styles.methodBadge, { backgroundColor: getMethodBgColor(item.payment_method) }]}>
              <Text style={[styles.methodText, { color: getMethodTextColor(item.payment_method) }]}>
                {item.payment_method}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.deleteBtn}
              onPress={() => handleDeletePress(item)}
            >
              <Text style={styles.deleteBtnText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* ============ HEADER ============ */}
      <View style={styles.header}>
        <Text style={styles.titleText}>Transaction History</Text>
        <Text style={styles.subText}>Logs of all membership subscriptions received</Text>
      </View>

      {/* ============ FILTER SCROLLER ============ */}
      <View style={styles.filterWrapper}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          {filterMethods.map(method => {
            const isActive = selectedMethodFilter === method;
            return (
              <TouchableOpacity
                key={method}
                style={[styles.filterBtn, isActive && styles.activeFilterBtn]}
                onPress={() => setSelectedMethodFilter(method)}
              >
                <Text style={[styles.filterText, isActive && styles.activeFilterText]}>
                  {method}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ============ TRANSACTIONS LIST ============ */}
      {filteredPayments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No transactions found for this filter.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredPayments}
          keyExtractor={item => item.id}
          renderItem={renderTransactionItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0b0c',
  },
  header: {
    padding: 18,
    paddingBottom: 8,
  },
  titleText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ede8de',
    textTransform: 'uppercase',
  },
  subText: {
    fontSize: 13,
    color: '#8a8f94',
    marginTop: 2,
  },
  filterWrapper: {
    height: 48,
    marginVertical: 4,
  },
  filterContainer: {
    paddingHorizontal: 18,
    alignItems: 'center',
    gap: 8,
  },
  filterBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: '#171613',
    borderWidth: 1,
    borderColor: 'rgba(237, 232, 222, 0.05)',
  },
  activeFilterBtn: {
    backgroundColor: '#c4602a',
    borderColor: '#c4602a',
  },
  filterText: {
    color: '#8a8f94',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  activeFilterText: {
    color: '#ede8de',
  },
  listContent: {
    padding: 18,
    gap: 12,
    paddingBottom: 30,
  },
  txnItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#171613',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(237, 232, 222, 0.04)',
  },
  txnLeft: {
    flex: 1,
    paddingRight: 10,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ede8de',
  },
  txnMeta: {
    fontSize: 11,
    color: '#8a8f94',
    marginTop: 2,
  },
  txnNotes: {
    fontSize: 11,
    color: '#b7bbbe',
    fontStyle: 'italic',
    marginTop: 4,
  },
  txnRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  txnAmount: {
    fontSize: 15,
    fontWeight: '800',
    color: '#25D366', // Green for incoming revenue
  },
  methodBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  methodText: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  deleteBtn: {
    padding: 6,
    borderRadius: 4,
    backgroundColor: 'rgba(234, 67, 53, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(234, 67, 53, 0.15)',
  },
  deleteBtnText: {
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    color: '#8a8f94',
    fontSize: 13,
    textAlign: 'center',
  }
});
