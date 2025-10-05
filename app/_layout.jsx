import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar, Platform, Dimensions } from "react-native";
import { SettingsProvider } from "../context/SettingsContext";
import { Slot } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { useEffect } from "react";

export default function RootLayout() {
    //gestisco l'orientamento dinamicamente su tablet e fisso su smartphone
    useEffect(() => {
        //verifico se il dispositivo è un tablet
        const isTablet = () => {
            const { width, height } = Dimensions.get("window");
            return Math.min(width, height) >= 600;
        };

        //imposto l'orientamento corretto
        const setOrientation = async () => {
            if (Platform.OS === "ios" || Platform.OS === "android") {
                if (isTablet()) {
                    //sblocco tutte le rotazioni su tablet
                    await ScreenOrientation.unlockAsync();
                } else {
                    //blocco in verticale su smartphone
                    await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
                }
            }
        };

        //eseguo la funzione all'avvio
        setOrientation();

        //aggiungo listener per reagire a cambi dimensioni (rotazione tablet)
        const subscription = Dimensions.addEventListener("change", () => {
            setOrientation();
        });

        //rimuovo listener al cleanup
        return () => {
            if (subscription?.remove) subscription.remove();
            else Dimensions.removeEventListener("change", setOrientation); // fallback vecchie versioni RN
        };
    }, []);

    return (
        //avvolgo app in SafeAreaProvider
        <SafeAreaProvider>
            {/*avvolgo app in SettingsProvider per lingua, unità e formati*/}
            <SettingsProvider>
                {/*configuro status bar trasparente e testo chiaro*/}
                <StatusBar
                    translucent
                    backgroundColor="transparent"
                    barStyle="light-content"
                />
                {/*mostro schermata corrente gestita da expo-router*/}
                <Slot />
            </SettingsProvider>
        </SafeAreaProvider>
    );
}
