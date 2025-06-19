import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Button, Alert } from 'react-native';
import ProfileHeader from '../components/ProfileHeader';
import SettingsRow from '../components/SettingsRow';
import SectionHeader from '../components/SectionHeader';

const SettingsScreen = () => {
  const [notifications, setNotifications] = useState({
    push: true,
    email: false,
    sms: true,
  });

  const [theme, setTheme] = useState('dark');
  const [security, setSecurity] = useState({
    twoFactor: true,
    faceId: false,
  });

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'OK', onPress: () => console.log('Logged out') },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <ProfileHeader />

      <SectionHeader title="Notifications" />
      <SettingsRow
        icon="notifications-outline"
        title="Push Notifications"
        type="toggle"
        value={notifications.push}
        onValueChange={(value) => setNotifications({ ...notifications, push: value })}
      />
      <SettingsRow
        icon="mail-outline"
        title="Email Notifications"
        type="toggle"
        value={notifications.email}
        onValueChange={(value) => setNotifications({ ...notifications, email: value })}
      />
      <SettingsRow
        icon="chatbubble-outline"
        title="SMS Notifications"
        type="toggle"
        value={notifications.sms}
        onValueChange={(value) => setNotifications({ ...notifications, sms: value })}
      />

      <SectionHeader title="Appearance" />
      <SettingsRow
        icon="color-palette-outline"
        title="Theme"
        type="navigate"
        onPress={() => Alert.alert('Theme', 'Navigate to theme settings')}
      />

      <SectionHeader title="Security" />
      <SettingsRow
        icon="lock-closed-outline"
        title="Two-Factor Authentication"
        type="toggle"
        value={security.twoFactor}
        onValueChange={(value) => setSecurity({ ...security, twoFactor: value })}
      />
       <SettingsRow
        icon="scan-outline"
        title="Face ID / Biometric"
        type="toggle"
        value={security.faceId}
        onValueChange={(value) => setSecurity({ ...security, faceId: value })}
      />
      
      <SectionHeader title="More" />
      <SettingsRow
        icon="document-text-outline"
        title="Data & Privacy"
        type="navigate"
        onPress={() => Alert.alert('Privacy', 'Navigate to privacy policy')}
      />
       <SettingsRow
        icon="help-circle-outline"
        title="Help & Support"
        type="navigate"
        onPress={() => Alert.alert('Support', 'Navigate to support page')}
      />

      <View style={styles.logoutButton}>
        <Button title="Logout" color="#FF3B30" onPress={handleLogout} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  contentContainer: {
    padding: 15,
  },
  logoutButton: {
    marginTop: 30,
    borderRadius: 10,
    overflow: 'hidden',
  }
});

export default SettingsScreen;
