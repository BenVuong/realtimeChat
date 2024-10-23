import Pocketbase from 'pocketbase'
import { writable } from 'svelte/store'
export const pb = new Pocketbase(import.meta.env.VITE_PB_URL);
export const currentUser = writable(pb.authStore.model);

pb.authStore.onChange((auth)=>{
    console.log('authStore changed', auth);
    currentUser.set(pb.authStore.model);
});

