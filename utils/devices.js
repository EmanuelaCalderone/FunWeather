import { Dimensions } from "react-native";

export const isTablet = () => {
    const { width, height } = Dimensions.get("window");
    return Math.min(width, height) >= 600;
};
