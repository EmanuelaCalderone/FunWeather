import React, { useState, useCallback, useContext, useEffect } from "react";
import { View, TextInput, FlatList, Text, Pressable, StyleSheet, ActivityIndicator, Modal, TouchableWithoutFeedback, Platform, StatusBar } from "react-native";
import { SettingsContext } from "../../context/SettingsContext";
import { translations } from "../../utils/translations";
//responsive
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

//debounce per evitare troppe chiamate API (utility function)
function debounce(fn, delay) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn(...args), delay);
    };
}
//funzione per normalizzare i nomi (rimuove accenti)
function normalizeName(name) {
    return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

//funzione per rilevare se un nome contiene accenti
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

    //nessun risultato trovato
    useEffect(() => {
        if (query.length < 2) {
            setShowNoResults(false);
            return;
        }

        if (!loading && results.length === 0) {
            const timer = setTimeout(() => {
                setShowNoResults(true);
            }, 800); //secondi di attesa

            return () => clearTimeout(timer);
        } else {
            setShowNoResults(false);
        }
    }, [query, results, loading]);

    //ricerca città con debounce
    const searchCity = useCallback(
        debounce(async (text) => {
            if (!text || text.length < 2) {
                setResults([]);
                return;
            }
            setLoading(true);
            try {
                //API di Open-Meteo per ricerca città
                const baseUrl = "https://geocoding-api.open-meteo.com/v1/search";

                //la lingua usata nella query è la stessa scelta dall’utente nell’app
                //    - se language="it" > risultati in italiano
                //    - se language="en" > risultati in inglese
                const url = `${baseUrl}?name=${encodeURIComponent(
                    text
                )}&count=50&language=${language}&format=json`;

                //richiesta GET all'URL che restituisce una promise che si risolve con un oggetto res
                const res = await fetch(url);
                //converto il body della risposta HTTP in json; si usa await perché res.json() restituisce una Promise
                const data = await res.json();

                if (data?.results) {
                    //mappa per città già "viste", per evitare duplicati
                    const seen = new Map();

                    data.results.forEach((item) => {
                        const key = `${normalizeName(item.name)}-${item.latitude}-${item.longitude}`;
                        if (!seen.has(key)) {
                            seen.set(key, {
                                name: String(item.name || ""),
                                region: item.admin1 ? String(item.admin1) : "",
                                country: item.country ? String(item.country) : "",
                                lat: item.latitude,
                                lon: item.longitude,
                            });
                        } else {
                            const existing = seen.get(key);
                            if (hasAccent(item.name) && !hasAccent(existing.name)) {
                                seen.set(key, {
                                    name: String(item.name || ""),
                                    region: item.admin1 ? String(item.admin1) : "",
                                    country: item.country ? String(item.country) : "",
                                    lat: item.latitude,
                                    lon: item.longitude,
                                });
                            }
                        }
                    });

                    //converto i valori della mappa in array e li passa a setResults
                    setResults(Array.from(seen.values()));
                } else {
                    setResults([]);
                }
            } catch (err) {
                console.warn("Errore ricerca città:", err);
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 500),
        [language] //al cambiare della lingua, le ricerche successive saranno in quella lingua
    );

    //registra subito quello che scrive l'utente aggiornando lo stato query
    const handleChange = (text) => {
        setQuery(text);
        searchCity(text);
    };

    return (
        <View style={styles.container}>
            {/* SE la modale è chiusa > mostro l’input nella schermata */}
            {!modalVisible && (
                <TextInput
                    style={styles.input}
                    placeholder={translations?.[language]?.searchCity}
                    placeholderTextColor="darkgrey"
                    value={query}
                    onFocus={() => setModalVisible(true)} // apro la modale quando riceve focus
                />
            )}

            {/* SE la modale è aperta > mostro la modale */}
            {modalVisible && (
                <Modal
                    transparent
                    statusBarTranslucent
                    animationType="fade"
                    visible={modalVisible}
                    onRequestClose={() => {
                        setModalVisible(false)
                        setQuery("");
                        setResults([]);
                        setShowNoResults(false);
                    }}
                >
                    <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

                    <TouchableWithoutFeedback onPress={() => {
                        setModalVisible(false);
                        setQuery("");
                        setResults([]);
                        setShowNoResults(false);
                    }}>
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
                                    onPress={() => setQuery("")}
                                    style={{
                                        position: "absolute",
                                        right: 12,
                                        top: "50%",
                                        transform: [{ translateY: -10 }],
                                    }}
                                >
                                    <Text style={{ fontSize: 18, color: "#888" }}>✕</Text>
                                </Pressable>
                            )}
                        </View>

                        {loading && <ActivityIndicator size="small" color="gray" />}

                        {showNoResults ? (
                            <Text style={styles.noResults}>
                                {translations?.[language]?.noResults}
                            </Text>
                        ) : (
                            <FlatList
                                data={results}
                                keyExtractor={(item) => `${item.lat}-${item.lon}`}
                                renderItem={
                                    ({ item }) => (
                                        <Pressable
                                            style={styles.item}
                                            onPress={
                                                () => {
                                                    onSelectCity(item);
                                                    setQuery("");
                                                    setResults([]);
                                                    setModalVisible(false);
                                                }
                                            }
                                        >
                                            <Text style={styles.cityName}>
                                                {String(item.name || "")}
                                                {item.region ? `, ${String(item.region)}` : ""}
                                                {item.country ? `, ${String(item.country)}` : ""}
                                            </Text>
                                        </Pressable>
                                    )}
                            />
                        )}
                    </View>

                </Modal >
            )
            }
        </View >
    );
}

export default React.memo(CitySearch);

const styles = StyleSheet.create({
    container: {
        margin: 10,
        marginBottom: 0
    },

    input: {
        backgroundColor: "#FFFFFF",
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 12,
        fontSize: Platform.OS === "android" ? 14 : 15,
        color: "#000000"
    },

    overlay: {
        backgroundColor: "rgba(0,0,0,0.78)",
        ...StyleSheet.absoluteFillObject,
    },

    modalBox: {
        position: "absolute",
        top: 80,
        left: 20,
        right: 20,
        backgroundColor: "#2A2A2A",
        borderRadius: 16,
        padding: 14,
        maxHeight: "70%",
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 6
    },

    noResults: {
        textAlign: "center",
        marginTop: 20,
        fontSize: 15,
        color: "#BBBBBB",
        fontStyle: "italic"
    },

    item: {
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#444"
    },

    cityName: {
        fontSize: 16,
        color: "#FFFFFF",
        fontWeight: "500"
    }
})






