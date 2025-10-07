// built-in components
import { Text, View, ImageBackground, StyleSheet, FlatList, ActivityIndicator, Pressable, Platform, Image, Alert } from "react-native";

// hook
import { useEffect, useContext, useCallback, useMemo, useState, useRef } from "react";

// icone
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

//notifica
import * as Notifications from 'expo-notifications';

// componenti
import CitySearch from "./components/CitySearch";
import QuoteOfTheDay from "./components/QuoteOfTheDay";
import HourlyForecast from "./components/HourlyForecast";
import NextThreeDaysForecast from "./components/NextThreeDaysForecast";
import InfoModal from "./components/InfoModal";

// utils
import { scheduleDaily10AM } from "../utils/notification";
import { WeatherIcon } from "../utils/icons";
import { getBackground, isNightByClock } from "../utils/backgrounds";
import { translations } from "../utils/translations";
import { checkConnection } from "../utils/network";
import { isTablet, scaledSize } from "../utils/devices";

// contesto per lingua, unità di misura e formato orario
import { SettingsContext } from "../context/SettingsContext";

// custom hook
import { useFormatters } from "../hooks/useFormatters";
import { useLocation } from "../hooks/useLocation";
import { useWeather } from "../hooks/useWeather";

// libreria esterna per safe area
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Home() {

    // hook per margini sotto notch
    const insets = useSafeAreaInsets();

    // hook con logiche per formattare temperature, vento e orario
    const { formatTemp, formatWind, formatTime } = useFormatters();

    const {
        language,
        toggleLanguage,
        toggleTimeFormat,
        toggleUnitTemp,
        toggleUnitWind,
        unitTemp,
        unitWind,
        timeFormat,
        isLoaded,
    } = useContext(SettingsContext);

    // stato per pagina info
    const [showInfo, setShowInfo] = useState(false);

    //verifica connessione
    const hasCheckedConnection = useRef(false);

    useEffect(() => {
        if (hasCheckedConnection.current) return; // evita richieste multiple
        hasCheckedConnection.current = true;

        async function verifyConnection() {
            const online = await checkConnection();
            if (!online) {
                Alert.alert(
                    translations[language].offlineTitle,
                    translations[language].offlineMessage
                );
            }
        }

        verifyConnection();
    }, []); // eseguito solo all'avvio

    // per ora aggiornamento orario ogni minuto, preciso allo scoccare del minuto
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const tick = () => setNow(new Date());

        // aggiorna subito
        tick();

        // calcola il tempo rimanente al prossimo minuto
        const delay =
            60000 - (new Date().getSeconds() * 1000 + new Date().getMilliseconds());

        const timeout = setTimeout(() => {
            tick();
            const interval = setInterval(tick, 60000); // aggiorna ogni minuto preciso
            // cleanup dell’interval
            return () => clearInterval(interval);
        }, delay);

        return () => clearTimeout(timeout);
    }, []);


    // per date e orari
    const locale = language === "it" ? "it-IT" : "en-GB";

    const {
        coords,
        place,
        error: gpsErrorMsg,
        loading: isLocationLoading,
        setManualLocation,
        useCurrentLocation,
    } = useLocation();

    const {
        data: weatherData,
        loading: isWeatherLoading,
        error: weatherError,
    } = useWeather(coords?.latitude, coords?.longitude);
    // se coords esiste, uso coords.latitude, altrimenti restituisce undefined senza lanciare errore

    // calcolo ora locale della città con offset API
    const cityNow = useMemo(() => {
        if (!weatherData) return null;
        const offset = weatherData.utc_offset_seconds || 0;
        const utcNow = now.getTime() + new Date().getTimezoneOffset() * 60000;
        return new Date(utcNow + offset * 1000);
    }, [weatherData, now]);

    // timezone del dispositivo
    const deviceTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // timezone della città (validato)
    const cityTimeZone = weatherData ? safeTimeZone(weatherData.timezone) : null;

    // 1. selezione città manuale dalla search bar
    // con useCallback per evitare che la funzione venga ricreata ad ogni aggiornamento dello stato
    // evitando re-render quando i figli ricevono questo handler come prop
    const handleSelectCity = useCallback(
        (city) => {
            if (!city) return;
            setManualLocation(city);
        },
        [setManualLocation]
    );

    // 2. descrizione meteo
    function getWeatherDescription(code) {
        const condition = translations?.[language]?.conditions?.[code];

        if (!condition) {
            return language === "it"
                ? "Condizione meteo sconosciuta"
                : "Unknown weather condition";
        }

        // se è un oggetto (EN) prendi la proprietà .text
        if (typeof condition === "object" && condition.text) {
            return condition.text;
        }

        // altrimenti (IT) è già una stringa
        return condition;
    }

    // 3. prossimi 3 giorni (sempre useMemo per evitare il ricalcolo dell'array ad ogni render)
    const nextThreeDays = useMemo(() => {
        if (!weatherData?.daily) return [];

        // slice per prendere da 1 a 3
        return weatherData.daily.time.slice(1, 4).map((d, i) => ({
            dayName: new Date(d).toLocaleDateString(locale, {
                weekday: "long",
                day: "numeric",
            }),
            min: formatTemp(weatherData.daily.temperature_2m_min?.[i]),
            max: formatTemp(weatherData.daily.temperature_2m_max?.[i]),
            code: weatherData.daily.weather_code?.[i],
            wind: formatWind(weatherData.daily.wind_speed_10m_max?.[i]),
            humidity: weatherData.daily.relative_humidity_2m_max?.[i] + "%",
            rainProb: weatherData.daily.precipitation_probability_max?.[i] + "%",
            sunrise: formatTime(weatherData.daily.sunrise?.[i], true),
            sunset: formatTime(weatherData.daily.sunset?.[i], true),
        }));
    }, [weatherData, formatTemp, formatWind, formatTime, locale]);

    // 4. funzione per validare la timezone
    function safeTimeZone(tz) {
        try {
            if (!tz || typeof tz !== "string") return "UTC";
            new Date().toLocaleString("en-US", { timeZone: tz }); // se non lancia > valido
            return tz;
        } catch (e) {
            return "UTC";
        }
    }

    // 5. notifica giornaliera alle 10
    useEffect(() => {
        if (!isLoaded) return;
        scheduleDaily10AM(language);
    }, [isLoaded, language]);

    // spinner solo se:
    // - settings non pronti
    // - gps in corso
    // - sto caricando meteo ma HO coords (fetch reale)
    const waiting =
        !isLoaded || isLocationLoading || (coords && isWeatherLoading);

    if (waiting) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#194350" />
            </View>
        );
    }

    if (weatherError) {
        return (
            <Text>
                {translations[language].error}: {weatherError.message}
            </Text>
        );
    }

    // calcolo se è notte
    const night = weatherData
        ? isNightByClock(
            safeTimeZone(weatherData.timezone),
            weatherData.daily.sunrise?.[0],
            weatherData.daily.sunset?.[0]
        )
        : false;

    // condizione meteo base
    let conditionText = weatherData
        ? getWeatherDescription(weatherData.current.weather_code)
        : "";

    // calcolo della condizione per frasi/quote
    let conditionKey = weatherData ? weatherData.current.weather_code : null;

    // override per condizioni speciali (afa/vento forte)
    if (
        weatherData &&
        weatherData.current.temperature_2m >= 30 &&
        weatherData.current.relative_humidity_2m >= 70
    ) {
        conditionKey = "afa_umidita";
    }

    if (weatherData && weatherData.current.wind_speed_10m >= 40) {
        conditionKey = "vento_forte";
    }

    const isSnowCode = weatherData
        ? [71, 73, 75, 85, 86].includes(weatherData.current.weather_code)
        : false;

    if (weatherData && weatherData.current.temperature_2m <= 0 && !isSnowCode) {
        conditionKey = "FREDDISSIMO";
        conditionText = language === "it" ? "FREDDISSIMO" : "Suuuper cold";
    }

    // override per condizioni notturne
    if (weatherData && night) {
        if (weatherData.current.weather_code === 0 || weatherData.current.weather_code === 1) {
            // testo sotto la temperatura
            conditionText =
                language === "it"
                    ? "Cielo stranamente sereno"
                    : "Suspiciously clear sky";
            // chiave per frasi/quote
            conditionKey = "sereno_night";
        }

        // nuvoloso
        if (weatherData.current.weather_code === 2) {
            conditionText =
                language === "it"
                    ? "Poche nuvolette"
                    : "A sprinkle of fluffy clouds";
            conditionKey = "parzialmente_nuvoloso_night";
        }

        if (weatherData.current.weather_code === 3) {
            conditionText =
                language === "it" ? "Parecchie nuvolette" : "Plenty of fluffy clouds";
            conditionKey = "nuvoloso_night";
        }

        // pioggia notturna
        if (
            [51, 53, 55, 61, 63, 65, 80, 81, 82].includes(
                weatherData.current.weather_code
            )
        ) {
            conditionText =
                language === "it"
                    ? "Simpatica pioggia notturna"
                    : "Charming night rain";
            conditionKey = "simpatica_pioggia_notturna";
        }

        // vento notturno
        if (weatherData.current.wind_speed_10m >= 40) {
            conditionText =
                language === "it"
                    ? "Affettuoso vento notturno"
                    : "Affectionate night wind";
            conditionKey = "affettuoso_vento_notturno";
        }
    }

    // fallback esplicito: se non ci sono dati, uso un semplice colore scuro come background
    const Container = weatherData ? ImageBackground : View;

    const containerProps = weatherData
        ? {
            source: getBackground(
                weatherData?.current,
                weatherData?.daily,
                safeTimeZone(weatherData?.timezone)
            ),
            imageStyle: { resizeMode: "cover" },
        }
        : {};

    // testi placeholder
    const dash = "—";
    const noQuoteText = translations?.[language]?.noQuote;

    return (
        <Container
            {...containerProps}
            style={[
                styles.background,
                { paddingTop: insets.top },
                !weatherData && styles.fallbackBg,
            ]}
        >
            <FlatList
                // per liste lunghe e scrollabili
                ListHeaderComponent={
                    <View>
                        <View style={styles.topBar}>
                            {/* Colonna sinistra: ? e GPS */}
                            <View style={styles.leftColumn}>
                                <Pressable
                                    onPress={() => setShowInfo(true)}
                                    style={[styles.buttonBase, styles.sideButton]}
                                >
                                    <Ionicons name="help-circle-outline" size={25} color="white" />
                                </Pressable>

                                <Pressable
                                    onPress={useCurrentLocation}
                                    style={[styles.buttonBase, styles.sideButton]}
                                >
                                    <Ionicons name="locate-outline" size={25} color="white" />
                                </Pressable>
                            </View>

                            {/* Colonna destra: toggle centrali */}
                            <View style={styles.rightColumn}>
                                <Pressable
                                    onPress={toggleLanguage}
                                    style={[styles.buttonBase, styles.toggleButton]}
                                >
                                    <Text style={styles.toggleText}>{language === "en" ? "IT" : "EN"}</Text>
                                </Pressable>

                                <Pressable
                                    onPress={toggleTimeFormat}
                                    style={[styles.buttonBase, styles.toggleButton]}
                                >
                                    <Text style={styles.toggleText}>{timeFormat === "12h" ? "24h" : "12h"}</Text>
                                </Pressable>

                                <Pressable
                                    onPress={toggleUnitTemp}
                                    style={[styles.buttonBase, styles.toggleButton]}
                                >
                                    <Text style={styles.toggleText}>{unitTemp === "fahrenheit" ? "°C" : "°F"}</Text>
                                </Pressable>

                                <Pressable
                                    onPress={toggleUnitWind}
                                    style={[styles.buttonBase, styles.toggleButton]}
                                >
                                    <Text style={styles.toggleText}>{unitWind === "mph" ? "km/h" : "mph"}</Text>
                                </Pressable>
                            </View>
                        </View>

                        {/* ricerca città */}
                        <CitySearch onSelectCity={handleSelectCity} />

                        {/* orario */}
                        <View style={styles.header}>
                            {place?.city && cityNow ? (
                                <>
                                    {/* città e nazione */}
                                    <Text style={styles.location}>
                                        {place?.city ? String(place.city) : ""}
                                    </Text>

                                    {/* data locale della città */}
                                    <Text style={styles.date}>
                                        {String(
                                            cityNow.toLocaleDateString(locale, {
                                                weekday: "long",
                                                day: "numeric",
                                                month: "long",
                                            })
                                        )}
                                    </Text>

                                    {/* ora locale */}
                                    {cityNow && (
                                        <Text style={styles.time}>
                                            {cityNow.toLocaleTimeString(locale, {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                                hour12: timeFormat === "12h",
                                            })}
                                        </Text>
                                    )}
                                </>
                            ) : (
                                <>
                                    {/* placeholder se non c’è ancora una città */}
                                    <Text style={styles.time}>
                                        {dash}
                                        {dash}:{dash}
                                        {dash}
                                    </Text>
                                    <Text style={styles.date}>
                                        {translations?.[language]?.selectCity}
                                    </Text>
                                </>
                            )}

                            {/* temperatura attuale */}
                            <View style={styles.tempRow}>
                                {weatherData ? (
                                    <>
                                        <WeatherIcon
                                            code={weatherData.current.weather_code}
                                            size={45}
                                            night={night}
                                            color="white"
                                        />
                                        <Text style={styles.temperature}>
                                            {formatTemp(weatherData.current.temperature_2m)}
                                        </Text>
                                    </>
                                ) : (
                                    <Text style={styles.temperature}>{dash}</Text>
                                )}
                            </View>

                            {/* condizione meteo corrente */}
                            <Text style={styles.condition}>
                                {weatherData
                                    ? conditionText
                                    : translations?.[language]?.waitingWeather}
                            </Text>
                        </View>

                        {/* prima riga: min/max + vento + umidità + pioggia */}
                        <View style={styles.row}>
                            {/* minima */}
                            <Ionicons name="thermometer-outline" size={18} color="white" />
                            <Text style={styles.info}>
                                {weatherData
                                    ? String(formatTemp(weatherData.daily.temperature_2m_min?.[0]))
                                    : dash}
                            </Text>

                            {/* massima */}
                            <Ionicons name="thermometer" size={18} color="white" />
                            <Text style={styles.info}>
                                {weatherData
                                    ? String(formatTemp(weatherData.daily.temperature_2m_max?.[0]))
                                    : dash}
                            </Text>

                            {/* vento */}
                            <>
                                <MaterialCommunityIcons
                                    name="weather-windy"
                                    size={18}
                                    color="white"
                                />
                                <Text style={styles.info}>
                                    {weatherData &&
                                        weatherData.daily.wind_speed_10m_max?.[0] != null
                                        ? String(formatWind(weatherData.daily.wind_speed_10m_max?.[0]))
                                        : dash}
                                </Text>
                            </>

                            {/* umidità */}
                            <>
                                <Ionicons name="water-outline" size={18} color="white" />
                                <Text style={styles.info}>
                                    {weatherData &&
                                        weatherData.daily.relative_humidity_2m_max?.[0] != null
                                        ? String(weatherData.daily.relative_humidity_2m_max?.[0]) +
                                        "%"
                                        : dash}
                                </Text>
                            </>

                            {/* probabilità pioggia */}
                            <>
                                <Ionicons name="rainy-outline" size={18} color="white" />
                                <Text style={styles.info}>
                                    {weatherData &&
                                        weatherData.daily.precipitation_probability_max?.[0] != null
                                        ? String(
                                            weatherData.daily.precipitation_probability_max?.[0]
                                        ) + "%"
                                        : dash}
                                </Text>
                            </>
                        </View>

                        {/* seconda riga: alba e tramonto */}
                        <View style={[styles.row, { marginTop: 16 }]}>
                            {/* alba */}
                            <>
                                <Ionicons name="sunny" size={18} color="white" />
                                <Text style={styles.info}>
                                    {weatherData && weatherData.daily.sunrise?.[0]
                                        ? String(formatTime(weatherData.daily.sunrise?.[0], true))
                                        : dash}
                                </Text>
                            </>

                            {/* tramonto */}
                            <>
                                <Ionicons name="moon" size={18} color="white" />
                                <Text style={styles.info}>
                                    {weatherData && weatherData.daily.sunset?.[0]
                                        ? String(formatTime(weatherData.daily.sunset?.[0], true))
                                        : dash}
                                </Text>
                            </>
                        </View>

                        {/* frase */}
                        <View style={styles.quoteBox}>
                            {weatherData && conditionKey !== null ? (
                                <QuoteOfTheDay weatherCondition={conditionKey} />
                            ) : (
                                <Text style={styles.quoteText}>{noQuoteText}</Text>
                            )}
                        </View>

                        {/* orari successivi */}
                        {weatherData ? (
                            <HourlyForecast
                                weatherData={weatherData}
                                sunrise={weatherData.daily.sunrise[0]}
                                sunset={weatherData.daily.sunset[0]}
                            />
                        ) : (
                            <View style={styles.placeholderBox}>
                                <Text style={styles.placeholderText}>
                                    {translations?.[language]?.hourlyUnavailable}
                                </Text>
                            </View>
                        )}

                        {/* successivi 3 gg */}
                        {weatherData ? (
                            <NextThreeDaysForecast nextDays={nextThreeDays} />
                        ) : (
                            <View style={styles.placeholderBox}>
                                <Text style={styles.placeholderText}>
                                    {translations?.[language]?.forecastUnavailable}
                                </Text>
                            </View>
                        )}
                    </View>
                }
                contentContainerStyle={{
                    paddingBottom: Platform.OS === "android" ? 40 : 0, //spazio extra solo su Android
                }}
            />

            <InfoModal visible={showInfo} onClose={() => setShowInfo(false)} />
        </Container>
    );
}


const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#111",
    },

    background: {
        flex: 1,
    },

    fallbackBg: {
        backgroundColor: "#1c1c1e",
    },

    topBar: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: isTablet() ? scaledSize(20) : 16,
        paddingTop: isTablet() ? scaledSize(20) : 18,
    },

    buttonBase: {
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 10,
    },

    toggleButton: {
        backgroundColor: "rgba(117, 114, 114, 0.35)",
        paddingVertical: isTablet() ? scaledSize(10) : 10,
        paddingHorizontal: isTablet() ? scaledSize(14) : 14,
        minWidth: isTablet() ? scaledSize(40) : 60,
        marginLeft: isTablet() ? scaledSize(10) : 10,
    },

    toggleText: {
        fontWeight: "600",
        fontSize: isTablet() ? scaledSize(12) : 13,
        color: "#fff",
    },

    centerToggles: {
        flexDirection: "row",
        justifyContent: "center",
        gap: isTablet() ? scaledSize(2) : 2,
    },

    header: {
        alignItems: "center",
        marginVertical: isTablet() ? scaledSize(25) : 25,
    },

    location: {
        fontSize: isTablet() ? scaledSize(20) : 20,
        fontWeight: "600",
        color: "#fff",
    },

    date: {
        fontSize: isTablet() ? scaledSize(14) : 15,
        fontWeight: "500",
        color: "#fff",
        marginVertical: isTablet() ? scaledSize(6) : 6,
    },

    time: {
        fontSize: isTablet() ? scaledSize(16) : 15,
        fontWeight: "700",
        color: "#fff",
    },

    tempRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: isTablet() ? scaledSize(10) : 10,
    },

    temperature: {
        fontSize: isTablet() ? scaledSize(45) : 52,
        fontWeight: "700",
        color: "#fff",
    },

    condition: {
        fontSize: isTablet() ? scaledSize(14) : 15,
        fontWeight: "500",
        color: "white",
        textAlign: "center",
        paddingHorizontal: isTablet() ? scaledSize(10) : 10,
        lineHeight: isTablet() ? scaledSize(18) : 20,
    },

    row: {
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
    },

    info: {
        fontSize: isTablet() ? scaledSize(14) : 15,
        color: "white",
        fontWeight: "500",
    },

    quoteBox: {
        marginTop: isTablet() ? scaledSize(20) : 13,
        marginBottom: isTablet() ? scaledSize(20) : 13,
        justifyContent: "center",
        alignItems: "center",
        height: isTablet() ? scaledSize(250) : 250,
    },

    quoteText: {
        fontSize: isTablet() ? scaledSize(16) : 18,
        fontStyle: "italic",
        color: "white",
        textAlign: "center",
        lineHeight: isTablet() ? scaledSize(22) : 24,
        flexWrap: "wrap",
    },

    noQuoteText: {
        fontWeight: "600",
        textAlign: "center",
        color: "#fff",
        fontSize: isTablet() ? scaledSize(14) : 16,
    },

    placeholderBox: {
        margin: isTablet() ? scaledSize(20) : 16,
        padding: isTablet() ? scaledSize(24) : 24,
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        borderRadius: isTablet() ? scaledSize(20) : 16,
        alignItems: "center",
        justifyContent: "center",
        minHeight: isTablet() ? scaledSize(120) : 120,
    },

    placeholderText: {
        fontSize: isTablet() ? scaledSize(14) : 16,
        fontWeight: "600",
        textAlign: "center",
        color: "#eee",
    },

    leftColumn: {
        flexDirection: "row",
        alignItems: "center",
        gap: isTablet() ? scaledSize(2) : 2,
    },

    rightColumn: {
        flexDirection: "row",
        alignItems: "center",
        gap: isTablet() ? scaledSize(4) : 4,
        marginRight: isTablet() ? scaledSize(12) : 12,
    },

    sideButton: {
        paddingVertical: isTablet() ? scaledSize(6) : 6,
        paddingHorizontal: isTablet() ? scaledSize(8) : 8
    }
});