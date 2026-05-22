# API JSON Body Formats

This document provides the JSON structure for creating or updating records in the Assessment API.

## 1. Triage Assessment
**Endpoint:** `POST /api/triage/assessments`

```json
{
  "visit_number": "2024/05/19/0001",
  "medical_record_number": "123456",
  "patient_name": "John Doe",
  "visit_date": "2024-05-19T10:00:00Z",
  "arrival_method": "WALK_IN",
  "transportation": "SELF",
  "arrival_reason": "SELF_ARRIVAL",
  "chief_complaint": "Chest pain and shortness of breath",
  "notes": "Patient arrived with family",
  "case_type_id": 1,
  "temperature": 36.5,
  "pain_scale": 7,
  "systolic_blood_pressure": 120,
  "diastolic_blood_pressure": 80,
  "heart_rate": 80,
  "oxygen_saturation": 98.5,
  "respiratory_rate": 20,
  "consciousness_level": "COMPOS_MENTIS",
  "airway_status": "CLEAR",
  "gcs_e": 4,
  "gcs_v": 5,
  "gcs_m": 6,
  "doa": false,
  "triage_level": "GREEN",
  "triage_priority": "SEMI_URGENT",
  "items": [
    {
      "rule_id": 1,
      "notes": "Patient is fully conscious"
    }
  ]
}
```

## 2. Master Case Type (Admin Only/Seeded)
**Table:** `master_triage_case_types`

```json
{
  "code": "TRAUMA",
  "case_name": "Trauma",
  "description": "Accident or impact cases",
  "is_active": true
}
```

## 3. Master Triage Category (Admin Only/Seeded)
**Table:** `master_triage_categories`

```json
{
  "code": "AIRWAY",
  "category_name": "Airway",
  "sort_order": 1
}
```

## 4. Master Triage Rule (Admin Only/Seeded)
**Table:** `master_triage_rules`

```json
{
  "category_id": 1,
  "scale": 1,
  "rule_name": "Total Obstruction",
  "description": "Airway is completely blocked",
  "triage_level": "RED",
  "priority": "IMMEDIATE",
  "is_active": true
}
```

## Enum Values Reference

- **ArrivalMethod:** `WALK_IN`, `STRETCHER`, `WHEELCHAIR`, `CARRIED`
- **Transportation:** `AMBULANCE`, `SELF`, `PRIVATE`, `NONE`
- **ArrivalReason:** `SELF_ARRIVAL`, `POLICE`, `REFERRAL`, `NONE`
- **AirwayStatus:** `CLEAR`, `PARTIAL_OBSTRUCTION`, `TOTAL_OBSTRUCTION`
- **TriageLevel:** `RED` (ATS 1), `ORANGE` (ATS 2), `YELLOW` (ATS 3), `GREEN` (ATS 4), `BLUE` (ATS 5), `WHITE` (ATS 5 Alternative), `BLACK` (DOA)
- **TriagePriority:** `IMMEDIATE` (Immediate), `EMERGENCY` (Emergency), `URGENT` (Urgent), `SEMI_URGENT` (Semi-urgent), `NON_URGENT` (Non-urgent)
- **ConsciousnessLevel:** `COMPOS_MENTIS`, `APATHY`, `SOMNOLENCE`, `DELIRIUM`, `STUPOR`, `COMA`

---

## Automatic Triage Determination (ATS)
The API has a built-in clinical intelligence engine that automatically calculates `triage_level` and `triage_priority` if omitted, or upgrades them if the calculated urgency is higher than the provided level (using the "Most Urgent Feature" clinical rule).

### How it works:
1. **DOA (Death on Arrival):** If `doa: true`, returns `BLACK` (DOA) with priority `NON_URGENT`.
2. **Airway:**
   - `TOTAL_OBSTRUCTION` → `RED` (IMMEDIATE)
   - `PARTIAL_OBSTRUCTION` → `ORANGE` (EMERGENCY)
   - `CLEAR` → `GREEN` (SEMI_URGENT)
3. **Breathing:**
   - RR < 5 or > 35 / SpO2 < 90% → `RED` (IMMEDIATE)
   - RR 5-8 or 30-35 / SpO2 90-92% → `ORANGE` (EMERGENCY)
   - RR 9-11 or 25-29 / SpO2 93-95% → `YELLOW` (URGENT)
   - RR 12-24 or SpO2 >= 96% → `GREEN` (SEMI_URGENT)
4. **Circulation:**
   - Heart Rate < 40 or > 150 / Systolic < 80 mmHg → `RED` (IMMEDIATE)
   - Heart Rate 40-49 or 120-150 / Systolic 80-89 mmHg or > 220 mmHg → `ORANGE` (EMERGENCY)
   - Heart Rate 50-59 or 100-119 / Systolic 90-99 mmHg or 180-220 mmHg → `YELLOW` (URGENT)
5. **Disability (Neurological / GCS):**
   - GCS < 9 or `COMA` → `RED` (IMMEDIATE)
   - GCS 9-12 or `SOMNOLENCE`/`STUPOR` → `ORANGE` (EMERGENCY)
   - GCS 13-14 or `APATHY` → `YELLOW` (URGENT)
   - GCS 15 or `COMPOS_MENTIS` → `GREEN` (SEMI_URGENT)
6. **Pain Scale:**
   - Scale 8-10 → `ORANGE` (EMERGENCY)
   - Scale 4-7 → `YELLOW` (URGENT)
   - Scale 1-3 → `GREEN` (SEMI_URGENT)
   - Scale 0 → `BLUE` (NON_URGENT)
7. **Temperature:**
   - Temp < 35°C or > 40°C → `ORANGE` (EMERGENCY)
   - Temp 38.5°C - 40°C → `YELLOW` (URGENT)
   - Temp 37.5°C - 38.4°C → `GREEN` (SEMI_URGENT)
8. **Checklist Master Rules (`items`):**
   - If any selected master rules have a pre-defined level, it is factored in, and the highest overall calculated urgency is saved!
