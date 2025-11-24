import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { SynthParams, WaveType, DEFAULT_PARAMS, Preset } from './types';
import { synthEngine } from './services/synthEngine';
import Visualizer from './components/Visualizer';
import Controls from './components/Controls';

// Định nghĩa các System Presets cố định
const SYSTEM_PRESETS: Preset[] = [
  {
    id: 'pew',
    label: '🔫 PEW PEW',
    isSystem: true,
    params: {
      ...DEFAULT_PARAMS,
      waveType: WaveType.SAWTOOTH,
      startFrequency: 880,
      endFrequency: 100,
      frequencySlide: true,
      duration: 0.1,
      attack: 0.01,
      decay: 0.1,
      sustain: 0.1,
      release: 0.1,
    }
  },
  {
    id: 'jump',
    label: '🦘 JUMP',
    isSystem: true,
    params: {
      ...DEFAULT_PARAMS,
      waveType: WaveType.SQUARE,
      startFrequency: 150,
      endFrequency: 450,
      frequencySlide: true,
      duration: 0.1,
      attack: 0.01,
      decay: 0.1,
      sustain: 0.8,
      release: 0.1,
    }
  },
  {
    id: 'coin',
    label: '💎 COIN',
    isSystem: true,
    params: {
      ...DEFAULT_PARAMS,
      waveType: WaveType.SINE,
      startFrequency: 900,
      endFrequency: 1600,
      frequencySlide: true,
      duration: 0.05,
      attack: 0.01,
      decay: 0.2,
      sustain: 0.7,
      release: 0.3,
    }
  },
  {
    id: 'explosion',
    label: '💥 BOOM',
    isSystem: true,
    params: {
      ...DEFAULT_PARAMS,
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
    }
  },
  {
    id: 'powerup',
    label: '🍄 UP',
    isSystem: true,
    params: {
      ...DEFAULT_PARAMS,
      waveType: WaveType.TRIANGLE,
      startFrequency: 300,
      endFrequency: 600,
      frequencySlide: true,
      duration: 0.3,
      attack: 0.05,
      decay: 0.1,
      sustain: 0.7,
      release: 0.4,
    }
  }
];

const App: React.FC = () => {
  const [params, setParams] = useState<SynthParams>(DEFAULT_PARAMS);
  const [isGeneratingWav, setIsGeneratingWav] = useState(false);
  
  // AI State
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  const playSound = () => {
    synthEngine.play(params);
  };

  const downloadWav = async () => {
    setIsGeneratingWav(true);
    try {
      const blob = await synthEngine.renderWav(params);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `8bit_${params.waveType}_${Date.now()}.wav`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Export failed", error);
      alert("Lỗi khi xuất file!");
    } finally {
      setIsGeneratingWav(false);
    }
  };

  const loadPreset = (preset: Preset) => {
    setParams(preset.params);
    // Auto play
    setTimeout(() => synthEngine.play(preset.params), 50);
  };

  const generateWithAI = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Generate 8-bit synthesizer parameters for a sound effect described as: "${aiPrompt}". 
        
        Rules:
        - "waveType" must be one of: "sine", "square", "sawtooth", "triangle", "noise".
        - "startFrequency" and "endFrequency" between 20 and 2000.
        - "duration" between 0.05 and 2.0.
        - "attack", "decay", "release" between 0.01 and 1.0.
        - "sustain" and "volume" between 0.0 and 1.0.
        - "frequencySlide" is boolean.
        
        Think about the physics of the sound. Explosions use noise. Lasers use sawtooth with slide. Jumps use square.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              waveType: { type: Type.STRING, enum: ["sine", "square", "sawtooth", "triangle", "noise"] },
              startFrequency: { type: Type.NUMBER },
              endFrequency: { type: Type.NUMBER },
              duration: { type: Type.NUMBER },
              attack: { type: Type.NUMBER },
              decay: { type: Type.NUMBER },
              sustain: { type: Type.NUMBER },
              release: { type: Type.NUMBER },
              volume: { type: Type.NUMBER },
              frequencySlide: { type: Type.BOOLEAN },
            },
            required: ["waveType", "startFrequency", "endFrequency", "duration", "attack", "decay", "sustain", "release", "volume", "frequencySlide"]
          }
        }
      });

      if (response.text) {
        const generatedParams = JSON.parse(response.text) as SynthParams;
        setParams(generatedParams);
        // Tự động phát sau khi AI tạo xong
        setTimeout(() => synthEngine.play(generatedParams), 100);
      }
    } catch (error) {
      console.error("AI Generation failed:", error);
      alert("Gemini đang bận, thử lại sau nhé!");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] text-gray-100 p-4 md:p-8 flex justify-center font-['VT323']">
      <div className="max-w-3xl w-full space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-5xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 animate-pulse uppercase tracking-widest" style={{textShadow: '0 0 10px rgba(74, 222, 128, 0.5)'}}>
            8-BIT SYNTH
          </h1>
          <p className="text-gray-400 text-lg">Web Audio API + Gemini AI</p>
        </div>

        {/* Visualizer */}
        <Visualizer />

        {/* AI Generator Section */}
        <div className="bg-gray-900/80 p-4 rounded-xl border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
           <label className="text-purple-400 text-sm uppercase tracking-wider mb-2 block">
             ✨ AI Sound Generator (Nhập tên âm thanh bạn muốn)
           </label>
           <div className="flex gap-2">
             <input 
                type="text" 
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && generateWithAI()}
                placeholder="VD: Laser gun, Alien UFO, Zombie groan, Magic spell..."
                className="flex-1 bg-gray-950 border border-purple-500/50 rounded-lg px-4 py-3 text-lg focus:outline-none focus:border-purple-400 text-white placeholder-gray-600 font-sans"
             />
             <button
                onClick={generateWithAI}
                disabled={isAiLoading || !aiPrompt.trim()}
                className={`px-6 py-2 rounded-lg font-bold text-lg uppercase transition-all flex items-center gap-2
                  ${isAiLoading || !aiPrompt.trim()
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                    : 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_4px_0_#581c87] active:shadow-[0_0px_0_#581c87] active:translate-y-1'
                  }`}
             >
                {isAiLoading ? 'Thinking...' : 'Generate'}
             </button>
           </div>
        </div>

        {/* Main Controls Buttons */}
        <div className="grid grid-cols-2 gap-4">
             <button 
                onClick={playSound}
                className="bg-green-600 hover:bg-green-500 text-black text-2xl font-bold py-4 rounded-lg shadow-[0_4px_0_#166534] active:shadow-[0_0px_0_#166534] active:translate-y-1 transition-all uppercase"
             >
                ▶ PLAY SOUND
             </button>
             <button 
                onClick={downloadWav}
                disabled={isGeneratingWav}
                className={`bg-blue-600 hover:bg-blue-500 text-white text-xl font-bold py-4 rounded-lg shadow-[0_4px_0_#1e40af] active:shadow-[0_0px_0_#1e40af] active:translate-y-1 transition-all uppercase flex items-center justify-center space-x-2 ${isGeneratingWav ? 'opacity-50 cursor-not-allowed' : ''}`}
             >
                {isGeneratingWav ? (
                    <span>Rendering...</span>
                ) : (
                    <span>⬇ Download .WAV</span>
                )}
             </button>
        </div>

        {/* Control Panel */}
        <Controls params={params} setParams={setParams} />

        {/* System Presets Area */}
        <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
            <h3 className="text-gray-400 mb-3 uppercase tracking-wider text-sm">Quick Presets</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {SYSTEM_PRESETS.map((preset) => (
                    <button
                        key={preset.id}
                        onClick={() => loadPreset(preset)}
                        className="border border-gray-600 text-gray-300 py-2 rounded transition-all hover:bg-gray-800 hover:border-green-500 hover:text-green-400 uppercase font-bold text-lg active:scale-95"
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