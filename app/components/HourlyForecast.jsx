import { Text, View, ScrollView, StyleSheet } from "react-native";
import { WeatherIcon } from "../../utils/icons";
import { useFormatters } from "../../hooks/useFormatters";
import { Ionicons } from "@expo/vector-icons";
import React from 'react'
//responsive
import { isTablet, scaledSize } from "../../utils/devices";

function HourlyForecast({ weatherData }) {
    const { formatTemp, formatTime } = useFormatters();

    if (!weatherData?.hourly?.time) return null;

    //offset = differenza tra UTC (Coordinated Universal Time) e ora locale della città
    const offset = weatherData?.utc_offset_seconds || 0;

    //ottengo timestamp UTC (in millisecondi)
    const utcTimestamp = Date.now() + new Date().getTimezoneOffset() * 60000;

    //aggiungo offset città (in secondi > ms)
    const now = new Date(utcTimestamp + offset * 1000);

    // fine giornata locale
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    // temperatura, condizione e probabilità pioggia per ogni ora
    const allHours = weatherData.hourly.time.map((t, i) => ({
        date: new Date(t), // già in orario locale città
        temp: weatherData.hourly.temperature_2m[i],
        code: weatherData.hourly.weather_code[i],
        rain: weatherData.hourly.precipitation_probability[i],
    }));

    let startOfPeriod = new Date(now);

    // fino alle 12 ore del gg dopo
    let endOfPeriod = new Date(now);
    endOfPeriod.setDate(endOfPeriod.getDate() + 1);
    endOfPeriod.setHours(12, 0, 0, 0);

    const futureHours = allHours.filter(
        h => h.date >= startOfPeriod && h.date <= endOfPeriod
    );

    //funzione per calcolare se è notte
    function isNight(date, weatherData) {
        //trovo l’indice del giorno corrispondente
        const dayIndex = weatherData.daily.time.findIndex(
            d => new Date(d).toDateString() === date.toDateString()
        );

        if (dayIndex === -1) return false; // fallback

        const sunrise = new Date(weatherData.daily.sunrise[dayIndex]);
        const sunset = new Date(weatherData.daily.sunset[dayIndex]);

        return date < sunrise || date >= sunset;
    }

    return (
        <View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {futureHours.map(h => (
                    //assegno a ogni box orario una chiave unica basata sull’ora esatta, così React gestisce bene la lista
                    <View key={h.date.toISOString()} style={styles.hourBox}>
                        {/* "false" per non visualizzare minuti */}
                        <Text style={styles.hour}>{formatTime(h.date, false)}</Text>
                        {/* icona */}
                        <WeatherIcon
                            code={h.code}
                            size={24}
                            night={isNight(h.date, weatherData)}
                        />
                        {/* temperatura */}
                        <Text style={styles.temp}>{formatTemp(h.temp)}</Text>

                        {/* probabilità pioggia */}
                        <View style={styles.rainRow}>
                            {h.rain > 0 && (
                                <>
                                    <Ionicons name="rainy-outline" size={18} color="white" style={styles.rain} />
                                    <Text style={styles.rain}>{String(h.rain) + "%"}</Text>
                                </>
                            )}
                        </View>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}
//reactMemo per evitare il re-render della lista, se i dati meteo non cambiano
export default React.memo(HourlyForecast);

const styles = StyleSheet.create({
    hourBox: {
        width: scaledSize(70),
        height: scaledSize(90),
        justifyContent: "space-around",
        alignItems: "center",
        marginRight: scaledSize(14),
        marginLeft: scaledSize(14),
        paddingVertical: scaledSize(3),
        backgroundColor: "rgba(117, 114, 114, 0.35)",
        borderRadius: scaledSize(16),
    },
    hour: {
        color: "#fff",
        fontSize: scaledSize(14),
        fontWeight: "500",
    },
    temp: {
        color: "#FFFFFF",
        fontSize: scaledSize(15),
        fontWeight: "600",
    },
    rainRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: scaledSize(1),
        marginTop: scaledSize(2),
    },
    rain: {
        fontSize: scaledSize(10),
        color: "rgba(10, 165, 212, 1)"
    }
});




