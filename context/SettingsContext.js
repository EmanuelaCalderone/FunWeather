import { createContext, useState, useCallback, useMemo, useEffect } from "react";
//libreria per salvare i dati in modo persistente
import AsyncStorage from "@react-native-async-storage/async-storage";

//creo contesto
// Imposto un valore di default non nullo per evitare errori al primo rendering
export const SettingsContext = createContext({});

//"it" / "en"
const normalizeLang = (v) =>
    String(v).toLowerCase().startsWith("en") ? "en" : "it";

//il componente che wrappa tutta l'app con i figli da renderizzare dentro
export function SettingsProvider({ children }) {
    //imposto i valori iniziali delle preferenze
    const [language, setLanguage] = useState("it");
    const [unitTemp, setUnitTemp] = useState("celsius");
    const [unitWind, setUnitWind] = useState("kmh");
    const [timeFormat, setTimeFormat] = useState("24h");
    const [isLoaded, setIsLoaded] = useState(false); //nuovo stato per monitorare il caricamento

    //carico le impostazioni salvate all'avvio
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
                } else {
                    // Imposta valori predefiniti se non ci sono impostazioni salvate
                    setLanguage("it");
                }
            } catch (err) {
                console.warn("Errore caricamento impostazioni:", err);
                // Imposta valori predefiniti in caso di errore
                setLanguage("it");
            } finally {
                setIsLoaded(true); // Imposta lo stato a true una volta che il caricamento è completato (o fallito)
            }
        })();
    }, []);

    //salva su AsyncStorage quando cambiano le impostazioni
    useEffect(() => {
        (async () => {
            if (isLoaded) { // Salva solo dopo il caricamento iniziale
                try {
                    const settings = {
                        language: normalizeLang(language),
                        unitTemp,
                        unitWind,
                        timeFormat
                    };
                    await AsyncStorage.setItem("settings", JSON.stringify(settings));
                } catch (err) {
                    console.warn("Errore salvataggio impostazioni:", err);
                }
            }
        })();
    }, [language, unitTemp, unitWind, timeFormat, isLoaded]);


    //logica per i toggle delle preferenze

    //lingua
    const toggleLanguage = useCallback(() => {
        setLanguage((l) => (normalizeLang(l) === "it" ? "en" : "it"));
    }, []);

    //gradi
    const toggleUnitTemp = useCallback(() => {
        setUnitTemp(u => (u === "celsius" ? "fahrenheit" : "celsius"));
    }, []);

    //vento
    const toggleUnitWind = useCallback(() => {
        setUnitWind(u => (u === "kmh" ? "mph" : "kmh"));
    }, []);

    //formato orario
    const toggleTimeFormat = useCallback(() => {
        setTimeFormat(f => (f === "24h" ? "12h" : "24h"));
    }, []);

    //oggetto con i dati e le funzioni da condividere nel contesto; viene ricreato solo quando cambiano le deps
    const value = useMemo(
        () => ({
            language: normalizeLang(language),
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

    //condivide value a tutti i suoi children
    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
}