# API JSON Body Formats

This document provides the JSON structure for creating or updating records in the Assessment API.

## 1. Triage Assessment
**Endpoint:** `POST /api/triage/assessments`

```json
{
  "no_rawat": "2024/05/19/0001",
  "no_rm": "123456",
  "nama_pasien": "John Doe",
  "tanggal_kunjungan": "2024-05-19T10:00:00Z",
  "cara_masuk": "JALAN",
  "transportasi": "SENDIRI",
  "alasan_kedatangan": "DATANG_SENDIRI",
  "keluhan_utama": "Nyeri dada dan sesak nafas",
  "keterangan": "Pasien datang dengan keluarga",
  "macam_kasus_id": 1,
  "suhu": 36.5,
  "skala_nyeri": 7,
  "tekanan_darah_sistolik": 120,
  "tekanan_darah_diastolik": 80,
  "nadi_per_menit": 80,
  "saturasi_oksigen": 98.5,
  "respirasi_per_menit": 20,
  "tingkat_kesadaran": "COMPOS_MENTIS",
  "status_jalan_nafas": "BEBAS",
  "gcs_e": 4,
  "gcs_v": 5,
  "gcs_m": 6,
  "doa": false,
  "level_triase": "HIJAU",
  "prioritas_triase": "NON_URGENT",
  "perawat_triase_id": 1,
  "items": [
    {
      "rule_id": 1,
      "catatan": "Pasien sadar penuh"
    }
  ]
}
```

## 2. Master Case Type (Admin Only/Seeded)
**Table:** `master_triage_case_types`

```json
{
  "kode": "TRAUMA",
  "nama_kasus": "Trauma",
  "deskripsi": "Kasus kecelakaan atau benturan",
  "aktif": true
}
```

## 3. Master Triage Category (Admin Only/Seeded)
**Table:** `master_triage_categories`

```json
{
  "kode": "JALAN_NAFAS",
  "nama_kategori": "Jalan Nafas",
  "urutan": 1
}
```

## 4. Master Triage Rule (Admin Only/Seeded)
**Table:** `master_triage_rules`

```json
{
  "kategori_id": 1,
  "skala": 1,
  "nama_rule": "Obstruksi Total",
  "deskripsi": "Jalan nafas tersumbat sepenuhnya",
  "level_triase": "MERAH",
  "prioritas": "SEGERA",
  "aktif": true
}
```

## Enum Values Reference

- **CaraMasuk:** `JALAN`, `BRANKAR`, `KURSI_RODA`, `DIGENDONG`
- **Transportasi:** `AGD`, `SENDIRI`, `SWASTA`, `TIDAK_ADA`
- **AlasanKedatangan:** `DATANG_SENDIRI`, `POLISI`, `RUJUKAN`, `BIDAN`, `PUSKESMAS`, `RUMAH_SAKIT`, `POLIKLINIK`, `FASKES_LAIN`, `TIDAK_ADA`
- **StatusJalanNafas:** `BEBAS`, `OBSTRUKSI_PARSIAL`, `OBSTRUKSI_TOTAL`
- **LevelTriase:** `HIJAU`, `KUNING`, `MERAH`, `HITAM`, `ABU`
- **PrioritasTriase:** `SEGERA`, `DARURAT`, `URGENT`, `NON_URGENT`
- **TingkatKesadaran:** `COMPOS_MENTIS`, `APATIS`, `SOMNOLEN`, `SOPOR`, `KOMA`
