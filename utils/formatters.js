//temperatura
export function formatTemp(temp, unit = "celsius") {
    if (typeof temp !== "number") return "";
    //se l'unità è celsius, arrotonda e aggiunge °C
    return unit === "celsius"
        ? `${Math.round(temp)}°C`
        //altrimenti arrotonda e aggiunge °F
        : `${Math.round((temp * 9) / 5 + 32)}°F`;
}

//vento
export function formatWind(wind, unit = "kmh") {
    if (typeof wind !== "number") return "";
    return unit === "kmh"
        ? `${Math.round(wind)} km/h`
        : `${Math.round(wind / 1.609)} mph`;
}

//orario
export function formatTime(dateString, opts = {}) {
    if (!dateString) return "";

    const { timeFormat = "24h", withMinutes = false } = opts;
    //se dateString è già un oggetto Date, lo usa direttamente, altrimenti lo converte
    const date = dateString instanceof Date ? dateString : new Date(dateString);

    //estraggo ora e minuti dall'oggetto Date
    let hours = date.getHours();
    let minutes = date.getMinutes();

    if (timeFormat === "12h") {
        //determino se è AM o PM in base all'ora
        const suffix = hours >= 12 ? "PM" : "AM";
        hours = hours % 12 || 12; // 0 diventa 12
        return withMinutes
            ? `${hours}:${minutes.toString().padStart(2, "0")} ${suffix}`
            : `${hours} ${suffix}`;
    }

    //se il formato è 24h: withMinutes è true, mostra anche i minuti (es. "13:05"), altrimenti solo l'ora
    return withMinutes
        ? `${hours}:${minutes.toString().padStart(2, "0")}`
        : `${hours}`; // niente zero davanti
}

