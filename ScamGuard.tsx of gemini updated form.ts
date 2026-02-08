
import React, { useState, useRef } from 'react';
import { analyzeScam, analyzeTransaction } from '../services/geminiService.ts';
import { Icons } from '../constants.tsx';

const RecentScamPatterns = [
  {
    id: 1,
    title: "The Electricity Bill Threat",
    desc: "SMS claiming your power will be cut in 10 mins due to 'unpaid bills'. Includes a phone number to call.",
    risk: "DANGER",
    tactic: "False Urgency",
    color: "red",
    detailedAdvice: "Legitimate power companies will never send SMS threats about 10-minute disconnections. They follow a long legal process involving multiple written notices. Never call the phone number in the SMS; it's a trap to get you on a call with a professional manipulator who will try to make you install a screen-sharing app."
  },
  {
    id: 2,
    title: "Work-from-Home 'Like' Scam",
    desc: "WhatsApp offer to earn ₹5000/day just by liking YouTube videos. Asks for a 'security deposit' later.",
    risk: "CAUTION",
    tactic: "Greed Appeal",
    color: "amber",
    detailedAdvice: "This is a classic 'Task Scam'. They give you small amounts initially to build trust, then ask for a 'security deposit' or 'VIP upgrade' to unlock bigger tasks. Once you pay the large amount, they block you. Remember: No real job asks you to pay money to work."
  },
  {
    id: 3,
    title: "Fake Bank KYC Update",
    desc: "Email with a link to a 'official' portal to update KYC. The portal is a clone designed to steal passwords.",
    risk: "DANGER",
    tactic: "Authority Impersonation",
    color: "red",
    detailedAdvice: "Banks will never ask for your password, PIN, or OTP through an email link. These links lead to 'Phishing' sites that look exactly like your bank. Always check the URL in the browser bar. If it's not the official bank website, close it immediately and report it to your bank."
  },
  {
    id: 4,
    title: "The QR Code 'Receive' Trick",
    desc: "Buyer on OLX sends you a QR code saying 'Scan this to receive payment'. Scanning actually sends money to them.",
    risk: "DANGER",
    tactic: "Technical Confusion",
    color: "red",
    detailedAdvice: "This is the most common UPI scam. You ONLY scan a QR code to SEND money. To RECEIVE money, you don't need to do anything—the money just shows up in your account. If someone tells you to scan a code or enter your PIN to receive money, they are trying to steal from you."
  },
  {
    id: 5,
    title: "The Lucky Draw Prize",
    desc: "SMS claiming you won a car or ₹25 Lakhs in a lucky draw. Asks for a 'GST/Processing Fee' to release the prize.",
    risk: "DANGER",
    tactic: "Greed Appeal",
    color: "red",
    detailedAdvice: "If you didn't enter a contest, you can't win it. Scammers use the excitement of a big prize to cloud your judgment. They will ask for 'processing fees' or 'taxes' upfront. Once you pay, they disappear. Real prizes are never delivered after an upfront payment via UPI."
  },
  {
    id: 6,
    title: "Fake Customer Care",
    desc: "Finding a 'helpline' on Google for a refund. They ask you to install a screen-sharing app like AnyDesk.",
    risk: "DANGER",
    tactic: "Helpfulness Trap",
    color: "red",
    detailedAdvice: "Scammers create fake Google ads with their own numbers for popular brands like Swiggy, Amazon, or Banks. When you call, they ask you to install apps like AnyDesk or TeamViewer. These apps allow them to see your phone screen and steal your bank details as you type them. Only use contact numbers from the official app's 'Help' section."
  },
  {
    id: 7,
    title: "Wrongly Sent Money",
    desc: "A stranger calls saying they sent money to your UPI by mistake. They show a fake SMS and ask for a 'return'.",
    risk: "CAUTION",
    tactic: "Emotional Guilt",
    color: "amber",
    detailedAdvice: "Scammers send a fake SMS that looks like a bank alert. They haven't actually sent any money. When you 'return' it, you are sending your real money to them. If this happens, tell them to contact their bank to reverse the transaction. Do not send any money back yourself without verifying your actual bank balance in your app."
  },
  {
    id: 8,
    title: "The Courier Package Hold",
    desc: "Automated call saying a parcel in your name contains illegal items. Threatens 'police action' unless you pay a fine.",
    risk: "DANGER",
    tactic: "Fear & Authority",
    color: "red",
    detailedAdvice: "This is 'Digital Arrest' fraud. They impersonate Narcotics or CBI officers. They will try to keep you on a video call and pressure you into a 'settlement' to avoid jail. Real law enforcement will never ask for a 'fine' over a video call or UPI. Hang up immediately and call 1930 (National Cyber Crime Helpline)."
  }
];

const ScamGuard: React.FC = () => {
  const [activeTool, setActiveTool] = useState<'scan' | 'transaction'>('scan');
  const [input, setInput] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ text: string, sources?: any[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [txInput, setTxInput] = useState('');
  const [txResult, setTxResult] = useState<any | null>(null);

  const [selectedPattern, setSelectedPattern] = useState<typeof RecentScamPatterns[0] | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCheck = async () => {
    if ((!input.trim() && !image) || isLoading) return;
    setIsLoading(true);
    setResult(null);

    try {
      const base64 = image ? image.split(',')[1] : undefined;
      const response = await analyzeScam(input || "Analyze this screenshot for scams.", base64);
      
      const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
        ?.filter(chunk => chunk.web)
        .map(chunk => ({
          title: chunk.web?.title || 'Safety Resource',
          uri: chunk.web?.uri || '#'
        }));

      setResult({
        text: response.text || "I couldn't analyze this content properly.",
        sources: sources
      });
    } catch (err) {
      console.error(err);
      setResult({ text: "Error connecting to Scam Guard. If you suspect a scam, stop all interaction with the source immediately." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTxCheck = async () => {
    if (!txInput.trim() || isLoading) return;
    setIsLoading(true);
    setTxResult(null);

    try {
      const response = await analyzeTransaction(txInput);
      setTxResult(response.text);
    } catch (err) {
      console.error(err);
      setTxResult("Error checking transaction details.");
    } finally {
      setIsLoading(false);
    }
  };

  const clearImage = () => {
    setImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const parseSections = (text: string) => {
    const sections: Record<string, string> = {};
    const headerRegex = /# (RISK LEVEL|TACTICS DETECTED|RED FLAGS|REASONING|NEXT STEPS|TRANSACTION SAFETY|CONCERNS|ADVICE):/g;
    let match;
    let lastIndex = 0;
    let lastHeader = "";

    while ((match = headerRegex.exec(text)) !== null) {
      if (lastHeader) {
        sections[lastHeader] = text.slice(lastIndex, match.index).trim();
      }
      lastHeader = match[1];
      lastIndex = headerRegex.lastIndex;
    }
    if (lastHeader) {
      sections[lastHeader] = text.slice(lastIndex).trim();
    }
    return sections;
  };

  const sections = result ? parseSections(result.text) : null;
  const txSections = txResult ? parseSections(txResult) : null;
  
  const riskText = sections?.['RISK LEVEL']?.toUpperCase() || "";
  const isDangerous = riskText.includes('DANGER');
  const isCaution = riskText.includes('CAUTION');
  const isSafe = riskText.includes('SAFE');

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-full overflow-hidden pb-12 relative">
      {/* Pattern Detail Modal */}
      {selectedPattern && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedPattern(null)}></div>
          <div className="bg-white rounded-[32px] w-full max-w-2xl relative z-10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className={`p-6 sm:p-10 ${selectedPattern.color === 'red' ? 'bg-red-50' : 'bg-amber-50'}`}>
               <div className="flex justify-between items-start mb-6">
                  <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${selectedPattern.color === 'red' ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'}`}>
                    {selectedPattern.risk} RISK
                  </div>
                  <button onClick={() => setSelectedPattern(null)} className="text-slate-400 hover:text-slate-600 p-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
               </div>
               <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-4">{selectedPattern.title}</h3>
               <p className="text-slate-600 font-bold leading-relaxed">{selectedPattern.desc}</p>
            </div>
            
            <div className="p-6 sm:p-10 space-y-8">
              <div>
                <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-4">The Scam Tactic</h4>
                <div className="inline-block px-4 py-2 bg-slate-100 rounded-xl text-xs font-black text-slate-700">
                   {selectedPattern.tactic}
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-4">Mentor's Detailed Advice</h4>
                <p className="text-sm sm:text-base font-bold text-slate-800 leading-relaxed bg-slate-50 p-6 rounded-2xl border border-slate-100 italic">
                  "{selectedPattern.detailedAdvice}"
                </p>
              </div>

              <button 
                onClick={() => setSelectedPattern(null)}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tool Selector */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full sm:w-fit self-start border border-slate-200/50">
        <button 
          onClick={() => setActiveTool('scan')}
          className={`flex-1 sm:flex-none px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTool === 'scan' ? 'bg-white text-red-600 shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Evidence Scanner
        </button>
        <button 
          onClick={() => setActiveTool('transaction')}
          className={`flex-1 sm:flex-none px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTool === 'transaction' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Transaction Verifier
        </button>
      </div>

      {activeTool === 'scan' ? (
        <div className="bg-white p-5 md:p-8 rounded-[24px] md:rounded-[32px] shadow-2xl shadow-slate-200/50 border border-slate-100">
          <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
            <div className="p-3 md:p-4 bg-red-100 text-red-600 rounded-xl md:rounded-2xl shadow-inner">
              <Icons.Shield />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Expert Scam Scan</h2>
              <p className="text-xs md:text-sm text-slate-500 font-medium leading-tight">Upload or paste suspicious text for a reasoning-based analysis.</p>
            </div>
          </div>

          <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col gap-4 md:gap-5">
              {image ? (
                <div className="relative w-full h-48 md:h-80 bg-slate-50 rounded-[20px] md:rounded-[24px] overflow-hidden border-2 border-red-100 group shadow-inner">
                  <img src={image} alt="Suspicious content" className="w-full h-full object-contain p-2 md:p-4" />
                  <button 
                    onClick={clearImage}
                    className="absolute top-2 right-2 md:top-4 md:right-4 p-2 bg-red-600 text-white rounded-lg md:rounded-xl shadow-xl hover:bg-red-700 transition-all hover:scale-110 active:scale-90"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                    </svg>
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-8 md:py-14 border-2 border-dashed border-slate-200 rounded-[24px] md:rounded-[32px] flex flex-col items-center justify-center gap-3 md:gap-4 hover:bg-slate-50 hover:border-indigo-300 transition-all text-slate-400 group bg-slate-50/30"
                >
                  <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100 group-hover:scale-110 transition-transform group-hover:text-indigo-600">
                     <Icons.Document />
                  </div>
                  <div className="text-center px-4">
                    <span className="text-sm md:text-base font-black text-slate-700 block mb-0.5">Upload Evidence</span>
                    <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">Screenshots, SMS, or QR</span>
                  </div>
                </button>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleImageUpload} 
              />

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Or describe the call/message: 'They said my account is blocked...'"
                className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-xl md:rounded-2xl px-4 md:px-6 py-4 md:py-5 focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500/50 transition-all resize-none min-h-[100px] md:min-h-[140px] placeholder:text-slate-400 font-medium text-sm leading-relaxed"
              />
            </div>

            <button
              onClick={handleCheck}
              disabled={(!input.trim() && !image) || isLoading}
              className="w-full py-4 md:py-5 bg-slate-900 text-white rounded-xl md:rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 active:scale-[0.98] text-xs md:text-sm"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <Icons.Shield />
                  Start Forensic Scan
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white p-5 md:p-8 rounded-[24px] md:rounded-[32px] shadow-2xl shadow-slate-200/50 border border-slate-100">
          <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
            <div className="p-3 md:p-4 bg-indigo-100 text-indigo-600 rounded-xl md:rounded-2xl shadow-inner">
              <Icons.Chat />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Transaction Verifier</h2>
              <p className="text-xs md:text-sm text-slate-500 font-medium leading-tight">Paste a transaction description to check if it's safe.</p>
            </div>
          </div>

          <div className="space-y-6">
            <textarea
              value={txInput}
              onChange={(e) => setTxInput(e.target.value)}
              placeholder="e.g., 'Sent ₹500 to XYZ merchant for a custom dress found on Instagram, they asked for payment via personal UPI ID...'"
              className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-xl md:rounded-2xl px-4 md:px-6 py-4 md:py-5 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all resize-none min-h-[120px] md:min-h-[160px] placeholder:text-slate-400 font-medium text-sm leading-relaxed"
            />
            <button
              onClick={handleTxCheck}
              disabled={!txInput.trim() || isLoading}
              className="w-full py-4 md:py-5 bg-indigo-600 text-white rounded-xl md:rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 active:scale-[0.98] text-xs md:text-sm"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                "Verify Transaction Flow"
              )}
            </button>

            {txResult && txSections && (
              <div className="mt-8 animate-in slide-in-from-top-4 duration-500">
                <div className={`p-6 rounded-[24px] border-2 ${txSections['RISK LEVEL'] === 'HIGH' ? 'bg-red-50 border-red-200' : txSections['RISK LEVEL'] === 'MEDIUM' ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'}`}>
                   <div className="flex items-center gap-3 mb-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${txSections['RISK LEVEL'] === 'HIGH' ? 'bg-red-600 text-white' : txSections['RISK LEVEL'] === 'MEDIUM' ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'}`}>
                        {txSections['RISK LEVEL']} RISK
                      </span>
                      <h4 className="font-black text-slate-900">Safety Verdict</h4>
                   </div>
                   <p className="text-sm font-bold text-slate-800 mb-4">{txSections['TRANSACTION SAFETY']}</p>
                   
                   <div className="space-y-3 mb-6">
                      <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Main Concerns</h5>
                      {txSections['CONCERNS']?.split('\n').filter(line => line.trim().startsWith('-')).map((c, i) => (
                        <div key={i} className="flex gap-3 text-xs font-medium text-slate-700 italic">
                           <span>•</span>
                           <p>{c.replace(/^- /, '')}</p>
                        </div>
                      ))}
                   </div>

                   <div className="bg-white p-4 rounded-xl border border-slate-200">
                      <h5 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2">Mentor Advice</h5>
                      <p className="text-sm font-black text-slate-900 leading-relaxed">{txSections['ADVICE']}</p>
                   </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {result && sections && (
        <div className="space-y-4 md:space-y-6 animate-in zoom-in-95 duration-500">
          <div className={`p-0.5 md:p-1 rounded-[32px] md:rounded-[40px] shadow-2xl ${
            isDangerous ? 'bg-red-600' : isCaution ? 'bg-amber-500' : 'bg-emerald-600'
          }`}>
            <div className="bg-white rounded-[30px] md:rounded-[38px] p-5 md:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 md:gap-6 mb-6 md:mb-10">
                <div className="flex items-center gap-4 md:gap-5">
                  <div className={`p-3 md:p-5 rounded-2xl md:rounded-3xl ${
                    isDangerous ? 'bg-red-50 text-red-600' : isCaution ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    <Icons.Shield />
                  </div>
                  <div>
                    <p className="text-[8px] md:text-[10px] uppercase font-black tracking-[0.2em] md:tracking-[0.3em] opacity-40 mb-0.5">Safety Assessment</p>
                    <h3 className={`text-2xl md:text-4xl font-black tracking-tighter leading-tight ${
                      isDangerous ? 'text-red-600' : isCaution ? 'text-amber-600' : 'text-emerald-600'
                    }`}>
                      {sections['RISK LEVEL']}
                    </h3>
                  </div>
                </div>
                <div className="bg-slate-50 px-3 md:px-5 py-2 md:py-2.5 rounded-xl md:rounded-2xl border border-slate-100 flex items-center gap-2 md:gap-3 self-start">
                  <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-indigo-500 rounded-full animate-pulse"></span>
                  <span className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest">Grounding Check Active</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
                {/* Left Side */}
                <div className="space-y-6 md:space-y-8">
                  <div>
                    <h4 className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 md:mb-5 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                      Manipulation Tactics
                    </h4>
                    <div className="flex flex-wrap gap-2 md:gap-2.5">
                      {sections['TACTICS DETECTED']?.split(/[,|\n]/).filter(t => t.trim()).map((t, i) => (
                        <span key={i} className={`text-[10px] md:text-xs font-black px-4 md:px-5 py-2 md:py-2.5 rounded-lg md:rounded-xl border-2 transition-all ${
                          isDangerous ? 'bg-red-50 border-red-100 text-red-700' : 
                          isCaution ? 'bg-amber-50 border-amber-100 text-amber-700' : 
                          'bg-emerald-50 border-emerald-100 text-emerald-700'
                        }`}>
                          {t.replace(/^- /, '').trim()}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 md:mb-5 flex items-center gap-2">
                       <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                       Critical Red Flags
                    </h4>
                    <div className="space-y-2 md:space-y-3">
                      {sections['RED FLAGS']?.split('\n').filter(line => line.trim().startsWith('-')).map((flag, i) => (
                        <div key={i} className="flex items-start gap-3 md:gap-4 p-3 md:p-4 rounded-xl md:rounded-2xl bg-slate-50 border border-slate-100/50 group hover:bg-white hover:border-indigo-100 transition-all">
                          <div className={`mt-0.5 shrink-0 w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center text-[8px] md:text-[10px] font-black ${
                            isDangerous ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                          }`}>
                            {isDangerous ? '!' : '?'}
                          </div>
                          <p className="text-xs md:text-sm font-bold text-slate-700 leading-snug">
                            {flag.replace(/^- /, '').trim()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Side */}
                <div className="space-y-6 md:space-y-8">
                  <div className="bg-slate-900 p-6 md:p-8 rounded-[24px] md:rounded-[32px] text-white shadow-xl relative overflow-hidden group">
                    <h4 className="text-[8px] md:text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] md:tracking-[0.3em] mb-3 md:mb-4 relative z-10">Analysis Reasoning</h4>
                    <p className="text-sm md:text-base font-bold leading-relaxed italic relative z-10 opacity-90">
                      "{sections['REASONING']}"
                    </p>
                  </div>

                  <div className={`p-6 md:p-8 rounded-[24px] md:rounded-[32px] shadow-lg border relative overflow-hidden group ${
                    isDangerous ? 'bg-red-50 border-red-200' : isCaution ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'
                  }`}>
                    <h4 className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] md:tracking-[0.3em] mb-3 md:mb-4">How to Respond</h4>
                    <p className={`text-base md:text-lg font-black leading-tight ${
                      isDangerous ? 'text-red-700' : isCaution ? 'text-amber-700' : 'text-emerald-700'
                    }`}>
                      {sections['NEXT STEPS']}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Alerts & Common Patterns */}
      <section className="space-y-4 md:space-y-6">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2 md:gap-3">
             <div className="w-1 h-5 md:w-1.5 md:h-6 bg-indigo-500 rounded-full"></div>
             <h3 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">Recent Scam Alerts</h3>
          </div>
          <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-200 px-2 md:px-3 py-1 rounded-full hidden sm:inline-block">Knowledge Base</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {RecentScamPatterns.map((pattern) => (
            <div key={pattern.id} className="bg-white p-5 md:p-6 rounded-[24px] md:rounded-[28px] border border-slate-100 shadow-md shadow-slate-200/30 group hover:-translate-y-1 transition-all duration-300 flex flex-col">
              <div className="flex justify-between items-start mb-3 md:mb-4">
                <span className={`text-[8px] md:text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest ${
                  pattern.color === 'red' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                }`}>
                  {pattern.risk}
                </span>
                <span className="text-[9px] md:text-[10px] font-bold text-slate-300">#{pattern.id}</span>
              </div>
              <h4 className="font-black text-slate-900 text-sm mb-1.5 group-hover:text-indigo-600 transition-colors leading-tight">{pattern.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-medium mb-4 line-clamp-2">{pattern.desc}</p>
              
              <div className="mt-auto pt-3 border-t border-slate-50 flex items-center justify-between">
                 <div className="shrink-0">
                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Tactic</p>
                   <p className="text-[10px] font-bold text-slate-700">{pattern.tactic}</p>
                 </div>
                 <button 
                  onClick={() => setSelectedPattern(pattern)}
                  className="px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 text-[10px] font-black text-slate-600 hover:text-indigo-600 rounded-lg transition-colors border border-slate-100 flex items-center gap-1 group/btn"
                 >
                   Learn More
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-2.5 h-2.5 group-hover/btn:translate-x-0.5 transition-transform">
                     <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                   </svg>
                 </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Educational Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 pb-4">
        <div className="bg-indigo-600 p-6 md:p-8 rounded-[24px] md:rounded-[32px] text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
          <div className="flex items-start gap-4 mb-2 relative z-10">
            <span className="text-2xl md:text-3xl">🛡️</span>
            <div>
              <h4 className="font-black text-base md:text-lg tracking-tight mb-1">The Golden Rule</h4>
              <p className="text-indigo-100 text-xs md:text-sm leading-relaxed font-medium">PIN = Money OUT. Never enter a PIN to receive money. If someone asks for your PIN to 'refund' you, they are lying.</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 p-6 md:p-8 rounded-[24px] md:rounded-[32px] text-white shadow-xl shadow-slate-200 relative overflow-hidden">
          <div className="flex items-start gap-4 mb-2 relative z-10">
            <span className="text-2xl md:text-3xl">⏳</span>
            <div>
              <h4 className="font-black text-base md:text-lg tracking-tight mb-1">The Urgency Trap</h4>
              <p className="text-slate-400 text-xs md:text-sm leading-relaxed font-medium">Scammers use fake deadlines (like "Electricity cut in 5 mins") to panic you. Real banks never threaten immediate disconnection via SMS.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScamGuard;