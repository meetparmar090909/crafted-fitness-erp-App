import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  FlatList,
  ActivityIndicator, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Modal,
  Dimensions
} from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function AddPayment({ members, onAddPayment }) {
  const [memberSearch, setMemberSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('GPay');
  const [period, setPeriod] = useState('1');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMemberPicker, setShowMemberPicker] = useState(false);

  // Filter members based on search inside the picker modal
  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
    m.phone.includes(memberSearch)
  );

  const handleSelectMember = (member) => {
    setSelectedMember(member);
    setMemberSearch('');
    setShowMemberPicker(false);
  };

  const handleClearMember = () => {
    setSelectedMember(null);
    setMemberSearch('');
  };

  const handleSubmit = async () => {
    if (!selectedMember) {
      Alert.alert('Required', 'Please select a gym member.');
      return;
    }
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Alert.alert('Required', 'Please enter a valid payment amount.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddPayment(
        selectedMember.id,
        parseFloat(amount),
        method,
        parseInt(period, 10),
        notes
      );
      Alert.alert('Success', `Payment of ₹${amount} logged successfully!`);
      setSelectedMember(null);
      setAmount('');
      setNotes('');
      setPeriod('1');
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to log transaction.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const paymentMethods = ['GPay', 'PhonePe', 'Paytm', 'Cash', 'Card', 'Bank Transfer'];
  const periods = [
    { label: '1 Month', value: '1' },
    { label: '3 Months', value: '3' },
    { label: '6 Months', value: '6' },
    { label: '12 Months', value: '12' },
  ];

  return (
    <>
      {/* ===== MEMBER PICKER MODAL ===== */}
      <Modal
        visible={showMemberPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowMemberPicker(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowMemberPicker(false)}>
          <View style={styles.pickerOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.pickerSheet}>
                <View style={styles.pickerHeader}>
                  <Text style={styles.pickerTitle}>Select Member</Text>
                  <TouchableOpacity onPress={() => setShowMemberPicker(false)}>
                    <Text style={styles.pickerClose}>✕ Close</Text>
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={styles.pickerSearch}
                  placeholder="Search name or phone..."
                  placeholderTextColor="#8a8f94"
                  value={memberSearch}
                  onChangeText={setMemberSearch}
                  autoFocus={true}
                  returnKeyType="search"
                />
                {filteredMembers.length === 0 ? (
                  <Text style={styles.noResultText}>No members found</Text>
                ) : (
                  <FlatList
                    data={filteredMembers}
                    keyExtractor={item => item.id}
                    keyboardShouldPersistTaps="handled"
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.pickerItem}
                        onPress={() => handleSelectMember(item)}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={styles.pickerItemName}>{item.name}</Text>
                          <Text style={styles.pickerItemPhone}>{item.phone}</Text>
                        </View>
                        <View style={[
                          styles.pickerItemBadge,
                          item.status === 'Active' ? styles.activeBadge : styles.inactiveBadge
                        ]}>
                          <Text style={[
                            styles.pickerItemBadgeText,
                            item.status === 'Active' ? styles.activeText : styles.inactiveText
                          ]}>{item.status}</Text>
                        </View>
                      </TouchableOpacity>
                    )}
                  />
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* ===== MAIN FORM ===== */}
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.headerText}>Log Payment</Text>
            <Text style={styles.subText}>Record cash or digital payments to keep ledger updated</Text>

            {/* ===== SELECT MEMBER FIELD ===== */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Select Gym Member</Text>
              {selectedMember ? (
                <View style={styles.selectedMemberBox}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.selectedMemberName}>{selectedMember.name}</Text>
                    <Text style={styles.selectedMemberPhone}>{selectedMember.phone}</Text>
                  </View>
                  <TouchableOpacity style={styles.changeMemberBtn} onPress={handleClearMember}>
                    <Text style={styles.changeMemberText}>Change</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.memberPickerBtn}
                  onPress={() => setShowMemberPicker(true)}
                >
                  <Text style={styles.memberPickerBtnText}>👤 Tap to select member...</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* ===== AMOUNT FIELD ===== */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Amount Paid (₹)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 1799"
                placeholderTextColor="#8a8f94"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
                returnKeyType="done"
              />
            </View>

            {/* ===== PAYMENT METHOD ===== */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Payment Method</Text>
              <View style={styles.badgeRow}>
                {paymentMethods.map(item => {
                  const isActive = method === item;
                  return (
                    <TouchableOpacity
                      key={item}
                      style={[styles.badgeBtn, isActive && styles.activeBadgeBtn]}
                      onPress={() => setMethod(item)}
                    >
                      <Text style={[styles.badgeText, isActive && styles.activeBadgeText]}>
                        {item}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* ===== MEMBERSHIP PERIOD ===== */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Membership Period</Text>
              <View style={styles.periodRow}>
                {periods.map(item => {
                  const isActive = period === item.value;
                  return (
                    <TouchableOpacity
                      key={item.value}
                      style={[styles.periodBtn, isActive && styles.activePeriodBtn]}
                      onPress={() => setPeriod(item.value)}
                    >
                      <Text style={[styles.periodText, isActive && styles.activePeriodText]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* ===== NOTES FIELD ===== */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Notes (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="e.g. Monthly renewal + diet chart"
                placeholderTextColor="#8a8f94"
                multiline
                numberOfLines={3}
                value={notes}
                onChangeText={setNotes}
                textAlignVertical="top"
              />
            </View>

            {/* ===== SUBMIT ===== */}
            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#ede8de" />
              ) : (
                <Text style={styles.submitButtonText}>Log Transaction</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: '#0b0b0c',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 18,
    paddingBottom: 40,
  },
  headerText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ede8de',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  subText: {
    fontSize: 13,
    color: '#8a8f94',
    marginBottom: 24,
    marginTop: 4,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#b7bbbe',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },

  // Member selector
  memberPickerBtn: {
    backgroundColor: '#171613',
    borderWidth: 1,
    borderColor: 'rgba(237, 232, 222, 0.08)',
    borderRadius: 8,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberPickerBtnText: {
    color: '#8a8f94',
    fontSize: 14,
  },
  selectedMemberBox: {
    backgroundColor: '#1f1d19',
    borderWidth: 1,
    borderColor: '#c4602a',
    borderRadius: 8,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedMemberName: {
    color: '#ede8de',
    fontWeight: '700',
    fontSize: 15,
  },
  selectedMemberPhone: {
    color: '#8a8f94',
    fontSize: 12,
    marginTop: 2,
  },
  changeMemberBtn: {
    backgroundColor: 'rgba(196, 96, 42, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(196, 96, 42, 0.4)',
  },
  changeMemberText: {
    color: '#e8814a',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },

  // Text Input
  input: {
    backgroundColor: '#171613',
    borderWidth: 1,
    borderColor: 'rgba(237, 232, 222, 0.08)',
    borderRadius: 8,
    padding: 13,
    color: '#ede8de',
    fontSize: 14,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },

  // Payment method badges
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badgeBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 6,
    backgroundColor: '#171613',
    borderWidth: 1,
    borderColor: 'rgba(237, 232, 222, 0.05)',
  },
  activeBadgeBtn: {
    backgroundColor: '#c4602a',
    borderColor: '#c4602a',
  },
  badgeText: {
    color: '#8a8f94',
    fontSize: 12,
    fontWeight: '600',
  },
  activeBadgeText: {
    color: '#ede8de',
  },

  // Period buttons
  periodRow: {
    flexDirection: 'row',
    gap: 8,
  },
  periodBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    backgroundColor: '#171613',
    borderWidth: 1,
    borderColor: 'rgba(237, 232, 222, 0.05)',
    alignItems: 'center',
  },
  activePeriodBtn: {
    backgroundColor: '#1f1d19',
    borderColor: '#e8814a',
  },
  periodText: {
    color: '#8a8f94',
    fontSize: 12,
    fontWeight: '700',
  },
  activePeriodText: {
    color: '#e8814a',
  },

  // Submit
  submitButton: {
    backgroundColor: '#c4602a',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#ede8de',
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Member Picker Modal
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  pickerSheet: {
    backgroundColor: '#1f1d19',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: SCREEN_HEIGHT * 0.75,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderColor: 'rgba(237, 232, 222, 0.08)',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: 'rgba(237, 232, 222, 0.06)',
  },
  pickerTitle: {
    color: '#ede8de',
    fontWeight: '800',
    fontSize: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pickerClose: {
    color: '#8a8f94',
    fontSize: 13,
    fontWeight: '600',
  },
  pickerSearch: {
    margin: 14,
    backgroundColor: '#171613',
    borderWidth: 1,
    borderColor: 'rgba(237, 232, 222, 0.1)',
    borderRadius: 8,
    padding: 12,
    color: '#ede8de',
    fontSize: 14,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderColor: 'rgba(237, 232, 222, 0.04)',
    marginHorizontal: 14,
    borderRadius: 6,
    marginBottom: 2,
  },
  pickerItemName: {
    color: '#ede8de',
    fontWeight: '700',
    fontSize: 14,
  },
  pickerItemPhone: {
    color: '#8a8f94',
    fontSize: 11,
    marginTop: 2,
  },
  pickerItemBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  activeBadge: {
    backgroundColor: 'rgba(37, 211, 102, 0.12)',
  },
  inactiveBadge: {
    backgroundColor: 'rgba(255, 193, 7, 0.12)',
  },
  pickerItemBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  activeText: {
    color: '#25D366',
  },
  inactiveText: {
    color: '#FFC107',
  },
  noResultText: {
    color: '#8a8f94',
    textAlign: 'center',
    padding: 20,
    fontSize: 13,
  },
});
