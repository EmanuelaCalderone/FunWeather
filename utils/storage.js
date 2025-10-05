import AsyncStorage from '@react-native-async-storage/async-storage';

//funzione asincrona per salvare i dati meteo nella cache locale (offline)
export async function saveWeather(data) {
    try {
        //serializza i dati e li salva con chiave "lastWeather"
        await AsyncStorage.setItem("lastWeather", JSON.stringify(data));
    } catch (e) {
        console.warn("Errore salvataggio meteo offline", e);
    }
}

//funzione asincrona che legge i dati dalla cache locale
export async function loadWeather() {
    try {
        //legge la stringa, la deserializza e restituisce l’oggetto (o null se non c’è/errore)
        const json = await AsyncStorage.getItem("lastWeather");
        return json != null ? JSON.parse(json) : null;
    } catch (e) {
        console.warn("Errore lettura meteo offline", e);
        return null;
    }
}