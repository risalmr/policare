// Official RBA Dataset according to Dokumen RBA Puskesmas Tamalanrea TA 2026

export const INITIAL_RBA_OFFICIAL_DATA = {
  header: {
    pemda: 'PEMERINTAH KOTA MAKASSAR',
    unit: 'PUSKESMAS TAMALANREA',
    title: 'RENCANA BISNIS DAN ANGGARAN',
    subtitle: 'RINCIAN PENDAPATAN DAN BELANJA TAHUN ANGGARAN 2026',
    dpaNomor: 'DPA/A.1/1.02.0.00.0.00.01.0000/001/2026',
    tanggalDpa: '02 Januari 2026',
    diterbitkanOleh: 'Walikota Makassar',
    statusBpkad: 'DISAHKAN & APPROVED',
    pimpinan: 'drg. Weri L.P. Saroengoe',
    nipPimpinan: '19690517 200604 2 009',
    jabatanPimpinan: 'Pemimpin Badan Layanan Umum Daerah',
    kotaTanggalTtd: 'Makassar, 02 Januari 2026',
  },
  pendapatan: [
    {
      id: 'pend-1',
      kategori: 'Jasa Layanan',
      subItems: [
        { id: 'p-1-a', no: 'a.', uraian: 'Retribusi Pelayanan Kesehatan', rincian: '1 tahun x Rp. 25.000.000', qty: 1, satuan: 'tahun', harga: 25000000, jumlah: 25000000 },
        { id: 'p-1-b', no: 'b.', uraian: 'Dana Kapitasi JKN', rincian: '1 tahun x Rp. 1.301.684.008', qty: 1, satuan: 'tahun', harga: 1301684008, jumlah: 1301684008 },
        { id: 'p-1-c', no: 'c.', uraian: 'Non Kapitasi JKN', rincian: '1 tahun x Rp. 40.000.000', qty: 1, satuan: 'tahun', harga: 40000000, jumlah: 40000000 },
      ]
    },
    {
      id: 'pend-2',
      kategori: 'APBD',
      subItems: [
        { id: 'p-2-a', no: '', uraian: 'APBD', rincian: '1 tahun x Rp. 771.480.663', qty: 1, satuan: 'tahun', harga: 771480663, jumlah: 771480663 },
      ]
    }
  ],
  belanjaSections: [
    {
      id: 'bel-operasi',
      kodeHeader: '5.1',
      title: 'BELANJA OPERASI',
      groups: [
        {
          id: 'grp-pegawai-blud',
          kodeRekening: '5.1.01.99.099.09999',
          title: 'BELANJA PEGAWAI BLUD',
          subGroups: [
            {
              id: 'sg-peg-apbd',
              title: 'Belanja Pegawai APBD',
              accounts: [
                {
                  id: 'acc-peg-1',
                  no: '1.',
                  kodeRekening: '5.1.01.02.006.00069',
                  uraian: 'Beban Jasa Pengelolaan BMD yang Tidak Menghasilkan Pendapatan',
                  items: [
                    { id: 'item-peg-1', kode: '8.1.01.03.08.0002.00008', uraian: 'Honorarium Pengurus Barang Pembantu', rincianText: '1 org x 12 bln x Rp 300.000', qty: 1, satuan: 'org', durasi: 12, durasiSatuan: 'bln', harga: 300000, jumlah: 3600000 }
                  ]
                },
                {
                  id: 'acc-peg-2',
                  no: '',
                  kodeRekening: '5.1.02.02.01.0004',
                  uraian: 'Lain - Lain',
                  items: [
                    { id: 'item-peg-2', kode: '', uraian: 'Lain-lain Pegawai', rincianText: 'Alokasi Penggajian Dukungan Pegawai', qty: 1, satuan: 'paket', harga: 1605000, jumlah: 1605000 }
                  ]
                }
              ],
              subtotalTitle: 'JUMLAH BELANJA PEGAWAI',
              subtotalDefault: 5205000
            }
          ]
        },
        {
          id: 'grp-barjas',
          kodeRekening: '5.1.02.99.099.09999',
          title: 'BELANJA BARANG DAN JASA',
          subGroups: [
            {
              id: 'sg-barjas-apbd',
              title: 'Belanja Barang dan Jasa APBD',
              bgHeader: '#dcfce7',
              accounts: [
                {
                  id: 'acc-apbd-1',
                  no: '1.',
                  kodeRekening: '5.1.02.02.01.0080',
                  uraian: 'Beban Jasa Pelaksanaan Transaksi Keuangan',
                  items: [
                    { id: 'i-apbd-1', kode: '8.1.02.02.01.0042.00081', uraian: 'Pembantu Bendahara Pengeluaran Pembantu', rincianText: '1 org x 12 bln x Rp 310.000', qty: 1, satuan: 'org', durasi: 12, durasiSatuan: 'bln', harga: 310000, jumlah: 3720000 }
                  ]
                },
                {
                  id: 'acc-apbd-2',
                  no: '2.',
                  kodeRekening: '5.1.02.02.01.0063',
                  uraian: 'Beban Kawat/Faksimili/Internet/TV Berlangganan',
                  items: [
                    { id: 'i-apbd-2', kode: '8.1.02.02.01.0063.00011', uraian: 'Biaya langganan internet Shared International Speed Up to 100 Mbps', rincianText: '1 paket x 12 bln x Rp 976.000', qty: 1, satuan: 'paket', durasi: 12, durasiSatuan: 'bln', harga: 976000, jumlah: 11712000 }
                  ]
                },
                {
                  id: 'acc-apbd-3',
                  no: '3.',
                  kodeRekening: '5.1.02.02.01.0060',
                  uraian: 'Beban Tagihan Air',
                  items: [
                    { id: 'i-apbd-3', kode: '8.1.02.02.01.0060.00001', uraian: 'Tarif PDAM Golongan IIC, > 31 M3', rincianText: '50,64883 m3 x 1 thn x Rp 3.600', qty: 50.64883, satuan: 'm3', durasi: 1, durasiSatuan: 'thn', harga: 3600, jumlah: 14942336 }
                  ]
                },
                {
                  id: 'acc-apbd-4',
                  no: '4.',
                  kodeRekening: '5.1.02.02.01.0061',
                  uraian: 'Beban Tagihan Listrik',
                  items: [
                    { id: 'i-apbd-4', kode: '8.1.02.02.01.0061.00004', uraian: 'Tagihan Listrik P-1/TR, 6.600 VA s.d 200 kVA', rincianText: '36982 kwh x 1 thn x Rp 1.352', qty: 36982, satuan: 'kwh', durasi: 1, durasiSatuan: 'thn', harga: 1352, jumlah: 49999664 }
                  ]
                },
                {
                  id: 'acc-apbd-5',
                  no: '5.',
                  kodeRekening: '5.1.02.03.003.00001',
                  uraian: 'Beban Pemeliharaan Bangunan Gedung-Bangunan Gedung Tempat Kerja-Bangunan Gedung Kantor',
                  items: [
                    { id: 'i-apbd-5', kode: '8.1.02.03.03.0001.00002', uraian: 'Biaya Pemeliharaan Gedung atau Bangunan Tidak Bertingkat', rincianText: '5,772457 m2 x 1 thn x Rp 190.000', qty: 5.772457, satuan: 'm2', durasi: 1, durasiSatuan: 'thn', harga: 190000, jumlah: 21996767 }
                  ]
                },
                {
                  id: 'acc-apbd-6',
                  no: '6.',
                  kodeRekening: '5.1.02.03.02.0409',
                  uraian: 'Beban Pemeliharaan Komputer-Peralatan Komputer-Peralatan Personal Computer',
                  items: [
                    { id: 'i-apbd-6', kode: '8.1.02.03.02.0409.00001', uraian: 'Pemeliharaan Peralatan Personal Computer (Printer)', rincianText: '6 unit x 1 thn x Rp 690.000', qty: 6, satuan: 'unit', durasi: 1, durasiSatuan: 'thn', harga: 690000, jumlah: 4140000 }
                  ]
                },
                {
                  id: 'acc-apbd-7',
                  no: '7.',
                  kodeRekening: '5.1.02.03.02.0405',
                  uraian: 'Beban Pemeliharaan Komputer-Komputer Unit-Personal Computer',
                  items: [
                    { id: 'i-apbd-7', kode: '8.1.02.03.02.0405.00001', uraian: 'Pemeliharaan Personal Computer (Komputer/Notebook)', rincianText: '10 unit x 1 thn x Rp 730.000', qty: 10, satuan: 'unit', durasi: 1, durasiSatuan: 'thn', harga: 730000, jumlah: 7300000 }
                  ]
                },
                {
                  id: 'acc-apbd-8',
                  no: '8.',
                  kodeRekening: '5.1.02.03.02.0121',
                  uraian: 'Beban Pemeliharaan Alat Kantor dan Rumah Tangga-Alat Rumah Tangga-Alat Pendingin',
                  items: [
                    { id: 'i-apbd-8', kode: '8.1.02.03.02.0121.00001', uraian: 'Pemeliharaan Sarana Kantor AC Split', rincianText: '8 unit x 1 thn x Rp 610.000', qty: 8, satuan: 'unit', durasi: 1, durasiSatuan: 'thn', harga: 610000, jumlah: 4880000 }
                  ]
                },
                {
                  id: 'acc-apbd-9',
                  no: '9.',
                  kodeRekening: '5.1.02.03.002.00036',
                  uraian: 'Belanja Pemeliharaan Alat Angkutan-Alat Angkutan Darat Bermotor-Kendaraan Bermotor Penumpang',
                  items: [
                    { id: 'i-apbd-9', kode: '8.1.02.03.02.0036.00001', uraian: 'Service Kendaraan Operasional Roda 4 & Roda 2', rincianText: '1 paket x 1 thn x Rp 22.500.000', qty: 1, satuan: 'paket', durasi: 1, durasiSatuan: 'thn', harga: 22500000, jumlah: 22500000 }
                  ]
                },
                {
                  id: 'acc-apbd-12',
                  no: '12.',
                  kodeRekening: '5.1.02.01.001.00043',
                  uraian: 'Belanja Natura',
                  items: [
                    { id: 'i-apbd-12', kode: '', uraian: 'Belanja PMT Penyuluhan', rincianText: '1 thn x Rp 72.000.000', qty: 1, satuan: 'thn', harga: 72000000, jumlah: 72000000 }
                  ]
                }
              ],
              subtotalTitle: 'JUMLAH BELANJA BARANG DAN JASA APBD',
              subtotalDefault: 213621667
            },
            {
              id: 'sg-barjas-blud',
              title: 'Belanja Barang dan Jasa BLUD',
              bgHeader: '#dcfce7',
              accounts: [
                {
                  id: 'acc-blud-1',
                  no: '1.',
                  kodeRekening: '5.1.02.02.01.0014',
                  uraian: 'Beban Jasa Tenaga Kesehatan',
                  items: [
                    { id: 'i-blud-1-1', kode: '', uraian: 'Belanja jasa medik ASN ( PNS dan PPPK)', rincianText: '1 tahun x Rp. 750.000.000', qty: 1, satuan: 'tahun', harga: 750000000, jumlah: 750000000 },
                    { id: 'i-blud-1-2', kode: '', uraian: 'Jasa Edukasi Prolanis', rincianText: '12 bulan x Rp. 500.000', qty: 12, satuan: 'bulan', harga: 500000, jumlah: 6000000 },
                    { id: 'i-blud-1-3', kode: '', uraian: 'Jasa Instruktur Senam Prolanis', rincianText: '12 bulan x Rp. 200.000', qty: 12, satuan: 'bulan', harga: 200000, jumlah: 2400000 },
                    { id: 'i-blud-1-4', kode: '', uraian: 'Utang Belanja Iuran Jasa Medis 4% PNS Desember Tahun 2025', rincianText: '1 bulan x Rp. 1.348.648', qty: 1, satuan: 'bulan', harga: 1348648, jumlah: 1348648 },
                    { id: 'i-blud-1-5', kode: '', uraian: 'Utang Belanja Iuran Jasa Medis 4% PPPK Desember Tahun 2025', rincianText: '1 bulan x Rp. 91.340', qty: 1, satuan: 'bulan', harga: 91340, jumlah: 91340 },
                  ]
                },
                {
                  id: 'acc-blud-2',
                  no: '2.',
                  kodeRekening: '5.1.02.02.01.0080',
                  uraian: 'Belanja Honorarium Penanggungjawaban Pengelola Keuangan',
                  items: [
                    { id: 'i-blud-2-1', kode: '8.1.02.02.01.0042.00006', uraian: 'Pemimpin BLUD', rincianText: '1 org x 12 bln x Rp 1.970.000', qty: 1, satuan: 'org', durasi: 12, durasiSatuan: 'bln', harga: 1970000, jumlah: 23640000 },
                    { id: 'i-blud-2-2', kode: '8.1.02.02.01.0042.00038', uraian: 'Pejabat Teknis BLUD', rincianText: '1 org x 12 bln x Rp 1.910.000', qty: 1, satuan: 'org', durasi: 12, durasiSatuan: 'bln', harga: 1910000, jumlah: 22920000 },
                    { id: 'i-blud-2-3', kode: '8.1.02.02.01.0042.00022', uraian: 'Pejabat Keuangan BLUD', rincianText: '1 org x 12 bln x Rp 770.000', qty: 1, satuan: 'org', durasi: 12, durasiSatuan: 'bln', harga: 770000, jumlah: 9240000 },
                    { id: 'i-blud-2-4', kode: '8.1.02.02.01.0042.00054', uraian: 'Bendahara Pengeluaran BLUD', rincianText: '1 org x 12 bln x Rp 670.000', qty: 1, satuan: 'org', durasi: 12, durasiSatuan: 'bln', harga: 670000, jumlah: 8040000 },
                    { id: 'i-blud-2-5', kode: '8.1.02.02.01.0042.00054', uraian: 'Bendahara Penerima BLUD', rincianText: '1 org x 12 bln x Rp 670.000', qty: 1, satuan: 'org', durasi: 12, durasiSatuan: 'bln', harga: 670000, jumlah: 8040000 },
                  ]
                },
                {
                  id: 'acc-blud-3',
                  no: '3.',
                  kodeRekening: '5.1.02.01.001.00024',
                  uraian: 'Belanja Alat tulis kantor',
                  items: [
                    { id: 'i-atk-1', kode: '1.1.12.01.03.0001.00990', uraian: 'Sticy Notes (isi 25 Lembar)', rincianText: '10 pack x Rp 15.500', qty: 10, satuan: 'pack', harga: 15500, jumlah: 155000 },
                    { id: 'i-atk-2', kode: '1.1.12.01.03.0001.00993', uraian: 'Bolpoin Non Gel (isi 12 Pcs)', rincianText: '20 pack x Rp 28.400', qty: 20, satuan: 'pack', harga: 28400, jumlah: 568000 },
                    { id: 'i-atk-3', kode: '1.1.12.01.03.0001.00995', uraian: 'Pensil 2B (isi 12 Pcs)', rincianText: '5 pack x Rp 57.100', qty: 5, satuan: 'pack', harga: 57100, jumlah: 285500 },
                    { id: 'i-atk-4', kode: '1.1.12.01.03.0001.01007', uraian: 'Tinta Stempel trodat Uk. 25 ml', rincianText: '5 botol x Rp 60.300', qty: 5, satuan: 'botol', harga: 60300, jumlah: 301500 },
                    { id: 'i-atk-5', kode: '1.1.12.01.03.0001.01307', uraian: 'Binder Clip / Double Clip No. 107', rincianText: '7 dus x Rp 51.400', qty: 7, satuan: 'dus', harga: 51400, jumlah: 359800 },
                    { id: 'i-atk-6', kode: '1.1.12.01.03.0001.01308', uraian: 'Double Clip / Binder Clip no.111', rincianText: '7 pack x Rp 55.000', qty: 7, satuan: 'pack', harga: 55000, jumlah: 385000 },
                    { id: 'i-atk-7', kode: '1.1.12.01.03.0001.01310', uraian: 'Double Clip / Binder Clip no.166', rincianText: '7 pcs x Rp 63.000', qty: 7, satuan: 'pcs', harga: 63000, jumlah: 441000 },
                    { id: 'i-atk-8', kode: '1.1.12.01.03.0001.01312', uraian: 'Double Clip / Binder Clip no.155', rincianText: '7 pack x Rp 64.300', qty: 7, satuan: 'pack', harga: 64300, jumlah: 450100 },
                    { id: 'i-atk-9', kode: '1.1.12.01.03.0001.01022', uraian: 'Penghapus Pensil ( isi 20 pcs)', rincianText: '2 pack x Rp 44.200', qty: 2, satuan: 'pack', harga: 44200, jumlah: 88400 },
                    { id: 'i-atk-10', kode: '1.1.12.01.03.0001.01031', uraian: 'Buku Ekspedisi Uk. 100 lembar, Sampul Keras', rincianText: '5 buah x Rp 13.800', qty: 5, satuan: 'buah', harga: 13800, jumlah: 69000 },
                    { id: 'i-atk-11', kode: '1.1.12.01.03.0001.01033', uraian: 'Buku Folio Uk. 100 lbr, sampul keras', rincianText: '5 buah x Rp 19.100', qty: 5, satuan: 'buah', harga: 19100, jumlah: 95500 },
                    { id: 'i-atk-12', kode: '1.1.12.01.03.0001.01034', uraian: 'Buku Folio Uk. 200 lbr', rincianText: '5 buah x Rp 36.300', qty: 5, satuan: 'buah', harga: 36300, jumlah: 181500 },
                    { id: 'i-atk-13', kode: '1.1.12.01.03.0001.01037', uraian: 'Buku Kwarto, Uk. 21 x 16 Cm, Isi 200 Lembar', rincianText: '5 buah x Rp 19.200', qty: 5, satuan: 'buah', harga: 19200, jumlah: 96000 },
                    { id: 'i-atk-14', kode: '1.1.12.01.03.0001.01044', uraian: 'Buku Tulis isi 38 lbr, 10 pcs', rincianText: '5 pack x Rp 42.700', qty: 5, satuan: 'pack', harga: 42700, jumlah: 213500 },
                    { id: 'i-atk-15', kode: '1.1.12.01.03.0001.01056', uraian: 'Map Palstik Uk. F4/ Folio', rincianText: '200 buah x Rp 4.400', qty: 200, satuan: 'buah', harga: 4400, jumlah: 880000 },
                    { id: 'i-atk-16', kode: '1.1.12.01.03.0001.01059', uraian: 'Map Palstik / Zipper bag Uk. F4/ Folio, Resleting/kancing', rincianText: '15 buah x Rp 12.300', qty: 15, satuan: 'buah', harga: 12300, jumlah: 184500 },
                    { id: 'i-atk-17', kode: '1.1.12.01.03.0001.01058', uraian: 'Map Plastik Kancing Uk. F4 / Folio, Isi 12 Pcs', rincianText: '10 pack x Rp 23.900', qty: 10, satuan: 'pack', harga: 23900, jumlah: 239000 },
                    { id: 'i-atk-18', kode: '1.1.12.01.03.0001.01061', uraian: 'Map Snelhekter Bahan Plastik Uk. F4/Folio', rincianText: '200 buah x Rp 6.600', qty: 200, satuan: 'buah', harga: 6600, jumlah: 1320000 },
                    { id: 'i-atk-19', kode: '1.1.12.01.03.0001.01068', uraian: 'Pisau Cutter Besar Uk. L 500', rincianText: '10 buah x Rp 19.000', qty: 10, satuan: 'buah', harga: 19000, jumlah: 190000 },
                    { id: 'i-atk-20', kode: '1.1.12.01.03.0001.01072', uraian: 'Isolasi Bening Uk. 1 Inch, 24 Mm, 72 Yards', rincianText: '20 buah x Rp 6.800', qty: 20, satuan: 'buah', harga: 6800, jumlah: 136000 },
                    { id: 'i-atk-21', kode: '1.1.12.01.03.0001.01078', uraian: 'Isolasi Double Tip Uk. 24 Mm 15 Yards', rincianText: '20 buah x Rp 5.800', qty: 20, satuan: 'buah', harga: 5800, jumlah: 116000 },
                    { id: 'i-atk-22', kode: '1.1.12.01.03.0001.01091', uraian: 'Lem Stick, Uk. 25 Gram', rincianText: '40 buah x Rp 7.100', qty: 40, satuan: 'buah', harga: 7100, jumlah: 284000 },
                    { id: 'i-atk-23', kode: '1.1.12.01.03.0001.01092', uraian: 'Staples Kecil No. 10', rincianText: '15 buah x Rp 16.300', qty: 15, satuan: 'buah', harga: 16300, jumlah: 244500 },
                    { id: 'i-atk-24', kode: '1.1.12.01.03.0001.01093', uraian: 'Staples Sedang No. 3', rincianText: '4 buah x Rp 47.100', qty: 4, satuan: 'buah', harga: 47100, jumlah: 188400 },
                    { id: 'i-atk-25', kode: '1.1.12.01.03.0001.01095', uraian: 'Isi Stales Kecil No. 10, isi 20 box', rincianText: '12 pack x Rp 35.600', qty: 12, satuan: 'pack', harga: 35600, jumlah: 427200 },
                    { id: 'i-atk-26', kode: '1.1.12.01.03.0001.01101', uraian: 'Gunting Kecil', rincianText: '5 buah x Rp 6.200', qty: 5, satuan: 'buah', harga: 6200, jumlah: 31000 },
                    { id: 'i-atk-27', kode: '1.1.12.01.03.0001.01267', uraian: 'Gunting Sedang', rincianText: '5 buah x Rp 11.800', qty: 5, satuan: 'buah', harga: 11800, jumlah: 59000 },
                    { id: 'i-atk-28', kode: '1.1.12.01.03.0001.01103', uraian: 'Gunting Besar', rincianText: '5 buah x Rp 12.600', qty: 5, satuan: 'buah', harga: 12600, jumlah: 63000 },
                    { id: 'i-atk-29', kode: '1.1.12.01.03.0001.01144', uraian: 'Stiker Label No. 99, isi 10 lembar', rincianText: '5 pack x Rp 8.200', qty: 5, satuan: 'pack', harga: 8200, jumlah: 41000 },
                    { id: 'i-atk-30', kode: '1.1.12.01.03.0001.01146', uraian: 'Stiker Label No. 101, isi 10 lembar', rincianText: '5 pack x Rp 11.300', qty: 5, satuan: 'pack', harga: 11300, jumlah: 56500 },
                    { id: 'i-atk-31', kode: '1.1.12.01.03.0001.01152', uraian: 'Kalkulator 12 Digit', rincianText: '4 buah x Rp 133.200', qty: 4, satuan: 'buah', harga: 133200, jumlah: 532800 },
                    { id: 'i-atk-32', kode: '1.1.12.01.03.0001.01160', uraian: 'Kertas Foto Uk. F4', rincianText: '5 pack x Rp 33.700', qty: 5, satuan: 'pack', harga: 33700, jumlah: 168500 },
                    { id: 'i-atk-33', kode: '1.1.12.01.03.0001.01100', uraian: 'Pelubang Kertas, ukuran sedang', rincianText: '5 buah x Rp 49.500', qty: 5, satuan: 'buah', harga: 49500, jumlah: 247500 },
                    { id: 'i-atk-34', kode: '1.1.12.01.03.0001.01196', uraian: 'Paper Clip Warna Warni', rincianText: '7 pack x Rp 38.500', qty: 7, satuan: 'pack', harga: 38500, jumlah: 269500 },
                    { id: 'i-atk-35', kode: '1.1.12.01.03.0001.01207', uraian: 'Map Ordner F4 5 Cm', rincianText: '30 buah x Rp 53.500', qty: 30, satuan: 'buah', harga: 53500, jumlah: 1605000 },
                    { id: 'i-atk-36', kode: '1.1.12.01.03.0001.01210', uraian: 'Cetak Spanduk', rincianText: '20 meter x Rp 58.900', qty: 20, satuan: 'meter', harga: 58900, jumlah: 1178000 },
                  ]
                },
                {
                  id: 'acc-blud-4',
                  no: '4.',
                  kodeRekening: '5.1.02.01.001.00025',
                  uraian: 'Belanja kertas dan cover',
                  items: [
                    { id: 'i-kertas-1', kode: '1.1.12.01.03.0002.00316', uraian: 'Kertas HVS A4 Uk. 75 Gsm', rincianText: '260 rim x Rp 53.000', qty: 260, satuan: 'rim', harga: 53000, jumlah: 13780000 },
                    { id: 'i-kertas-2', kode: '1.1.12.01.03.0002.00319', uraian: 'Kertas HVS F4 Uk. 75 Gsm', rincianText: '10 rim x Rp 63.200', qty: 10, satuan: 'rim', harga: 63200, jumlah: 632000 },
                    { id: 'i-kertas-3', kode: '1.1.12.01.03.0002.00340', uraian: 'Kertas Thermal Uk. 58 x 48 Mm', rincianText: '280 roll x Rp 4.600', qty: 280, satuan: 'roll', harga: 4600, jumlah: 1288000 },
                    { id: 'i-kertas-4', kode: '1.1.12.01.03.0002.00362', uraian: 'Amplop Putih besar Uk. 110 x 230 mm, isi 100 lbr', rincianText: '10 pack x Rp 24.000', qty: 10, satuan: 'pack', harga: 24000, jumlah: 240000 },
                    { id: 'i-kertas-5', kode: '1.1.12.01.03.0002.00363', uraian: 'Amplop Putih Sedang Uk.114 x 162 mm, isi 100 lbr', rincianText: '10 pack x Rp 25.000', qty: 10, satuan: 'pack', harga: 25000, jumlah: 250000 },
                    { id: 'i-kertas-6', kode: '1.1.12.01.03.0002.00381', uraian: 'Kertas Continious Form 4 Ply Ukuran 9,5 x 11 Inch, Isi 500 Sheets', rincianText: '1 dus x Rp 508.900', qty: 1, satuan: 'dus', harga: 508900, jumlah: 508900 },
                  ]
                },
                {
                  id: 'acc-blud-5',
                  no: '5.',
                  kodeRekening: '5.1.02.01.001.00031',
                  uraian: 'Belanja Alat Listrik',
                  items: [
                    { id: 'i-listrik-1', kode: '1.1.12.01.03.0008.00042', uraian: 'Baterai Charge (AAA)', rincianText: '20 pack x Rp 88.700', qty: 20, satuan: 'pack', harga: 88700, jumlah: 1774000 },
                    { id: 'i-listrik-2', kode: '', uraian: 'Baterai Charge (AA)', rincianText: '10 pack x Rp 187.200', qty: 10, satuan: 'pack', harga: 187200, jumlah: 1872000 },
                    { id: 'i-listrik-3', kode: '1.1.12.01.03.0008.00206', uraian: 'Terminal Kabel, Panjang kabel 1,5 m, lubang 6', rincianText: '4 buah x Rp 188.000', qty: 4, satuan: 'buah', harga: 188000, jumlah: 752000 },
                    { id: 'i-listrik-4', kode: '1.1.12.01.03.0008.00245', uraian: 'Baterai Kancing, Lithium , 3 volt', rincianText: '30 pcs x Rp 16.700', qty: 30, satuan: 'pcs', harga: 16700, jumlah: 501000 },
                    { id: 'i-listrik-5', kode: '1.1.12.01.03.0008.00119', uraian: 'Lampu LED 10 watt', rincianText: '12 buah x Rp 115.000', qty: 12, satuan: 'buah', harga: 115000, jumlah: 1380000 },
                    { id: 'i-listrik-6', kode: '1.1.12.01.03.0008.00123', uraian: 'Lampu LED 13 watt', rincianText: '10 buah x Rp 144.000', qty: 10, satuan: 'buah', harga: 144000, jumlah: 1440000 },
                  ]
                },
                {
                  id: 'acc-blud-6',
                  no: '6.',
                  kodeRekening: '5.1.02.01.001.00030',
                  uraian: 'Belanja Perabot Kantor',
                  items: [
                    { id: 'i-prb-1', kode: '1.1.12.01.03.0007.00068', uraian: 'Sapu Pembersih Air', rincianText: '3 buah x Rp 54.200', qty: 3, satuan: 'buah', harga: 54200, jumlah: 162600 },
                    { id: 'i-prb-2', kode: '1.1.12.01.03.0007.00085', uraian: 'Sikat Kloset', rincianText: '10 buah x Rp 49.600', qty: 10, satuan: 'buah', harga: 49600, jumlah: 496000 },
                    { id: 'i-prb-3', kode: '1.1.12.01.03.0007.00088', uraian: 'Sikat Lantai, panjang gagang 110 cm', rincianText: '5 buah x Rp 47.500', qty: 5, satuan: 'buah', harga: 47500, jumlah: 237500 },
                    { id: 'i-prb-4', kode: '1.1.12.01.03.0007.00093', uraian: 'Alat Pel Super Mop', rincianText: '4 buah x Rp 320.800', qty: 4, satuan: 'buah', harga: 320800, jumlah: 1283200 },
                    { id: 'i-prb-5', kode: '1.1.12.01.03.0007.00098', uraian: 'Kain Lap Bahan Mikrofiber Uk. 30 x 30 cm', rincianText: '6 pack x Rp 38.700', qty: 6, satuan: 'pack', harga: 38700, jumlah: 232200 },
                    { id: 'i-prb-6', kode: '1.1.12.01.03.0007.00106', uraian: 'lap kanebo Uk. 32 x 43 Cm', rincianText: '12 pack x Rp 75.500', qty: 12, satuan: 'pack', harga: 75500, jumlah: 906000 },
                    { id: 'i-prb-7', kode: '1.1.12.01.03.0007.00124', uraian: 'Keset Kamar Mandi Uk. 50 x 80 cm', rincianText: '24 buah x Rp 175.500', qty: 24, satuan: 'buah', harga: 175500, jumlah: 4212000 },
                    { id: 'i-prb-8', kode: '1.1.12.01.03.0007.00125', uraian: 'Keset Karet Uk. 50 x 100 cm', rincianText: '4 buah x Rp 101.200', qty: 4, satuan: 'buah', harga: 101200, jumlah: 404800 },
                    { id: 'i-prb-9', kode: '1.1.12.01.03.0007.00120', uraian: 'Keset handuk Uk. 45 x 70 Cm', rincianText: '24 buah x Rp 52.100', qty: 24, satuan: 'buah', harga: 52100, jumlah: 1250400 },
                    { id: 'i-prb-10', kode: '1.1.12.01.03.0007.00156', uraian: 'Pembersih Lantai Uk. 750', rincianText: '50 btl x Rp 25.400', qty: 50, satuan: 'btl', harga: 25400, jumlah: 1270000 },
                    { id: 'i-prb-11', kode: '1.1.12.01.03.0007.00179', uraian: 'Sabun Cuci Piring Uk. 910 ml', rincianText: '20 buah x Rp 21.100', qty: 20, satuan: 'buah', harga: 21100, jumlah: 422000 },
                    { id: 'i-prb-12', kode: '1.1.12.01.03.0007.00320', uraian: 'Sabun Cuci Tangan Anti Bacterial 500 ml', rincianText: '35 botol x Rp 75.400', qty: 35, satuan: 'botol', harga: 75400, jumlah: 2639000 },
                    { id: 'i-prb-13', kode: '1.1.12.01.03.0007.00183', uraian: 'Isi ulang Pengharum Ruangan Uk. 225 ml', rincianText: '40 buah x Rp 34.700', qty: 40, satuan: 'buah', harga: 34700, jumlah: 1388000 },
                    { id: 'i-prb-14', kode: '1.1.12.01.03.0007.00184', uraian: 'Pengharum Mobil Uk. 7,5 ml', rincianText: '12 buah x Rp 71.000', qty: 12, satuan: 'buah', harga: 71000, jumlah: 852000 },
                    { id: 'i-prb-15', kode: '1.1.12.01.03.0007.00191', uraian: 'Pengharum Kamar Mandi Uk. 80 gram', rincianText: '24 bks x Rp 12.500', qty: 24, satuan: 'bks', harga: 12500, jumlah: 300000 },
                    { id: 'i-prb-16', kode: '1.1.12.01.03.0007.00419', uraian: 'Box Container Ukuran 75×51×20 cm, bahan plastik', rincianText: '2 buah x Rp 300.000', qty: 2, satuan: 'buah', harga: 300000, jumlah: 600000 },
                    { id: 'i-prb-17', kode: '1.1.12.01.03.0007.00147', uraian: 'Tempat Sampah Pedal Injak, Kap. 10 Liter', rincianText: '5 buah x Rp 85.200', qty: 5, satuan: 'buah', harga: 85200, jumlah: 426000 },
                    { id: 'i-prb-18', kode: '1.1.12.01.03.0007.00265', uraian: 'Tempat Sampah Injak Kapasitas 30 liter', rincianText: '4 buah x Rp 600.000', qty: 4, satuan: 'buah', harga: 600000, jumlah: 2400000 },
                    { id: 'i-prb-19', kode: '1.1.12.01.03.0007.00202', uraian: 'Obat Nyamuk Spray 400 ml', rincianText: '20 kaleng x Rp 59.100', qty: 20, satuan: 'kaleng', harga: 59100, jumlah: 1182000 },
                    { id: 'i-prb-20', kode: '1.1.12.01.03.0007.00209', uraian: 'Tissue isi 250 lembar', rincianText: '250 bks x Rp 23.000', qty: 250, satuan: 'bks', harga: 23000, jumlah: 5750000 },
                    { id: 'i-prb-21', kode: '1.1.12.01.03.0007.00221', uraian: 'Pembersih Closet Uk. 450 ml', rincianText: '20 botol x Rp 39.300', qty: 20, satuan: 'botol', harga: 39300, jumlah: 786000 },
                    { id: 'i-prb-22', kode: '1.1.12.01.03.0007.00280', uraian: 'Shampo mobil', rincianText: '12 buah x Rp 19.200', qty: 12, satuan: 'buah', harga: 19200, jumlah: 230400 },
                    { id: 'i-prb-23', kode: '1.1.12.01.03.0007.00283', uraian: 'Tissue Hand Towel Toilet isi 150 sheet', rincianText: '250 buah x Rp 20.400', qty: 250, satuan: 'buah', harga: 20400, jumlah: 5100000 },
                    { id: 'i-prb-24', kode: '1.1.12.01.03.0007.00339', uraian: 'Pembersih Kaca isi 500 ml', rincianText: '10 botol x Rp 112.000', qty: 10, satuan: 'botol', harga: 112000, jumlah: 1120000 },
                    { id: 'i-prb-25', kode: '1.1.12.01.03.0007.00066', uraian: 'Sapu lantai', rincianText: '10 buah x Rp 20.600', qty: 10, satuan: 'buah', harga: 20600, jumlah: 206000 },
                    { id: 'i-prb-26', kode: '1.1.12.01.03.0007.00072', uraian: 'Sapu Lidi Gagang Bambu', rincianText: '5 buah x Rp 10.700', qty: 5, satuan: 'buah', harga: 10700, jumlah: 53500 },
                    { id: 'i-prb-27', kode: '1.1.12.01.03.0007.00100', uraian: 'kain Lap Uk. 35 x 35 cm', rincianText: '12 buah x Rp 9.500', qty: 12, satuan: 'buah', harga: 9500, jumlah: 114000 },
                    { id: 'i-prb-28', kode: '1.1.12.01.03.0007.00135', uraian: 'Kantong Sampah Plastik Uk. 40 x 60 cm isi 28-45 lembar', rincianText: '40 pack x Rp 17.900', qty: 40, satuan: 'pack', harga: 17900, jumlah: 716000 },
                    { id: 'i-prb-29', kode: '1.1.12.01.03.0007.00135', uraian: 'Kantong Sampah Plastik Uk. 60 x 100 cm isi 16 lembar', rincianText: '40 pack x Rp 27.500', qty: 40, satuan: 'pack', harga: 27500, jumlah: 1100000 },
                    { id: 'i-prb-30', kode: '1.1.12.01.03.0007.00131', uraian: 'Kantong Sampah Plastik Uk. 80 x 100 cm isi 15 lembar', rincianText: '30 pack x Rp 30.200', qty: 30, satuan: 'pack', harga: 30200, jumlah: 906000 },
                    { id: 'i-prb-31', kode: '1.1.12.01.03.0007.00134', uraian: 'Kantong Sampah Plastik Uk. 100 x 120 cm isi 5 lembar', rincianText: '20 pack x Rp 34.000', qty: 20, satuan: 'pack', harga: 34000, jumlah: 680000 },
                    { id: 'i-prb-32', kode: '1.1.12.01.03.0007.00136', uraian: 'Kantong Sampah Limbah Medis Uk. 40 x 60 cm isi 23 lembar', rincianText: '20 pack x Rp 23.600', qty: 20, satuan: 'pack', harga: 23600, jumlah: 472000 },
                    { id: 'i-prb-33', kode: '1.1.12.01.03.0007.00137', uraian: 'Kantong Sampah Limbah Medis Uk. 90 x 120 cm , isi 5 lembar', rincianText: '20 pack x Rp 32.000', qty: 20, satuan: 'pack', harga: 32000, jumlah: 640000 },
                    { id: 'i-prb-34', kode: '1.1.12.01.03.0007.00245', uraian: 'Gayung Air Bahan Plastik', rincianText: '6 buah x Rp 32.100', qty: 6, satuan: 'buah', harga: 32100, jumlah: 192600 },
                    { id: 'i-prb-35', kode: '', uraian: 'Sabun Cuci Tangan isi 5 liter', rincianText: '40 jerigen x Rp 75.400', qty: 40, satuan: 'jerigen', harga: 75400, jumlah: 3016000 },
                  ]
                },
                {
                  id: 'acc-blud-7',
                  no: '7.',
                  kodeRekening: '5.1.02.01.001.00037',
                  uraian: 'Belanja obat',
                  items: [
                    { id: 'i-obt-1', kode: '', uraian: 'Belanja obat', rincianText: '1 tahun x Rp. 5.546.927', qty: 1, satuan: 'tahun', harga: 5546927, jumlah: 5546927 }
                  ]
                },
                {
                  id: 'acc-blud-8',
                  no: '8.',
                  kodeRekening: '5.1.02.01.001.00038',
                  uraian: 'Belanja obat-obatan lainnya',
                  items: [
                    { id: 'i-obt-2', kode: '', uraian: 'Belanja obat-obatan lainnya (BMHP)', rincianText: '1 tahun x Rp. 5.000.000', qty: 1, satuan: 'tahun', harga: 3560012, jumlah: 3560012 }
                  ]
                },
                {
                  id: 'acc-blud-9',
                  no: '9.',
                  kodeRekening: '5.1.02.01.001.00009',
                  uraian: 'Belanja Isi Tabung Pemadam Kebakaran',
                  items: [
                    { id: 'i-apar-1', kode: '1.1.12.01.09.0009.00002', uraian: 'Isi tabung APAR tabung 6 kg', rincianText: '4 unit x Rp 300.000', qty: 4, satuan: 'unit', harga: 300000, jumlah: 1200000 }
                  ]
                },
                {
                  id: 'acc-blud-10',
                  no: '10.',
                  kodeRekening: '5.2.02.05.002.00005',
                  uraian: 'Belanja isi tabung oksigen',
                  items: [
                    { id: 'i-o2-1', kode: '', uraian: 'Beban Persediaan Tabung Oksigen (O2)', rincianText: '5 buah x 1 kali x Rp 50.000', qty: 5, satuan: 'buah', harga: 50000, jumlah: 250000 }
                  ]
                },
                {
                  id: 'acc-blud-11',
                  no: '11.',
                  kodeRekening: '5.1.02.01.001.00004',
                  uraian: 'Bahan bakar dan pelumas',
                  items: [
                    { id: 'i-bbm-1', kode: '1.1.12.01.01.0004.00093', uraian: 'BBM pertamax (kendaraan dinas roda empat)', rincianText: '1 tahun x Rp 33.177.600', qty: 1, satuan: 'tahun', harga: 33177600, jumlah: 33177600 }
                  ]
                },
                {
                  id: 'acc-blud-12',
                  no: '12.',
                  kodeRekening: '5.1.02.01.001.00029',
                  uraian: 'Belanja bahan komputer',
                  items: [
                    { id: 'i-komp-1', kode: '1.1.12.01.03.0006.00161', uraian: 'Tinta Printer Epson', rincianText: '60 buah x Rp 161.000', qty: 60, satuan: 'buah', harga: 161000, jumlah: 9660000 },
                    { id: 'i-komp-2', kode: '1.1.12.01.03.0006.00163', uraian: 'Mouse Nirkabel / Aksesoris Komputer', rincianText: '8 unit x Rp 180.000', qty: 8, satuan: 'unit', harga: 180000, jumlah: 1440000 },
                  ]
                },
                {
                  id: 'acc-blud-28',
                  no: '28.',
                  kodeRekening: '5.1.02.04.001.00001',
                  uraian: 'Beban Perjalanan Dinas Biasa',
                  items: [
                    { id: 'i-pld-1', kode: '8.1.02.04.01.0001.00003', uraian: 'Perjalanan Dinas Luar Provinsi, Eselon III / Gol IV: 3 Hari 2 Malam', rincianText: '1 thn x Rp 70.000.000', qty: 1, satuan: 'thn', harga: 70000000, jumlah: 70000000 }
                  ]
                },
                {
                  id: 'acc-blud-29',
                  no: '29.',
                  kodeRekening: '5.1.02.01.001.00027',
                  uraian: 'Belanja Alat/Bahan untuk Kegiatan Kantor-Benda Pos',
                  items: [
                    { id: 'i-mtr-1', kode: '1.1.12.01.03.0004.00001', uraian: 'Materai', rincianText: '15 lbr x 12 bulan x Rp 12.000', qty: 15, satuan: 'lbr', durasi: 12, durasiSatuan: 'bulan', harga: 12000, jumlah: 2160000 }
                  ]
                },
                {
                  id: 'acc-blud-30',
                  no: '30.',
                  kodeRekening: '5.1.02.02.001.00029',
                  uraian: 'Beban Jasa Tenaga Ahli',
                  items: [
                    { id: 'i-ahli-1', kode: '8.1.02.02.01.0029.00005', uraian: 'Beban honorarium rehab bangunan', rincianText: '1 org x 2 jam x 2 keg x Rp 1.000.000', qty: 1, satuan: 'org', durasi: 2, durasiSatuan: 'jam', harga: 1000000, jumlah: 4000000 }
                  ]
                }
              ],
              subtotalTitle: 'JUMLAH BELANJA BARANG DAN JASA BLUD',
              subtotalDefault: 1242105607
            },
            {
              id: 'sg-barjas-bok',
              title: 'Belanja Barang dan Jasa BOK',
              bgHeader: '#dcfce7',
              accounts: [
                {
                  id: 'acc-bok-1',
                  no: '',
                  kodeRekening: '',
                  uraian: 'PENINGKATAN LAYANAN KESEHATAN SESUAI SIKLUS HIDUP :',
                  items: [
                    { id: 'i-bok-1-1', kode: '1.02.02.2.02.0021', uraian: '1. Pengelolaan Pelayanan Kesehatan Orang dengan Masalah Kesehatan Jiwa (ODMK)', rincianText: 'Fasilitasi Pelaksanaa First Aider Pertolongan Pertama', qty: 1, satuan: 'paket', harga: 3080000, jumlah: 3080000 },
                    { id: 'i-bok-1-2', kode: '1.02.02.2.02.0010', uraian: '2. Pengelolaan Pelayanan Kesehatan Orang dengan Gangguan Jiwa Berat', rincianText: 'Pelacakan dan Pengawasan Minum Obat', qty: 1, satuan: 'paket', harga: 4200000, jumlah: 4200000 },
                    { id: 'i-bok-1-3', kode: '1.02.02.2.02.0046', uraian: '3. Pengelolaan upaya kesehatan Ibu dan Anak', rincianText: 'Pelacakan dan pelaporan kematian', qty: 1, satuan: 'paket', harga: 2233000, jumlah: 2233000 },
                    { id: 'i-bok-1-4', kode: '1.02.02.2.02.0001', uraian: '4. Pengelolaan Pelayanan Kesehatan Ibu Hamil', rincianText: 'Pelaksanaan Kelas ibu Hamil dan Ibu Balita', qty: 1, satuan: 'paket', harga: 24640000, jumlah: 24640000 },
                    { id: 'i-bok-1-5', kode: '1.02.02.2.02.0005', uraian: '5. Pengelolaan Pelayanan Kesehatan pada Usia Pendidikan Dasar', rincianText: 'Pelayanan Kesehatan pada anak usia sekolah dan remaja', qty: 1, satuan: 'paket', harga: 35100000, jumlah: 35100000 },
                    { id: 'i-bok-1-6', kode: '1.02.02.2.02.0021', uraian: '6. Pengelolaan Pelayanan Kesehatan Orang dengan Masalah Kesehatan Jiwa (ODMK)', rincianText: 'Skrining dan Tindak Lanjut Hasil Skrining Jiwa', qty: 1, satuan: 'paket', harga: 11200000, jumlah: 11200000 },
                    { id: 'i-bok-1-7', kode: '1.02.02.2.02.0015', uraian: '7. Pengelolaan Pelayanan Kesehatan Gizi Masyarakat', rincianText: 'Kunjungan lapangan pemantauan Tumbuh Kembang dan Gizi', qty: 1, satuan: 'paket', harga: 44000000, jumlah: 44000000 },
                  ]
                },
                {
                  id: 'acc-bok-2',
                  no: '',
                  kodeRekening: '',
                  uraian: 'SURVEILANCE, RESPONS PENYAKIT DAN KESEHATAN LINGKUNGAN :',
                  items: [
                    { id: 'i-bok-surv-1', kode: '', uraian: 'Surveilans & Pengendalian Vektor Penyakit Menular & Tidak Menular', rincianText: 'Transport, ATK, Reagen & Bahan Uji Lapangan', qty: 1, satuan: 'tahun', harga: 174822000, jumlah: 174822000 }
                  ]
                },
                {
                  id: 'acc-bok-3',
                  no: '1.',
                  kodeRekening: '1.02.02.2.02.0033',
                  uraian: 'INSENTIF UKM : Operasional Pelayanan Puskesmas',
                  items: [
                    { id: 'i-bok-ukm-1', kode: '', uraian: 'Pemberian Insentif UKM bagi Pegawai Puskesmas', rincianText: '1 keg x 1 keg x Rp 83.004.996', qty: 1, satuan: 'keg', harga: 83004996, jumlah: 83004996 }
                  ]
                },
                {
                  id: 'acc-bok-4',
                  no: '',
                  kodeRekening: '',
                  uraian: 'LAIN-LAIN BOK',
                  items: [
                    { id: 'i-bok-lain-1', kode: '', uraian: 'Dukungan Operasional Program BOK Lainnya', rincianText: 'Operasional Pendukung BOK', qty: 1, satuan: 'paket', harga: 3900000, jumlah: 3900000 }
                  ]
                }
              ],
              subtotalTitle: 'JUMLAH BELANJA BARANG DAN JASA BOK',
              subtotalDefault: 552653996
            }
          ],
          totalBarjasTitle: 'JUMLAH BELANJA BARANG DAN JASA BLUD',
          totalBarjasDefault: 2008381270
        }
      ]
    },
    {
      id: 'bel-modal',
      kodeHeader: '5.2',
      title: 'BELANJA MODAL',
      groups: [
        {
          id: 'grp-modal-mesin',
          kodeRekening: '5.1.02.99.099.09999',
          title: 'BELANJA MODAL PERALATAN DAN MESIN BLUD',
          subGroups: [
            {
              id: 'sg-modal-items',
              title: 'Rincian Belanja Modal Peralatan dan Mesin',
              bgHeader: '#fed7aa',
              accounts: [
                {
                  id: 'acc-mod-1',
                  no: '1.',
                  kodeRekening: '5.2.02.10.002.00003',
                  uraian: 'Belanja Modal Peralatan Personal Computer',
                  items: [
                    { id: 'i-mod-1-1', kode: '1.3.02.10.02.0003.00008', uraian: 'Printer Ink Jet Multifungsi All In One', rincianText: '4 unit x Rp 3.480.200', qty: 4, satuan: 'unit', harga: 3480200, jumlah: 13920800 },
                    { id: 'i-mod-1-2', kode: '1.3.02.10.02.0003.00012', uraian: 'Printer Thermal / Label', rincianText: '1 unit x Rp 2.600.000', qty: 1, satuan: 'unit', harga: 2600000, jumlah: 2600000 },
                  ]
                },
                {
                  id: 'acc-mod-2',
                  no: '2.',
                  kodeRekening: '5.2.02.10.001.00002',
                  uraian: 'Belanja Modal Personal Computer',
                  items: [
                    { id: 'i-mod-2-1', kode: '1.3.02.10.01.0002.00002', uraian: 'Komputer / PC (Min. CPU Octacore, RAM 16 GB)', rincianText: '2 unit x Rp 10.759.301', qty: 2, satuan: 'unit', harga: 10759301, jumlah: 21518601 },
                    { id: 'i-mod-2-2', kode: '1.3.02.10.01.0002.00004', uraian: 'Laptop Administrasi Perkantoran', rincianText: '5 unit x Rp 9.000.000', qty: 5, satuan: 'unit', harga: 9000000, jumlah: 45000000 },
                  ]
                },
                {
                  id: 'acc-mod-3',
                  no: '3.',
                  kodeRekening: '5.2.02.05.002.00006',
                  uraian: 'Belanja Modal Alat Rumah Tangga Lainnya (Home Use)',
                  items: [
                    { id: 'i-mod-3-1', kode: '1.3.02.05.02.0006.00014', uraian: 'Televisi (Uk. 42 Inch, Smart TV)', rincianText: '2 unit x Rp 4.100.000', qty: 2, satuan: 'unit', harga: 4100000, jumlah: 8200000 },
                    { id: 'i-mod-3-2', kode: '1.3.02.05.02.0004.00024', uraian: 'Kipas Angin Dinding', rincianText: '2 unit x Rp 1.550.000', qty: 2, satuan: 'unit', harga: 1550000, jumlah: 3100000 },
                  ]
                },
                {
                  id: 'acc-mod-4',
                  no: '4.',
                  kodeRekening: '5.2.02.07.001.00001',
                  uraian: 'Belanja Modal Alat Kedokteran Umum',
                  items: [
                    { id: 'i-mod-4-1', kode: '1.3.02.07.01.0001.00037', uraian: 'Timbangan Badan', rincianText: '6 unit x Rp 2.000.000', qty: 6, satuan: 'unit', harga: 2000000, jumlah: 12000000 },
                    { id: 'i-mod-4-2', kode: '1.3.02.07.01.0001.00052', uraian: 'Tensimeter Digital Tipe digital dan dilengkapi adaptor ( Kajian Awal)', rincianText: '6 unit x Rp 1.200.000', qty: 6, satuan: 'unit', harga: 1200000, jumlah: 7200000 },
                    { id: 'i-mod-4-3', kode: '1.3.02.07.01.0001.00036', uraian: 'Thermogun', rincianText: '4 Unit x Rp 431.000', qty: 4, satuan: 'unit', harga: 431000, jumlah: 1724000 },
                  ]
                },
                {
                  id: 'acc-mod-5',
                  no: '5.',
                  kodeRekening: '5.2.02.05.001.00004',
                  uraian: 'Belanja Modal Alat Penyimpan Perlengkapan Kantor',
                  items: [
                    { id: 'i-mod-5-1', kode: '1.1.12.01.03.0013.00098', uraian: 'Rak Besi 5 Tingkat', rincianText: '4 buah x Rp 990.000', qty: 4, satuan: 'buah', harga: 990000, jumlah: 3960000 },
                  ]
                },
                {
                  id: 'acc-mod-6',
                  no: '6.',
                  kodeRekening: '5.2.02.05.001.00005',
                  uraian: 'Belanja Modal Alat Kantor Lainnya',
                  items: [
                    { id: 'i-mod-6-1', kode: '1.3.02.05.01.0005.00010', uraian: 'CCTV', rincianText: '6 unit x Rp 892.500', qty: 6, satuan: 'unit', harga: 892500, jumlah: 5355000 },
                  ]
                }
              ],
              subtotalTitle: 'JUMLAH BELANJA MODAL PERALATAN DAN MESIN BLUD',
              subtotalDefault: 124578401
            }
          ]
        }
      ]
    }
  ]
};
