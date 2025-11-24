import React, { useEffect, useRef } from 'react';
import { synthEngine } from '../services/synthEngine';

const Visualizer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);

  const draw = () => {
    const canvas = canvasRef.current;
    const analyser = synthEngine.getAnalyser();
    
    if (canvas && analyser) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteTimeDomainData(dataArray);

        ctx.fillStyle = '#111827'; // Tailwind gray-900 (Background)
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.lineWidth = 2;
        ctx.strokeStyle = '#4ade80'; // Tailwind green-400 (Retro Green)
        ctx.beginPath();

        const sliceWidth = (canvas.width * 1.0) / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * canvas.height) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }

          x += sliceWidth;
        }

        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
      }
    } else if (canvas) {
        // Idle state
        const ctx = canvas.getContext('2d');
        if(ctx) {
             ctx.fillStyle = '#111827';
             ctx.fillRect(0, 0, canvas.width, canvas.height);
             ctx.beginPath();
             ctx.strokeStyle = '#1f2937'; // Darker gray line
             ctx.moveTo(0, canvas.height / 2);
             ctx.lineTo(canvas.width, canvas.height / 2);
             ctx.stroke();
        }
    }

    requestRef.current = requestAnimationFrame(draw);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(draw);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <div className="w-full h-32 border-2 border-green-500/50 rounded-lg overflow-hidden bg-gray-900 shadow-[0_0_15px_rgba(74,222,128,0.2)]">
      <canvas 
        ref={canvasRef} 
        width={600} 
        height={128} 
        className="w-full h-full"
      />
    </div>
  );
};

export default Visualizer;