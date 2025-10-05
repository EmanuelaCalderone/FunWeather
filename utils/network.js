import * as Network from 'expo-network';

//funzione asincrona che controlla se l'utente è connesso a Internet
export async function checkConnection() {
    try {
        const status = await Network.getNetworkStateAsync();
        console.log("Online?", status.isConnected);
        return status.isConnected;
    } catch (e) {
        console.warn("Errore nel controllo rete:", e);
        return false;
    }
}
