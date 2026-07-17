import { state } from './store.js';
import { formatRupiah, bersihkanTeks } from './helper.js';
import { el } from './dom.js'; // Import DOM

export function updateTanggalHeader() {
    const tgl = el.inputTanggal.value;
    if(!tgl) return;
    const dateObj = new Date(tgl);
    el.teksTanggalHeader.innerText = dateObj.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export function gantiTab(tab) {
    state.modeAktif = tab;
    el.btnMenuCatatan.classList.toggle('aktif', tab === 'catatan');
    el.btnMenuPengeluaran.classList.toggle('aktif', tab === 'pengeluaran');
    el.btnMenuAkun.classList.toggle('aktif', tab === 'akun');
    
    el.halamanCatatan.classList.toggle('aktif', tab === 'catatan');
    el.halamanPengeluaran.classList.toggle('aktif', tab === 'pengeluaran');
    el.halamanAkun.classList.toggle('aktif', tab === 'akun');
    
    if (el.inputCari) el.inputCari.value = ""; 
    
    if (tab === 'akun') {
        el.wadahNavTanggal.style.display = 'none';
        el.btnBukaSebulan.style.display = 'none';
        el.wadahCari.style.display = 'flex';
    } else {
        el.wadahNavTanggal.style.display = 'flex';
        el.btnBukaSebulan.style.display = 'flex';
        el.wadahCari.style.display = tab === 'catatan' ? 'flex' : 'none';
        el.btnBukaSebulan.innerText = tab === 'catatan' ? 'Catatan Bulan Ini' : '➕ Catat Pengeluaran';
    }
    renderLayarUtama();
}

export function renderLayarUtama() {
    el.daftarItem.innerHTML = "";
    const tglPilih = el.inputTanggal.value; 
    const blnPilih = tglPilih.substring(0, 7); 
    const kataKunci = el.inputCari && el.wadahCari.style.display !== 'none' ? el.inputCari.value.toLowerCase() : "";
    
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
                
                // Jika data lama tidak punya kategori, tampilkan "Lainnya"
                const teksKategori = data.kategori ? data.kategori : "Lainnya"; 

                htmlHariIni += `
                    <li class="item-pengeluaran">
                        <div class="header-kartu">
                            <div class="waktu-teks">
                                🕒 Jam: ${data.jam_input || '-'} • 
                                <span style="color:#e03131; font-weight:bold;">🏷️ ${teksKategori}</span>
                            </div>
                            <div class="grup-tombol-kecil">
                                <button class="btn-aksi btn-edit" data-id="${data.id}" data-jenis="pengeluaran" data-nama="${bersihkanTeks(data.nama_item || "")}" data-harga="${data.harga}" data-kategori="${teksKategori}" title="Edit">✏️</button>
                                
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
                
                // 👇 LOGIKA BARU: DETEKSI LINK (URL) 👇
                let teksPlatform = bersihkanTeks(p);
                let elemenPlatform = teksPlatform;
                
                // Cek apakah teks diawali dengan http:// atau https://
                if (teksPlatform.toLowerCase().startsWith('http://') || teksPlatform.toLowerCase().startsWith('https://')) {
                    // Jika iya, ubah jadi tag <a> agar bisa diklik dan buka di tab baru (_blank)
                    elemenPlatform = `<a href="${teksPlatform}" target="_blank" rel="noopener noreferrer" style="color: #20c997; text-decoration: none; cursor: pointer;" title="Buka Link">${teksPlatform}</a>`;
                }
                // 👆 -------------------------------- 👆

                htmlAkun += `
                    <li class="item-akun">
                        <div class="header-kartu" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                            
                            <div style="font-weight:bold; color:#20c997; font-size:14px; flex: 1; min-width: 0; word-break: break-all; margin-right: 10px;">
                                💻 ${elemenPlatform}
                            </div>
                            
                            <div class="grup-tombol-kecil" style="flex-shrink: 0;">
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
        el.daftarItem.innerHTML = jumlahTampil === 0 ? (kataKunci !== "" ? `<div class='pesan-kosong'>Pencarian tidak ditemukan.</div>` : `<div class='pesan-kosong'>Belum ada akun yang tersimpan.</div>`) : htmlAkun;
    }
}
