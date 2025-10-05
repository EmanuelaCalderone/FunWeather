import { useContext, useCallback } from "react";
import { SettingsContext } from "../context/SettingsContext";
//importo le funzioni da formatters.js
import { formatTemp as fTemp, formatWind as fWind, formatTime as fTime } from "../utils/formatters";

export function useFormatters() {
    const { unitTemp, unitWind, language, timeFormat } = useContext(SettingsContext);

    //temperatura
    const formatTemp = useCallback(
        (t) => fTemp(t, unitTemp),
        [unitTemp]
    );

    //vento
    const formatWind = useCallback(
        (w) => fWind(w, unitWind),
        [unitWind]
    );

    //orario
    //withMinutes: false (solo ore) / true (ore:minuti)
    const formatTime = useCallback(
        (dateString, withMinutes = false) =>
            fTime(dateString, { language, timeFormat, withMinutes }),
        [language, timeFormat]
    );

    return { formatTemp, formatWind, formatTime };
}
