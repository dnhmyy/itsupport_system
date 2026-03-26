import { KeyRound, Laptop, Wifi, Mail, AppWindow } from 'lucide-react';

export type ArticleBadge = 'Baru' | 'Populer' | null;

export interface KnowledgeDocument {
  slug: string;
  title: string;
  summary: string;
  readTime: string;
  badge: ArticleBadge;
  tags: string[];
  steps: string[];
  notes?: string[];
  helpText: string;
  category: string;
  categorySlug: string;
}

export interface KnowledgeGroup {
  slug: string;
  title: string;
  description: string;
  icon: typeof KeyRound;
  documents: Omit<KnowledgeDocument, 'category' | 'categorySlug'>[];
}

export const knowledgeGroups: KnowledgeGroup[] = [
  {
    slug: 'akun-akses',
    title: 'Akun & Akses',
    description: 'Panduan untuk login, reset password, dan akses akun kerja.',
    icon: KeyRound,
    documents: [
      {
        slug: 'cara-reset-password',
        title: 'Cara reset password akun kerja',
        summary: 'Panduan singkat saat Anda lupa password akun kantor atau tidak bisa login.',
        readTime: '2 menit',
        badge: 'Populer',
        tags: ['Password', 'Login', 'Akun'],
        steps: [
          'Buka halaman login aplikasi atau email kerja Anda.',
          'Pilih opsi lupa password atau hubungi tim IT bila tombol reset tidak tersedia.',
          'Siapkan informasi akun yang digunakan, seperti email atau username kantor.',
          'Ikuti instruksi reset lalu buat password baru yang mudah diingat tapi tetap aman.',
        ],
        notes: [
          'Jika akun masih tidak bisa dipakai setelah reset, buat tiket agar tim IT bisa cek lebih lanjut.',
        ],
        helpText: 'Kalau reset password tidak berhasil atau akun Anda terkunci, tim IT bisa bantu mengecek akun secara langsung.',
      },
      {
        slug: 'akun-windows-tidak-bisa-login',
        title: 'Akun Windows tidak bisa login',
        summary: 'Langkah dasar jika perangkat kerja menolak password atau login terus gagal.',
        readTime: '3 menit',
        badge: null,
        tags: ['Windows', 'Login', 'Perangkat'],
        steps: [
          'Pastikan keyboard normal dan Caps Lock tidak aktif.',
          'Coba ulangi login dengan akun yang benar dan cek apakah ada salah ketik.',
          'Restart perangkat lalu coba login lagi.',
          'Jika tetap gagal, hubungi tim IT agar akun atau perangkat bisa dicek lebih lanjut.',
        ],
        helpText: 'Jika perangkat tidak bisa masuk sama sekali, sebaiknya buat tiket agar penanganannya lebih cepat.',
      },
      {
        slug: 'permintaan-akses-aplikasi',
        title: 'Permintaan akses aplikasi internal',
        summary: 'Cara meminta akses ke aplikasi kerja yang belum bisa Anda buka.',
        readTime: '2 menit',
        badge: 'Baru',
        tags: ['Akses', 'Aplikasi', 'Approval'],
        steps: [
          'Pastikan nama aplikasi yang dibutuhkan sudah benar.',
          'Sampaikan kebutuhan akses melalui tiket atau atasan terkait.',
          'Tunggu konfirmasi bahwa akses sudah diproses oleh tim IT.',
          'Coba login ulang setelah mendapat notifikasi akses aktif.',
        ],
        helpText: 'Jika akses sifatnya mendesak, sertakan alasan kebutuhan saat membuat tiket.',
      },
    ],
  },
  {
    slug: 'perangkat',
    title: 'Perangkat (Laptop / PC)',
    description: 'Panduan untuk masalah dasar pada laptop, PC, monitor, dan perangkat kerja.',
    icon: Laptop,
    documents: [
      {
        slug: 'laptop-lemot',
        title: 'Laptop terasa lemot',
        summary: 'Hal-hal sederhana yang bisa dicoba saat laptop terasa lambat dipakai bekerja.',
        readTime: '4 menit',
        badge: 'Populer',
        tags: ['Laptop', 'Performa', 'Slow'],
        steps: [
          'Tutup aplikasi yang tidak sedang dipakai.',
          'Restart laptop agar proses yang menumpuk bisa dibersihkan.',
          'Pastikan sisa storage masih cukup dan tidak penuh.',
          'Jika tetap lambat, buat tiket agar perangkat dicek lebih lanjut.',
        ],
        notes: ['Biasanya masalah ini muncul saat terlalu banyak aplikasi aktif bersamaan.'],
        helpText: 'Kalau laptop sangat lambat sampai mengganggu kerja, tim IT bisa bantu cek kondisi perangkat.',
      },
      {
        slug: 'monitor-tidak-tampil',
        title: 'Monitor tidak tampil',
        summary: 'Langkah cepat saat monitor menyala tapi layar tetap kosong.',
        readTime: '2 menit',
        badge: null,
        tags: ['Monitor', 'Display', 'Perangkat'],
        steps: [
          'Pastikan kabel power monitor terpasang dengan baik.',
          'Cek kabel HDMI atau display yang terhubung ke laptop atau CPU.',
          'Pastikan monitor berada di source/input yang benar.',
          'Coba restart perangkat lalu cek kembali.',
        ],
        helpText: 'Jika monitor tetap blank, kemungkinan perlu pengecekan kabel atau unit monitornya.',
      },
      {
        slug: 'keyboard-atau-mouse-tidak-terdeteksi',
        title: 'Keyboard atau mouse tidak terdeteksi',
        summary: 'Solusi dasar jika keyboard atau mouse mendadak tidak bisa dipakai.',
        readTime: '2 menit',
        badge: null,
        tags: ['Keyboard', 'Mouse', 'USB'],
        steps: [
          'Cabut lalu pasang kembali perangkat ke port yang sama.',
          'Jika memungkinkan, pindahkan ke port USB lain.',
          'Untuk perangkat wireless, cek baterai atau dongle receiver.',
          'Jika tetap tidak berfungsi, laporkan ke tim IT.',
        ],
        helpText: 'Bila perangkat rusak secara fisik, sertakan informasi itu saat membuat tiket.',
      },
    ],
  },
  {
    slug: 'internet-jaringan',
    title: 'Internet & Jaringan',
    description: 'Panduan untuk koneksi internet, Wi-Fi, VPN, dan jaringan lokal kantor.',
    icon: Wifi,
    documents: [
      {
        slug: 'vpn-tidak-bisa-connect',
        title: 'VPN tidak bisa connect',
        summary: 'Cek dasar saat koneksi VPN gagal dipakai untuk akses kerja dari luar kantor.',
        readTime: '3 menit',
        badge: 'Populer',
        tags: ['VPN', 'Remote', 'Jaringan'],
        steps: [
          'Pastikan koneksi internet utama Anda stabil.',
          'Periksa username dan password VPN yang digunakan.',
          'Coba putuskan koneksi lalu sambungkan kembali.',
          'Jika masih gagal, hubungi tim IT dengan screenshot error yang muncul.',
        ],
        helpText: 'Screenshot pesan error sangat membantu tim IT saat melakukan pengecekan.',
      },
      {
        slug: 'wifi-tersambung-tapi-tidak-ada-internet',
        title: 'Wi-Fi tersambung tapi tidak ada internet',
        summary: 'Langkah sederhana jika Wi-Fi sudah connect tapi internet tetap tidak jalan.',
        readTime: '3 menit',
        badge: 'Baru',
        tags: ['Wi-Fi', 'Internet', 'Jaringan'],
        steps: [
          'Matikan lalu hidupkan kembali Wi-Fi di perangkat Anda.',
          'Coba buka beberapa website untuk memastikan masalah bukan di satu situs saja.',
          'Disconnect lalu connect ulang ke jaringan kantor.',
          'Jika banyak rekan mengalami hal yang sama, segera laporkan ke tim IT.',
        ],
        helpText: 'Jika hanya Anda yang terdampak, kemungkinan masalah ada di perangkat atau akun Wi-Fi.',
      },
      {
        slug: 'komputer-tidak-dapat-ip-address',
        title: 'Komputer tidak dapat IP address',
        summary: 'Panduan dasar saat jaringan lokal tidak terbaca di komputer.',
        readTime: '3 menit',
        badge: null,
        tags: ['IP Address', 'LAN', 'Jaringan'],
        steps: [
          'Periksa kabel LAN atau koneksi Wi-Fi yang digunakan.',
          'Restart koneksi jaringan di perangkat.',
          'Coba matikan perangkat sebentar lalu nyalakan kembali.',
          'Jika jaringan tetap tidak muncul, buat tiket ke tim IT.',
        ],
        helpText: 'Sebutkan apakah masalah terjadi di satu perangkat saja atau beberapa perangkat sekaligus.',
      },
    ],
  },
  {
    slug: 'email',
    title: 'Email',
    description: 'Panduan untuk email kantor, setup di HP, dan kendala kirim-terima email.',
    icon: Mail,
    documents: [
      {
        slug: 'setup-email-di-hp',
        title: 'Cara setup email di HP',
        summary: 'Panduan singkat agar email kerja bisa dibuka dari ponsel.',
        readTime: '3 menit',
        badge: 'Populer',
        tags: ['Email', 'Mobile', 'Setup'],
        steps: [
          'Buka aplikasi email bawaan atau aplikasi yang direkomendasikan kantor.',
          'Masukkan alamat email kerja dan password akun Anda.',
          'Ikuti proses login sampai sinkronisasi selesai.',
          'Tes kirim dan terima email untuk memastikan akun sudah aktif.',
        ],
        helpText: 'Jika diminta setting manual dan Anda tidak yakin, hubungi tim IT agar tidak salah konfigurasi.',
      },
      {
        slug: 'email-tidak-bisa-kirim',
        title: 'Email tidak bisa kirim',
        summary: 'Langkah yang bisa dicek saat email masuk normal tapi gagal terkirim.',
        readTime: '2 menit',
        badge: null,
        tags: ['Email', 'Kirim Email'],
        steps: [
          'Periksa koneksi internet Anda.',
          'Pastikan alamat tujuan email sudah benar.',
          'Coba kirim ulang setelah beberapa menit.',
          'Jika tetap gagal, simpan screenshot error dan buat tiket.',
        ],
        helpText: 'Lampiran berukuran besar juga bisa menyebabkan email gagal terkirim.',
      },
      {
        slug: 'email-tidak-masuk',
        title: 'Email tidak masuk',
        summary: 'Panduan saat Anda menunggu email tapi belum juga diterima.',
        readTime: '2 menit',
        badge: null,
        tags: ['Email', 'Inbox'],
        steps: [
          'Refresh inbox atau buka ulang aplikasi email.',
          'Cek folder spam, junk, atau quarantine.',
          'Pastikan mailbox Anda tidak penuh.',
          'Jika email penting tetap tidak masuk, laporkan ke tim IT.',
        ],
        helpText: 'Sertakan alamat pengirim dan perkiraan waktu email dikirim saat melapor.',
      },
    ],
  },
  {
    slug: 'aplikasi-internal',
    title: 'Aplikasi Internal',
    description: 'Panduan untuk aplikasi kerja internal perusahaan yang dipakai sehari-hari.',
    icon: AppWindow,
    documents: [
      {
        slug: 'aplikasi-internal-tidak-bisa-dibuka',
        title: 'Aplikasi internal tidak bisa dibuka',
        summary: 'Cek cepat saat aplikasi kerja perusahaan tidak bisa diakses dari browser atau desktop.',
        readTime: '3 menit',
        badge: null,
        tags: ['Aplikasi', 'Internal', 'Login'],
        steps: [
          'Pastikan Anda terhubung ke internet atau jaringan kantor.',
          'Coba refresh halaman atau login ulang.',
          'Coba buka aplikasi dari browser atau perangkat lain jika memungkinkan.',
          'Jika tetap gagal, buat tiket ke tim IT beserta nama aplikasi dan pesan error.',
        ],
        helpText: 'Nama aplikasi dan screenshot error akan mempercepat pengecekan.',
      },
      {
        slug: 'fitur-aplikasi-tidak-muncul',
        title: 'Fitur aplikasi tidak muncul',
        summary: 'Panduan saat menu atau fitur tertentu tidak terlihat di aplikasi kerja.',
        readTime: '2 menit',
        badge: 'Baru',
        tags: ['Fitur', 'Role', 'Aplikasi'],
        steps: [
          'Coba logout lalu login ulang.',
          'Pastikan Anda memakai akun yang benar.',
          'Cek apakah rekan lain dengan role serupa juga mengalami hal yang sama.',
          'Jika fitur tetap tidak muncul, ajukan pengecekan hak akses ke tim IT.',
        ],
        helpText: 'Masalah ini sering terkait role atau hak akses akun.',
      },
    ],
  },
];

export const popularDocumentSlugs = [
  'cara-reset-password',
  'setup-email-di-hp',
  'vpn-tidak-bisa-connect',
  'laptop-lemot',
  'wifi-tersambung-tapi-tidak-ada-internet',
  'aplikasi-internal-tidak-bisa-dibuka',
];

export const latestDocumentSlugs = [
  'fitur-aplikasi-tidak-muncul',
  'wifi-tersambung-tapi-tidak-ada-internet',
  'permintaan-akses-aplikasi',
];

export const knowledgeDocuments = knowledgeGroups.flatMap((group) =>
  group.documents.map((document) => ({
    ...document,
    category: group.title,
    categorySlug: group.slug,
  }))
);

export function getKnowledgeDocument(slug: string) {
  return knowledgeDocuments.find((document) => document.slug === slug) || null;
}

export function getKnowledgeGroup(slug: string | null) {
  if (!slug) return null;
  return knowledgeGroups.find((group) => group.slug === slug) || null;
}

export function getPopularDocuments() {
  return popularDocumentSlugs
    .map((slug) => getKnowledgeDocument(slug))
    .filter((document): document is KnowledgeDocument => Boolean(document));
}

export function getLatestDocuments() {
  return latestDocumentSlugs
    .map((slug) => getKnowledgeDocument(slug))
    .filter((document): document is KnowledgeDocument => Boolean(document));
}

export function getRelatedDocuments(slug: string, categorySlug: string) {
  return knowledgeDocuments
    .filter((document) => document.slug !== slug && document.categorySlug === categorySlug)
    .slice(0, 3);
}
