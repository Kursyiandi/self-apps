// Memetakan semua elemen HTML ke dalam satu objek
export const el = {
    // 1. Area Utama & Navigasi
    areaLogin: document.getElementById('areaLogin'),
    areaApp: document.getElementById('areaApp'),
    areaUtama: document.getElementById('areaUtama'),
    areaBulanan: document.getElementById('areaBulanan'),
    infoUser: document.getElementById('infoUser'),
    teksTanggalHeader: document.getElementById('teksTanggalHeader'),
    
    // 2. Tombol Utama
    btnLogin: document.getElementById('btnLogin'),
    btnLogout: document.getElementById('btnLogout'),
    
    // 3. Tab Menu & Halaman
    btnMenuCatatan: document.getElementById('btnMenuCatatan'),
    btnMenuPengeluaran: document.getElementById('btnMenuPengeluaran'),
    btnMenuAkun: document.getElementById('btnMenuAkun'),
    halamanCatatan: document.getElementById('halamanCatatan'),
    halamanPengeluaran: document.getElementById('halamanPengeluaran'),
    halamanAkun: document.getElementById('halamanAkun'),
    
    // 4. Kontrol Waktu & Pencarian
    wadahNavTanggal: document.getElementById('wadahNavTanggal'),
    btnPrevTanggal: document.getElementById('btnPrevTanggal'),
    btnNextTanggal: document.getElementById('btnNextTanggal'),
    inputTanggal: document.getElementById('inputTanggalPilih'), 
    wadahCari: document.getElementById('wadahCari'),
    inputCari: document.getElementById('inputCariItem'),
    btnBukaSebulan: document.getElementById('btnBukaSebulan'),
    
    // 5. Form Catatan
    btnTambahCatatan: document.getElementById('btnTambahCatatan'),
    wadahInputCatatan: document.getElementById('wadahInputCatatan'),
    inputCatatan: document.getElementById('inputCatatan'),
    btnBatalCatatan: document.getElementById('btnBatalCatatan'),
    btnSimpanCatatan: document.getElementById('btnSimpanCatatan'),
    btnSuaraCatatan: document.getElementById('btnSuaraCatatan'),
    
    // 6. Form Pengeluaran
    angkaTotalHari: document.getElementById('angkaTotalHari'),
    angkaTotalBulan: document.getElementById('angkaTotalBulan'),
    btnTambahPengeluaran: document.getElementById('btnTambahPengeluaran'),
    wadahInputPengeluaran: document.getElementById('wadahInputPengeluaran'),
    inputNamaPengeluaran: document.getElementById('inputNamaPengeluaran'),
    inputNominalPengeluaran: document.getElementById('inputNominalPengeluaran'),
    inputKategoriPengeluaran: document.getElementById('inputKategoriPengeluaran'),
    btnBatalPengeluaran: document.getElementById('btnBatalPengeluaran'),
    btnSimpanPengeluaran: document.getElementById('btnSimpanPengeluaran'),
    
    // 7. Form Akun
    inputPinMaster: document.getElementById('inputPinMaster'),
    btnTambahAkun: document.getElementById('btnTambahAkun'),
    wadahInputAkun: document.getElementById('wadahInputAkun'),
    inputNamaPlatform: document.getElementById('inputNamaPlatform'),
    inputUsername: document.getElementById('inputUsername'),
    inputPasswordAkun: document.getElementById('inputPasswordAkun'),
    btnBatalAkun: document.getElementById('btnBatalAkun'),
    grafikKategori: document.getElementById('grafikKategori'),
    btnSimpanAkun: document.getElementById('btnSimpanAkun'),
    
// 8. Daftar & Modal Edit
    daftarItem: document.getElementById('daftarItem'),
    overlayModal: document.getElementById('overlayModal'),
    modalEdit: document.getElementById('modalEdit'),
    inputEditCatatan: document.getElementById('inputEditCatatan'),
    btnBatalEdit: document.getElementById('btnBatalEdit'),
    btnSimpanEdit: document.getElementById('btnSimpanEdit'),
    modalEditPengeluaran: document.getElementById('modalEditPengeluaran'),
    inputEditNamaPengeluaran: document.getElementById('inputEditNamaPengeluaran'),
    inputEditNominalPengeluaran: document.getElementById('inputEditNominalPengeluaran'),
    inputEditKategoriPengeluaran: document.getElementById('inputEditKategoriPengeluaran'),
    btnBatalEditPengeluaran: document.getElementById('btnBatalEditPengeluaran'),
    btnSimpanEditPengeluaran: document.getElementById('btnSimpanEditPengeluaran'),
    
    // 9. Komponen Lainnya
    toastNotification: document.getElementById('toastNotification'),
    btnKembali: document.getElementById('btnKembali'),
    judulBulanan: document.getElementById('judulBulanan'),
    btnDownloadPDF: document.getElementById('btnDownloadPDF'),
    inputBulanRekap: document.getElementById('inputBulanRekap'),
    wadahGrafik: document.getElementById('wadahGrafik'),
    grafikPengeluaran: document.getElementById('grafikPengeluaran'),
    kontenBulanan: document.getElementById('kontenBulanan')
};