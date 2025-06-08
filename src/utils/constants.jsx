// Model Constants
export const CORE_MODEL_WEIGHTS = { 
  EA4_PGS: 0.238, 
  INT_PGS: 0.146, 
  SPI: -0.284, 
  SES: 0.112, 
  TBV: 0.062, 
  CT: -0.012, 
  FA: 0.049, 
  dFC: 0.008 
};

export const SPI_FACTORS = { 
  maternal_crp: -0.15, 
  folate_deficiency: -0.12, 
  prenatal_stress: -0.18, 
  lead_exposure: -0.22, 
  pm25_exposure: -0.11, 
  maternal_smoking: -0.20, 
  alcohol_exposure: -0.25, 
  gestational_diabetes: -0.10, 
  preterm_birth: -0.14, 
  iugr: -0.16, 
  maternal_infection: -0.13 
};

export const ANCESTRY_CALIBRATION = { 
  'Northwest European': 1.000, 
  'West Germanic': 0.995, 
  'North Germanic': 0.990, 
  'Celtic': 0.988, 
  'South Asian': 0.975, 
  'Ashkenazi': 0.973, 
  'East Asian': 0.968, 
  'Finnish': 0.955, 
  'West Slavic': 0.965, 
  'East Slavic': 0.958, 
  'Admixed American': 0.945, 
  'African': 0.890 
};

export const getNumber = (val, defaultVal = 0) => { 
  const num = parseFloat(val); 
  return isNaN(num) ? defaultVal : num; 
};
