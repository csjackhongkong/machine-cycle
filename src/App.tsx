/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cpu, 
  Database, 
  ArrowRight, 
  ArrowLeft, 
  Play, 
  RotateCcw, 
  Info,
  ChevronRight,
  ChevronLeft,
  Activity
} from 'lucide-react';

// --- Types ---

interface Step {
  id: number;
  phase: 'Fetch' | 'Decode & Execute' | 'Store';
  description: string;
  shortAction: string;
  illustration: string;
  source: string;
  target: string;
  dataValue: string;
  busType: 'address' | 'data' | 'internal';
}

// --- Constants ---

const STEPS: Step[] = [
  {
    id: 1,
    phase: 'Fetch',
    description: 'The memory address stored in the Program Counter (PC) is fetched to the Memory Address Register (MAR).',
    shortAction: 'Transferring address from PC to MAR...',
    illustration: 'PC -> MAR',
    source: 'PC',
    target: 'MAR',
    dataValue: '0x100',
    busType: 'internal'
  },
  {
    id: 2,
    phase: 'Fetch',
    description: 'The memory address stored in the PC is updated with the address of the next instruction (PC = PC + 1).',
    shortAction: 'Updating Program Counter (PC + 1)...',
    illustration: 'PC (updated)',
    source: 'PC',
    target: 'PC',
    dataValue: '0x101',
    busType: 'internal'
  },
  {
    id: 3,
    phase: 'Fetch',
    description: 'The memory address stored in the MAR is transferred to the Main Memory via the Address Bus.',
    shortAction: 'Sending address to Main Memory via Address Bus...',
    illustration: 'MAR -> Main Memory',
    source: 'MAR',
    target: 'RAM',
    dataValue: '0x100',
    busType: 'address'
  },
  {
    id: 4,
    phase: 'Fetch',
    description: 'The instruction or data stored in the memory address mentioned in the previous step is transferred from Main Memory to the Memory Data Register (MDR) via the Data Bus.',
    shortAction: 'Fetching instruction from Memory to MDR via Data Bus...',
    illustration: 'Main Memory -> MDR',
    source: 'RAM',
    target: 'MDR',
    dataValue: 'LOAD 5',
    busType: 'data'
  },
  {
    id: 5,
    phase: 'Fetch',
    description: 'The instruction or data stored in the MDR is copied to the Current Instruction Register (CIR).',
    shortAction: 'Copying instruction from MDR to CIR...',
    illustration: 'MDR -> CIR',
    source: 'MDR',
    target: 'CIR',
    dataValue: 'LOAD 5',
    busType: 'internal'
  },
  {
    id: 6,
    phase: 'Decode & Execute',
    description: 'The instruction stored in the CIR is decoded by the Control Unit (CU) and then executed by the Arithmetic Logic Unit (ALU).',
    shortAction: 'Decoding in CU and Executing in ALU...',
    illustration: 'CIR -> CU -> ALU',
    source: 'CIR',
    target: 'ALU',
    dataValue: 'EXECUTE',
    busType: 'internal'
  },
  {
    id: 7,
    phase: 'Store',
    description: 'The processing result is stored in the Accumulator (ACC).',
    shortAction: 'Storing result in the Accumulator...',
    illustration: 'ALU -> ACC',
    source: 'ALU',
    target: 'ACC',
    dataValue: 'RESULT',
    busType: 'internal'
  }
];

// --- Components ---

const Register = ({ name, value, active, label, isAnimating }: { name: string, value: string, active: boolean, label: string, isAnimating?: boolean }) => (
  <div className={`hardware-card p-4 flex flex-col items-center justify-center transition-all duration-300 ${
    active ? 'border-blue-500 shadow-lg shadow-blue-500/20 scale-105' : 'border-gray-700'
  } ${active && isAnimating ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-black animate-pulse' : ''}`}>
    <span className="text-xs uppercase tracking-wider text-gray-500 mb-1 font-mono">{label}</span>
    <div className="text-lg font-bold mono text-blue-400">{name}</div>
    <div className="text-sm mt-2 mono text-gray-300 bg-black/30 px-3 py-1 rounded border border-gray-800 w-full text-center truncate">
      {value}
    </div>
  </div>
);

export default function App() {
  const [currentStep, setCurrentStep] = useState(0); // 0 is initial state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [componentValues, setComponentValues] = useState({
    PC: '0x100',
    MAR: '----',
    MDR: '----',
    CIR: '----',
    RAM: 'LOAD 5',
    CU: 'IDLE',
    ALU: 'IDLE',
    ACC: '0'
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      const step = STEPS[currentStep];
      updateValues(step);
      setCurrentStep(prev => prev + 1);
      
      // Trigger animation state
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 1500); // Matches packet animation duration
    } else {
      reset();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setIsAnimating(false);
      // In a real app, we'd need a history of values to revert perfectly.
      // For this visualization, we'll just reset if going back for simplicity or re-calculate.
    }
  };

  const updateValues = (step: Step) => {
    setComponentValues(prev => {
      const next = { ...prev };
      if (step.id === 1) next.MAR = step.dataValue;
      if (step.id === 2) next.PC = step.dataValue;
      if (step.id === 4) next.MDR = step.dataValue;
      if (step.id === 5) next.CIR = step.dataValue;
      if (step.id === 6) {
        next.CU = 'DECODE';
        next.ALU = 'EXECUTE';
      }
      if (step.id === 7) next.ACC = '5';
      return next;
    });
  };

  const reset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
    setIsAnimating(false);
    setComponentValues({
      PC: '0x100',
      MAR: '----',
      MDR: '----',
      CIR: '----',
      RAM: 'LOAD 5',
      CU: 'IDLE',
      ALU: 'IDLE',
      ACC: '0'
    });
  };

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentStep(prev => {
          if (prev < STEPS.length) {
            const step = STEPS[prev];
            updateValues(step);
            
            // Trigger animation state
            setIsAnimating(true);
            setTimeout(() => setIsAnimating(false), 1500);
            
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, 3000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);

  const activeStep = currentStep > 0 ? STEPS[currentStep - 1] : null;

  // Animation helper for data packets
  const getPacketPath = () => {
    if (!activeStep) return null;
    const { source, target } = activeStep;
    
    // Define positions (simplified grid coordinates)
    const pos: Record<string, { x: number, y: number }> = {
      PC: { x: 100, y: 50 },
      MAR: { x: 300, y: 50 },
      RAM: { x: 500, y: 150 },
      MDR: { x: 300, y: 250 },
      CIR: { x: 100, y: 250 },
      CU: { x: 100, y: 150 },
      ALU: { x: 300, y: 150 },
      ACC: { x: 300, y: 350 }
    };

    if (source === target) return null; // No movement for PC update

    return {
      start: pos[source],
      end: pos[target]
    };
  };

  const packetPath = getPacketPath();

  return (
    <div className="min-h-screen flex flex-col p-6 max-w-6xl mx-auto">
      {/* Lesson Title */}
      <div className="mb-4 text-center">
        <h2 className="text-xl font-bold tracking-widest text-white uppercase opacity-80">
          CASCCMC ICT lesson10
        </h2>
      </div>

      {/* Header */}
      <header className="mb-8 flex items-center justify-between border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter flex items-center gap-3">
            <Cpu className="text-blue-500" size={32} />
            MACHINE CYCLE VISUALIZER
          </h1>
          <p className="text-gray-500 text-sm mt-1">Interactive 7-Step Fetch-Decode-Execute-Store Cycle</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-gray-800">
            <Activity size={14} className="text-green-500 animate-pulse" />
            <span className="text-xs mono text-gray-400">CPU STATUS: {isPlaying ? 'RUNNING' : 'PAUSED'}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Architecture Visualization */}
        <div className="lg:col-span-2 hardware-card p-8 relative overflow-hidden min-h-[500px]">
          <div className="absolute top-4 left-4 flex items-center gap-2 text-xs text-gray-500 uppercase tracking-widest">
            <Info size={14} />
            Architecture View
          </div>

          {/* SVG Connections (Buses) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
            {/* Internal Bus */}
            <line x1="100" y1="50" x2="300" y2="50" stroke="white" strokeWidth="2" strokeDasharray="4" />
            <line x1="300" y1="50" x2="300" y2="250" stroke="white" strokeWidth="2" strokeDasharray="4" />
            <line x1="300" y1="250" x2="100" y2="250" stroke="white" strokeWidth="2" strokeDasharray="4" />
            <line x1="100" y1="250" x2="100" y2="150" stroke="white" strokeWidth="2" strokeDasharray="4" />
            
            {/* Address Bus */}
            <line x1="300" y1="50" x2="500" y2="50" stroke="#4dabf7" strokeWidth="4" />
            <line x1="500" y1="50" x2="500" y2="150" stroke="#4dabf7" strokeWidth="4" />
            
            {/* Data Bus */}
            <line x1="500" y1="150" x2="500" y2="250" stroke="#69db7c" strokeWidth="4" />
            <line x1="500" y1="250" x2="300" y2="250" stroke="#69db7c" strokeWidth="4" />

            {/* ALU Connections */}
            <line x1="100" y1="150" x2="300" y2="150" stroke="white" strokeWidth="2" strokeDasharray="4" />
            <line x1="300" y1="250" x2="300" y2="350" stroke="white" strokeWidth="2" strokeDasharray="4" />
          </svg>

          {/* Components Grid */}
          <div className="relative h-full">
            {/* Row 1: PC & MAR */}
            <div className="absolute" style={{ left: '100px', top: '50px', transform: 'translate(-50%, -50%)' }}>
              <Register 
                name="PC" 
                value={componentValues.PC} 
                active={activeStep?.source === 'PC' || activeStep?.target === 'PC'} 
                label="Program Counter" 
                isAnimating={isAnimating}
              />
            </div>
            <div className="absolute" style={{ left: '300px', top: '50px', transform: 'translate(-50%, -50%)' }}>
              <Register 
                name="MAR" 
                value={componentValues.MAR} 
                active={activeStep?.source === 'MAR' || activeStep?.target === 'MAR'} 
                label="Memory Address Reg" 
                isAnimating={isAnimating}
              />
            </div>

            {/* Row 2: CU & ALU & RAM */}
            <div className="absolute" style={{ left: '100px', top: '150px', transform: 'translate(-50%, -50%)' }}>
              <div className={`hardware-card p-4 w-40 h-24 flex flex-col items-center justify-center border-dashed transition-all duration-300 ${
                activeStep?.id === 6 ? 'border-yellow-500 bg-yellow-500/10 scale-105' : 'border-gray-700'
              } ${activeStep?.id === 6 && isAnimating ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-black animate-pulse' : ''}`}>
                <span className="text-xs text-gray-500 uppercase">Control Unit</span>
                <span className="font-bold text-lg text-yellow-500 mono">{componentValues.CU}</span>
              </div>
            </div>
            <div className="absolute" style={{ left: '300px', top: '150px', transform: 'translate(-50%, -50%)' }}>
              <div className={`hardware-card p-4 w-40 h-24 flex flex-col items-center justify-center border-dashed transition-all duration-300 ${
                activeStep?.id === 6 ? 'border-purple-500 bg-purple-500/10 scale-105' : 'border-gray-700'
              } ${activeStep?.id === 6 && isAnimating ? 'ring-2 ring-purple-400 ring-offset-2 ring-offset-black animate-pulse' : ''}`}>
                <span className="text-xs text-gray-500 uppercase">ALU</span>
                <span className="font-bold text-lg text-purple-500 mono">{componentValues.ALU}</span>
              </div>
            </div>
            <div className="absolute" style={{ left: '500px', top: '150px', transform: 'translate(-50%, -50%)' }}>
              <div className={`hardware-card p-4 w-40 h-40 flex flex-col items-center justify-center border-double border-4 transition-all duration-300 ${
                activeStep?.source === 'RAM' || activeStep?.target === 'RAM' ? 'border-green-500 bg-green-500/10 scale-105' : 'border-gray-700'
              } ${ (activeStep?.source === 'RAM' || activeStep?.target === 'RAM') && isAnimating ? 'ring-2 ring-green-400 ring-offset-2 ring-offset-black animate-pulse' : ''}`}>
                <Database className="text-green-500 mb-2" size={32} />
                <span className="text-xs text-gray-500 uppercase">Main Memory</span>
                <div className="mt-3 text-xs mono text-gray-400 bg-black/40 p-2 rounded">
                  0x100: LOAD 5
                </div>
              </div>
            </div>

            {/* Row 3: CIR & MDR */}
            <div className="absolute" style={{ left: '100px', top: '250px', transform: 'translate(-50%, -50%)' }}>
              <Register 
                name="CIR" 
                value={componentValues.CIR} 
                active={activeStep?.source === 'CIR' || activeStep?.target === 'CIR'} 
                label="Current Instr Reg" 
                isAnimating={isAnimating}
              />
            </div>
            <div className="absolute" style={{ left: '300px', top: '250px', transform: 'translate(-50%, -50%)' }}>
              <Register 
                name="MDR" 
                value={componentValues.MDR} 
                active={activeStep?.source === 'MDR' || activeStep?.target === 'MDR'} 
                label="Memory Data Reg" 
                isAnimating={isAnimating}
              />
            </div>

            {/* Row 4: Accumulator */}
            <div className="absolute" style={{ left: '300px', top: '350px', transform: 'translate(-50%, -50%)' }}>
              <Register 
                name="ACC" 
                value={componentValues.ACC} 
                active={activeStep?.source === 'ACC' || activeStep?.target === 'ACC'} 
                label="Accumulator" 
                isAnimating={isAnimating}
              />
            </div>

            {/* Animated Data Packet */}
            <AnimatePresence>
              {packetPath && (
                <>
                  <motion.div
                    key={`packet-${currentStep}`}
                    className="data-packet"
                    initial={{ left: packetPath.start.x, top: packetPath.start.y, opacity: 0, scale: 0 }}
                    animate={{ left: packetPath.end.x, top: packetPath.end.y, opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                  />
                  {isAnimating && (
                    <motion.div
                      key={`label-${currentStep}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute text-[10px] font-bold text-blue-400 mono uppercase bg-black/80 px-2 py-0.5 rounded border border-blue-500/30 z-20 pointer-events-none"
                      style={{ 
                        left: (packetPath.start.x + packetPath.end.x) / 2, 
                        top: (packetPath.start.y + packetPath.end.y) / 2 - 20,
                        transform: 'translate(-50%, -50%)'
                      }}
                    >
                      Transferring...
                    </motion.div>
                  )}
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Bus Labels */}
          <div className="absolute top-[30px] left-[400px] text-[10px] text-blue-400 font-bold uppercase tracking-widest">Address Bus</div>
          <div className="absolute top-[260px] left-[400px] text-[10px] text-green-400 font-bold uppercase tracking-widest">Data Bus</div>
        </div>

        {/* Right Column: Controls & Description */}
        <div className="flex flex-col gap-6">
          
          {/* Step Progress */}
          <div className="hardware-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Step {currentStep} of 7</h2>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                activeStep?.phase === 'Fetch' ? 'bg-blue-500/20 text-blue-400' :
                activeStep?.phase === 'Store' ? 'bg-green-500/20 text-green-400' :
                'bg-yellow-500/20 text-yellow-400'
              }`}>
                {activeStep?.phase || 'Ready'}
              </span>
            </div>
            
            <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden mb-6">
              <motion.div 
                className="h-full bg-blue-500"
                initial={{ width: 0 }}
                animate={{ width: `${(currentStep / 7) * 100}%` }}
              />
            </div>

            <div className="min-h-[150px] relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="text-gray-300 text-lg leading-relaxed"
                >
                  {activeStep ? activeStep.description : "Click 'Next Step' to begin the machine cycle visualization."}
                </motion.div>
              </AnimatePresence>

              {/* Dynamic Animation Explanation */}
              <AnimatePresence>
                {isAnimating && activeStep && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute -bottom-12 left-0 right-0 bg-blue-500/20 border border-blue-500/30 p-3 rounded-lg flex items-center gap-3"
                  >
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                    <span className="text-sm font-bold text-blue-400 mono uppercase tracking-tight">
                      {activeStep.shortAction}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-2 mt-6">
              <button 
                onClick={prevStep}
                disabled={currentStep === 0}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 py-3 rounded-lg font-bold transition-colors"
              >
                <ChevronLeft size={18} /> Back
              </button>
              <button 
                onClick={nextStep}
                className="flex-[2] flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 py-3 rounded-lg font-bold transition-colors shadow-lg shadow-blue-600/20"
              >
                {currentStep === 7 ? 'Finish' : 'Next Step'} <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Auto Controls */}
          <div className="hardware-card p-6">
            <h3 className="text-sm font-bold mb-4 uppercase tracking-widest text-gray-500">Auto Sequence</h3>
            <div className="flex gap-2">
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-all ${
                  isPlaying ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'bg-green-600 hover:bg-green-500 text-white'
                }`}
              >
                {isPlaying ? <><RotateCcw size={18} /> Stop</> : <><Play size={18} /> Auto Play</>}
              </button>
              <button 
                onClick={reset}
                className="bg-gray-800 hover:bg-gray-700 p-3 rounded-lg text-gray-400"
                title="Reset"
              >
                <RotateCcw size={18} />
              </button>
            </div>
            <p className="text-[10px] text-gray-500 mt-4 italic">
              * Auto Play advances steps every 3 seconds.
            </p>
          </div>

          {/* Legend */}
          <div className="hardware-card p-6 flex-1">
            <h3 className="text-base font-bold mb-4 uppercase tracking-widest text-gray-500">Component Legend</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                <div className="text-sm"><span className="font-bold">PC:</span> Program Counter (Address of next instruction)</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-blue-400"></div>
                <div className="text-sm"><span className="font-bold">MAR:</span> Memory Address Register</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                <div className="text-sm"><span className="font-bold">MDR:</span> Memory Data Register</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-green-400"></div>
                <div className="text-sm"><span className="font-bold">CIR:</span> Current Instruction Register</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                <div className="text-sm"><span className="font-bold">CU:</span> Control Unit (Decodes instructions)</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-purple-500"></div>
                <div className="text-sm"><span className="font-bold">ALU:</span> Arithmetic Logic Unit (Calculations)</div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Visualization Table */}
      <section className="mt-12 hardware-card p-6 overflow-x-auto">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
          <Database size={20} className="text-gray-400" />
          Visualization of the Seven Steps
        </h2>
        <table className="w-full text-sm mono border-collapse">
          <thead>
            <tr className="border-b border-gray-700 text-gray-500 uppercase tracking-widest">
              <th className="p-4 text-left">Stage</th>
              <th className="p-4 text-left">PC</th>
              <th className="p-4 text-left">MAR</th>
              <th className="p-4 text-left">MDR</th>
              <th className="p-4 text-left">CIR</th>
              <th className="p-4 text-left">CU</th>
              <th className="p-4 text-left">ALU</th>
              <th className="p-4 text-left">ACC</th>
            </tr>
          </thead>
          <tbody>
            {[0, 1, 2, 3, 4, 5, 6, 7].map((stage) => {
              const isActive = currentStep === stage;
              return (
                <tr 
                  key={stage} 
                  className={`border-b border-gray-800/50 transition-colors ${isActive ? 'bg-blue-500/10 text-blue-400' : 'text-gray-400'}`}
                >
                  <td className="p-4 font-bold">{stage}</td>
                  <td className="p-4">{stage >= 2 ? '0x101' : '0x100'}</td>
                  <td className="p-4">{stage >= 1 ? '0x100' : '----'}</td>
                  <td className="p-4">{stage >= 4 ? 'LOAD 5' : '----'}</td>
                  <td className="p-4">{stage >= 5 ? 'LOAD 5' : '----'}</td>
                  <td className="p-4">{stage >= 6 ? 'DECODE' : 'IDLE'}</td>
                  <td className="p-4">{stage >= 6 ? 'EXECUTE' : 'IDLE'}</td>
                  <td className="p-4">{stage >= 7 ? '5' : '0'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {/* Footer */}
      <footer className="mt-8 pt-4 border-t border-gray-800 text-center text-gray-600 text-xs">
        <p>Designed for ICT Education • Machine Cycle Visualization (Fetch-Decode-Execute-Store)</p>
      </footer>
    </div>
  );
}
