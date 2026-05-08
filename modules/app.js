import { state } from './store.js';
import { login, logout, initAuth } from './auth.js';
import { fetchCatatan } from './catatan.js';
import { fetchPengeluaran } from './pengeluaran.js';
import { fetchAkun } from './akun.js';
import { updateTanggalHeader, gantiTab, renderLayarUtama } from './ui.js';
import { simpanCatatan, hapusCatatan, updateCatatan } from './catatan.js';
import { simpanPengeluaran, hapusPengeluaran } from './pengeluaran.js';
import { simpanAkun, hapusAkun } from './akun.js';
import { dekripsi, showToast } from './helper.js';
import { updateDropdownBulan, renderLayarBulanan, downloadPDF } from './rekap.js';

// 1. Inisialisasi Tanggal Hari Ini
const inputTanggal = document.getElementById('inputTanggalPilih');
const tzoffset = (new Date()).getTimezoneOffset() * 60000; 
inputTanggal.value = (new Date(Date.now() - tzoffset)).toISOString().slice(0, 10);
updateTanggalHeader(); 

// 2. Fungsi Utama: Menarik semua data setelah Login
async function initData() {
    console.log("Sedang menarik data dari Supabase...");
    await Promise.all([
        fetchCatatan(),
        fetchPengeluaran(),
        fetchAkun()
    ]);
    console.log("Data berhasil ditarik!");
    renderLayarUtama(); // Gambar data ke layar
}

// 3. Menjalankan Pemantau Sesi (Login/Logout)
initAuth(
    // JIKA LOGIN SUKSES
    () => {
        document.getElementById('areaLogin').style.display = 'none';
        document.getElementById('areaApp').style.display = 'block';
        document.getElementById('infoUser').innerText = `Halo, ${state.currentUser.user_metadata.full_name || 'Pengguna'}!`;
        
        // Mencegah tarik data berulang kali jika status berubah-ubah
        if (!state.dataSudahDitarikAwal) {
            state.dataSudahDitarikAwal = true; 
            setTimeout(() => { initData(); }, 150); // Jeda kecil untuk keamanan Supabase
        }
    },
    // JIKA LOGOUT
    () => {
        document.getElementById('areaLogin').style.display = 'block';
        document.getElementById('areaApp').style.display = 'none';
        document.getElementById('infoUser').innerText = "";
    }
);

// 4. Pasang Event Listener Tombol Utama
document.getElementById('btnLogin').addEventListener('click', login);
document.getElementById('btnLogout').addEventListener('click', logout);

// Event Listener Tab Menu
document.getElementById('btnMenuCatatan').addEventListener('click', () => gantiTab('catatan'));
document.getElementById('btnMenuPengeluaran').addEventListener('click', () => gantiTab('pengeluaran'));
document.getElementById('btnMenuAkun').addEventListener('click', () => gantiTab('akun'));

// ==========================================
// EVENT LISTENER TANGGAL & PENCARIAN
// ==========================================

// Fungsi untuk maju/mundur hari
function ubahTanggalHari(selisih) {
    const inputTanggal = document.getElementById('inputTanggalPilih');
    const tgl = inputTanggal.value;
    if(!tgl) return;
    
    const dateObj = new Date(tgl);
    dateObj.setDate(dateObj.getDate() + selisih);
    
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    
    inputTanggal.value = `${year}-${month}-${day}`;
    updateTanggalHeader(); // Update teks judul
    renderLayarUtama();    // Gambar ulang layar
}

// Pasang ke tombol < dan >
document.getElementById('btnPrevTanggal').addEventListener('click', () => ubahTanggalHari(-1));
document.getElementById('btnNextTanggal').addEventListener('click', () => ubahTanggalHari(1));

// (Ini kode yang sudah ada sebelumnya, biarkan saja)
inputTanggal.addEventListener('change', () => { 
    updateTanggalHeader(); 
    renderLayarUtama(); 
});
document.getElementById('inputCariItem').addEventListener('input', () => {
    renderLayarUtama();
});

// --- EVENT LISTENER SIMPAN DATA ---

// 1. Simpan Catatan
document.getElementById('btnSimpanCatatan').addEventListener('click', async () => {
    const inputCatatan = document.getElementById('inputCatatan');
    const teks = inputCatatan.value.trim();
    const tgl = inputTanggal.value;
    
    const sukses = await simpanCatatan(teks, tgl);
    if (sukses) {
        inputCatatan.value = ""; 
        inputCatatan.style.height = "44px";
        renderLayarUtama();
    }
});

// 2. Simpan Pengeluaran
document.getElementById('btnSimpanPengeluaran').addEventListener('click', async () => {
    const inputNama = document.getElementById('inputNamaPengeluaran');
    const inputNominal = document.getElementById('inputNominalPengeluaran');
    const tgl = inputTanggal.value;
    
    const sukses = await simpanPengeluaran(inputNama.value.trim(), inputNominal.value, tgl);
    if (sukses) {
        inputNama.value = ""; inputNominal.value = "";
        renderLayarUtama();
    }
});

// 3. Simpan Akun
document.getElementById('btnSimpanAkun').addEventListener('click', async () => {
    const inputPlatform = document.getElementById('inputNamaPlatform');
    const inputUsername = document.getElementById('inputUsername');
    const inputPassword = document.getElementById('inputPasswordAkun');
    const pinMaster = document.getElementById('inputPinMaster').value;
    
    const sukses = await simpanAkun(inputPlatform.value.trim(), inputUsername.value.trim(), inputPassword.value, pinMaster);
    if (sukses) {
        inputPlatform.value = ""; inputUsername.value = ""; inputPassword.value = "";
        renderLayarUtama();
    }
});

// --- EVENT LISTENER DELEGATION (Klik Daftar Item: Hapus, Edit, Copy, Lihat) ---
document.getElementById('daftarItem').addEventListener('click', async function(e) {
    // Fitur Copy Username
    const elUsername = e.target.closest('.teks-username-akun');
    if (elUsername) {
        const usernameAsli = elUsername.getAttribute('title'); 
        if (usernameAsli) {
            navigator.clipboard.writeText(usernameAsli).then(() => showToast("Username disalin!", "success"));
        }
        return;
    }

    const btn = e.target.closest('button');
    if (!btn) return;
    
    const idItem = btn.getAttribute('data-id');
    const jenis = btn.getAttribute('data-jenis'); 
    
    // Fitur Hapus
    if(btn.classList.contains('btn-hapus')) {
        if(confirm("Yakin ingin menghapus data ini?")) {
            let sukses = false;
            if (jenis === 'catatan') sukses = await hapusCatatan(idItem);
            else if (jenis === 'pengeluaran') sukses = await hapusPengeluaran(idItem);
            else if (jenis === 'akun') sukses = await hapusAkun(idItem);
            
            if (sukses) renderLayarUtama();
        }
    }
    
    // Fitur Buka Modal Edit Catatan
    if(btn.classList.contains('btn-edit') && jenis === 'catatan') {
        const isiLama = btn.closest('li').querySelector('.isi-teks').innerText;
        document.getElementById('inputEditCatatan').value = isiLama;
        document.getElementById('overlayModal').style.display = 'block';
        document.getElementById('modalEdit').style.display = 'block';
        state.idCatatanEditAktif = idItem; 
    }
    
    // Fitur Lihat/Copy Password
    if(btn.classList.contains('btn-lihat') || btn.classList.contains('btn-copy')) {
        const teksAcak = btn.getAttribute('data-pass');
        const pinMaster = document.getElementById('inputPinMaster').value;
        if (!pinMaster) { showToast("Isi PIN Master di atas!", "error"); return; }
        
        const hasilDekripsi = dekripsi(teksAcak, pinMaster);
        if (!hasilDekripsi) { showToast("Gagal! PIN Master salah.", "error"); return; }
        
        if(btn.classList.contains('btn-lihat')) {
            const elRahasia = btn.closest('li').querySelector('.teks-rahasia');
            if (btn.innerText.includes('👁️')) {
                elRahasia.innerText = hasilDekripsi; elRahasia.style.color = "#333"; elRahasia.style.letterSpacing = "normal";
                btn.innerText = "🔒"; btn.setAttribute("title", "Tutup");
            } else {
                elRahasia.innerText = "••••••••"; elRahasia.style.color = "#868e96"; elRahasia.style.letterSpacing = "3px";
                btn.innerText = "👁️"; btn.setAttribute("title", "Lihat");
            }
        } else {
            navigator.clipboard.writeText(hasilDekripsi).then(() => showToast("Password disalin!", "success"));
        }
    }
});

// Event Listener Modal Edit Catatan
document.getElementById('btnBatalEdit').addEventListener('click', () => {
    document.getElementById('overlayModal').style.display = 'none'; document.getElementById('modalEdit').style.display = 'none';
    state.idCatatanEditAktif = null;
});

document.getElementById('btnSimpanEdit').addEventListener('click', async () => {
    const teksBaru = document.getElementById('inputEditCatatan').value.trim();
    if (teksBaru && state.idCatatanEditAktif) {
        const sukses = await updateCatatan(state.idCatatanEditAktif, teksBaru);
        if (sukses) {
            document.getElementById('overlayModal').style.display = 'none'; 
            document.getElementById('modalEdit').style.display = 'none';
            state.idCatatanEditAktif = null;
            renderLayarUtama();
        }
    }
});

// ==========================================
// EVENT LISTENER: REKAP & GRAFIK (BULANAN)
// ==========================================
const areaUtama = document.getElementById('areaUtama');
const areaBulanan = document.getElementById('areaBulanan');

document.getElementById('btnBukaSebulan').addEventListener('click', () => {
    areaUtama.style.display = 'none'; 
    areaBulanan.style.display = 'block';
    updateDropdownBulan(document.getElementById('inputTanggalPilih').value); 
    document.getElementById('inputBulanRekap').value = document.getElementById('inputTanggalPilih').value.substring(0, 7); 
    renderLayarBulanan();
});

document.getElementById('inputBulanRekap').addEventListener('change', renderLayarBulanan);
document.getElementById('btnKembali').addEventListener('click', () => { areaBulanan.style.display = 'none'; areaUtama.style.display = 'block'; });
document.getElementById('btnDownloadPDF').addEventListener('click', downloadPDF);

// ==========================================
// EVENT LISTENER: UX MOBILE & ANIMASI UI
// ==========================================
// 1. Auto Resize Textarea
function autoResize() {
    if (this.value === "") { this.style.height = '44px'; return; }
    this.style.height = '44px'; 
    this.style.height = (this.scrollHeight + 2) + 'px'; 
}
document.getElementById('inputCatatan').addEventListener('input', autoResize);
document.getElementById('inputEditCatatan').addEventListener('input', autoResize);

// 2. Mobile Toggles (Tombol +)
const btnTambahCatatan = document.getElementById('btnTambahCatatan');
const wadahInputCatatan = document.getElementById('wadahInputCatatan');
btnTambahCatatan.addEventListener('click', () => {
    wadahInputCatatan.classList.add('tampil');
    btnTambahCatatan.style.display = 'none';
    document.getElementById('inputCatatan').focus();
});
document.getElementById('btnBatalCatatan').addEventListener('click', () => {
    wadahInputCatatan.classList.remove('tampil');
    btnTambahCatatan.style.display = 'block';
    document.getElementById('inputCatatan').value = ""; 
    document.getElementById('inputCatatan').style.height = "44px"; 
});

const btnTambahPengeluaran = document.getElementById('btnTambahPengeluaran');
const wadahInputPengeluaran = document.getElementById('wadahInputPengeluaran');
btnTambahPengeluaran.addEventListener('click', () => {
    wadahInputPengeluaran.classList.add('tampil');
    btnTambahPengeluaran.style.display = 'none';
    document.getElementById('inputNamaPengeluaran').focus();
});
document.getElementById('btnBatalPengeluaran').addEventListener('click', () => {
    wadahInputPengeluaran.classList.remove('tampil');
    btnTambahPengeluaran.style.display = 'block';
    document.getElementById('inputNamaPengeluaran').value = ""; 
    document.getElementById('inputNominalPengeluaran').value = ""; 
});

const btnTambahAkun = document.getElementById('btnTambahAkun');
const wadahInputAkun = document.getElementById('wadahInputAkun');
btnTambahAkun.addEventListener('click', () => {
    wadahInputAkun.classList.add('tampil');
    btnTambahAkun.style.display = 'none';
    document.getElementById('inputNamaPlatform').focus();
});
document.getElementById('btnBatalAkun').addEventListener('click', () => {
    wadahInputAkun.classList.remove('tampil');
    btnTambahAkun.style.display = 'flex'; 
    document.getElementById('inputNamaPlatform').value = ""; 
    document.getElementById('inputUsername').value = ""; 
    document.getElementById('inputPasswordAkun').value = ""; 
});

// ==========================================
// EVENT LISTENER: WEB SPEECH API (VOICE NOTE)
// ==========================================
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const btnSuara = document.getElementById('btnSuaraCatatan');
const inputCatatan = document.getElementById('inputCatatan');

if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.lang = 'id-ID'; recognition.interimResults = false;
    
    btnSuara.addEventListener('click', () => {
        if (btnSuara.classList.contains('merekam')) {
            recognition.stop();
            btnSuara.classList.remove('merekam'); 
            btnSuara.innerText = "🎤";
            showToast("Batal merekam", "normal");
            
            if (window.innerWidth <= 500 && wadahInputCatatan.classList.contains('tampil') && inputCatatan.value.trim() === '') {
                wadahInputCatatan.classList.remove('tampil');
                btnTambahCatatan.style.display = 'block';
            }
        } else { 
            recognition.start(); 
            btnSuara.classList.add('merekam'); 
            btnSuara.innerText = "🔴"; 
            showToast("Silakan bicara...", "normal"); 
            
            if (window.innerWidth <= 500 && !wadahInputCatatan.classList.contains('tampil')) {
                wadahInputCatatan.classList.add('tampil');
                btnTambahCatatan.style.display = 'none';
            }
        }
    });
    
    recognition.onresult = (event) => {
        const hasil = event.results[0][0].transcript;
        inputCatatan.value = inputCatatan.value ? inputCatatan.value + " " + hasil : hasil;
        inputCatatan.dispatchEvent(new Event('input')); // Memicu autoResize
        btnSuara.classList.remove('merekam'); btnSuara.innerText = "🎤";
        showToast("Suara ditangkap!", "success");
    };
    
    recognition.onerror = () => { btnSuara.classList.remove('merekam'); btnSuara.innerText = "🎤"; };
    recognition.onend = () => { btnSuara.classList.remove('merekam'); btnSuara.innerText = "🎤"; };
} else { 
    btnSuara.style.display = 'none'; 
}