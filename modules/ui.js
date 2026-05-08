import { state } from './store.js';
import { formatRupiah, bersihkanTeks } from './helper.js';

// Tangkap Elemen DOM
const inputTanggal = document.getElementById('inputTanggalPilih');
const inputCari = document.getElementById('inputCariItem');
const wadahCari = document.getElementById('wadahCari');
const wadahNavTanggal = document.getElementById('wadahNavTanggal');
const btnBukaSebulan = document.getElementById('btnBukaSebulan');
const daftarItem = document.getElementById('daftarItem');
const teksTanggalHeader = document.getElementById('teksTanggalHeader');

// 1. Fungsi Update Teks Tanggal di Header
export function updateTanggalHeader() {
    const tgl = inputTanggal.value;
    if(!tgl) return;
    const dateObj = new Date(tgl);
    teksTanggalHeader.innerText = dateObj.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

// 2. Fungsi Mengganti Tab Aktif
export function gantiTab(tab) {
    state.modeAktif = tab;
    
    // Ubah warna tombol tab
    document.getElementById('btnMenuCatatan').classList.toggle('aktif', tab === 'catatan');
    document.getElementById('btnMenuPengeluaran').classList.toggle('aktif', tab === 'pengeluaran');
    document.getElementById('btnMenuAkun').classList.toggle('aktif', tab === 'akun');
    
    // Tampilkan/sembunyikan area input
    document.getElementById('halamanCatatan').classList.toggle('aktif', tab === 'catatan');
    document.getElementById('halamanPengeluaran').classList.toggle('aktif', tab === 'pengeluaran');
    document.getElementById('halamanAkun').classList.toggle('aktif', tab === 'akun');
    
    if (inputCari) inputCari.value = ""; 
    
    // Logika Search Bar vs Tanggal
    if (tab === 'akun') {
        wadahNavTanggal.style.display = 'none';
        btnBukaSebulan.style.display = 'none';
        wadahCari.style.display = 'flex';
    } else {
        wadahNavTanggal.style.display = 'flex';
        btnBukaSebulan.style.display = 'flex';
        wadahCari.style.display = tab === 'catatan' ? 'flex' : 'none';
        btnBukaSebulan.innerText = tab === 'catatan' ? 'Catatan Bulan Ini' : 'Pengeluaran Bulan Ini';
    }
    
    // Gambar ulang layar sesuai tab
    renderLayarUtama();
}

// 3. Fungsi Inti: Menggambar Daftar Kartu (Catatan/Pengeluaran/Akun)
export function renderLayarUtama() {
    daftarItem.innerHTML = "";
    const tglPilih = inputTanggal.value; 
    const blnPilih = tglPilih.substring(0, 7); 
    const kataKunci = inputCari && wadahCari.style.display !== 'none' ? inputCari.value.toLowerCase() : "";
    
    // --- RENDER CATATAN ---
    if (state.modeAktif === "catatan") {
        let htmlCatatan = ""; let jumlahTampil = 0;
        state.dataCatatanPribadi.forEach(data => {
            let isi = data.isi || "";
            let tampilkan = kataKunci !== "" ? isi.toLowerCase().includes(kataKunci) : data.tanggal_db === tglPilih;
            if (tampilkan) {
                jumlahTampil++;
                const infoTanggal = kataKunci !== "" ? `<div style="font-size:12px; color:#4dabf7; font-weight:bold; margin-bottom:5px;">📅 ${data.tanggal_db}</div>` : "";
                htmlCatatan += `
                    <li>
                        ${infoTanggal}
                        <div class="header-kartu">
                            <div class="waktu-teks">🕒 Jam: ${data.jam_input || '-'}</div>
                            <div class="grup-tombol-kecil">
                                <button class="btn-aksi btn-edit" data-id="${data.id}" data-jenis="catatan" title="Edit">✏️</button>
                                <button class="btn-aksi btn-hapus" data-id="${data.id}" data-jenis="catatan" title="Hapus">🗑️</button>
                            </div>
                        </div>
                        <span class="isi-teks">${bersihkanTeks(isi)}</span>
                    </li>`;
            }
        });
        daftarItem.innerHTML = jumlahTampil === 0 
            ? (kataKunci !== "" ? `<div class='pesan-kosong'>Pencarian tidak ditemukan.</div>` : `<div class='pesan-kosong'>Tidak ada catatan.</div>`) 
            : htmlCatatan;
            
    // --- RENDER PENGELUARAN ---
    } else if (state.modeAktif === "pengeluaran") {
        let totalBulan = 0; let totalHari = 0; let htmlHariIni = ""; let jumlahTampil = 0;
        state.dataPengeluaranPribadi.forEach(data => {
            if (data.tanggal_db && data.tanggal_db.startsWith(blnPilih)) totalBulan += data.harga;
            if (data.tanggal_db === tglPilih) {
                totalHari += data.harga; jumlahTampil++;
                htmlHariIni += `
                    <li class="item-pengeluaran">
                        <div class="header-kartu">
                            <div class="waktu-teks">🕒 Jam: ${data.jam_input || '-'}</div>
                            <div class="grup-tombol-kecil">
                                <button class="btn-aksi btn-hapus" data-id="${data.id}" data-jenis="pengeluaran" title="Hapus">🗑️</button>
                            </div>
                        </div>
                        <span class="isi-teks">${bersihkanTeks(data.nama_item || "")}</span>
                        <div class="nominal-teks">${formatRupiah(data.harga)}</div>
                    </li>`;
            }
        });
        document.getElementById('angkaTotalBulan').innerText = formatRupiah(totalBulan);
        document.getElementById('angkaTotalHari').innerText = formatRupiah(totalHari);
        daftarItem.innerHTML = jumlahTampil === 0 ? `<div class='pesan-kosong'>Tidak ada pengeluaran hari ini.</div>` : htmlHariIni;
        
    // --- RENDER AKUN ---
    } else if (state.modeAktif === "akun") {
        let htmlAkun = ""; let jumlahTampil = 0;
        state.dataAkunPribadi.forEach(data => {
            let p = data.platform || ""; let u = data.username || "";
            let teksCari = p.toLowerCase() + " " + u.toLowerCase();
            let tampilkan = kataKunci !== "" ? teksCari.includes(kataKunci) : true;
            
            if (tampilkan) {
                jumlahTampil++;
                htmlAkun += `
                    <li class="item-akun">
                        <div class="header-kartu">
                            <div class="waktu-teks" style="font-weight:bold; color:#20c997; font-size:14px;">💻 ${bersihkanTeks(p)}</div>
                            <div class="grup-tombol-kecil">
                                <button class="btn-aksi btn-hapus" data-id="${data.id}" data-jenis="akun" title="Hapus">🗑️</button>
                            </div>
                        </div>
                            <div class="teks-username-akun" title="${bersihkanTeks(u)}">👤 ${bersihkanTeks(u)}</div>
                        <div style="display:flex; justify-content:space-between; align-items:center; background:#f8f9fa; padding:8px 10px; border-radius:6px; border:1px solid #ced4da; margin-top:8px;">
                            <span class="teks-rahasia" style="font-family:monospace; letter-spacing:3px; color:#868e96; font-size:16px;">••••••••</span>
                            <div style="display:flex; gap:5px;">
                                <button class="btn-aksi btn-copy" data-pass="${data.password_enc}" title="Salin">📋</button>
                                <button class="btn-aksi btn-lihat" data-pass="${data.password_enc}" title="Lihat">👁️</button>
                            </div>
                        </div>
                    </li>`;
            }
        });
        daftarItem.innerHTML = jumlahTampil === 0 ? (kataKunci !== "" ? `<div class='pesan-kosong'>Pencarian tidak ditemukan.</div>` : `<div class='pesan-kosong'>Belum ada akun yang tersimpan.</div>`) : htmlAkun;
    }
}