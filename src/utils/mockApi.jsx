import { CORE_MODEL_WEIGHTS, SPI_FACTORS, ANCESTRY_CALIBRATION, getNumber } from './constants.jsx';

export const mockApi = {
  createUploadJob: async () => { 
    await new Promise(res => setTimeout(res, 500)); 
    return { job_id: `job_${new Date().getTime()}` }; 
  },
  
  getPipelineResults: async () => { 
    await new Promise(res => setTimeout(res, 1000)); 
    return { 
      pgs_scores: { 
        'EA4': { z_score: 1.15 }, 
        'INT': { z_score: 0.92 } 
      } 
    }; 
  },
  
  calculateFinalPrediction: async (formData) => {
    const calculateSPI = () => { 
      let spi = 0, count = 0; 
      for (const factor in SPI_FACTORS) { 
        const val = getNumber(formData[`spi_${factor}`]); 
        if (val !== 0) { 
          spi += SPI_FACTORS[factor] * val; 
          count++; 
        } 
      } 
      return count > 0 ? spi / Math.sqrt(count) : 0; 
    };
    
    const calculateSES = () => { 
      const ed = getNumber(formData.parent_education_years, 14);
      const inc = getNumber(formData.household_income, 60000); 
      return ((ed - 14) / 2 + (Math.log(inc) - Math.log(60000)) / 0.7) / 2; 
    };
    
    const total_effect = (
      (CORE_MODEL_WEIGHTS.EA4_PGS * getNumber(formData.ea4_pgs) + CORE_MODEL_WEIGHTS.INT_PGS * getNumber(formData.int_pgs)) + 
      (CORE_MODEL_WEIGHTS.SPI * calculateSPI()) + 
      (CORE_MODEL_WEIGHTS.SES * calculateSES()) + 
      (CORE_MODEL_WEIGHTS.TBV * getNumber(formData.tbv_zscore) + CORE_MODEL_WEIGHTS.CT * getNumber(formData.ct_zscore) + CORE_MODEL_WEIGHTS.FA * getNumber(formData.fa_zscore) + CORE_MODEL_WEIGHTS.dFC * getNumber(formData.dfc_zscore))
    ) * 15;
    
    const iq_estimate = 100 + total_effect;
    const calibrated_iq = 100 + (iq_estimate - 100) * (ANCESTRY_CALIBRATION[formData.ancestry] || 1.0);
    const rmse = 10.53;
    
    return { 
      predictedFSIQ: Math.round(calibrated_iq), 
      ci_lower: Math.round(calibrated_iq - 1.96 * rmse), 
      ci_upper: Math.round(calibrated_iq + 1.96 * rmse) 
    };
  }
};