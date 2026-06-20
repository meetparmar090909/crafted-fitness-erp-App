import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Alert,
  StatusBar
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Login({ correctPin, onLoginSuccess }) {
  const [pin, setPin] = useState('');
  const insets = useSafeAreaInsets();

  const handleKeyPress = (num) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      
      // Auto-validate when 4 digits are entered
      if (newPin.length === 4) {
        if (newPin === correctPin) {
          setTimeout(() => {
            onLoginSuccess();
          }, 150);
        } else {
          setTimeout(() => {
            Alert.alert("Access Denied", "Incorrect passcode. Please try again.");
            setPin('');
          }, 150);
        }
      }
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
  };

  const renderDot = (index) => {
    const isFilled = pin.length > index;
    return (
      <View 
        key={index} 
        style={[styles.dot, isFilled && styles.dotFilled]} 
      />
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>
      <StatusBar barStyle="light-content" backgroundColor="#0b0b0c" />
      
      {/* Brand Header */}
      <View style={styles.header}>
        <Text style={styles.logoMain}>CRAFTED<Text style={styles.logoSpan}>HUB</Text></Text>
        <Text style={styles.subtitle}>Partner Ledger Locked</Text>
      </View>

      {/* PIN Status Display */}
      <View style={styles.pinContainer}>
        <Text style={styles.instruction}>Enter Passcode to Unlock</Text>
        <View style={styles.dotsRow}>
          {[0, 1, 2, 3].map(renderDot)}
        </View>
      </View>

      {/* Numeric Keypad */}
      <View style={styles.keypad}>
        <View style={styles.keyRow}>
          {['1', '2', '3'].map((num) => (
            <TouchableOpacity 
              key={num} 
              style={styles.keyBtn} 
              onPress={() => handleKeyPress(num)}
            >
              <Text style={styles.keyText}>{num}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.keyRow}>
          {['4', '5', '6'].map((num) => (
            <TouchableOpacity 
              key={num} 
              style={styles.keyBtn} 
              onPress={() => handleKeyPress(num)}
            >
              <Text style={styles.keyText}>{num}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.keyRow}>
          {['7', '8', '9'].map((num) => (
            <TouchableOpacity 
              key={num} 
              style={styles.keyBtn} 
              onPress={() => handleKeyPress(num)}
            >
              <Text style={styles.keyText}>{num}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.keyRow}>
          <View style={styles.emptyKey} />
          <TouchableOpacity 
            style={styles.keyBtn} 
            onPress={() => handleKeyPress('0')}
          >
            <Text style={styles.keyText}>0</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.keyBtn} 
            onPress={handleBackspace}
          >
            <Text style={[styles.keyText, styles.backspaceText]}>⌫</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={styles.footerNote}>Protected Area · Partners & Owners Only</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0b0c',
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
  },
  logoMain: {
    fontSize: 28,
    fontWeight: '900',
    color: '#ede8de',
    letterSpacing: 2,
  },
  logoSpan: {
    color: '#e8814a',
  },
  subtitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8a8f94',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 6,
  },
  pinContainer: {
    alignItems: 'center',
  },
  instruction: {
    fontSize: 13,
    color: '#b7bbbe',
    fontWeight: '600',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#171613',
    backgroundColor: 'transparent',
  },
  dotFilled: {
    backgroundColor: '#e8814a',
    borderColor: '#e8814a',
  },
  keypad: {
    paddingHorizontal: 40,
    gap: 16,
  },
  keyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  keyBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#171613',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(237, 232, 222, 0.04)',
  },
  emptyKey: {
    width: 68,
    height: 68,
  },
  keyText: {
    color: '#ede8de',
    fontSize: 24,
    fontWeight: '700',
  },
  backspaceText: {
    color: '#8a8f94',
    fontSize: 20,
  },
  footerNote: {
    textAlign: 'center',
    color: '#8a8f94',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  }
});
