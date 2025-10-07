import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "react-native";
import { SettingsProvider } from "../context/SettingsContext";
import { Slot } from "expo-router";


export default function RootLayout() {
    return (
        <SafeAreaProvider>
            <SettingsProvider>
                <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
                <Slot />
            </SettingsProvider>
        </SafeAreaProvider>
    );
}
