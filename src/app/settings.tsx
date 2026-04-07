import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from "react-native-safe-area-context";

import MyClasses from '@/components/Settings/MyClasses';
import AddClasses from '@/components/Settings/AddClasses';
import AboutApp from '@/components/Settings/AboutApp';

type TabType = 'my_classes' | 'add_classes' | 'about';

export default function ManageScreen() {
    const { colors } = useTheme();
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<TabType>('add_classes');

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>

            <View style={[styles.tabsContainer, { borderBottomColor: colors.border }]}>

                <TouchableOpacity
                    style={[
                        styles.tab,
                        activeTab === 'my_classes'
                            ? { backgroundColor: colors.card, borderColor: colors.border, shadowOpacity: 0.1 }
                            : { borderColor: 'transparent', shadowOpacity: 0 }
                    ]}
                    onPress={() => setActiveTab('my_classes')}
                >
                    <Ionicons
                        name={activeTab === 'my_classes' ? "bookmark" : "bookmark-outline"}
                        size={22}
                        color={activeTab === 'my_classes' ? '#4F46E5' : colors.text}
                        style={{ opacity: activeTab === 'my_classes' ? 1 : 0.5, marginBottom: 6 }}
                    />
                    <Text style={[styles.tabText, { color: activeTab === 'my_classes' ? '#4F46E5' : colors.text, opacity: activeTab === 'my_classes' ? 1 : 0.5 }]}>
                        Moje zajęcia
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.tab,
                        activeTab === 'add_classes'
                            ? { backgroundColor: colors.card, borderColor: colors.border, shadowOpacity: 0.1 }
                            : { borderColor: 'transparent', shadowOpacity: 0 }
                    ]}
                    onPress={() => setActiveTab('add_classes')}
                >
                    <Ionicons
                        name={activeTab === 'add_classes' ? "add-circle" : "add-circle-outline"}
                        size={22}
                        color={activeTab === 'add_classes' ? '#4F46E5' : colors.text}
                        style={{ opacity: activeTab === 'add_classes' ? 1 : 0.5, marginBottom: 6 }}
                    />
                    <Text style={[styles.tabText, { color: activeTab === 'add_classes' ? '#4F46E5' : colors.text, opacity: activeTab === 'add_classes' ? 1 : 0.5 }]}>
                        Dodaj zajęcia
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.tab,
                        activeTab === 'about'
                            ? { backgroundColor: colors.card, borderColor: colors.border, shadowOpacity: 0.1 }
                            : { borderColor: 'transparent', shadowOpacity: 0 }
                    ]}
                    onPress={() => setActiveTab('about')}
                >
                    <Ionicons
                        name={activeTab === 'about' ? "information-circle" : "information-circle-outline"}
                        size={22}
                        color={activeTab === 'about' ? '#4F46E5' : colors.text}
                        style={{ opacity: activeTab === 'about' ? 1 : 0.5, marginBottom: 6 }}
                    />
                    <Text style={[styles.tabText, { color: activeTab === 'about' ? '#4F46E5' : colors.text, opacity: activeTab === 'about' ? 1 : 0.5 }]}>
                        O aplikacji
                    </Text>
                </TouchableOpacity>

            </View>

            <View style={styles.content}>
                {activeTab === 'my_classes' && <MyClasses />}
                {activeTab === 'add_classes' && <AddClasses />}
                {activeTab === 'about' && <AboutApp />}
            </View>

            <View style={[styles.bottomBar, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
                <TouchableOpacity
                    style={styles.doneButton}
                    onPress={() => router.back()}
                >
                    <Text style={styles.doneButtonText}>Gotowe</Text>
                    <Ionicons name="checkmark" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
                </TouchableOpacity>
            </View>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    tabsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderBottomWidth: 1,
        gap: 8,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
    },
    tabText: {
        fontSize: 12,
        fontWeight: '600'
    },
    content: {
        flex: 1
    },
    bottomBar: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: Platform.OS === 'ios' ? 8 : 20,
        borderTopWidth: 1,
    },
    doneButton: {
        flexDirection: 'row',
        backgroundColor: '#4F46E5',
        borderRadius: 14,
        paddingVertical: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    doneButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    }
});