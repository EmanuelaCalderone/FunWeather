import React from "react";
import { Ionicons, FontAwesome5, MaterialIcons } from "@expo/vector-icons";

//mappa codici meteo -> icona (libreria, nome, colore di default)
const ICON_MAP = {
    0: { comp: Ionicons, name: "sunny-outline", color: "white" },
    1: { comp: Ionicons, name: "sunny-outline", color: "white" },
    2: { comp: Ionicons, name: "partly-sunny-outline", color: "white" },
    3: { comp: Ionicons, name: "cloud-outline", color: "white" },
    45: { comp: Ionicons, name: "cloud-outline", color: "white" },
    48: { comp: Ionicons, name: "cloud-outline", color: "white" },
    51: { comp: Ionicons, name: "rainy-outline", color: "white" },
    53: { comp: Ionicons, name: "rainy-outline", color: "white" },
    55: { comp: Ionicons, name: "rainy-outline", color: "white" },
    56: { comp: Ionicons, name: "snow-outline", color: "white" },
    57: { comp: Ionicons, name: "snow-outline", color: "white" },
    61: { comp: Ionicons, name: "rainy-outline", color: "white" },
    63: { comp: Ionicons, name: "rainy-outline", color: "white" },
    65: { comp: Ionicons, name: "rainy-outline", color: "white" },
    66: { comp: Ionicons, name: "snow-outline", color: "white" },
    67: { comp: Ionicons, name: "snow-outline", color: "white" },
    71: { comp: MaterialIcons, name: "ac-unit", color: "white" },
    73: { comp: MaterialIcons, name: "ac-unit", color: "white" },
    75: { comp: MaterialIcons, name: "ac-unit", color: "white" },
    80: { comp: Ionicons, name: "rainy-outline", color: "white" },
    81: { comp: Ionicons, name: "rainy-outline", color: "white" },
    82: { comp: Ionicons, name: "rainy-outline", color: "white" },
    85: { comp: Ionicons, name: "snow-outline", color: "white" },
    86: { comp: Ionicons, name: "snow-outline", color: "white" },
    95: { comp: FontAwesome5, name: "poo-storm", color: "white" },
    96: { comp: FontAwesome5, name: "poo-storm", color: "white" },
    99: { comp: FontAwesome5, name: "poo-storm", color: "white" },
    default: { comp: Ionicons, name: "help-circle-outline", color: "white" },
};

// Componente React che mostra l'icona meteo corretta in base al codice passato.
// Utilizza ICON_MAP per determinare la libreria, il nome e il colore dell'icona.
// Se è notte (night === true), applica un override visivo per evitare icone solari inappropriate.
// Wrappato in React.memo per evitare re-render inutili quando le props non cambiano.
export const WeatherIcon = React.memo(function WeatherIcon({ code, size = 24, color, night = false }) {
    const entry = ICON_MAP[code] ?? ICON_MAP.default;
    const Comp = entry.comp;

    // override visivo per la notte
    let iconName = entry.name;
    if (night) {
        if (code === 0 || code === 1) iconName = "moon-outline"; // cielo sereno notturno
        if (code === 2) iconName = "cloudy-night-outline"; // parzialmente nuvoloso notturno
    }

    return <Comp name={iconName} size={size} color={color ?? entry.color} />;
});
