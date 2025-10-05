import * as Notifications from 'expo-notifications';
import { translations } from '../utils/translations';

export async function scheduleDaily10AM(lang = 'it') {
    // richiedi permessi
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        console.log('Permessi notifica negati');
        return;
    }

    // verifica se la notifica giornaliera è già programmata
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const dailyAlreadyScheduled = scheduled.some(
        (n) => n.content.data?.type === 'dailyWeather'
    );

    if (dailyAlreadyScheduled) {
        console.log('Notifica giornaliera già programmata');
        return;
    }

    // calcola la prossima 10:00
    const now = new Date();
    const next10AM = new Date();
    next10AM.setHours(10, 0, 0, 0);
    if (now >= next10AM) {
        next10AM.setDate(next10AM.getDate() + 1);
    }

    await Notifications.scheduleNotificationAsync({
        content: {
            title: 'FunWeather',
            body: translations[lang]?.notificationBodyText || translations.it.notificationBodyText,
            sound: 'default',
            data: { type: 'dailyWeather' },
        },
        trigger: {
            date: next10AM,
            repeats: true,  //si ripete ogni giorno
        },
    });

    console.log('Notifica giornaliera programmata per le 10');
}
