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
- **LevelTriase:** `MERAH` (ATS 1), `OREN` (ATS 2), `KUNING` (ATS 3), `HIJAU` (ATS 4), `BIRU` (ATS 5), `PUTIH` (ATS 5 Alternative), `HITAM` (DOA)
- **PrioritasTriase:** `SEGERA` (Immediate), `DARURAT` (Emergency), `URGENT` (Urgent), `SEMI_URGENT` (Semi-urgent), `NON_URGENT` (Non-urgent)
- **TingkatKesadaran:** `COMPOS_MENTIS`, `APATIS`, `SOMNOLEN`, `SOPOR`, `KOMA`

---

## Automatic Triage Determination (ATS)
The API has a built-in clinical intelligence engine that automatically calculates `level_triase` and `prioritas_triase` if omitted, or upgrades them if the calculated urgency is higher than the provided level (using the "Most Urgent Feature" clinical rule).

### How it works:
1. **DOA (Death on Arrival):** If `doa: true`, returns `HITAM` (DOA) with priority `NON_URGENT`.
2. **Airway (Jalan Nafas):**
   - `OBSTRUKSI_TOTAL` → `MERAH` (SEGERA)
   - `OBSTRUKSI_PARSIAL` → `OREN` (DARURAT)
   - `BEBAS` → `HIJAU` (SEMI_URGENT)
3. **Breathing (Pernafasan):**
   - RR < 5 or > 35 / SpO2 < 90% → `MERAH` (SEGERA)
   - RR 5-8 or 30-35 / SpO2 90-92% → `OREN` (DARURAT)
   - RR 9-11 or 25-29 / SpO2 93-95% → `KUNING` (URGENT)
   - RR 12-24 or SpO2 >= 96% → `HIJAU` (SEMI_URGENT)
4. **Circulation (Sirkulasi):**
   - Nadi < 40 or > 150 / Sistolik < 80 mmHg → `MERAH` (SEGERA)
   - Nadi 40-49 or 120-150 / Sistolik 80-89 mmHg or > 220 mmHg → `OREN` (DARURAT)
   - Nadi 50-59 or 100-119 / Sistolik 90-99 mmHg or 180-220 mmHg → `KUNING` (URGENT)
5. **Disability (Neurologis / GCS):**
   - GCS < 9 or `KOMA` → `MERAH` (SEGERA)
   - GCS 9-12 or `SOMNOLEN`/`SOPOR` → `OREN` (DARURAT)
   - GCS 13-14 or `APATIS` → `KUNING` (URGENT)
   - GCS 15 or `COMPOS_MENTIS` → `HIJAU` (SEMI_URGENT)
6. **Pain Scale (Skala Nyeri):**
   - Skala 8-10 → `OREN` (DARURAT)
   - Skala 4-7 → `KUNING` (URGENT)
   - Skala 1-3 → `HIJAU` (SEMI_URGENT)
   - Skala 0 → `BIRU` (NON_URGENT)
7. **Temperature (Suhu):**
   - Suhu < 35°C or > 40°C → `OREN` (DARURAT)
   - Suhu 38.5°C - 40°C → `KUNING` (URGENT)
   - Suhu 37.5°C - 38.4°C → `HIJAU` (SEMI_URGENT)
8. **Checklist Master Rules (`items`):**
   - If any selected master rules have a pre-defined level, it is factored in, and the highest overall calculated urgency is saved!
