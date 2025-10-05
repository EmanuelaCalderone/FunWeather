import { View, Text, StyleSheet } from "react-native";
import React, { useContext } from "react";
import { SettingsContext } from "../../context/SettingsContext";
import { translations } from "../../utils/translations";
import quotes from "../data/quotes.json";
//responsive
import { isTablet, scaledSize } from "../../utils/devices";

function QuoteOfTheDay({ weatherCondition }) {
    //fallback: se SettingsContext è undefined o non ha language, usa "it"
    const { language = "it" } = useContext(SettingsContext) || {};

    //funzione per generare indice giornaliero casuale
    function getDailyIndex(max) {
        //data in formato ita
        const today = new Date().toLocaleDateString("it-IT");
        //conversione in stringa
        const hash = today.split("/").reverse().join("");
        //conversione stringa in num + modulo % max per ottenere un indice valido tra 0 e max-1
        return Number(hash) % max;
    }

    //in caso di frase non disponibile
    let todayQuote = translations[language].todayQuote || translations["it"].todayQuote;

    // Recupero condizione da translations (può essere stringa IT o oggetto EN)
    const cond = translations?.[language]?.conditions?.[weatherCondition];

    // calcolo chiave italiana in base alla lingua
    const conditionKeyIt =
        language === "en"
            ? cond?.keyIt
            : cond;

    //recupero lista di frasi
    const availableQuotes = conditionKeyIt ? quotes[conditionKeyIt]?.[language] : [];

    //se ci sono frasi disponibili, prendi quella del giorno
    if (availableQuotes && availableQuotes.length > 0) {
        todayQuote = availableQuotes[getDailyIndex(availableQuotes.length)];
    }

    //fallback
    if (typeof todayQuote !== "string") {
        todayQuote = "No quote available";
    }

    //a capo dopo ogni punto ma non dopo l'ultimo
    const formattedQuote = String(todayQuote || "No quote available")
        .trim()
        .replace(/\.(?!$)/g, ".\n");

    return (
        <View style={styles.container}>
            <Text style={styles.quote}>{formattedQuote}</Text>
        </View>
    );

}

export default React.memo(QuoteOfTheDay);

const styles = StyleSheet.create({
    container: {
        justifyContent: "center",
        alignItems: "center",
        borderRadius: isTablet() ? scaledSize(24) : 16,
        backgroundColor: "rgba(117, 114, 114, 0.35)",
        height: isTablet() ? scaledSize(220) : 220,
        width: isTablet() ? scaledSize(360) : 350,
        paddingHorizontal: isTablet() ? scaledSize(20) : 24,
        marginTop: isTablet() ? scaledSize(40) : 25,
        marginBottom: isTablet() ? scaledSize(40) : 25,
    },

    quote: {
        fontSize: isTablet() ? scaledSize(16) : 18,
        fontStyle: "italic",
        lineHeight: isTablet() ? scaledSize(22) : 26,
        color: "white",
        textAlign: "center",
        fontWeight: "400",
        includeFontPadding: false,
        textAlignVertical: "center",
    },
});






