import React, { useContext } from "react";
import { Modal, View, Text, Pressable, StyleSheet, Linking } from "react-native";
import { SettingsContext } from "../../context/SettingsContext";
import { translations } from "../../utils/translations";
import { Ionicons } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
//responsive
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export default function InfoModal({ visible, onClose }) {
    const { language } = useContext(SettingsContext);
    const t = translations[language]?.info || translations.it.info;

    // Apertura link esterno per supporto
    const handleBuyCoffee = () => {
        Linking.openURL("https://www.buymeacoffee.com/emanuelacld");
    };

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={true}
            statusBarTranslucent
        >
            <View style={styles.overlay}>
                <View style={styles.box}>
                    <Text style={styles.title}>{t.title}</Text>
                    <Text style={styles.author}>{t.author}</Text>
                    <Text style={styles.toContact}>{t.bug}</Text>

                    <View style={styles.linksRow}>
                        <Pressable onPress={() => Linking.openURL("mailto:emanuelacld@icloud.com")}>
                            <Ionicons name="mail-outline" style={styles.icon} />
                        </Pressable>

                        <Pressable onPress={() => Linking.openURL("https://github.com/EmanuelaCalderone")}>
                            <FontAwesome name="github" style={styles.icon} />
                        </Pressable>

                        <Pressable onPress={() => Linking.openURL("https://www.linkedin.com/in/emanuela-calderone-webdeveloper/")}>
                            <FontAwesome name="linkedin" style={styles.icon} />
                        </Pressable>
                    </View>

                    {/* Bottone Offrimi un caffè */}
                    <Pressable style={styles.coffeeButton} onPress={() => Linking.openURL("https://www.buymeacoffee.com/emanuelacld")}>
                        <Text style={styles.support}>☕ {t.support}</Text>
                    </Pressable>


                    <Pressable style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.support}>{t.close}</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0, 0, 0, 0.78)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },

    box: {
        width: "85%",
        borderRadius: 20,
        padding: 26,
        alignItems: "center",
        backgroundColor: "#2A2A2A",
        shadowColor: "#000000ff",
        shadowOpacity: 0.25,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 8 },
        elevation: 10,
    },
    title: {
        fontSize: 22,
        fontWeight: "700",
        color: "#FFFFFF",
        marginBottom: 12,
        textAlign: "center",
    },
    author: {
        fontSize: 16,
        fontWeight: "600",
        color: "white",
        marginBottom: 8,
        textAlign: "center",
    },
    toContact: {
        marginTop: 8,
        marginBottom: 8,
        fontSize: 15,
        color: "#B0B0B0",
        textAlign: "center",
    },
    linksRow: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 16,
        gap: 24,
    },
    icon: {
        color: "#CCCCCC",
        fontSize: 28,
    },
    coffeeButton: {
        marginTop: 16,
        backgroundColor: "#FFFFFF",
        paddingVertical: 12,
        paddingHorizontal: 28,
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "center",
    },
    support: {
        fontSize: 15,
        fontWeight: "600",
        textAlign: "center",
    },
    closeButton: {
        marginTop: 14,
        backgroundColor: "#CCCCCC",
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 30,
        alignItems: "center"
    }
});








