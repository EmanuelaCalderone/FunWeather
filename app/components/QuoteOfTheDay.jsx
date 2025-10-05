import quotes from "../data/quotes.json";
import { View, Text, StyleSheet } from "react-native";
import { useContext } from "react";
import { SettingsContext } from "../../context/SettingsContext";
import { translations } from "../../utils/translations";
import React from "react";
//responsive
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

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
        borderRadius: 16,
        backgroundColor: "rgba(117, 114, 114, 0.35)",
        height: 250,
        width: 350,
        paddingHorizontal: 24,
    },

    quote: {
        fontSize: 20,
        fontStyle: "italic",
        lineHeight: 28,
        color: "white",
        textAlign: "center",
        fontWeight: "400",
        includeFontPadding: false, // Android: niente spazio extra sopra/sotto
        textAlignVertical: "center" // Android: aiuta la centratura
    }
});




