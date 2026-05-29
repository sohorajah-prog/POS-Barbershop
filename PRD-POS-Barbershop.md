# PRD — Aplikasi POS Kasir Barbershop

**Versi:** 1.0 (Draft, untuk review) · **Tanggal:** Mei 2026
**Tipe:** Web App Responsive · **Peran:** Admin · Manajer Outlet · Kasir · **Skala:** Multi-outlet (~5)

---

## 01 · Ringkasan Produk & Tujuan

Aplikasi POS yang dirancang khusus untuk barbershop yang mengelola beberapa outlet, dengan kebutuhan operasional yang berbeda dari retail biasa: transaksi melekat pada **kapster**, ada **antrian walk-in** dan **booking**, serta perhitungan **komisi** yang akurat.

**Masalah yang dipecahkan**

- Pencatatan transaksi manual rawan selisih dan sulit direkonsiliasi antar-shift dan antar-outlet.
- Tidak ada visibilitas terpusat: pemilik tak bisa membandingkan performa outlet secara real-time.
- Antrian walk-in dan booking dikelola terpisah (buku, chat) sehingga bentrok jadwal kapster dan no-show tinggi.
- Komisi kapster dihitung manual di akhir periode — sumber sengketa dan kesalahan.

**Sasaran produk (measurable)**

- *Operasional:* satu transaksi POS selesai < 45 detik; rekonsiliasi shift < 5 menit; selisih kas tutup shift mendekati nol.
- *Bisnis:* no-show booking turun via reminder WhatsApp; komisi kapster terhitung otomatis 100% transaksi; laporan multi-outlet tanpa rekap manual.

> **⚑ Catatan kritis.** PRD ini menambahkan modul **Komisi Kapster** yang tidak ada di permintaan awal. Untuk barbershop, komisi adalah kebutuhan inti — "Daftar Kapster" + "Manajemen Shift" tanpa komisi hanya mencatat siapa kerja kapan, bukan berapa yang mereka hasilkan. Jika komisi ditangani di luar sistem, modul 11 dapat dihapus tanpa memengaruhi modul lain.

---

## 02 · Asumsi & Keputusan Desain

Keputusan berikut dikunci di awal karena memengaruhi banyak modul. Perubahan setelah pengembangan dimulai berbiaya tinggi.

- **Platform:** Web responsive — satu basis kode untuk tablet kasir, desktop manajer/admin, dan mobile. Tidak ada aplikasi native di fase awal.
- **Peran:** 3 tingkat — Admin (pusat/owner), Manajer Outlet, Kasir. Kapster *bukan* pengguna login di fase ini; data & komisi kapster dikelola oleh Manajer/Admin.
- **Booking:** input internal oleh staf *plus* kanal online — link booking publik per outlet dan integrasi WhatsApp (konfirmasi + reminder + reschedule).
- **Pembayaran (default):** Tunai, QRIS, Kartu Debit/Kredit via EDC, dan E-wallet. Split payment didukung. Integrasi gateway otomatis = fase lanjut; fase awal pencatatan metode + nominal.
- **Inventory:** stok dasar per outlet untuk Produk Ritel + alert stok menipis. Purchase order / manajemen supplier = di luar cakupan fase awal.
- **Komisi:** hanya untuk *jasa/layanan*. Tidak ada komisi penjualan produk ritel.
- **Pajak:** satu nilai tunggal, di-input manual dan dapat diubah sewaktu-waktu oleh Admin untuk menyesuaikan regulasi. Tidak ada service charge terpisah dan tidak ada nilai yang di-hardcode.
- **Booking deposit:** tanpa deposit/DP. Slot diamankan oleh konfirmasi saja.
- **Fitur Pelanggan:** tidak ada di fase awal. Customer hanya entri opsional di transaksi (nama untuk struk); tanpa profil/membership/loyalti/riwayat.
- **Skala:** dirancang untuk ~5 outlet. Arsitektur cukup dengan katalog master + override per outlet; tidak butuh sharding/multi-tenant kompleks.

> **⚠ Risiko.** POS berbasis web sangat bergantung pada koneksi internet. Di outlet, internet putus = kasir berhenti. Rekomendasi: bangun sebagai **PWA** dengan antrian transaksi offline (simpan lokal, sinkron saat online kembali) minimal untuk alur "buat transaksi + bayar tunai". Jika tidak dimasukkan, sampaikan ke pemilik bahwa downtime internet = downtime kasir.

---

## 03 · Peran Pengguna & Hak Akses

Semua data **terikat (scoped) pada outlet**. Manajer dan Kasir hanya melihat data outlet tempat mereka ditugaskan; Admin melihat dan membandingkan seluruh outlet.

- **Admin / Owner** — akses penuh lintas outlet. Kelola outlet, user, katalog master, harga, aturan komisi, pajak, integrasi, dan semua laporan. Tidak terikat shift.
- **Manajer Outlet** — operasional satu outlet: kelola kapster, jadwal, booking, shift, lihat laporan & komisi outlet, atur sebagian preferensi outlet. Tidak bisa ubah katalog master/harga global.
- **Kasir** — menjalankan transaksi: POS, antrian, tarik booking, buka/tutup shift sendiri. Tidak melihat laporan agregat atau komisi orang lain. Aksi sensitif (void, diskon, harga manual) diatur izinnya.

**Matriks hak akses**

| Kapabilitas | Admin | Manajer | Kasir |
|---|:---:|:---:|:---:|
| Membuat transaksi POS | ✓ | ✓ | ✓ |
| Kelola antrian walk-in | ✓ | ✓ | ✓ |
| Buka / tutup shift sendiri | ✓ | ✓ | ✓ |
| Void / refund transaksi | ✓ | ✓ | izin* |
| Beri diskon manual | ✓ | ✓ | izin* |
| Kelola booking & jadwal kapster | ✓ | ✓ | lihat |
| Kelola daftar & profil kapster | ✓ | ✓ | — |
| Edit katalog layanan & harga (outlet) | ✓ | harga lokal | — |
| Edit katalog master & aturan komisi | ✓ | — | — |
| Lihat laporan agregat semua outlet | ✓ | — | — |
| Lihat laporan & komisi outlet sendiri | ✓ | ✓ | — |
| Kelola outlet, user, integrasi, pajak | ✓ | — | — |
| Atur "Penginputan Kasir" | ✓ | sebagian | — |

\*"izin" = bergantung pada konfigurasi di Pengaturan Penginputan Kasir (Modul 13). Default: nonaktif.

---

## 04 · Arsitektur Navigasi

Login → pemilihan outlet (Admin) / auto-outlet (Manajer & Kasir) → sidebar utama (hijau-gelap, branding) → area kerja (kanvas terang). Kasir membuka layar dengan **POS sebagai default**, bukan Dashboard.

**Navigasi utama:** Dashboard · POS Kasir · Antrian Walk-in · Booking Jadwal · Katalog & Layanan · Manajemen Shift · Komisi Kapster · Laporan Penjualan · Pengaturan.

**Elemen global:** pemilih outlet aktif (Admin) di header; indikator status shift selalu terlihat untuk Kasir; badge antrian aktif & booking hari ini; profil & logout; jejak audit untuk aksi sensitif.

---

## 05 · Modul: Dashboard

*Akses: Admin · Manajer · Kasir (ringkas).*

Ringkasan kondisi bisnis yang **berbeda per peran** — bukan sekadar angka, harus menjawab "apa yang perlu saya lakukan sekarang".

- **Admin:** omzet agregat & per-outlet, perbandingan antar-outlet, tren periode, ranking kapster & layanan, status semua shift aktif.
- **Manajer:** omzet outlet hari ini vs kemarin/target, antrian aktif, booking hari ini, kapster bertugas, produk terlaris, stok menipis.
- **Kasir:** ringkas — penjualan shift berjalan, jumlah transaksi, antrian menunggu, booking yang akan datang.

**Detail:** filter periode (hari/minggu/bulan/kustom) & outlet (Admin); widget bisa diklik menuju modul terkait; angka kunci memakai aksen emas; latar kerja terang.

**Kriteria penerimaan:** data sesuai scope peran & outlet (Kasir tak pernah melihat komisi/omzet outlet lain); refresh ≤ 60 detik / on-demand dengan timestamp.

---

## 06 · Modul: POS Kasir

*Akses: Kasir · Manajer · Admin. Jantung aplikasi — harus cepat, minim klik, tidak boleh kehilangan transaksi.*

**Alur transaksi**

1. Pastikan shift terbuka (jika belum & tidak diizinkan → diblokir; lihat Modul 13).
2. Pilih customer (opsional / walk-in) atau tarik dari Antrian / Booking.
3. Pilih **kapster** (wajib bila diatur demikian) — penentu komisi.
4. Tambah item: Layanan & Jasa dan/atau Produk Ritel, atur qty, diskon item (jika diizinkan).
5. Terapkan pajak (nilai tunggal) sesuai konfigurasi outlet; diskon total bila diizinkan.
6. Pilih metode bayar (Tunai/QRIS/EDC/E-wallet, atau split); hitung kembalian.
7. Selesaikan → komisi tercatat otomatis → cetak struk / kirim via WhatsApp.

**Fungsi pendukung:** hold/parkir transaksi; void & refund (wajib alasan, audit log, izin diatur); multi-kapster per transaksi (komisi terbagi per item); pencarian item cepat, item favorit, barcode; struk dengan header/footer outlet, kapster, metode bayar, nomor transaksi unik.

**Kriteria penerimaan:** transaksi tunai standar (2 item) ≤ 45 detik; setiap transaksi selesai menghasilkan record komisi sesuai kapster & aturan saat itu; void/refund tidak menghapus data (status berubah + terekam siapa/kapan/alasan); transaksi tertahan tidak hilang saat refresh/ganti perangkat dalam outlet sama.

---

## 07 · Modul: Antrian Walk-in

*Akses: Kasir · Manajer.*

Pelanggan datang tanpa booking. Modul ini mengubah keramaian menjadi urutan terkelola dan terhubung ke POS.

- Daftarkan antrian: nama (opsional), layanan, pilih kapster *atau* "kapster mana saja".
- Estimasi waktu tunggu berdasarkan durasi layanan & ketersediaan kapster.
- Status: **Menunggu → Dipanggil → Dilayani → Selesai → Checkout** (push ke POS).
- Mode tampilan antrian untuk layar/TV outlet.
- Pindahkan/urutkan ulang antrian; tandai batal / pergi.

**Kriteria penerimaan:** item "Selesai" dapat ditarik ke POS dengan layanan & kapster terisi otomatis; estimasi tunggu memperhitungkan kapster yang melayani & durasi; antrian terikat outlet aktif (tidak bocor antar-outlet).

---

## 08 · Modul: Booking Jadwal

*Akses: Manajer · Kasir (lihat/tarik) · kanal Online & WhatsApp.*

- Kalender per kapster per outlet; slot dari jam operasional + durasi layanan + buffer.
- Sumber booking: **input staf**, **link booking publik** per outlet, dan **WhatsApp**.
- Status: Diminta → Dikonfirmasi → Reminder (H-1 & H-jam) → Hadir (push ke antrian/POS) → Selesai / No-show.
- Cegah double-booking; buffer antar-jadwal. **Tanpa deposit/DP** — slot diamankan oleh konfirmasi.
- Reschedule & pembatalan dengan jejak; link self-reschedule untuk pelanggan.

**Integrasi WhatsApp/online:** pesan otomatis (konfirmasi, reminder, perubahan, terima kasih); link publik menampilkan slot tersedia real-time tanpa membuka data internal.

> **⚠ Risiko.** Integrasi WhatsApp resmi (WA Business API) butuh persetujuan template pesan, nomor terverifikasi, dan biaya per percakapan melalui provider (BSP) — bukan "tinggal colok". Untuk MVP, pertimbangkan link booking publik + notifikasi email dulu, lalu WhatsApp menyusul setelah akun BSP siap.

**Kriteria penerimaan:** tidak mungkin membuat dua booking bertumpukan untuk kapster sama; booking "Hadir" otomatis muncul di antrian/POS outlet terkait; slot di link publik tidak menampilkan jadwal penuh.

---

## 09 · Modul: Katalog & Layanan

*Akses: Admin · Manajer (terbatas). Empat sub-modul — sumber data untuk POS, booking, dan komisi.*

**9.1 Layanan & Jasa** — nama, kategori, **durasi** (untuk slot booking & estimasi antrian), harga; harga dapat berbeda per outlet (override); aturan komisi melekat (persen/flat); status aktif/nonaktif per outlet.

**9.2 Produk Ritel** — SKU, kategori, harga, barcode; **stok per outlet** + ambang alert; stok berkurang otomatis saat terjual (penyesuaian manual tercatat); **tanpa komisi produk** — komisi hanya berlaku untuk jasa.

**9.3 Daftar Kapster** — profil (nama, foto, kontak, outlet, status); layanan yang dikuasai (memengaruhi slot booking & pilihan antrian); jam kerja default; aturan komisi default kapster (override aturan layanan).

**9.4 Pengaturan Outlet** — identitas, alamat, kontak, jam operasional; pajak (satu nilai tunggal, manual, dapat diubah Admin; tanpa service charge); metode bayar aktif; konfigurasi printer & header/footer struk; link booking publik outlet.

> **⚑ Catatan.** Manajer hanya boleh mengubah **harga lokal & status aktif** di outletnya, bukan struktur katalog master atau aturan komisi global. Tanpa batas ini, konsistensi harga & komisi antar-outlet akan kacau.

---

## 10 · Modul: Manajemen Shift

*Akses: Kasir · Manajer · Admin. Akuntabilitas kas per kasir per periode kerja.*

- **Buka shift:** catat kas awal, kasir, waktu mulai, outlet.
- **Selama shift:** semua transaksi melekat ke shift berjalan.
- **Tutup shift:** input kas fisik akhir → sistem hitung ekspektasi (kas awal + tunai masuk − kas keluar) → tampilkan **selisih** → catat setoran.
- Rincian per metode bayar (tunai vs non-tunai) saat tutup shift.
- Riwayat shift & laporan per shift (mirip X/Z report).

**Kriteria penerimaan:** transaksi tidak dapat dibuat tanpa shift terbuka (kecuali diizinkan eksplisit, Modul 13); selisih kas dihitung otomatis & tidak dapat diubah setelah shift ditutup (hanya catatan koreksi); satu kasir tidak bisa membuka dua shift bersamaan di outlet sama.

---

## 11 · Modul: Komisi Kapster *(tambahan)*

*Akses: Admin · Manajer (outlet). Dihitung otomatis dari setiap transaksi selesai berdasarkan aturan yang berlaku saat transaksi terjadi.*

**Aturan komisi**

- Berlaku **hanya untuk layanan/jasa** — produk ritel tidak menghasilkan komisi.
- Per layanan: persentase atau nominal flat.
- Hirarki: aturan kapster > aturan layanan > default. Multi-kapster → komisi per item.
- Tiered/target-based (mis. bonus di atas omzet tertentu) — fase lanjut.

**Pelaporan:** komisi per kapster per periode & per outlet; rincian per transaksi (dapat ditelusuri); status pembayaran komisi (opsional, untuk payroll); export untuk proses payroll.

**Kriteria penerimaan:** setiap item transaksi menghasilkan satu record komisi yang dapat diaudit; perubahan aturan komisi **tidak** mengubah komisi transaksi yang sudah terjadi (snapshot aturan); void/refund membatalkan komisi terkait secara konsisten.

> **⚑ Catatan.** Snapshot aturan saat transaksi terjadi adalah keputusan krusial. Tanpa itu, mengubah persentase komisi bulan ini akan diam-diam menulis ulang komisi bulan lalu — sumber sengketa terbesar di sistem barbershop.

---

## 12 · Modul: Laporan Penjualan

*Akses: Admin (semua outlet) · Manajer (outlet sendiri).*

- Penjualan per periode, outlet, kapster, layanan/produk, metode bayar, kasir, shift.
- Ringkasan: omzet, jumlah transaksi, rata-rata nilai transaksi (AOV).
- Top layanan, top produk, top kapster.
- Laporan diskon, pajak, void/refund, dan komisi.
- Export CSV / Excel / PDF; bandingkan periode & outlet (Admin); scope ketat per peran.

**Kriteria penerimaan:** angka laporan rekonsiliasi tepat dengan total transaksi & shift untuk periode sama; refund/void tercermin benar (tidak menggandakan/menghilangkan nilai).

---

## 13 · Modul: Pengaturan

*Akses: Admin · Manajer (sebagian).*

**Cakupan:** profil bisnis & manajemen outlet; manajemen user & peran (undang, nonaktifkan, reset); metode pembayaran & pajak (satu nilai tunggal, manual, dapat diubah Admin); printer & template struk; integrasi (WhatsApp/BSP, link booking, gateway pembayaran — fase lanjut); jejak audit aksi sensitif.

### 13.1 Pengaturan Penginputan Kasir

Mengontrol **apa yang boleh dilakukan kasir saat menginput transaksi** — guardrail untuk mencegah kebocoran & kesalahan.

| Pengaturan | Fungsi | Default |
|---|---|---|
| Izin diskon manual | Boleh/tidak; batas maksimum %. | Nonaktif |
| Izin void / refund | Boleh membatalkan transaksi (wajib alasan). | Nonaktif |
| Izin harga manual | Boleh mengubah harga item di POS. | Nonaktif |
| Wajib pilih kapster | Transaksi tak bisa selesai tanpa kapster. | Aktif |
| Wajib pilih customer | Identitas pelanggan diwajibkan. | Nonaktif |
| Pembulatan | Aturan pembulatan total/kembalian. | Terdekat |
| Transaksi tanpa shift | Boleh transaksi tanpa buka shift. | Nonaktif |
| Batas waktu edit transaksi | Berapa lama transaksi bisa diubah setelah dibuat. | 0 menit |

**Kriteria penerimaan:** mengubah pengaturan langsung berlaku pada perilaku POS kasir di outlet terkait; aksi yang dibatasi tidak dapat di-bypass dari sisi klien.

---

## 14 · Sistem Desain Visual

Arah: **elegan, klasik-maskulin (heritage barbershop), tenang.** Hijau-gelap & emas membawa kesan premium; hitam memberi kedalaman; netral terang menjaga keterbacaan.

| Warna | Hex | Peran |
|---|---|---|
| Hijau gelap | `#07310E` | Brand/chrome: sidebar, header, splash, struk, latar gelap |
| Emas | `#FFDE59` | Aksen: tombol primer, angka kunci, highlight, status aktif |
| Hitam | `#000000` | Teks kontras tinggi, garis, kedalaman, ikon |

> **⚠ Risiko.** Jangan jadikan hijau-gelap latar utama layar transaksi. POS dipakai berjam-jam; teks krem di atas hijau-gelap melelahkan untuk tabel padat & input cepat. Pembagian peran warna:
> - **Chrome (navigasi, header, struk):** hijau-gelap + emas — mewah & berbrand.
> - **Kanvas kerja (POS, tabel, form):** netral terang (mis. `#FBFAF5`) dengan teks gelap — keterbacaan maksimal.
> - **Emas = aksi/penekanan saja**, bukan area luas.

**Tipografi:** display/judul serif berkarakter (mis. *Cormorant Garamond*); antarmuka/data sans-serif bersih (mis. *Hanken Grotesk*); angka & label teknis monospace.

**Komponen kunci:** tombol primer emas dengan teks hijau-gelap, sekunder garis emas; kontras WCAG AA minimal; target sentuh besar untuk mode tablet; status warna jelas (sukses/peringatan/gagal).

---

## 15 · Kebutuhan Non-Fungsional

- **Kinerja:** layar POS interaktif < 2 dtk; aksi tambah item terasa instan; tetap responsif saat data tumbuh.
- **Keandalan/Offline:** PWA dengan antrian transaksi offline untuk alur dasar; sinkron otomatis saat online; tidak ada transaksi hilang.
- **Keamanan:** RBAC per peran & outlet; data antar-outlet terisolasi; audit log aksi sensitif; perlindungan data pribadi pelanggan.
- **Skalabilitas:** target ~5 outlet; penambahan outlet tanpa migrasi besar; katalog master + override per outlet.
- **Kompatibilitas:** responsive (tablet kasir, desktop manajer/admin, mobile lihat cepat); dukungan printer thermal.
- **Lokalisasi:** Bahasa Indonesia, format Rupiah, zona waktu lokal; pajak nilai tunggal yang dapat dikonfigurasi.

---

## 16 · Model Data & Integrasi

**Entitas inti (tingkat tinggi):** Outlet · User (peran) · Kapster · Layanan · Produk · Customer · Transaksi · Item Transaksi · Pembayaran · Antrian · Booking · Shift · Aturan Komisi · Record Komisi · Pergerakan Stok · Audit Log.

**Hubungan kunci:**

- Transaksi → Outlet, Shift, Customer (opsional), banyak Item.
- Item Transaksi → Layanan/Produk + Kapster → menurunkan Record Komisi (snapshot aturan).
- Booking → Kapster + Outlet; saat hadir → mengisi Antrian → POS.

**Integrasi eksternal:** WhatsApp Business API via BSP (konfirmasi/reminder booking — perlu template & biaya berjalan); QRIS/EDC/payment gateway (fase awal pencatatan, fase lanjut rekonsiliasi otomatis); printer thermal + opsi struk digital.

---

## 17 · Roadmap & Fase

| Fase | Cakupan | Tujuan |
|---|---|---|
| **MVP** | Login & RBAC, POS Kasir, Antrian, Shift, Katalog (Layanan/Produk/Kapster/Outlet), Komisi dasar, Laporan inti, Pengaturan + Penginputan Kasir. | Operasional satu→banyak outlet bisa jalan penuh. |
| **Fase 2** | Booking internal + link publik, dashboard lengkap, alert stok, struk digital, export laporan. | Kurangi friksi jadwal & tingkatkan visibilitas. |
| **Fase 3** | Integrasi WhatsApp (BSP), PWA offline, gateway pembayaran otomatis, komisi tiered. | Otomasi & ketahanan; fitur berbiaya/berdependensi. |

> **⚑ Catatan.** Booking ditaruh di Fase 2 dan WhatsApp di Fase 3 meski diminta — bukan untuk menunda, tapi karena kasir + shift + komisi adalah fondasi yang harus solid dulu, dan WhatsApp punya lead-time eksternal (BSP). Jika booking/WA adalah pembeda utama bisnis, urutan bisa dibalik — tapi sadari trade-off-nya.

---

## 18 · Risiko, Out-of-Scope & Status Keputusan

**Risiko utama**

- Ketergantungan internet pada POS web → mitigasi: PWA offline (Fase 3) / komunikasikan ke pemilik.
- Biaya & lead-time WhatsApp BSP → mitigasi: mulai dari link publik + email.
- Sengketa komisi → mitigasi: snapshot aturan + record per transaksi yang dapat diaudit.
- Akurasi stok bila pencatatan longgar → mitigasi: pengurangan otomatis + log penyesuaian.
- Kebocoran data antar-outlet → mitigasi: scoping ketat & uji RBAC.

**Di luar cakupan (saat ini):** aplikasi native iOS/Android, login kapster, fitur pelanggan (profil/membership/loyalti/riwayat), komisi produk ritel, e-commerce, akuntansi penuh, purchase order/supplier, payroll lengkap, deposit booking.

**Keputusan yang sudah dikunci**

- Fitur pelanggan/membership: **tidak ada** di fase awal.
- Pajak: **satu nilai tunggal**, input manual, dapat diubah Admin; **tanpa service charge** terpisah.
- Deposit/DP booking: **tidak dipakai**.
- Komisi: **hanya jasa**, tidak ada komisi produk.
- Skala: **~5 outlet**.

**Yang masih perlu ditentukan**

- **Provider WhatsApp (BSP)** — belum ada target. Bisa ditunda ke Fase 3, tapi pemilihannya menentukan biaya per percakapan & lead-time approval template, jadi mulai evaluasi sebelum Fase 3.

---

*PRD · POS Kasir Barbershop · v1.0 Draft · untuk review.*
