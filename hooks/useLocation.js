//hook React
import { useEffect, useState, useCallback, useContext } from "react";

import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { SettingsContext } from "../context/SettingsContext";
import { translations } from "../utils/translations";

export function useLocation() {
    const { language = "it" } = useContext(SettingsContext) || {};

    const [coords, setCoords] = useState(null);
    const [place, setPlace] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const CACHE_KEY = "last_location";

    //funzione per ottenere posizione da GPS
    const fetchLocation = useCallback(async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== "granted") {
                setError(
                    translations[language]?.noGpsPermission ||
                    translations.it.noGpsPermission
                );
                setLoading(false);
                return;
            }

            const position = await Location.getCurrentPositionAsync({});

            //reverse geocoding: da coordinate a città e paese
            const reverse = await Location.reverseGeocodeAsync(position.coords);
            const foundPlace = reverse.length > 0 ? reverse[0] : null;

            const newCoords = position.coords;
            const newPlace = foundPlace
                ? { city: foundPlace.city, country: foundPlace.country }
                : null;

            setCoords(newCoords);
            setPlace(newPlace);
            setError(null);

            // salva in cache
            await AsyncStorage.setItem(
                CACHE_KEY,
                JSON.stringify({ coords: newCoords, place: newPlace })
            );
        } catch (err) {
            console.warn("Errore durante il fetch della posizione:", err);
            setError(
                translations[language]?.errorLocation || translations.it.errorLocation
            );
            setCoords(null);
            setPlace(null);
        } finally {
            setLoading(false);
        }
    }, [language]);

    // al mount: carica cache e poi prova a recuperare GPS
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

            // se non c'è cache né errore, prova a ottenere GPS
            if (!coords && !error) {
                fetchLocation();
            }
        };

        loadCacheAndUpdate();
    }, [fetchLocation, coords, error]);

    //aggiorna manualmente la città da search bar
    const setManualLocation = useCallback(async (city) => {
        if (!city) return;

        const newCoords = {
            latitude: city.lat,
            longitude: city.lon,
        };

        const newPlace = {
            city: city.name,
            country: city.country,
        };

        setCoords(newCoords);
        setPlace(newPlace);
        setError(null);
        setLoading(false);

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
