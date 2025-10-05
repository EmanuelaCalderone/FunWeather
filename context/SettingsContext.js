import { createContext, useState, useEffect, useCallback, useMemo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

//creo contesto
export const SettingsContext = createContext({});

//normalizzo lingua
const normalizeLang = (v) => {
    return String(v).toLowerCase().startsWith("en") ? "en" : "it";
};

export function SettingsProvider({ children }) {
    const [language, setLanguage] = useState("it");
    const [unitTemp, setUnitTemp] = useState("celsius");
    const [unitWind, setUnitWind] = useState("kmh");
    const [timeFormat, setTimeFormat] = useState("24h");
    const [isLoaded, setIsLoaded] = useState(false);

    //carico le impostazioni salvate
    useEffect(() => {
        (async () => {
            try {
                const saved = await AsyncStorage.getItem("settings");
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (parsed.language) setLanguage(normalizeLang(parsed.language));
                    if (parsed.unitTemp) setUnitTemp(parsed.unitTemp);
                    if (parsed.unitWind) setUnitWind(parsed.unitWind);
                    if (parsed.timeFormat) setTimeFormat(parsed.timeFormat);
                }
            } catch (err) {
                console.warn("Errore caricamento impostazioni:", err);
            } finally {
                setIsLoaded(true);
            }
        })();
    }, []);

    //salvo le impostazioni quando cambiano
    useEffect(() => {
        (async () => {
            if (isLoaded) {
                try {
                    const settings = {
                        language: normalizeLang(language),
                        unitTemp,
                        unitWind,
                        timeFormat,
                    };
                    await AsyncStorage.setItem("settings", JSON.stringify(settings));
                } catch (err) {
                    console.warn("Errore salvataggio impostazioni:", err);
                }
            }
        })();
    }, [language, unitTemp, unitWind, timeFormat, isLoaded]);

    // Toggle functions
    const toggleLanguage = useCallback(() => {
        setLanguage((l) => (normalizeLang(l) === "it" ? "en" : "it"));
    }, []);

    const toggleUnitTemp = useCallback(() => {
        setUnitTemp((u) => (u === "celsius" ? "fahrenheit" : "celsius"));
    }, []);

    const toggleUnitWind = useCallback(() => {
        setUnitWind((u) => (u === "kmh" ? "mph" : "kmh"));
    }, []);

    const toggleTimeFormat = useCallback(() => {
        setTimeFormat((f) => (f === "24h" ? "12h" : "24h"));
    }, []);

    const value = useMemo(
        () => ({
            language,
            unitTemp,
            unitWind,
            timeFormat,
            isLoaded,
            setLanguage,
            setUnitTemp,
            setUnitWind,
            setTimeFormat,
            toggleLanguage,
            toggleUnitTemp,
            toggleUnitWind,
            toggleTimeFormat,
        }),
        [language, unitTemp, unitWind, timeFormat, isLoaded]
    );

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
}
