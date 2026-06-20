import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  Switch,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';

export default function SettingsModal({ 
  visible, 
  onClose, 
  currentPin, 
  onUpdatePin, 
  isPinRequired, 
  onTogglePinRequired,
  onLogout 
}) {
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [oldPinInput, setOldPinInput] = useState('');

  const handleChangePin = () => {
    if (!oldPinInput || !newPin || !confirmPin) {
      Alert.alert("Missing Fields", "Please complete all fields to change the PIN.");
      return;
    }
    if (oldPinInput !== currentPin) {
      Alert.alert("Invalid Action", "Old passcode is incorrect.");
      return;
    }
    if (newPin.length !== 4 || isNaN(newPin)) {
      Alert.alert("Invalid PIN", "New passcode must be exactly 4 digits.");
      return;
    }
    if (newPin !== confirmPin) {
      Alert.alert("Mismatch", "New passcode confirmation does not match.");
      return;
    }

    onUpdatePin(newPin);
    Alert.alert("Success", "Passcode updated successfully!");
    setOldPinInput('');
    setNewPin('');
    setConfirmPin('');
    Keyboard.dismiss();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      {/* Dismiss keyboard when tapping the dark overlay */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          {/* KeyboardAvoidingView pushes the sheet up when keyboard appears */}
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          >
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.content}>

                {/* Header */}
                <View style={styles.header}>
                  <Text style={styles.title}>Ledger Settings</Text>
                  <TouchableOpacity onPress={() => { Keyboard.dismiss(); onClose(); }} style={styles.closeBtn}>
                    <Text style={styles.closeBtnText}>Done</Text>
                  </TouchableOpacity>
                </View>

                {/* Scrollable body so everything is reachable above keyboard */}
                <ScrollView
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                  bounces={false}
                >
                  {/* PIN Lock Toggle */}
                  <View style={styles.optionRow}>
                    <View style={styles.optionMeta}>
                      <Text style={styles.optionLabel}>Passcode Protection</Text>
                      <Text style={styles.optionSub}>Require 4-digit PIN on app launch</Text>
                    </View>
                    <Switch
                      trackColor={{ false: '#171613', true: 'rgba(232, 129, 74, 0.4)' }}
                      thumbColor={isPinRequired ? '#e8814a' : '#8a8f94'}
                      value={isPinRequired}
                      onValueChange={onTogglePinRequired}
                    />
                  </View>

                  {/* Change PIN Form */}
                  {isPinRequired && (
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Change Passcode</Text>

                      <TextInput
                        style={styles.input}
                        placeholder="Old 4-Digit Passcode"
                        placeholderTextColor="#8a8f94"
                        keyboardType="number-pad"
                        secureTextEntry
                        maxLength={4}
                        value={oldPinInput}
                        onChangeText={setOldPinInput}
                        returnKeyType="next"
                      />

                      <TextInput
                        style={styles.input}
                        placeholder="New 4-Digit Passcode"
                        placeholderTextColor="#8a8f94"
                        keyboardType="number-pad"
                        secureTextEntry
                        maxLength={4}
                        value={newPin}
                        onChangeText={setNewPin}
                        returnKeyType="next"
                      />

                      <TextInput
                        style={styles.input}
                        placeholder="Confirm New Passcode"
                        placeholderTextColor="#8a8f94"
                        keyboardType="number-pad"
                        secureTextEntry
                        maxLength={4}
                        value={confirmPin}
                        onChangeText={setConfirmPin}
                        returnKeyType="done"
                        onSubmitEditing={handleChangePin}
                      />

                      <TouchableOpacity style={styles.updateBtn} onPress={handleChangePin}>
                        <Text style={styles.updateBtnText}>Update Passcode</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Logout button */}
                  <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
                    <Text style={styles.logoutText}>Lock App Session</Text>
                  </TouchableOpacity>

                  {/* Extra bottom padding so content clears keyboard */}
                  <View style={{ height: 20 }} />
                </ScrollView>

              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: '#1f1d19',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    borderTopWidth: 1,
    borderColor: 'rgba(237, 232, 222, 0.08)',
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderColor: 'rgba(237, 232, 222, 0.05)',
    paddingBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ede8de',
    textTransform: 'uppercase',
  },
  closeBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  closeBtnText: {
    color: '#e8814a',
    fontWeight: '700',
    fontSize: 13,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#171613',
    padding: 14,
    borderRadius: 8,
    marginBottom: 20,
  },
  optionMeta: {
    flex: 1,
    paddingRight: 10,
  },
  optionLabel: {
    color: '#ede8de',
    fontSize: 14,
    fontWeight: '700',
  },
  optionSub: {
    color: '#8a8f94',
    fontSize: 11,
    marginTop: 2,
  },
  section: {
    marginBottom: 20,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#8a8f94',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  input: {
    height: 46,
    backgroundColor: '#171613',
    borderWidth: 1,
    borderColor: 'rgba(237, 232, 222, 0.08)',
    borderRadius: 6,
    paddingHorizontal: 12,
    color: '#ede8de',
    fontSize: 16,
  },
  updateBtn: {
    backgroundColor: '#171613',
    padding: 13,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(232, 129, 74, 0.3)',
    marginTop: 4,
  },
  updateBtnText: {
    color: '#e8814a',
    fontWeight: '800',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  logoutBtn: {
    backgroundColor: '#ea4335',
    padding: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  logoutText: {
    color: '#ede8de',
    fontWeight: '800',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  }
});
