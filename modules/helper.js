import { el } from './dom.js';

export function showToast(pesan, tipe = "normal") {
    el.toastNotification.innerText = pesan;
    el.toastNotification.className = "toast show";
    if (tipe === "error") el.toastNotification.classList.add("error");
    if (tipe === "success") el.toastNotification.classList.add("success");
    setTimeout(() => { el.toastNotification.className = el.toastNotification.className.replace("show", ""); }, 1500);
}

export function enkripsi(teks, pin) { 
    return CryptoJS.AES.encrypt(teks, pin).toString(); 
}

export function dekripsi(teksAcak, pin) {
    try {
        const bytes = CryptoJS.AES.decrypt(teksAcak, pin);
        return bytes.toString(CryptoJS.enc.Utf8);
    } catch (e) { return ""; }
}

export function formatRupiah(angka) { 
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka); 
}

export function bersihkanTeks(teks) { 
    const d = document.createElement('div'); 
    d.innerText = teks; 
    return d.innerHTML; 
}

export function formatWaktuDetail() { 
    return new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }); 
}
