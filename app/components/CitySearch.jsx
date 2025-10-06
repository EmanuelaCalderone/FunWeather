import React, { useState, useCallback, useContext, useEffect } from "react";
import { View, TextInput, FlatList, Text, Pressable, StyleSheet, ActivityIndicator, Modal, TouchableWithoutFeedback, Platform, StatusBar } from "react-native";
import { SettingsContext } from "../../context/SettingsContext";
import { translations } from "../../utils/translations";
import { isTablet, scaledSize } from "../../utils/devices";

// debounce utility
function debounce(fn, delay) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn(...args), delay);
    };
}

// normalizza nomi (rimuove accenti)
function normalizeName(name) {
    return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

// rileva accenti
function hasAccent(str) {
    return /[^\u0000-\u007F]/.test(str);
}

function CitySearch({ onSelectCity }) {
    const { language = "it" } = useContext(SettingsContext) || {};
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [showNoResults, setShowNoResults] = useState(false);

    const validFeatureCodes = ["PPL", "PPLA", "PPLC", "PPLS", "PPLA2", "PPLA3"];

    // Messaggio "nessun risultato"
    useEffect(() => {
        if (query.length < 2) {
            setShowNoResults(false);
            return;
        }
        if (!loading && results.length === 0) {
            const timer = setTimeout(() => setShowNoResults(true), 800);
            return () => clearTimeout(timer);
        } else {
            setShowNoResults(false);
        }
    }, [query, results, loading]);
    // Ricerca città con debounce
    const searchCity = useCallback(
        debounce(async (text) => {
            if (!text || text.length < 2) {
                setResults([]);
                setShowNoResults(false);
                return;
            }

            setLoading(true);
            try {
                const baseUrl = "https://geocoding-api.open-meteo.com/v1/search";
                const url = `${baseUrl}?name=${encodeURIComponent(text)}&count=100&language=${language}&format=json`;
                const res = await fetch(url);
                const data = await res.json();

                if (data?.results) {
                    const queryNormalized = normalizeName(text);
                    const seen = new Map();

                    data.results.forEach((item) => {
                        if (!validFeatureCodes.includes(item.feature_code)) return;

                        const itemNameNormalized = normalizeName(item.name);
                        if (!itemNameNormalized.includes(queryNormalized)) return;

                        // chiave affidabile senza admin1
                        const key = `${itemNameNormalized}-${item.country}`;

                        if (!seen.has(key)) {
                            seen.set(key, {
                                name: item.name || "",
                                region: item.admin1 || "",
                                country: item.country || "",
                                lat: item.latitude,
                                lon: item.longitude
                            });
                        }
                    });

                    // Ordina per:
                    // 1. inizia con la query
                    // 2. lunghezza del nome più corto
                    const sortedResults = Array.from(seen.values()).sort((a, b) => {
                        const nameA = normalizeName(a.name);
                        const nameB = normalizeName(b.name);
                        const aStarts = nameA.startsWith(queryNormalized) ? 0 : 1;
                        const bStarts = nameB.startsWith(queryNormalized) ? 0 : 1;
                        if (aStarts !== bStarts) return aStarts - bStarts;
                        return nameA.length - nameB.length;
                    });

                    setResults(sortedResults);
                } else {
                    setResults([]);
                }
            } catch (err) {
                console.warn("Errore ricerca città:", err);
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 300),
        [language]
    );


    const handleChange = (text) => {
        setQuery(text);
        searchCity(text);
    };

    return (
        <View style={styles.container}>
            {!modalVisible && (
                <TextInput
                    style={styles.input}
                    placeholder={translations?.[language]?.searchCity}
                    placeholderTextColor="darkgrey"
                    value={query}
                    onFocus={() => setModalVisible(true)}
                />
            )}

            {modalVisible && (
                <Modal
                    transparent
                    statusBarTranslucent
                    animationType="fade"
                    visible={modalVisible}
                    onRequestClose={() => {
                        setModalVisible(false);
                        setQuery("");
                        setResults([]);
                        setShowNoResults(false);
                    }}
                >
                    <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
                    <TouchableWithoutFeedback
                        onPress={() => {
                            setModalVisible(false);
                            setQuery("");
                            setResults([]);
                            setShowNoResults(false);
                        }}
                    >
                        <View style={styles.overlay} />
                    </TouchableWithoutFeedback>

                    <View style={styles.modalBox}>
                        <View style={{ position: "relative", justifyContent: "center" }}>
                            <TextInput
                                style={styles.input}
                                placeholder={translations?.[language]?.searchCity}
                                placeholderTextColor="darkgrey"
                                value={query}
                                onChangeText={handleChange}
                                autoFocus
                            />
                            {query.length > 0 && (
                                <Pressable
                                    onPress={() => {
                                        setQuery("");
                                        setResults([]);
                                        setShowNoResults(false);
                                    }}
                                    style={{
                                        position: "absolute",
                                        right: 12,
                                        top: "50%",
                                        transform: [{ translateY: -10 }]
                                    }}
                                >
                                    <Text style={{ fontSize: 18, color: "#888" }}>✕</Text>
                                </Pressable>
                            )}
                        </View>

                        {loading && <ActivityIndicator size="small" color="gray" />}

                        {showNoResults ? (
                            <Text style={styles.noResults}>{translations?.[language]?.noResults}</Text>
                        ) : (
                            <FlatList
                                data={results}
                                keyExtractor={(item) => `${item.lat}-${item.lon}`}
                                renderItem={({ item }) => (
                                    <Pressable
                                        style={styles.item}
                                        onPress={() => {
                                            onSelectCity(item);
                                            setQuery("");
                                            setResults([]);
                                            setModalVisible(false);
                                        }}
                                    >
                                        <Text style={styles.cityName}>
                                            {item.name}
                                            {item.region ? `, ${item.region}` : ""}
                                            {item.country ? `, ${item.country}` : ""}
                                        </Text>
                                    </Pressable>
                                )}
                            />
                        )}
                    </View>
                </Modal>
            )}
        </View>
    );
}

export default React.memo(CitySearch);

const styles = StyleSheet.create({
    container: {
        margin: isTablet() ? scaledSize(16) : 10,
        marginBottom: 0
    },
    input: {
        backgroundColor: "#FFFFFF",
        borderRadius: isTablet() ? scaledSize(12) : 10,
        paddingVertical: isTablet() ? scaledSize(8) : 10,
        paddingHorizontal: isTablet() ? scaledSize(14) : 12,
        fontSize: isTablet() ? scaledSize(15) : Platform.OS === "android" ? 14 : 15,
        color: "#000000"
    },
    overlay: {
        backgroundColor: "rgba(0,0,0,0.78)",
        ...StyleSheet.absoluteFillObject
    },
    modalBox: {
        position: "absolute",
        top: isTablet() ? scaledSize(100) : 80,
        left: isTablet() ? scaledSize(40) : 20,
        right: isTablet() ? scaledSize(40) : 20,
        backgroundColor: "#2A2A2A",
        borderRadius: isTablet() ? scaledSize(20) : 16,
        padding: isTablet() ? scaledSize(10) : 14,
        maxHeight: "70%",
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: isTablet() ? scaledSize(14) : 10,
        elevation: 6
    },
    noResults: {
        textAlign: "center",
        marginTop: isTablet() ? scaledSize(24) : 20,
        fontSize: isTablet() ? scaledSize(18) : 15,
        color: "#BBBBBB",
        fontStyle: "italic"
    },
    item: {
        paddingVertical: isTablet() ? scaledSize(18) : 14,
        paddingHorizontal: isTablet() ? scaledSize(20) : 16,
        borderBottomWidth: 1,
        borderBottomColor: "#444"
    },
    cityName: {
        fontSize: isTablet() ? scaledSize(18) : 16,
        color: "#FFFFFF",
        fontWeight: "500"
    }
});
