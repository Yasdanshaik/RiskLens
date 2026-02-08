
import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const ScenarioPlanner: React.FC = () => {
  const [principal, setPrincipal] = useState(10000);
  const [rate, setRate] = useState(10);
  const [years, setYears] = useState(10);

  const data = useMemo(() => {
    const result = [];
    for (let i = 0; i <= years; i++) {
      const savings = principal * Math.pow(1 + rate / 100, i);
      const simple = principal + (principal * (rate / 100) * i);
      result.push({
        year: i === 0 ? 'Start' : `Y${i}`,
        'Compound Growth': Math.round(savings),
        'Simple Growth': Math.round(simple),
      });
    }
    return result;
  }, [principal, rate, years]);

  const finalCompound = data[data.length - 1]['Compound Growth'];
  const finalSimple = data[data.length - 1]['Simple Growth'];
  const compoundBenefit = finalCompound - finalSimple;

  return (
    <div className="bg-white p-8 rounded-[32px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-10">
        <div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Wealth Visualizer</h3>
          <p className="text-sm text-slate-500 max-w-lg leading-relaxed font-medium">
            Compound interest is often called the "eighth wonder of the world." See how consistent growth transforms your savings into a fortune.
          </p>
        </div>
        <div className="bg-indigo-50 px-5 py-3 rounded-2xl border border-indigo-100 flex flex-col items-center min-w-[140px]">
           <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Total at Year {years}</span>
           <span className="text-xl font-black text-indigo-700">₹{finalCompound.toLocaleString()}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-10">
        <SliderControl 
          label="Initial Investment" 
          value={principal} 
          min={1000} 
          max={100000} 
          step={1000}
          unit="₹"
          onChange={setPrincipal}
        />
        <SliderControl 
          label="Expected Interest" 
          value={rate} 
          min={1} 
          max={30} 
          step={0.5}
          unit="%"
          onChange={setRate}
        />
        <SliderControl 
          label="Time Horizon" 
          value={years} 
          min={1} 
          max={40} 
          step={1}
          unit=" Yrs"
          onChange={setYears}
        />
      </div>

      <div className="h-80 w-full mb-8 rounded-[24px] bg-slate-50/50 p-6 border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 z-10 hidden sm:block">
           <div className="flex flex-col items-end gap-1">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Compounding Edge</span>
              <span className="text-xs font-black text-emerald-600">+₹{compoundBenefit.toLocaleString()}</span>
           </div>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#e2e8f0" />
            {/* Fix: Changed `fontWeights` to `fontWeight` */}
            <XAxis dataKey="year" fontSize={10} fontWeight="bold" stroke="#94a3b8" tickLine={false} axisLine={false} />
            {/* Fix: Changed `fontWeights` to `fontWeight` */}
            <YAxis 
              fontSize={10} 
              fontWeight="bold"
              stroke="#94a3b8" 
              tickFormatter={(value) => `₹${value >= 1000 ? value/1000 + 'k' : value}`} 
              tickLine={false} 
              axisLine={false}
            />
            <Tooltip 
              formatter={(value: any) => [`₹${value.toLocaleString()}`, '']}
              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', padding: '12px' }}
              itemStyle={{ fontWeight: 'bold' }}
            />
            <Legend verticalAlign="top" height={40} iconType="circle" />
            <Area 
              type="monotone" 
              dataKey="Compound Growth" 
              stroke="#4f46e5" 
              strokeWidth={4}
              fillOpacity={1} 
              fill="url(#colorComp)" 
              animationDuration={1500}
            />
            <Area 
              type="monotone" 
              dataKey="Simple Growth" 
              stroke="#94a3b8" 
              strokeWidth={2}
              fill="transparent" 
              strokeDasharray="8 8" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <div className="p-6 bg-indigo-600 rounded-[24px] text-white shadow-lg shadow-indigo-100 flex flex-col justify-center">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-70">Expert Take</h4>
            <p className="text-sm font-bold leading-relaxed">
              In {years} years, compounding earns you <span className="text-indigo-200">₹{compoundBenefit.toLocaleString()}</span> more than simple interest. That's money working for you while you sleep!
            </p>
         </div>
         <div className="p-6 bg-slate-900 rounded-[24px] text-white shadow-lg shadow-slate-200 flex flex-col justify-center">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-50">Wealth Rule</h4>
            <p className="text-sm font-bold leading-relaxed">
              The best time to start was yesterday. The second best time is <span className="text-emerald-400">TODAY</span>. Small amounts added regularly are more powerful than large sums added late.
            </p>
         </div>
      </div>
    </div>
  );
};

const SliderControl: React.FC<{ label: string; value: number; min: number; max: number; step: number; unit: string; onChange: (v: number) => void }> = ({ label, value, min, max, step, unit, onChange }) => (
  <div className="group">
    <div className="flex justify-between items-center mb-4">
      <label className="text-xs font-black text-slate-400 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">{label}</label>
      <div className="text-sm font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">
        {unit === '₹' ? `₹${value.toLocaleString()}` : `${value}${unit}`}
      </div>
    </div>
    <input 
      type="range" min={min} max={max} step={step} 
      value={value} 
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-500 transition-all"
    />
    <div className="flex justify-between mt-2 text-[9px] font-bold text-slate-300">
      <span>{unit === '₹' ? `₹${min.toLocaleString()}` : `${min}${unit}`}</span>
      <span>{unit === '₹' ? `₹${max.toLocaleString()}` : `${max}${unit}`}</span>
    </div>
  </div>
);

export default ScenarioPlanner;