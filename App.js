import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  StatusBar, 
  TouchableOpacity, 
  ActivityIndicator,
  Platform
} from 'react-native';
import { SafeAreaView, SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { dbService, getDatabaseMode } from './lib/supabase';
import Dashboard from './components/Dashboard';
import AddPayment from './components/AddPayment';
import Members from './components/Members';
import History from './components/History';
import Login from './components/Login';
import SettingsModal from './components/SettingsModal';

const TAB_ICONS = {
  dashboard: '📊',
  add:       '➕',
  members:   '👥',
  history:   '🧾',
};

const PIN_KEY = '@crafted_ledger_pin';
const PIN_REQUIRED_KEY = '@crafted_ledger_pin_required';

function MainApp({ correctPin, pinRequired, onUpdatePin, onTogglePinRequired, onLogout, dbMode }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [members, setMembers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const fetchedMembers = await dbService.getMembers();
      const fetchedPayments = await dbService.getPayments();
      setMembers(fetchedMembers);
      setPayments(fetchedPayments);
    } catch (e) {
      console.error('Failed to load data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPayment = async (memberId, amount, paymentMethod, periodMonths, notes) => {
    const newPayment = await dbService.addPayment(memberId, amount, paymentMethod, periodMonths, notes);
    setPayments(prev => [newPayment, ...prev]);
  };

  const handleDeletePayment = async (paymentId) => {
    await dbService.deletePayment(paymentId);
    setPayments(prev => prev.filter(p => p.id !== paymentId));
  };

  const handleAddMember = async (name, phone, email, status) => {
    const newMember = await dbService.addMember(name, phone, email, status);
    setMembers(prev => [...prev, newMember]);
  };

  const handleUpdateMember = async (id, name, phone, email, status) => {
    const updatedMember = await dbService.updateMember(id, name, phone, email, status);
    setMembers(prev => prev.map(m => m.id === id ? updatedMember : m));
    setPayments(prev => prev.map(p => p.member_id === id ? { ...p, member_name: name } : p));
    return updatedMember;
  };

  const handleDeleteMember = async (memberId) => {
    await dbService.deleteMember(memberId);
    setMembers(prev => prev.filter(m => m.id !== memberId));
    setPayments(prev => prev.filter(p => p.member_id !== memberId));
  };

  const tabs = [
    { key: 'dashboard', label: 'Overview' },
    { key: 'add',       label: 'Log Pay'  },
    { key: 'members',   label: 'Members'  },
    { key: 'history',   label: 'History'  },
  ];

  const getStatusColor = () => {
    if (dbMode === 'Supabase Live') return '#25D366';
    if (dbMode === 'SQLite Local') return '#38bdf8';
    return '#FFC107';
  };

  const renderView = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#c4602a" />
          <Text style={styles.loadingText}>Synchronizing Ledger...</Text>
        </View>
      );
    }
    switch (activeTab) {
      case 'dashboard': return <Dashboard payments={payments} members={members} />;
      case 'add':       return <AddPayment members={members} onAddPayment={handleAddPayment} />;
      case 'members':   return (
        <Members 
          members={members} 
          payments={payments} 
          onAddMember={handleAddMember} 
          onUpdateMember={handleUpdateMember}
          onDeleteMember={handleDeleteMember}
          onDeletePayment={handleDeletePayment}
        />
      );
      case 'history':   return <History payments={payments} onDeletePayment={handleDeletePayment} />;
      default:          return <Dashboard payments={payments} members={members} />;
    }
  };

  // Bottom nav bar height — respects Android gesture nav bar
  const navBarHeight = 56 + insets.bottom;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="#0b0b0c" translucent={false} />

      {/* ====== HEADER ====== */}
      <View style={styles.header}>
        <View>
          <Text style={styles.logoMain}>CRAFTED<Text style={styles.logoSpan}>HUB</Text></Text>
          <Text style={styles.headerPartner}>Partner Ledger</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.dbStatus}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
            <Text style={styles.dbStatusText}>{dbMode}</Text>
          </View>
          <TouchableOpacity 
            style={styles.settingsBtn}
            onPress={() => setShowSettings(true)}
          >
            <Text style={styles.settingsBtnText}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ====== VIEW PORT — leaves room for nav bar ====== */}
      <View style={[styles.viewPort, { paddingBottom: navBarHeight }]}>
        {renderView()}
      </View>

      {/* ====== BOTTOM NAV BAR ====== */}
      <View style={[styles.navBar, { height: navBarHeight, paddingBottom: insets.bottom }]}>
        {tabs.map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.navItem}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.7}
            >
              <Text style={styles.navIcon}>{TAB_ICONS[tab.key]}</Text>
              <Text style={[styles.navText, isActive && styles.activeNavText]}>
                {tab.label}
              </Text>
              {isActive && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ====== SETTINGS OVERLAY ====== */}
      <SettingsModal
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        currentPin={correctPin}
        onUpdatePin={onUpdatePin}
        isPinRequired={pinRequired}
        onTogglePinRequired={onTogglePinRequired}
        onLogout={onLogout}
      />
    </View>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [pinRequired, setPinRequired] = useState(true);
  const [correctPin, setCorrectPin] = useState('1234');
  const dbMode = getDatabaseMode();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedPin = await AsyncStorage.getItem(PIN_KEY);
      const savedPinRequired = await AsyncStorage.getItem(PIN_REQUIRED_KEY);
      if (savedPin !== null) setCorrectPin(savedPin);
      if (savedPinRequired !== null) {
        const required = savedPinRequired === 'true';
        setPinRequired(required);
        if (!required) setIsLoggedIn(true);
      }
    } catch (e) {
      console.error('Failed to load settings:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePin = async (newPin) => {
    try {
      await AsyncStorage.setItem(PIN_KEY, newPin);
      setCorrectPin(newPin);
    } catch (e) { console.error('Failed to save PIN:', e); }
  };

  const handleTogglePinRequired = async (required) => {
    try {
      await AsyncStorage.setItem(PIN_REQUIRED_KEY, required ? 'true' : 'false');
      setPinRequired(required);
      if (!required) setIsLoggedIn(true);
    } catch (e) { console.error('Failed to save PIN required:', e); }
  };

  const handleLogout = () => setIsLoggedIn(false);

  if (isLoading) {
    return (
      <SafeAreaProvider>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#c4602a" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  if (pinRequired && !isLoggedIn) {
    return (
      <SafeAreaProvider>
        <Login correctPin={correctPin} onLoginSuccess={() => setIsLoggedIn(true)} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <MainApp
        correctPin={correctPin}
        pinRequired={pinRequired}
        onUpdatePin={handleUpdatePin}
        onTogglePinRequired={handleTogglePinRequired}
        onLogout={handleLogout}
        dbMode={dbMode}
      />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0b0c',
  },
  header: {
    height: 60,
    backgroundColor: '#171613',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderColor: 'rgba(237, 232, 222, 0.08)',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoMain: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ede8de',
    letterSpacing: 1,
  },
  logoSpan: {
    color: '#e8814a',
  },
  headerPartner: {
    fontSize: 9,
    fontWeight: '700',
    color: '#8a8f94',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: -2,
  },
  dbStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1f1d19',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(237, 232, 222, 0.04)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dbStatusText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#ede8de',
    textTransform: 'uppercase',
  },
  settingsBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#1f1d19',
    borderWidth: 1,
    borderColor: 'rgba(237, 232, 222, 0.04)',
  },
  settingsBtnText: {
    fontSize: 14,
  },
  viewPort: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#0b0b0c',
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8a8f94',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  navBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#171613',
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: 'rgba(237, 232, 222, 0.08)',
    paddingTop: 6,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 4,
  },
  navIcon: {
    fontSize: 20,
  },
  navText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8a8f94',
    marginTop: 2,
  },
  activeNavText: {
    color: '#e8814a',
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    width: 20,
    height: 2,
    backgroundColor: '#e8814a',
    borderRadius: 1,
  },
});
