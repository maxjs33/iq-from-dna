/* ------------------------------------------------------------------
 *  Front-end-only stub of the FastAPI back-end.
 *  Replace with real axios calls once your server is live.
 * ----------------------------------------------------------------*/

//
// helpers
//
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const num = (v, d = 0) => {
  const n = parseFloat(v);
  return Number.isNaN(n) ? d : n;
};

/* ---------------------------------------------------------------
 *  Constants (mirrors of those in App.jsx)
 * --------------------------------------------------------------*/
const CORE_MODEL_WEIGHTS = {
  EA4_PGS: 0.238,
  INT_PGS: 0.146,
  SPI: -0.284,
  SES: 0.112,
  TBV: 0.062,
  CT: -0.012,
  FA: 0.049,
  dFC: 0.008,
};

const SPI_FACTORS = {
  maternal_crp: -0.15,
  folate_deficiency: -0.12,
  prenatal_stress: -0.18,
  lead_exposure: -0.22,
  pm25_exposure: -0.11,
  maternal_smoking: -0.2,
  alcohol_exposure: -0.25,
  gestational_diabetes: -0.1,
  preterm_birth: -0.14,
  iugr: -0.16,
  maternal_infection: -0.13,
};

const ANCESTRY_CALIBRATION = {
  'Northwest European': 1,
  'West Germanic': 0.995,
  'North Germanic': 0.99,
  Celtic: 0.988,
  'South Asian': 0.975,
  Ashkenazi: 0.973,
  'East Asian': 0.968,
  Finnish: 0.955,
  'West Slavic': 0.965,
  'East Slavic': 0.958,
  'Admixed American': 0.945,
  African: 0.89,
};

/* ---------------------------------------------------------------
 *  Public “API” ─ the three functions App.jsx imports
 * --------------------------------------------------------------*/

/**
 * Pretend-upload: returns a fake job_id after ½ s
 */
export const createUploadJob = async () => {
  await sleep(500);
  return { job_id: `job_${Date.now()}` };
};

/**
 * Pretend pipeline: after 1 s resolves with two toy PGS Z-scores
 */
export const getJobStatus = async () => {
  await sleep(1000);
  return {
    pgs_scores: {
      EA4: { z_score: 1.15 },
      INT: { z_score: 0.92 },
    },
  };
};

/**
 * Pure JS replica of the “core multimodal model” used in App.jsx
 * Accepts the formData object and returns a final IQ estimate + CI
 */
export const calculatePrediction = async (formData) => {
  await sleep(600); // make it feel realistic

  /* ---------- helpers ---------- */
  const spi = (() => {
    let s = 0,
      k = 0;
    for (const f in SPI_FACTORS) {
      const val = num(formData[`spi_${f}`]);
      if (val !== 0) {
        s += SPI_FACTORS[f] * val;
        k += 1;
      }
    }
    return k ? s / Math.sqrt(k) : 0;
  })();

  const ses = (() => {
    const ed = num(formData.parent_education_years, 14);
    const inc = num(formData.household_income, 60000);
    return ((ed - 14) / 2 + (Math.log(inc) - Math.log(60000)) / 0.7) / 2;
  })();

  /* ---------- linear model ---------- */
  const rawEffect =
    CORE_MODEL_WEIGHTS.EA4_PGS * num(formData.ea4_pgs) +
    CORE_MODEL_WEIGHTS.INT_PGS * num(formData.int_pgs) +
    CORE_MODEL_WEIGHTS.SPI * spi +
    CORE_MODEL_WEIGHTS.SES * ses +
    CORE_MODEL_WEIGHTS.TBV * num(formData.tbv_zscore) +
    CORE_MODEL_WEIGHTS.CT * num(formData.ct_zscore) +
    CORE_MODEL_WEIGHTS.FA * num(formData.fa_zscore) +
    CORE_MODEL_WEIGHTS.dFC * num(formData.dfc_zscore);

  const iq = 100 + rawEffect * 15;
  const calibrated =
    100 + (iq - 100) * (ANCESTRY_CALIBRATION[formData.ancestry] ?? 1);
  const rmse = 10.53;

  return {
    predictedFSIQ: Math.round(calibrated),
    ci_lower: Math.round(calibrated - 1.96 * rmse),
    ci_upper: Math.round(calibrated + 1.96 * rmse),
  };
};

/* ---------------------------------------------------------------
 *  Nothing below needs to change for the demo build
 * --------------------------------------------------------------*/
export default {
  createUploadJob,
  getJobStatus,
  calculatePrediction,
};
