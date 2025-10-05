//hook React
import { useEffect, useState, useCallback, useContext } from "react";
//libreria di Expo per funzioni di geolocalizzazione in R Native
import * as Location from "expo-location";
//AsyncStorage per salvare ultima posizione/città scelta
import AsyncStorage from "@react-native-async-storage/async-storage";

import { SettingsContext } from "../context/SettingsContext";
import { translations } from "../utils/translations";

export function useLocation() {
    const { language = "it" } = useContext(SettingsContext) || {};

    const [coords, setCoords] = useState(null);
    const [place, setPlace] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    //chiave per salvare i dati in cache
    const CACHE_KEY = "last_location";

    //posizione da GPS con useCallback per non ricreare la funzione ad ogni render
    const fetchLocation = useCallback(async () => {
        try {
            let permission = await Location.requestForegroundPermissionsAsync();

            if (permission.status === "granted") {
                const position = await Location.getCurrentPositionAsync();

                // reverse geocoding: da coordinate a città, ecc
                const result = await Location.reverseGeocodeAsync(position.coords);
                const foundPlace = result && result.length > 0 ? result[0] : null;

                const newCoords = position.coords;
                const newPlace = foundPlace
                    ? { city: foundPlace.city, country: foundPlace.country }
                    : null;

                setCoords(newCoords);
                setPlace(newPlace);

                // salvo ultima posizione/città in cache
                await AsyncStorage.setItem(
                    CACHE_KEY,
                    JSON.stringify({ coords: newCoords, place: newPlace })
                );
            } else {
                setError(
                    translations[language]?.noGpsPermission || translations.it.noGpsPermission
                );
                setLoading(false);
            }
        } catch (err) {
            console.warn("Errore durante il fetch della posizione:", err);
            setError(
                translations[language]?.errorLocation || translations.it.errorLocation
            );
        } finally {
            setLoading(false);
        }
    }, [language]);


    //al mount > carica cache e poi prova a recuperare GPS
    useEffect(() => {
        const loadCacheAndUpdate = async () => {
            try {
                const cached = await AsyncStorage.getItem(CACHE_KEY);
                if (cached) {
                    const parsed = JSON.parse(cached);
                    setCoords(parsed.coords);
                    setPlace(parsed.place);
                    setLoading(false);
                }
            } catch (err) {
                console.warn("Errore lettura cache location:", err);
            }

            //GPS solo se non c'è cache né errore
            if (!place && !error) {
                fetchLocation();
            }
        };

        loadCacheAndUpdate();
    }, [fetchLocation, place, error]);



    //funzione per aggiornare manualmente città da search bar
    const setManualLocation = useCallback(async (city) => {
        if (!city) return;

        const newCoords = {
            latitude: city.lat,
            longitude: city.lon,
        };

        const newPlace = {
            city: city.name,
            country: city.country
        };

        setCoords(newCoords);
        setPlace(newPlace);
        setError(null);
        setLoading(false);

        //salvo la città scelta manualmente in cache
        await AsyncStorage.setItem(
            CACHE_KEY,
            JSON.stringify({ coords: newCoords, place: newPlace })
        );
    }, []);

    return {
        coords,
        place,
        error,
        loading,
        setManualLocation,
    };
}
