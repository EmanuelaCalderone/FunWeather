import { useState, useEffect, useCallback, useContext, useRef } from "react";
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
    const [manualOverride, setManualOverride] = useState(false);

    const CACHE_KEY = "last_location";
    const subscriptionRef = useRef(null);

    // Aggiorna stato e cache
    const updateLocation = useCallback(async (newCoords, newPlace) => {
        setCoords(newCoords);
        setPlace(newPlace);
        setError(null);

        try {
            await AsyncStorage.setItem(
                CACHE_KEY,
                JSON.stringify({ coords: newCoords, place: newPlace })
            );
        } catch (err) {
            console.warn("Errore salvataggio cache location:", err);
        }
    }, []);

    // Avvia GPS e tracking continuo
    const startTracking = useCallback(async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                setError(
                    translations[language]?.noGpsPermission || translations.it.noGpsPermission
                );
                setLoading(false);
                return;
            }

            // Posizione iniziale
            const position = await Location.getCurrentPositionAsync({});
            const reverse = await Location.reverseGeocodeAsync(position.coords);
            const foundPlace = reverse.length > 0 ? reverse[0] : null;

            // Aggiorna solo se non c’è override manuale
            if (!manualOverride) {
                await updateLocation(
                    position.coords,
                    foundPlace ? { city: foundPlace.city, country: foundPlace.country } : null
                );
            }

            // Tracking continuo
            const subscription = await Location.watchPositionAsync(
                { accuracy: Location.Accuracy.High, distanceInterval: 10000 },
                async (pos) => {
                    if (!manualOverride) {
                        const rev = await Location.reverseGeocodeAsync(pos.coords);
                        const pl = rev.length > 0 ? rev[0] : null;
                        updateLocation(
                            pos.coords,
                            pl ? { city: pl.city, country: pl.country } : null
                        );
                    }
                }
            );

            subscriptionRef.current = subscription;
        } catch (err) {
            console.warn("Errore durante il tracking della posizione:", err);
            setError(translations[language]?.errorLocation || translations.it.errorLocation);
        } finally {
            setLoading(false);
        }
    }, [language, updateLocation, manualOverride]);

    // Leggi cache al mount e avvia tracking
    useEffect(() => {
        const loadCache = async () => {
            try {
                const cached = await AsyncStorage.getItem(CACHE_KEY);
                if (cached) {
                    const parsed = JSON.parse(cached);
                    setCoords(parsed.coords);
                    setPlace(parsed.place);
                }
            } catch (err) {
                console.warn("Errore lettura cache location:", err);
            } finally {
                startTracking();
            }
        };

        loadCache();

        // Cleanup: rimuove subscription quando componente si smonta
        return () => {
            if (subscriptionRef.current) {
                subscriptionRef.current.remove();
                subscriptionRef.current = null;
            }
        };
    }, [startTracking]);

    // Imposta manualmente la città
    const setManualLocation = useCallback(
        async (city) => {
            if (!city) return;

            // Ferma GPS per dare priorità alla città manuale
            if (subscriptionRef.current) {
                subscriptionRef.current.remove();
                subscriptionRef.current = null;
            }

            setManualOverride(true);

            await updateLocation(
                { latitude: city.lat, longitude: city.lon },
                { city: city.name, country: city.country }
            );
            setLoading(false);
        },
        [updateLocation]
    );

    // Riattiva GPS se necessario
    const useCurrentLocation = useCallback(() => {
        setManualOverride(false);
        startTracking();
    }, [startTracking]);

    return {
        coords,
        place,
        error,
        loading,
        setManualLocation,
        useCurrentLocation, // permette all’utente di tornare alla posizione reale
    };
}
