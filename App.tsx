import React, { useState } from 'react';
import { SynthParams, WaveType, DEFAULT_PARAMS } from './types';
import { synthEngine } from './services/synthEngine';
import Visualizer from './components/Visualizer';
import Controls from './components/Controls';

const App: React.FC = () => {
  const [params, setParams] = useState<SynthParams>(DEFAULT_PARAMS);
  const [isGenerating, setIsGenerating] = useState(false);

  const playSound = () => {
    synthEngine.play(params);
  };

  const downloadWav = async () => {
    setIsGenerating(true);
    try {
      const blob = await synthEngine.renderWav(params);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      // Tên file dựa trên loại sóng và thời gian
      a.download = `8bit_${params.waveType}_${Date.now()}.wav`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Export failed", error);
      alert("Lỗi khi xuất file!");
    } finally {
      setIsGenerating(false);
    }
  };

  // --- Presets ---
  const loadPreset = (type: 'pew' | 'jump' | 'coin' | 'explosion' | 'powerup') => {
    let newParams = { ...DEFAULT_PARAMS };
    switch (type) {
      case 'pew':
        newParams = {
          ...newParams,
          waveType: WaveType.SAWTOOTH,
          startFrequency: 880,
          endFrequency: 100,
          frequencySlide: true,
          duration: 0.1,
          attack: 0.01,
          decay: 0.1,
          sustain: 0.1,
          release: 0.1,
        };
        break;
      case 'jump':
        newParams = {
          ...newParams,
          waveType: WaveType.SQUARE,
          startFrequency: 150,
          endFrequency: 450,
          frequencySlide: true,
          duration: 0.1,
          attack: 0.01,
          decay: 0.1,
          sustain: 0.8,
          release: 0.1,
        };
        break;
      case 'coin':
        newParams = {
          ...newParams,
          waveType: WaveType.SINE,
          startFrequency: 900,
          endFrequency: 1600,
          frequencySlide: true,
          duration: 0.05,
          attack: 0.01,
          decay: 0.2,
          sustain: 0.7,
          release: 0.3,
        };
        break;
      case 'explosion':
        newParams = {
          ...newParams,
          waveType: WaveType.NOISE,
          startFrequency: 800,
          endFrequency: 50,
          frequencySlide: true,
          duration: 0.4,
          attack: 0.01,
          decay: 0.3,
          sustain: 0.5,
          release: 0.5,
          volume: 0.8
        };
        break;
        case 'powerup':
            newParams = {
              ...newParams,
              waveType: WaveType.TRIANGLE,
              startFrequency: 300,
              endFrequency: 600,
              frequencySlide: true,
              duration: 0.3,
              attack: 0.05,
              decay: 0.1,
              sustain: 0.7,
              release: 0.4,
            };
            break;
    }
    setParams(newParams);
    // Auto play on preset select for UX
    setTimeout(() => synthEngine.play(newParams), 50);
  };

  return (
    <div className="min-h-screen bg-[#111111] text-gray-100 p-4 md:p-8 flex justify-center font-['VT323']">
      <div className="max-w-3xl w-full space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-5xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 animate-pulse uppercase tracking-widest" style={{textShadow: '0 0 10px rgba(74, 222, 128, 0.5)'}}>
            8-BIT SYNTH
          </h1>
          <p className="text-gray-400 text-lg">Web Audio API Sound Generator</p>
        </div>

        {/* Visualizer */}
        <Visualizer />

        {/* Main Controls */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
             <button 
                onClick={playSound}
                className="col-span-2 md:col-span-3 bg-green-600 hover:bg-green-500 text-black text-2xl font-bold py-4 rounded-lg shadow-[0_4px_0_#166534] active:shadow-[0_0px_0_#166534] active:translate-y-1 transition-all uppercase"
             >
                ▶ PLAY SOUND
             </button>
             <button 
                onClick={downloadWav}
                disabled={isGenerating}
                className={`col-span-2 md:col-span-2 bg-blue-600 hover:bg-blue-500 text-white text-xl font-bold py-4 rounded-lg shadow-[0_4px_0_#1e40af] active:shadow-[0_0px_0_#1e40af] active:translate-y-1 transition-all uppercase flex items-center justify-center space-x-2 ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
             >
                {isGenerating ? (
                    <span>Processing...</span>
                ) : (
                    <>
                        <span>⬇ .WAV</span>
                    </>
                )}
             </button>
        </div>

        {/* Control Panel */}
        <Controls params={params} setParams={setParams} />

        {/* Presets */}
        <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
            <h3 className="text-gray-400 mb-3 uppercase tracking-wider text-sm">Quick Presets</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {[
                    { id: 'pew', label: '🔫 PEW PEW', color: 'text-pink-400 border-pink-500/30 hover:bg-pink-500/10' },
                    { id: 'jump', label: '🦘 JUMP', color: 'text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/10' },
                    { id: 'coin', label: '💎 COIN', color: 'text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/10' },
                    { id: 'explosion', label: '💥 BOOM', color: 'text-red-400 border-red-500/30 hover:bg-red-500/10' },
                    { id: 'powerup', label: '🍄 UP', color: 'text-purple-400 border-purple-500/30 hover:bg-purple-500/10' },
                ].map((preset) => (
                    <button
                        key={preset.id}
                        onClick={() => loadPreset(preset.id as any)}
                        className={`border ${preset.color} py-2 rounded transition-colors uppercase font-bold text-lg`}
                    >
                        {preset.label}
                    </button>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default App;