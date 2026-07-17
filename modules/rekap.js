import { state } from './store.js';
import { formatRupiah, bersihkanTeks, showToast } from './helper.js';
import { el } from './dom.js';

let chartPengeluaran = null;
let chartKategori = null;

export function updateDropdownBulan(tanggalPilih) {
    const select = el.inputBulanRekap;
    const bulanUnik = new Set();
    const blnSekarang = (tanggalPilih || new Date().toISOString().slice(0, 10)).substring(0, 7);
    
    bulanUnik.add(blnSekarang);
    state.dataCatatanPribadi.forEach(d => { if (d.tanggal_db) bulanUnik.add(d.tanggal_db.substring(0, 7)); });
    state.dataPengeluaranPribadi.forEach(d => { if (d.tanggal_db) bulanUnik.add(d.tanggal_db.substring(0, 7)); });
    
    const arrayBulan = Array.from(bulanUnik).sort().reverse();
    const nilaiAktif = select.value || blnSekarang;
    
    select.innerHTML = "";
    arrayBulan.forEach(bln => {
        const namaBulan = new Date(bln + "-01").toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
        const opt = document.createElement('option');
        opt.value = bln;
        opt.innerText = namaBulan;
        if (bln === nilaiAktif) opt.selected = true;
        select.appendChild(opt);
    });
}

export function renderLayarBulanan() {
    const blnPilih = el.inputBulanRekap.value;
    el.judulBulanan.innerText = `Rekap ${state.modeAktif === 'catatan' ? 'Catatan' : 'Pengeluaran'}`;
    
    let dataSumber = state.modeAktif === 'catatan' ? state.dataCatatanPribadi : state.dataPengeluaranPribadi;
    let dataBulanIni = dataSumber.filter(d => d.tanggal_db && d.tanggal_db.startsWith(blnPilih));
    
    if (dataBulanIni.length === 0) {
        const namaBulan = new Date(blnPilih + "-01").toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
        el.kontenBulanan.innerHTML = `<div class="pesan-kosong">Belum ada data di bulan ${namaBulan}.</div>`;
        el.wadahGrafik.style.display = 'none';
        return;
    }
    
    dataBulanIni.sort((a, b) => a.tanggal_db.localeCompare(b.tanggal_db));
    let totalRekapBulan = 0;
    const dataDikelompokkan = {};
    
    dataBulanIni.forEach(item => {
        if (!dataDikelompokkan[item.tanggal_db]) dataDikelompokkan[item.tanggal_db] = [];
        dataDikelompokkan[item.tanggal_db].push(item);
        if (state.modeAktif === 'pengeluaran') totalRekapBulan += item.harga;
    });
    
    let htmlRekap = "";
    for (const tgl in dataDikelompokkan) {
        htmlRekap += `<div class="grup-tanggal"><div class="tgl-kecil">📅 ${tgl}</div><ul class="list-simple">`;
        dataDikelompokkan[tgl].forEach(item => {
            if (state.modeAktif === 'catatan') htmlRekap += `<li>${bersihkanTeks(item.isi || "")}</li>`;
            else htmlRekap += `<li>${bersihkanTeks(item.nama_item || "")} : <strong>${formatRupiah(item.harga)}</strong></li>`;
        });
        htmlRekap += `</ul></div>`;
    }
    
    if (state.modeAktif === 'pengeluaran') {
        htmlRekap += `<div class="box-total-rekap"><div class="label-total-rekap">Total Bulan Ini</div><div class="angka-total-rekap">${formatRupiah(totalRekapBulan)}</div></div>`;
    }
    el.kontenBulanan.innerHTML = htmlRekap;
    gambarGrafik(dataDikelompokkan, dataBulanIni);
}

function gambarGrafik(dataDikelompokkan, dataBulanIni) {
    if (state.modeAktif !== 'pengeluaran') {
        el.wadahGrafik.style.display = 'none';
        return;
    }
    el.wadahGrafik.style.display = 'block';

    const ctxBar = el.grafikPengeluaran.getContext('2d');
    const labelTanggal = Object.keys(dataDikelompokkan).sort();
    const dataTotalHarian = labelTanggal.map(tgl => dataDikelompokkan[tgl].reduce((total, item) => total + item.harga, 0));
    const labelTanggalPendek = labelTanggal.map(tgl => tgl.substring(8));

    if (chartPengeluaran) chartPengeluaran.destroy();
    chartPengeluaran = new window.Chart(ctxBar, {
        type: 'bar',
        data: {
            labels: labelTanggalPendek,
            datasets: [{ data: dataTotalHarian, backgroundColor: 'rgba(77, 171, 247, 0.5)', borderColor: '#1864ab', borderWidth: 1, borderRadius: 4 }]
        },
        options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
    });

    const ctxPie = el.grafikKategori.getContext('2d');
    const rekapKategori = {};
    let totalSeluruhPengeluaran = 0;

    dataBulanIni.forEach(item => {
        const kat = item.kategori || "Lainnya";
        if (!rekapKategori[kat]) rekapKategori[kat] = 0;
        rekapKategori[kat] += item.harga;
        totalSeluruhPengeluaran += item.harga;
    });

    const labelKategoriAsli = Object.keys(rekapKategori);
    const dataKategori = Object.values(rekapKategori);
    const labelDenganPersen = labelKategoriAsli.map((label, index) => {
        const persen = Math.round((dataKategori[index] / totalSeluruhPengeluaran) * 100);
        return `${label} (${persen}%)`;
    });

    if (chartKategori) chartKategori.destroy();
    chartKategori = new window.Chart(ctxPie, {
        type: 'pie',
        data: {
            labels: labelDenganPersen,
            datasets: [{ data: dataKategori, backgroundColor: ['#ff8787', '#4dabf7', '#51cf66', '#fcc419', '#cc5de8', '#ff922b'], borderWidth: 1 }]
        },
        options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
    });
}

export function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const bulanAktif = el.inputBulanRekap.value;
    const namaBulan = new Date(bulanAktif + "-01").toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    
    doc.setFontSize(18);
    doc.text(`Laporan ${state.modeAktif === 'catatan' ? 'Catatan' : 'Pengeluaran'} - ${namaBulan}`, 14, 20);
    doc.setFontSize(11);
    doc.text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID')}`, 14, 28);
    
    let head = []; let body = [];
    let dataSumber = state.modeAktif === 'catatan' ? state.dataCatatanPribadi : state.dataPengeluaranPribadi;
    let dataBulanIni = dataSumber.filter(d => d.tanggal_db && d.tanggal_db.startsWith(bulanAktif));
    dataBulanIni.sort((a, b) => a.tanggal_db.localeCompare(b.tanggal_db));
    
    if (state.modeAktif === 'catatan') {
        head = [['Tanggal', 'Jam', 'Isi Catatan']];
        dataBulanIni.forEach(item => body.push([item.tanggal_db, item.jam_input || '-', item.isi]));
    } else {
        head = [['Tanggal', 'Jam', 'Nama Item', 'Harga (Rp)']];
        let total = 0;
        dataBulanIni.forEach(item => { body.push([item.tanggal_db, item.jam_input || '-', item.nama_item, formatRupiah(item.harga)]); total += item.harga; });
        body.push([{ content: 'TOTAL KESELURUHAN', colSpan: 3, styles: { halign: 'right', fontStyle: 'bold' } }, { content: formatRupiah(total), styles: { fontStyle: 'bold', textColor: [224, 49, 49] } }]);
    }
    
    doc.autoTable({ startY: 35, head: head, body: body, theme: 'striped', headStyles: { fillColor: [77, 171, 247] }, styles: { fontSize: 10, cellPadding: 4 } });
    doc.save(`Laporan_${state.modeAktif}_${bulanAktif}.pdf`);
    showToast("PDF Berhasil Diunduh!", "success");
}
