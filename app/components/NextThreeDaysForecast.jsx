import { useContext } from "react";
import { Text, View, StyleSheet } from "react-native";
import { WeatherIcon } from "../../utils/icons";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { SettingsContext } from "../../context/SettingsContext";
import { translations } from "../../utils/translations";
import React from "react";
//responsive
import { isTablet, scaledSize } from "../../utils/devices";


function NextThreeDaysForecast({ nextDays }) {
    const { language = "it" } = useContext(SettingsContext) || {};

    if (!nextDays || nextDays.length === 0) return null;
    return (
        <View style={styles.container}>
            {/* titolo */}
            <Text style={styles.title}>{translations[language].nextDays}</Text>
            {nextDays.map((d, i) => (
                <View key={i} style={styles.card}>
                    <View style={styles.dayRow}>
                        {/* icona */}
                        <WeatherIcon code={d.code} size={28} />
                        {/* giorno settimana */}
                        <Text style={styles.day}>{String(d.dayName)}</Text>
                    </View>

                    <View style={styles.row}>
                        {/* minima */}
                        <Ionicons name="thermometer-outline" size={18} color="white" />
                        <Text style={styles.info}>{String(d.min)}</Text>

                        {/* massima */}
                        <Ionicons name="thermometer" size={18} color="white" style={{ marginLeft: 6 }} />
                        <Text style={styles.info}>{String(d.max)}</Text>

                        {/* vento */}
                        {d.wind && (
                            <>
                                <MaterialCommunityIcons name="weather-windy" size={18} color="white" style={{ marginLeft: 10 }} />
                                <Text style={styles.info}>{String(d.wind)}</Text>
                            </>
                        )}

                        {/* umidità */}
                        {d.humidity && (
                            <>
                                <Ionicons name="water-outline" size={18} color="white" style={{ marginLeft: 10 }} />
                                <Text style={styles.info}>{String(d.humidity)}</Text>
                            </>
                        )}

                        {/* probabilità pioggia */}
                        {d.rainProb && (
                            <>
                                <Ionicons name="rainy-outline" size={18} color="white" style={{ marginLeft: 10 }} />
                                <Text style={styles.info}>{String(d.rainProb)}</Text>
                            </>
                        )}
                    </View>

                    {/* orario alba */}
                    <View style={styles.row}>
                        {d.sunrise && (
                            <>
                                <Ionicons name="sunny" size={18} color="white" />
                                <Text style={styles.info}>{String(d.sunrise)}</Text>
                            </>
                        )}

                        {/* orario tramonto */}
                        {d.sunset && (
                            <>
                                <Ionicons name="moon" size={18} color="white" style={{ marginLeft: 10 }} />
                                <Text style={styles.info}>{String(d.sunset)}</Text>
                            </>
                        )}
                    </View>
                </View>
            ))}
        </View>
    );
}

export default React.memo(NextThreeDaysForecast);

const styles = StyleSheet.create({
    container: {
        padding: scaledSize(16),
        alignItems: "center",
    },
    title: {
        fontSize: scaledSize(16),
        color: "#fff",
        marginBottom: scaledSize(12),
        textAlign: "center",
        fontWeight: "400",
    },
    card: {
        width: isTablet() ? "85%" : "90%",
        backgroundColor: "rgba(255,255,255,0.1)",
        borderRadius: isTablet() ? scaledSize(32) : 16,
        padding: isTablet() ? scaledSize(24) : 16,
        marginVertical: isTablet() ? scaledSize(16) : 8,
        alignSelf: "center",
    },

    dayRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: scaledSize(8),
    },
    day: {
        fontSize: scaledSize(16),
        fontWeight: "600",
        color: "#FFFFFF",
        marginLeft: scaledSize(8),
        flexShrink: 1,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap",
        paddingVertical: scaledSize(4),
    },
    info: {
        fontSize: scaledSize(13),
        marginLeft: scaledSize(4),
        color: "white",
    }
});



