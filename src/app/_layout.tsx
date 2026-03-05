import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useColorScheme } from 'react-native';
import React from "react";
import { NativeTabs } from "expo-router/unstable-native-tabs";


export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <NativeTabs>
        <NativeTabs.Trigger name="index">
          <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
              src={require('@/assets/images/tabIcons/home.png')}
              renderingMode="template"
          />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="settings">
          <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
              src={require('@/assets/images/tabIcons/explore.png')}
              renderingMode="template"
          />
        </NativeTabs.Trigger>
      </NativeTabs>
    </ThemeProvider>
  )
}
