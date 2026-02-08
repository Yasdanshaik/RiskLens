 
import React, { useState } from 'react';
import ChatInterface from './components/ChatInterface.tsx';
import ScenarioPlanner from './components/ScenarioPlanner.tsx';
import ScamGuard from './components/ScamGuard.tsx';
import { Icons } from './constants.tsx';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'scenario' | 'scam'>('chat');

  return (
    <div className="min-h-screen bg-[#fcfdfe] flex flex-col pb-20 md:pb-0 text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Navbar */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab('chat')}>
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-200 group-hover:scale-105 transition-transform">R</div>
            <div>
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">RiskLens</h1>
              <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest leading-none mt-0.5"></p>
            </div>
          </div>
          
          <div className="hidden md:flex gap-1.5 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/50">
            <TabButton 
              active={activeTab === 'chat'} 
              onClick={() => setActiveTab('chat')} 
              icon={<Icons.Chat />} 
              label="Mentor Chat" 
            />
            <TabButton 
              active={activeTab === 'scenario'} 
              onClick={() => setActiveTab('scenario')} 
              icon={<Icons.Search />} 
              label="Scenarios" 
            />
            <TabButton 
              active={activeTab === 'scam'} 
              onClick={() => setActiveTab('scam')} 
              icon={<Icons.Shield />} 
              label="Scam Guard" 
            />
          </div>

          <div className="flex items-center gap-4">
             <div className="hidden lg:flex flex-col items-end mr-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">System Status</span>
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  Safety Active
                </span>
             </div>
             <button className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
                <Icons.Document />
             </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Main Workspace */}
          <div className="lg:col-span-8 space-y-10">
            <div className="relative">
              {activeTab === 'chat' && (
                <section className="animate-in fade-in slide-in-from-bottom-6 duration-700 ease-out">
                  <ChatInterface onNavigateToScam={() => setActiveTab('scam')} />
                </section>
              )}
              
              {activeTab === 'scenario' && (
                <section className="animate-in fade-in slide-in-from-bottom-6 duration-700 ease-out">
                  <ScenarioPlanner />
                </section>
              )}

              {activeTab === 'scam' && (
                <section className="animate-in fade-in slide-in-from-bottom-6 duration-700 ease-out">
                  <ScamGuard />
                </section>
              )}
            </div>

            {/* Global Educational Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <EduCard 
                title="What is UPI?" 
                desc="Unified Payments Interface. Think of it as a universal digital bridge between your bank and any shop. It's instant, free, and secure as long as you keep your PIN secret."
                color="indigo"
                icon="🏦"
              />
              <EduCard 
                title="Credit Score Secrets" 
                desc="Your score is basically your financial reputation. Banks look at it to decide if you're a responsible borrower. Pay bills on time to watch it soar!"
                color="emerald"
                icon="📈"
              />
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-8">
            <div className="bg-white p-7 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-full -mr-8 -mt-8 group-hover:scale-110 transition-transform duration-700"></div>
              <h3 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-3 relative z-10">
                <span className="p-2 bg-red-100 text-red-600 rounded-xl">
                   <Icons.Shield />
                </span>
                Safety Check
              </h3>
              <p className="text-sm text-slate-600 mb-6 leading-relaxed relative z-10">Received a message promising free money or asking for personal details? Don't risk it.</p>
              <button 
                onClick={() => setActiveTab('scam')}
                className="w-full py-4 px-6 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-lg shadow-slate-200 relative z-10"
              >
                <Icons.Shield />
                Launch Scam Guard
              </button>
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-[32px] shadow-2xl shadow-indigo-200 text-white relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <svg width="100%" height="100%"><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/></pattern><rect width="100%" height="100%" fill="url(#grid)" /></svg>
              </div>
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <span className="text-xl">💡</span>
                Mentor Insight
              </h3>
              <p className="text-indigo-50 text-sm mb-6 leading-relaxed font-medium italic">"Financial freedom isn't about how much you earn, but how much you understand and keep."</p>
              <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                <div className="h-full w-3/4 bg-white rounded-full"></div>
              </div>
              <div className="flex justify-between mt-3">
                 <p className="text-[10px] opacity-70 uppercase tracking-widest font-black">Safety Tip #14</p>
                 <p className="text-[10px] opacity-70 uppercase tracking-widest font-black">75% Complete</p>
              </div>
            </div>

            <div className="bg-white p-7 rounded-[32px] border border-slate-100 shadow-lg shadow-slate-200/30">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-900">Live Fraud Alerts</h3>
                <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-black rounded-md animate-pulse">LIVE</span>
              </div>
              <div className="space-y-6">
                <NewsItem title="Major bank warns about fake 'Reward Point' SMS" tag="URGENT" danger />
                <NewsItem title="New 'Remote Access' scams targeting students" tag="ALERT" danger />
                <NewsItem title="How to spot fake UPI QR codes in shops" tag="GUIDE" />
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 h-20 flex items-center justify-around px-6 z-50 rounded-t-3xl shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
        <MobileTabButton active={activeTab === 'chat'} onClick={() => setActiveTab('chat')} icon={<Icons.Chat />} label="Mentor" />
        <MobileTabButton active={activeTab === 'scenario'} onClick={() => setActiveTab('scenario')} icon={<Icons.Search />} label="Growth" />
        <MobileTabButton active={activeTab === 'scam'} onClick={() => setActiveTab('scam')} icon={<Icons.Shield />} label="Guard" />
      </nav>
    </div>
  );
};

// Sub-components
const TabButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
      active ? 'bg-white text-indigo-600 shadow-md shadow-slate-200/50 scale-[1.02]' : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
    }`}
  >
    <div className={`${active ? 'scale-110' : 'scale-100'} transition-transform`}>{icon}</div>
    <span>{label}</span>
  </button>
);

const MobileTabButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center flex-1 py-1 transition-all duration-300 ${
      active ? 'text-indigo-600 -translate-y-1' : 'text-slate-400'
    }`}
  >
    <div className={`p-2 rounded-xl transition-all ${active ? 'bg-indigo-50 shadow-inner' : ''}`}>{icon}</div>
    <span className="text-[10px] font-black mt-1 uppercase tracking-widest">{label}</span>
  </button>
);

const EduCard: React.FC<{ title: string; desc: string; color: 'indigo' | 'emerald', icon: string }> = ({ title, desc, color, icon }) => (
  <div className={`group p-7 rounded-[32px] border transition-all duration-500 hover:shadow-xl ${
    color === 'indigo' ? 'bg-indigo-50/50 border-indigo-100 hover:bg-indigo-50' : 'bg-emerald-50/50 border-emerald-100 hover:bg-emerald-50'
  }`}>
    <div className="flex items-center gap-3 mb-3">
      <span className="text-2xl">{icon}</span>
      <h4 className={`font-black tracking-tight ${color === 'indigo' ? 'text-indigo-900' : 'text-emerald-900'}`}>{title}</h4>
    </div>
    <p className={`text-sm leading-relaxed ${color === 'indigo' ? 'text-indigo-700' : 'text-emerald-700'}`}>{desc}</p>
  </div>
);

const NewsItem: React.FC<{ title: string; tag: string; danger?: boolean }> = ({ title, tag, danger }) => (
  <div className="group cursor-pointer flex flex-col gap-1.5 border-b border-slate-50 pb-5 last:border-0 last:pb-0">
    <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-md self-start ${danger ? 'bg-red-50 text-red-500' : 'bg-indigo-50 text-indigo-500'}`}>
      {tag}
    </span>
    <p className="text-sm font-bold text-slate-800 leading-snug group-hover:text-indigo-600 transition-colors">{title}</p>
  </div>
);

export default App;