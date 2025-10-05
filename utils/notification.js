//libreria di Expo per gestire notifiche
import * as Notifications from 'expo-notifications';
//oggetto di React Native che dice su quale piattaforma gira l’app (android, ios, web)
import { Platform } from 'react-native';
import { translations } from "./translations";

//mostra notifiche anche in foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        // iOS: mostra banner e inserisci nella Notification List
        shouldShowBanner: true,
        shouldShowList: true,
        // comuni
        shouldPlaySound: false,
        shouldSetBadge: false,
    }),
});

//solo per Android: obbligatorio definire canale notifiche (richiesto per versione da 8+)
async function ensureAndroidChannel() {
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'Alerts',
            importance: Notifications.AndroidImportance.HIGH,
        });
    }
}

export async function scheduleDaily10AM(language) {
    const lang = String(language)
        .toLowerCase()
        .startsWith("en") ? "en" : "it";

    //chiedo lo status dei permessi per la notifica
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    //se l'accesso non è garantito, li chiede all'utente
    if (existingStatus !== "granted") {
        //popup di sistema
        const { status } = await Notifications.requestPermissionsAsync();
        //aggiorno status con risposta utente
        finalStatus = status;
    }

    //se non vengono concessi, lancia l'errore
    if (finalStatus !== "granted") {
        console.warn("Permessi notifica negati");
        return;
    }

    await ensureAndroidChannel();

    //evita duplicati: se già c’è, cancella prima di rischedulare
    const existing = await Notifications.getAllScheduledNotificationsAsync();
    for (const n of existing) {
        if (n.trigger?.repeats && n.trigger?.hour === 10 && n.trigger?.minute === 0) {
            await Notifications.cancelScheduledNotificationAsync(n.identifier);
        }
    }

    //usa traduzione corretta
    const notificationBodyText =
        translations[lang]?.notificationBodyText || translations.it.notificationBodyText;


    //programma ogni giorno alle 10:00
    await Notifications.scheduleNotificationAsync({
        content: {
            title: 'FunWeather',
            body: notificationBodyText,
        },
        trigger: {
            hour: 10,
            minute: 0,
            repeats: true,
            channelId: Platform.OS === 'android' ? 'default' : undefined,
        },
    });

}

