import { useState, useEffect, useCallback } from "react";

export function useWeather(latitude, longitude) {
    const [data, setData] = useState(null); // dati meteo
    const [loading, setLoading] = useState(true); // true solo al primo caricamento
    const [updating, setUpdating] = useState(false); // true quando sto aggiornando ma ho già dati vecchi
    const [error, setError] = useState(null);

    //funzione per fare la fetch ai dati meteo
    const fetchWeather = useCallback(async () => {
        if (!latitude || !longitude) return;

        //se non ci sono ancora dati > sto facendo il primo caricamento
        if (!data) {
            setLoading(true);
        } else {
            //se ho già dati > aggiorno la località
            setUpdating(true);
        }

        try {
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,daylight_duration,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,relative_humidity_2m_max&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,weather_code,visibility,wind_speed_10m,snowfall,precipitation&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,snowfall&timezone=auto&forecast_days=4`;

            const res = await fetch(url);
            const json = await res.json();
            setData(json); // aggiorno i dati meteo
            setError(null); // reset errori precedenti
        } catch (err) {
            setError(err);
        } finally {
            //fine caricamento: resetto loading o updating
            setLoading(false);
            setUpdating(false);
        }
    }, [latitude, longitude]);

    //richiamo fetch solo quando cambiano latitudine/longitudine
    useEffect(() => {
        fetchWeather();
    }, [fetchWeather]);

    return { data, loading, updating, error, fetchWeather };
}
