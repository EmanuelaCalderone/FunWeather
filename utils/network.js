import * as Network from 'expo-network';

//funzione asincrona che controlla se l'utente è connesso a Internet
export async function checkConnection() {
    try {
        const status = await Network.getNetworkStateAsync();
        return status.isConnected;
    } catch (e) {
        return false;
    }
}
