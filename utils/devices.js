import { Dimensions } from "react-native";

export const isTablet = () => {
    const { width, height } = Dimensions.get("window");
    return Math.min(width, height) >= 600;
};

// Base dimensioni di riferimento (iPhone 8)
const { width, height } = Dimensions.get("window");
const baseWidth = 375;
const baseHeight = 667;

//scala proporzionale (min tra larghezza e altezza)
export const scale = Math.min(width / baseWidth, height / baseHeight);

//funzione per ridimensionare qualsiasi valore
export const scaledSize = (size) => Math.round(size * scale);
