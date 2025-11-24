import React from 'react';
import { SynthParams, WaveType } from '../types';

interface ControlsProps {
  params: SynthParams;
  setParams: React.Dispatch<React.SetStateAction<SynthParams>>;
}

// Moved InputGroup outside to resolve TypeScript error about missing children prop
const InputGroup = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex flex-col space-y-1 mb-4">
    <label className="text-green-400 text-sm uppercase tracking-wider">{label}</label>
    {children}
  </div>
);

const Controls: React.FC<ControlsProps> = ({ params, setParams }) => {
  const handleChange = (key: keyof SynthParams, value: any) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  const Slider = ({ 
    param, 
    min, 
    max, 
    step 
  }: { 
    param: keyof SynthParams; 
    min: number; 
    max: number; 
    step: number 
  }) => (
    <div className="flex items-center space-x-2">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={Number(params[param])}
        onChange={(e) => handleChange(param, parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
      />
      <span className="text-xs text-white w-12 text-right font-mono">{params[param]}</span>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
      
      {/* Oscillator Section */}
      <div className="border-r border-gray-700 pr-4">
        <h3 className="text-white mb-4 text-lg border-b border-gray-600 pb-1">OSCILLATOR</h3>
        
        <InputGroup label="Wave Type">
          <select
            value={params.waveType}
            onChange={(e) => handleChange('waveType', e.target.value)}
            className="w-full bg-gray-900 text-green-400 border border-green-500/30 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {Object.values(WaveType).map((t) => (
              <option key={t} value={t}>{t.toUpperCase()}</option>
            ))}
          </select>
        </InputGroup>

        <InputGroup label="Start Frequency (Hz)">
          <Slider param="startFrequency" min={50} max={2000} step={10} />
        </InputGroup>

        <div className="flex items-center justify-between mb-2">
            <label className="text-green-400 text-sm uppercase">Slide Freq?</label>
            <input 
                type="checkbox" 
                checked={params.frequencySlide}
                onChange={(e) => handleChange('frequencySlide', e.target.checked)}
                className="w-4 h-4 accent-green-500"
            />
        </div>

        {params.frequencySlide && (
             <InputGroup label="End Frequency (Hz)">
                <Slider param="endFrequency" min={10} max={2000} step={10} />
             </InputGroup>
        )}

         <InputGroup label="Duration (s)">
            <Slider param="duration" min={0.05} max={2} step={0.05} />
         </InputGroup>
      </div>

      {/* Envelope Section */}
      <div className="pl-2">
        <h3 className="text-white mb-4 text-lg border-b border-gray-600 pb-1">ENVELOPE (ADSR)</h3>
        
        <InputGroup label="Attack (s)">
          <Slider param="attack" min={0} max={1} step={0.01} />
        </InputGroup>
        
        <InputGroup label="Decay (s)">
          <Slider param="decay" min={0} max={1} step={0.01} />
        </InputGroup>
        
        <InputGroup label="Sustain (Vol)">
          <Slider param="sustain" min={0} max={1} step={0.01} />
        </InputGroup>
        
        <InputGroup label="Release (s)">
          <Slider param="release" min={0} max={2} step={0.01} />
        </InputGroup>

         <InputGroup label="Master Volume">
          <Slider param="volume" min={0} max={1} step={0.01} />
        </InputGroup>
      </div>
    </div>
  );
};

export default Controls;