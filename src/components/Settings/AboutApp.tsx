import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';

export default function AboutApp() {
    const appVersion = Constants.expoConfig?.version || 'N/A';
    const { colors } = useTheme();

    const handleOpenPrivacyPolicy = async () => {
        const policyUrl = 'https://karolpietrow.github.io/morium-schedule-planner/privacy.html';

        await WebBrowser.openBrowserAsync(policyUrl, {
            presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
            toolbarColor: colors.card,
            controlsColor: '#4F46E5',
        });
    };

    return (
        <ScrollView
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.header}>
                <Image
                    source={require('@/assets/images/icon.png')}
                    style={styles.logo}
                    resizeMode="cover"
                />
                <Text style={[styles.appName, { color: colors.text }]}>Morium</Text>
                <Text style={[styles.version, { color: colors.text }]}>Wersja {appVersion}</Text>
            </View>

            <Text style={[styles.subtitle, { color: colors.text }]}>
                Nieoficjalna aplikacja mobilna dla systemu UMCS&nbsp;Moria
            </Text>

            <View style={{ flex: 1, minHeight: 40 }} />

            <TouchableOpacity
                style={[
                    styles.button,
                    {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                    }
                ]}
                onPress={handleOpenPrivacyPolicy}
            >
                <Text style={[styles.buttonText, { color: colors.text }]}>
                    Polityka prywatności
                </Text>
            </TouchableOpacity>

            <View style={styles.disclaimerContainer}>
                <Text style={[styles.disclaimerText, { color: colors.text, marginBottom: 8 }]}>
                    Aplikacja jest niezależnym, nieoficjalnym projektem i nie jest w żaden sposób powiązana z systemem Moria, ani z Uniwersytetem Marii Curie-Skłodowskiej w Lublinie (UMCS).
                </Text>
                <Text style={[styles.disclaimerText, { color: colors.text }]}>
                    Aplikacja wykorzystuje publiczne, ogólnodostępne API Moria. Aplikacja nie zbiera, nie przetwarza, nie przechowuje ani nie udostępnia żadnych danych osobowych na zewnętrznych serwerach.
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 24,
    },
    logo: {
        width: 100,
        height: 100,
        borderRadius: 24,
        marginBottom: 16,
    },
    appName: {
        fontSize: 28,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    version: {
        fontSize: 14,
        opacity: 0.5,
        marginTop: 4,
        fontWeight: '500',
    },
    subtitle: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        lineHeight: 24,
        opacity: 0.8,
        paddingHorizontal: 10,
    },
    button: {
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 1,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
        opacity: 0.9,
    },
    disclaimerContainer: {
        alignItems: 'center',
        paddingHorizontal: 10,
        marginBottom: 10,
    },
    disclaimerText: {
        fontSize: 12,
        textAlign: 'center',
        opacity: 0.4,
        lineHeight: 18,
    },
});