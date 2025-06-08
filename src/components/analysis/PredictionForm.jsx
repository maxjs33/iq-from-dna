import React from 'react';
import { Dna, Edit, Shield, Activity } from 'lucide-react';
import FormInput from '../UI/FormInput';
import CollapsibleSection from '../UI/CollapsibleSection';
import { SPI_FACTORS, ANCESTRY_CALIBRATION } from '../../constants/model';

const PredictionForm = ({ data, setData, editable, setEditable, next }) => {
  const update = (id, v) => setData((p) => ({ ...p, [id]: v }));

  return (
    <div className="grid w-full max-w-4xl grid-cols-1 gap-8 mx-auto lg:grid-cols-2 animate-fade-in">
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white">Step 2: Complete Your Profile</h2>
        <div className="p-6 space-y-4 rounded-xl bg-slate-900/50 border border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center text-lg font-semibold text-white">
              <Dna className="w-5 h-5 mr-2 text-purple-400" /> Polygenic Scores{' '}
              <span className="ml-2 text-xs text-green-400">(auto)</span>
            </h3>
            <button onClick={() => setEditable(!editable)} className="flex items-center text-xs text-purple-400">
              <Edit className="w-3 h-3 mr-1" /> {editable ? 'Lock' : 'Override'}
            </button>
          </div>
          <FormInput id="ea4_pgs" label="Educational Attainment PGS" value={data.ea4_pgs} onChange={update} disabled={!editable} />
          <FormInput id="int_pgs" label="Intelligence PGS" value={data.int_pgs} onChange={update} disabled={!editable} />
        </div>

        <CollapsibleSection
          title="Socioeconomic Status (required)"
          subtitle="Factors related to your developmental environment."
          icon={<Shield className="w-5 h-5 mr-2 text-blue-400" />}
        >
          <FormInput id="parent_education_years" label="Parental Education (years)" value={data.parent_education_years} onChange={update} placeholder="16" />
          <FormInput id="household_income" label="Household Income ($)" value={data.household_income} onChange={update} placeholder="60000" />
        </CollapsibleSection>

        <CollapsibleSection
          title="Prenatal Index (optional)"
          subtitle="Higher accuracy with more data."
          icon={<Shield className="w-5 h-5 mr-2 text-sky-400" />}
        >
          {Object.keys(SPI_FACTORS).map((f) => (
            <FormInput
              key={f}
              id={`spi_${f}`}
              label={f.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
              value={data[`spi_${f}`]}
              onChange={update}
              placeholder="Z‑score"
            />
          ))}
        </CollapsibleSection>

        <CollapsibleSection
          title="Neuroimaging Metrics (optional)"
          subtitle="Structural MRI‑derived metrics."
          icon={<Activity className="w-5 h-5 mr-2 text-green-400" />}
        >
          <FormInput id="tbv_zscore" label="TBV" value={data.tbv_zscore} onChange={update} placeholder="Z‑score" />
          <FormInput id="ct_zscore" label="CT" value={data.ct_zscore} onChange={update} placeholder="Z‑score" />
          <FormInput id="fa_zscore" label="FA" value={data.fa_zscore} onChange={update} placeholder="Z‑score" />
          <FormInput id="dfc_zscore" label="dFC" value={data.dfc_zscore} onChange={update} placeholder="Z‑score" />
        </CollapsibleSection>
      </div>

      <div className="sticky top-24 space-y-6">
        <div className="p-8 rounded-xl bg-slate-900/50 border border-slate-800">
          <h3 className="text-lg font-bold text-white">Final Step (required)</h3>
          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="ancestry" className="block mb-1 text-sm text-slate-300">
                Ancestry Calibration
              </label>
              <select
                id="ancestry"
                className="w-full px-3 py-2 text-white bg-slate-800 border border-slate-700 rounded-lg"
                value={data.ancestry ?? ''}
                onChange={(e) => update('ancestry', e.target.value)}
              >
                <option value="">Select…</option>
                {Object.keys(ANCESTRY_CALIBRATION).map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={next}
              className="w-full py-3 font-semibold text-white rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600"
            >
              Proceed to Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionForm;