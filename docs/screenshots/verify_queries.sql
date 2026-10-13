\dt (patient_encounters|care_interventions)
SELECT COUNT(*) AS total_encounters FROM patient_encounters;
SELECT risk_level, COUNT(*) AS encounters
  FROM patient_encounters GROUP BY risk_level ORDER BY MIN(risk_score) DESC;
SELECT status, COUNT(*) AS interventions FROM care_interventions GROUP BY status;
SELECT encounter_id, age, number_inpatient AS inpat, number_emergency AS emerg,
       time_in_hospital AS los, num_medications AS meds, risk_score, risk_level, readmitted
  FROM patient_encounters ORDER BY risk_score DESC, encounter_id LIMIT 10;
