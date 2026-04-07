// =============================================
// Sistem Otomatisasi Pengajuan & Pencairan Dana
//
// =============================================

Table users {
id UUID [primary key]
email VARCHAR(255) [unique, not null]
password_hash TEXT [not null]
full_name VARCHAR(255) [not null]
role VARCHAR(50) [not null] // ormawa, kaprodi, ppk, spi
prodi_id UUID [ref: > program_studi.id, null]
ormawa_id UUID [ref: > ormawa.id, null]
fakultas_id UUID [ref: > fakultas.id, null]
is_active BOOLEAN [default: true]
created_at TIMESTAMPTZ [default: `now()`]
updated_at TIMESTAMPTZ [default: `now()`]

Indexes {
(email) [unique]
(role)
(prodi_id)
(ormawa_id)
(fakultas_id)
}
}

Table program_studi {
id UUID [primary key]
nama VARCHAR(255) [not null]
kode VARCHAR(50) [unique]
fakultas_id UUID [ref: > fakultas.id, not null]
}

Table ormawa {
id UUID [primary key]
nama VARCHAR(255) [not null]
kode VARCHAR(50) [unique]
prodi_id UUID [ref: > program_studi.id, not null]
}

Table fakultas {
id UUID [primary key]
nama VARCHAR(255) [not null]
kode VARCHAR(50) [unique]
}

Table pengajuan_rab {
id UUID [primary key]
nomor_pengajuan VARCHAR(100) [unique, not null]
users_id UUID [ref: > users.id, not null]
judul_kegiatan VARCHAR(500) [not null]
deskripsi TEXT
file_rab_url TEXT [not null]
total_anggaran NUMERIC(15,2) [not null]
status_rab VARCHAR(50) [not null, default: 'DRAFT']
submitted_at TIMESTAMPTZ
kaprodi_decision_at TIMESTAMPTZ
ppk_decision_at TIMESTAMPTZ
spi_decision_at TIMESTAMPTZ
created_at TIMESTAMPTZ [default: `now()`]
updated_at TIMESTAMPTZ [default: `now()`]

Indexes {
(status_rab)
(users_id)
(nomor_pengajuan) [unique]
}
}

Table approval_log {
id UUID [primary key]
pengajuan_rab_id UUID [ref: > pengajuan_rab.id, not null]
actor_id UUID [ref: > users.id, not null]
role_actor VARCHAR(50) [not null]
action VARCHAR(50) [not null] // setuju, revisi, tolak
catatan_revisi TEXT
created_at TIMESTAMPTZ [default: `now()`]

Indexes {
(pengajuan_rab_id)
}
}

Table kegiatan {
id UUID [primary key]
pengajuan_rab_id UUID [ref: > pengajuan_rab.id, not null]
status_kegiatan VARCHAR(50) [default: 'BELUM_DILAKSANAKAN']
tanggal_mulai DATE
tanggal_selesai DATE
created_at TIMESTAMPTZ [default: `now()`]
updated_at TIMESTAMPTZ [default: `now()`]

Indexes {
(pengajuan_rab_id)
}
}

Table dokumentasi_kegiatan {
id UUID [primary key]
kegiatan_id UUID [ref: > kegiatan.id, not null]
tipe_dokumen VARCHAR(50) [not null] // foto_kegiatan, daftar_hadir, materi
deskripsi TEXT
file_url TEXT [not null]
uploaded_by UUID [ref: > users.id, not null]
created_at TIMESTAMPTZ [default: `now()`]

Indexes {
(kegiatan_id)
}
}

Table tagihan_pencairan {
id UUID [primary key]
kegiatan_id UUID [ref: > kegiatan.id, not null]
tipe_tagihan VARCHAR(50) [not null] // jasa, barang
sk_nomor VARCHAR(100)
sk_file_url TEXT
nama_penerima VARCHAR(255) [not null]
rekening_penerima VARCHAR(100) [not null]
bank_penerima VARCHAR(100)
nominal NUMERIC(15,2) [not null]
toko_nama VARCHAR(255)
toko_alamat TEXT
struk_file_url TEXT
status_tagihan VARCHAR(50) [default: 'WAITING_PEMBAYARAN']
created_by UUID [ref: > users.id, not null]
created_at TIMESTAMPTZ [default: `now()`]
updated_at TIMESTAMPTZ [default: `now()`]

Indexes {
(kegiatan_id)
(status_tagihan)
}
}

Table pembayaran {
id UUID [primary key]
tagihan_id UUID [ref: > tagihan_pencairan.id, not null]
ppk_id UUID [ref: > users.id, not null]
bukti_transfer_url TEXT [not null]
tanggal_pembayaran TIMESTAMPTZ [default: `now()`]
catatan_pembayaran TEXT
created_at TIMESTAMPTZ [default: `now()`]

Indexes {
(tagihan_id)
}
}

Table lpg {
id UUID [primary key]
kegiatan_id UUID [ref: > kegiatan.id, not null]
file_lpg_url TEXT [not null]
status_lpg VARCHAR(50) [default: 'WAITING_SPI']
spi_notes TEXT
ormawa_notes TEXT
submitted_at TIMESTAMPTZ [default: `now()`]
archived_at TIMESTAMPTZ
created_at TIMESTAMPTZ [default: `now()`]
updated_at TIMESTAMPTZ [default: `now()`]

Indexes {
(kegiatan_id)
(status_lpg)
}
}

Table revisi_lpg_log {
id UUID [primary key]
lpg_id UUID [ref: > lpg.id, not null]
requester_id UUID [ref: > users.id, not null]
catatan_revisi TEXT [not null]
created_at TIMESTAMPTZ [default: `now()`]

Indexes {
(lpg_id)
}
}

Table audit_log {
id UUID [primary key]
table_name VARCHAR(100)
record_id UUID
action VARCHAR(20) // INSERT, UPDATE, DELETE
old_data JSONB
new_data JSONB
user_id UUID [ref: > users.id]
created_at TIMESTAMPTZ [default: `now()`]

Indexes {
(table_name)
(record_id)
(user_id)
}
}
