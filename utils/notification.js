import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { translations } from '../utils/translations';

const DAILY_TYPE = 'dailyWeather';
const DAILY_CHANNEL_ID = 'daily';

async function ensureAndroidChannel() {
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync(DAILY_CHANNEL_ID, {
            name: 'Notifiche giornaliere',
            importance: Notifications.AndroidImportance.DEFAULT,
            sound: 'default',
        });
    }
}

export async function scheduleDaily10AM(lang = 'it') {
    try {
        await ensureAndroidChannel();

        // permessi
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            console.log('❌ Permessi notifica negati.');
            return;
        }

        //controllo se esiste già
        const scheduled = await Notifications.getAllScheduledNotificationsAsync();
        const existing = scheduled.find(n => n?.content?.data?.type === DAILY_TYPE);

        //verifico lingua
        if (existing && existing.content?.data?.lang === lang) {
            return;
        }

        //cambio lingua
        if (existing) {
            await Notifications.cancelScheduledNotificationAsync(existing.identifier);
        }

        //pianifico la notifica alle 10:00
        const trigger = {
            hour: 10,
            minute: 0,
            repeats: true,
        };

        await Notifications.scheduleNotificationAsync({
            content: {
                title: 'FunWeather',
                body:
                    (translations[lang] && translations[lang].notificationBodyText) ||
                    translations.it.notificationBodyText,
                sound: 'default',
                data: { type: DAILY_TYPE, lang },
                channelId: DAILY_CHANNEL_ID,
            },
            trigger,
        });

    } catch (error) {
        console.error('Errore nella programmazione della notifica:', error);
    }
}
