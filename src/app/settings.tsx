import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";

export default function ManageScreen() {
  const [activeTab, setActiveTab] = useState<'my_classes' | 'search'>('my_classes');

  return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Zarządzaj planem</Text>
        </View>

        <View style={styles.tabsContainer}>
          <TouchableOpacity
              style={[styles.tab, activeTab === 'my_classes' && styles.activeTab]}
              onPress={() => setActiveTab('my_classes')}
          >
            <Text style={[styles.tabText, activeTab === 'my_classes' && styles.activeTabText]}>
              Moje zajęcia
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
              style={[styles.tab, activeTab === 'search' && styles.activeTab]}
              onPress={() => setActiveTab('search')}
          >
            <Text style={[styles.tabText, activeTab === 'search' && styles.activeTabText]}>
              Dodaj nowe
            </Text>
          </TouchableOpacity>
        </View>

        {/* Zawartość zależna od wybranej zakładki */}
        <View style={styles.content}>
          {activeTab === 'my_classes' ? (
              <View style={styles.placeholder}>
                <Text style={styles.placeholderText}>Tutaj pojawi się lista zapisanych zajęć z opcją usuwania.</Text>
              </View>
          ) : (
              <View style={styles.searchSection}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Wyszukaj kierunek..."
                />
                <View style={styles.placeholder}>
                  <Text style={styles.placeholderText}>Tutaj pojawi się lista kierunków, a po kliknięciu - lista przedmiotów do dodania.</Text>
                </View>
              </View>
          )}
        </View>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  tabsContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#EEF2FF', // Delikatne tło dla aktywnej zakładki
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  activeTabText: {
    color: '#4F46E5', // Główny kolor aplikacji
  },
  content: {
    flex: 1,
  },
  searchSection: {
    flex: 1,
  },
  searchInput: {
    margin: 16,
    height: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    color: '#0F172A',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  placeholderText: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 14,
  }
});