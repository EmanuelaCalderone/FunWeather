import React, { useContext } from "react";
import { Modal, View, Text, Pressable, StyleSheet, Linking } from "react-native";
import { SettingsContext } from "../../context/SettingsContext";
import { translations } from "../../utils/translations";
import { Ionicons } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
//responsive
import { isTablet, scaledSize } from "../../utils/devices";


export default function InfoModal({ visible, onClose }) {
    const { language } = useContext(SettingsContext);
    const t = translations[language]?.info || translations.it.info;

    //apertura link esterno per supporto
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
        padding: isTablet() ? scaledSize(20) : 20,
    },

    box: {
        width: isTablet() ? "70%" : "85%",
        borderRadius: isTablet() ? scaledSize(20) : 20,
        padding: isTablet() ? scaledSize(24) : 26,
        alignItems: "center",
        backgroundColor: "#2A2A2A",
        shadowColor: "#000000ff",
        shadowOpacity: 0.25,
        shadowRadius: isTablet() ? scaledSize(16) : 20,
        shadowOffset: { width: 0, height: isTablet() ? 8 : 8 },
        elevation: 10,
    },

    title: {
        fontSize: isTablet() ? scaledSize(18) : 22,
        fontWeight: "700",
        color: "#FFFFFF",
        marginBottom: isTablet() ? scaledSize(10) : 12,
        textAlign: "center",
    },

    author: {
        fontSize: isTablet() ? scaledSize(14) : 16,
        fontWeight: "600",
        color: "white",
        marginBottom: isTablet() ? scaledSize(8) : 8,
        textAlign: "center",
    },

    toContact: {
        marginTop: isTablet() ? scaledSize(6) : 8,
        marginBottom: isTablet() ? scaledSize(6) : 8,
        fontSize: isTablet() ? scaledSize(12) : 15,
        color: "#B0B0B0",
        textAlign: "center",
    },

    linksRow: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: isTablet() ? scaledSize(12) : 16,
        gap: isTablet() ? scaledSize(16) : 24,
    },

    icon: {
        color: "#CCCCCC",
        fontSize: isTablet() ? scaledSize(24) : 28,
    },

    coffeeButton: {
        marginTop: isTablet() ? scaledSize(12) : 16,
        backgroundColor: "#FFFFFF",
        paddingVertical: isTablet() ? scaledSize(10) : 12,
        paddingHorizontal: isTablet() ? scaledSize(24) : 28,
        borderRadius: isTablet() ? scaledSize(24) : 30,
        alignItems: "center",
        justifyContent: "center",
    },

    support: {
        fontSize: isTablet() ? scaledSize(13) : 14,
        fontWeight: "550",
        textAlign: "center",
    },

    closeButton: {
        marginTop: isTablet() ? scaledSize(10) : 14,
        backgroundColor: "#CCCCCC",
        paddingVertical: isTablet() ? scaledSize(8) : 10,
        paddingHorizontal: isTablet() ? scaledSize(20) : 24,
        borderRadius: isTablet() ? scaledSize(24) : 30,
        alignItems: "center",
        justifyContent: "center",
    }
});










