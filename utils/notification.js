import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations } from '../utils/translations';

export async function scheduleDaily10AM(lang = 'it') {
    try {
        //cancello eventuali vecchie notifiche "dailyWeather"
        const all = await Notifications.getAllScheduledNotificationsAsync();
        for (const n of all) {
            if (n.content.data?.type === 'dailyWeather') {
                await Notifications.cancelScheduledNotificationAsync(n.identifier);
            }
        }

        await AsyncStorage.removeItem('dailyWeatherScheduled');

        //controllo permessi
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            console.log('Permessi notifica negati.');
            return;
        }

        // calcolo la prossima ora locale 10:00
        const now = new Date();
        const trigger = new Date(now);
        trigger.setHours(10, 0, 0, 0);
        if (trigger <= now) {
            // se sono già passate le 10, programmo per domani
            trigger.setDate(trigger.getDate() + 1);
        }

        // schedulo la notifica singola
        await Notifications.scheduleNotificationAsync({
            content: {
                title: 'FunWeather',
                body:
                    translations[lang]?.notificationBodyText ||
                    translations.it.notificationBodyText,
                sound: 'default',
                data: { type: 'dailyWeather' },
            },
            trigger,
        });

        // salvo il flag per evitare rischedulazioni inutili
        await AsyncStorage.setItem('dailyWeatherScheduled', 'true');
    } catch (error) {
        console.error('Errore nella programmazione della notifica:', error);
    }
}

// handler globale per le notifiche
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});
