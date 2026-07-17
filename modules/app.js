import { state } from './store.js';
import { login, logout, initAuth } from './auth.js';
import { fetchCatatan, simpanCatatan, hapusCatatan, updateCatatan } from './catatan.js';
import { fetchPengeluaran, simpanPengeluaran, hapusPengeluaran, updatePengeluaran } from './pengeluaran.js';
import { fetchAkun, simpanAkun, hapusAkun } from './akun.js';
import { updateTanggalHeader, gantiTab, renderLayarUtama } from './ui.js';
import { dekripsi, showToast } from './helper.js';
import { updateDropdownBulan, renderLayarBulanan, downloadPDF } from './rekap.js';
import { el } from './dom.js';

const tzoffset = (new Date()).getTimezoneOffset() * 60000;
el.inputTanggal.value = (new Date(Date.now() - tzoffset)).toISOString().slice(0, 10);
updateTanggalHeader();

initAuth(
    () => {
        el.areaLogin.style.display = 'none';
        el.areaApp.style.display = 'block';
        el.infoUser.innerText = `Halo, ${state.currentUser.user_metadata.full_name || 'Pengguna'}!`;
        
        if (!state.dataSudahDitarikAwal) {
            state.dataSudahDitarikAwal = true;
            setTimeout(() => { initData(); }, 150);
        }
    },
    () => {
        el.areaLogin.style.display = 'block';
        el.areaApp.style.display = 'none';
        el.infoUser.innerText = "";
    }
);

async function initData() {
    await Promise.all([
        fetchCatatan(),
        fetchPengeluaran(),
        fetchAkun()
    ]);
    renderLayarUtama();
}

function ubahTanggalHari(selisih) {
    const tgl = el.inputTanggal.value;
    if (!tgl) return;
    const dateObj = new Date(tgl);
    dateObj.setDate(dateObj.getDate() + selisih);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    el.inputTanggal.value = `${year}-${month}-${day}`;
    updateTanggalHeader();
    renderLayarUtama();
}

function autoResize() {
    if (this.value === "") { 
        this.style.height = '44px'; 
        return; 
    }
    this.style.height = '44px';
    this.style.height = (this.scrollHeight + 2) + 'px';
}

el.btnLogin.addEventListener('click', login);
el.btnLogout.addEventListener('click', logout);

el.btnMenuCatatan.addEventListener('click', () => gantiTab('catatan'));
el.btnMenuPengeluaran.addEventListener('click', () => gantiTab('pengeluaran'));
el.btnMenuAkun.addEventListener('click', () => gantiTab('akun'));

el.btnPrevTanggal.addEventListener('click', () => ubahTanggalHari(-1));
el.btnNextTanggal.addEventListener('click', () => ubahTanggalHari(1));
el.inputTanggal.addEventListener('change', () => {
    updateTanggalHeader();
    renderLayarUtama();
});

el.inputCari.addEventListener('input', () => {
    renderLayarUtama();
});

el.btnSimpanCatatan.addEventListener('click', async () => {
    const teks = el.inputCatatan.value.trim();
    const tgl = el.inputTanggal.value;
    const sukses = await simpanCatatan(teks, tgl);
    if (sukses) {
        el.inputCatatan.value = "";
        el.inputCatatan.style.height = "44px";
        renderLayarUtama();
    }
});

el.btnSimpanPengeluaran.addEventListener('click', async () => {
    const nama = el.inputNamaPengeluaran.value.trim();
    const nominal = el.inputNominalPengeluaran.value;
    const kategori = el.inputKategoriPengeluaran.value;
    const tgl = el.inputTanggal.value;
    const sukses = await simpanPengeluaran(nama, nominal, kategori, tgl);
    if (sukses) {
        el.inputNamaPengeluaran.value = "";
        el.inputNominalPengeluaran.value = "";
        renderLayarUtama();
    }
});

el.btnSimpanAkun.addEventListener('click', async () => {
    const platform = el.inputNamaPlatform.value.trim();
    const username = el.inputUsername.value.trim();
    const password = el.inputPasswordAkun.value;
    const pinMaster = el.inputPinMaster.value;
    const sukses = await simpanAkun(platform, username, password, pinMaster);
    if (sukses) {
        el.inputNamaPlatform.value = "";
        el.inputUsername.value = "";
        el.inputPasswordAkun.value = "";
        renderLayarUtama();
    }
});

el.daftarItem.addEventListener('click', async function(e) {
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
    
    if (btn.classList.contains('btn-hapus')) {
        if (confirm("Yakin ingin menghapus data ini?")) {
            let sukses = false;
            if (jenis === 'catatan') sukses = await hapusCatatan(idItem);
            else if (jenis === 'pengeluaran') sukses = await hapusPengeluaran(idItem);
            else if (jenis === 'akun') sukses = await hapusAkun(idItem);
            if (sukses) renderLayarUtama();
        }
    }
    
    if (btn.classList.contains('btn-edit') && jenis === 'pengeluaran') {
        const namaLama = btn.getAttribute('data-nama');
        const hargaLama = btn.getAttribute('data-harga');
        const kategoriLama = btn.getAttribute('data-kategori');
        el.inputEditNamaPengeluaran.value = namaLama;
        el.inputEditNominalPengeluaran.value = hargaLama;
        el.inputEditKategoriPengeluaran.value = kategoriLama;
        el.overlayModal.style.display = 'block';
        el.modalEditPengeluaran.style.display = 'block';
        state.idPengeluaranEditAktif = idItem;
    }
    
    if (btn.classList.contains('btn-edit') && jenis === 'catatan') {
        const teksLama = btn.closest('li').querySelector('.isi-teks').innerText;
        el.inputEditCatatan.value = teksLama;
        el.overlayModal.style.display = 'block';
        el.modalEdit.style.display = 'block';
        state.idCatatanEditAktif = idItem;
    }
    
    if (btn.classList.contains('btn-lihat') || btn.classList.contains('btn-copy')) {
        const teksAcak = btn.getAttribute('data-pass');
        const pinMaster = el.inputPinMaster.value;
        if (!pinMaster) { 
            showToast("Isi PIN Master di atas!", "error"); 
            return; 
        }
        
        const hasilDekripsi = dekripsi(teksAcak, pinMaster);
        if (!hasilDekripsi) { 
            showToast("Gagal! PIN Master salah.", "error"); 
            return; 
        }
        
        if (btn.classList.contains('btn-lihat')) {
            const elRahasia = btn.closest('li').querySelector('.teks-rahasia');
            if (btn.innerText.includes('👁️')) {
                elRahasia.innerText = hasilDekripsi; 
                elRahasia.style.color = "#333"; 
                elRahasia.style.letterSpacing = "normal";
                btn.innerText = "🔒"; 
                btn.setAttribute("title", "Tutup");
            } else {
                elRahasia.innerText = "••••••••"; 
                elRahasia.style.color = "#868e96"; 
                elRahasia.style.letterSpacing = "3px";
                btn.innerText = "👁️"; 
                btn.setAttribute("title", "Lihat");
            }
        } else {
            navigator.clipboard.writeText(hasilDekripsi).then(() => showToast("Password disalin!", "success"));
        }
    }
});

el.btnBatalEdit.addEventListener('click', () => {
    el.overlayModal.style.display = 'none';
    el.modalEdit.style.display = 'none';
    state.idCatatanEditAktif = null;
});

el.btnSimpanEdit.addEventListener('click', async () => {
    const teksBaru = el.inputEditCatatan.value.trim();
    if (teksBaru && state.idCatatanEditAktif) {
        const sukses = await updateCatatan(state.idCatatanEditAktif, teksBaru);
        if (sukses) {
            el.overlayModal.style.display = 'none';
            el.modalEdit.style.display = 'none';
            state.idCatatanEditAktif = null;
            renderLayarUtama();
        }
    }
});

el.btnBatalEditPengeluaran.addEventListener('click', () => {
    el.overlayModal.style.display = 'none';
    el.modalEditPengeluaran.style.display = 'none';
    state.idPengeluaranEditAktif = null;
});

el.btnSimpanEditPengeluaran.addEventListener('click', async () => {
    const namaBaru = el.inputEditNamaPengeluaran.value.trim();
    const hargaBaru = el.inputEditNominalPengeluaran.value;
    const kategoriBaru = el.inputEditKategoriPengeluaran.value;
    
    if (state.idPengeluaranEditAktif) {
        const sukses = await updatePengeluaran(state.idPengeluaranEditAktif, namaBaru, hargaBaru, kategoriBaru);
        if (sukses) {
            el.overlayModal.style.display = 'none';
            el.modalEditPengeluaran.style.display = 'none';
            state.idPengeluaranEditAktif = null;
            renderLayarUtama();
        }
    }
});

el.btnBukaSebulan.addEventListener('click', () => {
    if (state.modeAktif === 'catatan') {
        el.areaUtama.style.display = 'none';
        el.areaBulanan.style.display = 'block';
        updateDropdownBulan(el.inputTanggal.value);
        el.inputBulanRekap.value = el.inputTanggal.value.substring(0, 7);
        renderLayarBulanan();
    } else if (state.modeAktif === 'pengeluaran') {
        el.wadahInputPengeluaran.classList.add('tampil');
        el.inputNamaPengeluaran.focus();
    }
});

el.boxTotalBulan.addEventListener('click', () => {
    el.areaUtama.style.display = 'none';
    el.areaBulanan.style.display = 'block';
    updateDropdownBulan(el.inputTanggal.value);
    el.inputBulanRekap.value = el.inputTanggal.value.substring(0, 7);
    renderLayarBulanan();
});

el.inputBulanRekap.addEventListener('change', renderLayarBulanan);
el.btnKembali.addEventListener('click', () => { 
    el.areaBulanan.style.display = 'none'; 
    el.areaUtama.style.display = 'block'; 
});
el.btnDownloadPDF.addEventListener('click', downloadPDF);

el.inputCatatan.addEventListener('input', autoResize);
el.inputEditCatatan.addEventListener('input', autoResize);

el.btnTambahCatatan.addEventListener('click', () => {
    el.wadahInputCatatan.classList.add('tampil');
    el.btnTambahCatatan.style.display = 'none';
    el.inputCatatan.focus();
});

el.btnBatalCatatan.addEventListener('click', () => {
    el.wadahInputCatatan.classList.remove('tampil');
    el.btnTambahCatatan.style.display = 'block';
    el.inputCatatan.value = "";
    el.inputCatatan.style.height = "44px";
});

el.btnBatalPengeluaran.addEventListener('click', () => {
    el.wadahInputPengeluaran.classList.remove('tampil');
    el.inputNamaPengeluaran.value = "";
    el.inputNominalPengeluaran.value = "";
});

el.btnTambahAkun.addEventListener('click', () => {
    el.wadahInputAkun.classList.add('tampil');
    el.btnTambahAkun.style.display = 'none';
    el.inputNamaPlatform.focus();
});

el.btnBatalAkun.addEventListener('click', () => {
    el.wadahInputAkun.classList.remove('tampil');
    el.btnTambahAkun.style.display = 'flex';
    el.inputNamaPlatform.value = "";
    el.inputUsername.value = "";
    el.inputPasswordAkun.value = "";
});

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.lang = 'id-ID'; 
    recognition.interimResults = false;
    
    el.btnSuaraCatatan.addEventListener('click', () => {
        if (el.btnSuaraCatatan.classList.contains('merekam')) {
            recognition.stop();
            el.btnSuaraCatatan.classList.remove('merekam');
            el.btnSuaraCatatan.innerText = "🎤";
            showToast("Batal merekam", "normal");
            
            if (window.innerWidth <= 500 && el.wadahInputCatatan.classList.contains('tampil') && el.inputCatatan.value.trim() === '') {
                el.wadahInputCatatan.classList.remove('tampil');
                el.btnTambahCatatan.style.display = 'block';
            }
        } else {
            recognition.start();
            el.btnSuaraCatatan.classList.add('merekam');
            el.btnSuaraCatatan.innerText = "🔴";
            showToast("Silakan bicara...", "normal");
            
            if (window.innerWidth <= 500 && !el.wadahInputCatatan.classList.contains('tampil')) {
                el.wadahInputCatatan.classList.add('tampil');
                el.btnTambahCatatan.style.display = 'none';
            }
        }
    });
    
    recognition.onresult = (event) => {
        const hasil = event.results[0][0].transcript;
        el.inputCatatan.value = el.inputCatatan.value ? el.inputCatatan.value + " " + hasil : hasil;
        el.inputCatatan.dispatchEvent(new Event('input'));
        el.btnSuaraCatatan.classList.remove('merekam'); 
        el.btnSuaraCatatan.innerText = "🎤";
        showToast("Suara ditangkap!", "success");
    };
    
    recognition.onerror = () => { 
        el.btnSuaraCatatan.classList.remove('merekam'); 
        el.btnSuaraCatatan.innerText = "🎤"; 
    };
    
    recognition.onend = () => { 
        el.btnSuaraCatatan.classList.remove('merekam'); 
        el.btnSuaraCatatan.innerText = "🎤"; 
    };
} else {
    el.btnSuaraCatatan.style.display = 'none';
}
