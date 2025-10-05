// mappa codici meteo
const backgrounds = {
    0: require("../app/assets/backgrounds/soleggiato.png"),
    1: require("../app/assets/backgrounds/soleggiato.png"),
    2: require("../app/assets/backgrounds/parzialmente_nuvoloso.png"),
    3: require("../app/assets/backgrounds/nuvoloso.png"),
    45: require("../app/assets/backgrounds/nebbia.png"),
    48: require("../app/assets/backgrounds/nebbia.png"),
    51: require("../app/assets/backgrounds/pioggia_leggera.png"),
    53: require("../app/assets/backgrounds/pioggia_leggera.png"),
    55: require("../app/assets/backgrounds/pioggia_leggera.png"),
    56: require("../app/assets/backgrounds/pioggia_leggera.png"),
    57: require("../app/assets/backgrounds/pioggia_leggera.png"),
    61: require("../app/assets/backgrounds/pioggia_moderata.png"),
    63: require("../app/assets/backgrounds/pioggia_moderata.png"),
    65: require("../app/assets/backgrounds/pioggia_intensa.png"),
    66: require("../app/assets/backgrounds/pioggia_moderata.png"),
    67: require("../app/assets/backgrounds/pioggia_intensa.png"),
    80: require("../app/assets/backgrounds/pioggia_intensa.png"),
    81: require("../app/assets/backgrounds/nubifragio.png"),
    82: require("../app/assets/backgrounds/nubifragio.png"),
    71: require("../app/assets/backgrounds/neve_romantica.png"),
    73: require("../app/assets/backgrounds/neve_moderata.png"),
    75: require("../app/assets/backgrounds/bufera.png"),
    85: require("../app/assets/backgrounds/neve_moderata.png"),
    86: require("../app/assets/backgrounds/bufera.png"),
    95: require("../app/assets/backgrounds/temporale.png"),
    96: require("../app/assets/backgrounds/grandine.png"),
    99: require("../app/assets/backgrounds/grandine.png"),

    // fenomeni speciali
    afa_umidita: require("../app/assets/backgrounds/afa_umidita.png"),
    vento_forte: require("../app/assets/backgrounds/vento_forte.png"),
    gelo: require("../app/assets/backgrounds/gelo.png"),

    // varianti notturne
    afa_umidita_night: require("../app/assets/backgrounds/afa_umidita_night.png"),
    gelo_night: require("../app/assets/backgrounds/gelo_night.png"),
    nebbia_night: require("../app/assets/backgrounds/nebbia_night.png"),
    neve_night: require("../app/assets/backgrounds/neve_night.png"),
    nuvoloso_night: require("../app/assets/backgrounds/nuvoloso_night.png"),
    parzialmente_nuvoloso_night: require("../app/assets/backgrounds/parzialmente_nuvoloso_night.png"),
    pioggia_leggera_night: require("../app/assets/backgrounds/pioggia_leggera_night.png"),
    pioggia_moderata_night: require("../app/assets/backgrounds/pioggia_moderata_night.png"),
    pioggia_intensa_night: require("../app/assets/backgrounds/pioggia_intensa_night.png"),
    sereno_night: require("../app/assets/backgrounds/sereno_night.png"),
    vento_forte_night: require("../app/assets/backgrounds/vento_forte_night.png"),
};

// funzione helper: converte ora corrente in minuti dal mezzanotte nel fuso scelto
function minutesNowInTZ(tz) {
    const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: tz,
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    }).formatToParts(new Date());

    const h = parseInt(parts.find(p => p.type === "hour")?.value ?? "0", 10);
    const m = parseInt(parts.find(p => p.type === "minute")?.value ?? "0", 10);
    return h * 60 + m;
}

// funzione helper: parsifica stringa "YYYY-MM-DDTHH:MM" o "HH:MM" > minuti dal mezzanotte
function minutesFromStringHHMM(str) {
    if (!str) return 0;
    const timePart = str.includes("T") ? str.split("T")[1] : str;
    const [hh, mm] = timePart.split(":");
    const h = parseInt(hh, 10);
    const m = parseInt(mm, 10);
    return h * 60 + m;
}

// funzione per capire se è notte: prima dell’alba o dopo il tramonto
export function isNightByClock(tz, sunriseStr, sunsetStr) {
    if (!tz || !sunriseStr || !sunsetStr) return false;

    const nowMin = minutesNowInTZ(tz);
    const srMin = minutesFromStringHHMM(sunriseStr);
    const ssMin = minutesFromStringHHMM(sunsetStr);

    return nowMin < srMin || nowMin >= ssMin;
}

// funzione per validare la timezone
function safeTimeZone(tz) {
    try {
        if (!tz || typeof tz !== "string") return "UTC";
        new Date().toLocaleString("en-US", { timeZone: tz });
        return tz;
    } catch {
        return "UTC";
    }
}

// funzione principale che sceglie lo sfondo
export function getBackground(current, daily, timezone) {
    // fallback
    if (!current || !daily) return backgrounds.nuvoloso;

    // estraggo dal parametro current i dati meteo
    const { weather_code, temperature_2m, relative_humidity_2m, wind_speed_10m } = current;

    // uso la funzione robusta per validare la timezone
    const tz = safeTimeZone(timezone);

    // verifico se è notte
    const night = isNightByClock(tz, daily.sunrise?.[0], daily.sunset?.[0]);

    // scelta sfondo in base al codice + fallback
    let bg = backgrounds[weather_code] || backgrounds.nuvoloso;

    // override per condizioni speciali (afa / gelo / nebbia / vento forte)
    if (temperature_2m >= 30 && relative_humidity_2m >= 70) {
        bg = night
            ? backgrounds.afa_umidita_night || backgrounds.afa_umidita
            : backgrounds.afa_umidita;
    }

    if (temperature_2m <= 0) {
        bg = night
            ? backgrounds.gelo_night || backgrounds.gelo
            : backgrounds.gelo;
    }

    if ([45, 48].includes(weather_code)) {
        bg = night
            ? backgrounds.nebbia_night || backgrounds[45]
            : backgrounds[45];
    }

    if (wind_speed_10m >= 40) {
        bg = night
            ? backgrounds.vento_forte_night || backgrounds.vento_forte
            : backgrounds.vento_forte;
    }

    // varianti notturne standard (sole, nuvole, pioggia, neve)
    if (night) {
        if (weather_code === 0 || weather_code === 1) {
            bg = backgrounds.sereno_night || backgrounds[weather_code];
        }
        if (weather_code === 2) {
            bg = backgrounds.parzialmente_nuvoloso_night || backgrounds[2];
        }
        if (weather_code === 3) {
            bg = backgrounds.nuvoloso_night || backgrounds[3];
        }
        if ([51, 53, 55].includes(weather_code)) {
            bg = backgrounds.pioggia_leggera_night || backgrounds[51];
        }
        if ([61, 63].includes(weather_code)) {
            bg = backgrounds.pioggia_moderata_night || backgrounds[61];
        }
        if ([71, 73, 75, 85, 86].includes(weather_code)) {
            // unica immagine neve notturna
            bg = backgrounds.neve_night || backgrounds[71];
        }
        if (weather_code === 65) {
            bg = backgrounds.pioggia_intensa_night || backgrounds[65];
        }
    }

    return bg;
}
