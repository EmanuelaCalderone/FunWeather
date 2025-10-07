import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations } from '../utils/translations';

export async function scheduleDaily10AM(lang = 'it') {
    try {
        //se non ci sono notifiche attive, resetta il flag in AsyncStorage
        const scheduled = await Notifications.getAllScheduledNotificationsAsync();
        if (scheduled.length === 0) {
            await AsyncStorage.removeItem('dailyWeatherScheduled');
        }

        // controllo se la notifica è già stata programmata
        const alreadyScheduled = await AsyncStorage.getItem('dailyWeatherScheduled');
        if (alreadyScheduled === 'true') {
            console.log('Notifica già impostata (flag AsyncStorage).');
            return;
        }

        // controllo permessi notifiche
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

        // verifica notifiche già schedulate 
        const scheduledAgain = await Notifications.getAllScheduledNotificationsAsync();
        const alreadyScheduledNotification = scheduledAgain.some(
            (n) => n.content.data?.type === 'dailyWeather'
        );

        if (alreadyScheduledNotification) {
            console.log('Notifica giornaliera già programmata (Expo Notifications).');
            await AsyncStorage.setItem('dailyWeatherScheduled', 'true');
            return;
        }

        // programmo la notifica alle 10:00 ogni giorno
        const id = await Notifications.scheduleNotificationAsync({
            content: {
                title: 'FunWeather',
                body:
                    translations[lang]?.notificationBodyText ||
                    translations.it.notificationBodyText,
                sound: 'default',
                data: { type: 'dailyWeather' },
            },
            trigger: {
                hour: 10,
                minute: 0,
                repeats: true,
            },
        });

        // salvo lo stato per evitare rischedulazioni future
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
