import React from 'react';
import { Bell, Settings, LogOut, Search, Building2, TrendingUp, AlertTriangle, Scale, Shield, BarChart3, ArrowRight, Activity, ArrowUpRight } from 'lucide-react';

export default function ExploradorEmpresas() {
  return (
    <div className="flex h-screen bg-[#0f172a] text-slate-300 font-sans">
      
      {/* Sidebar - Minimized Version */}
      <div className="w-20 bg-[#1e293b] border-r border-slate-800 flex flex-col items-center py-6 justify-between">
        <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
          <Scale size={20} />
        </div>
        <nav className="flex flex-col gap-8">
          <a href="#" className="p-3 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"><Shield size={22} /></a>
          <a href="#" className="p-3 text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-xl transition-colors"><Building2 size={22} /></a>
          <a href="#" className="p-3 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"><BarChart3 size={22} /></a>
        </nav>
        <div className="flex flex-col gap-6">
          <button className="text-slate-500 hover:text-white transition-colors"><Settings size={22} /></button>
          <button className="text-slate-500 hover:text-rose-400 transition-colors"><LogOut size={22} /></button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="h-20 flex items-center justify-between px-10 border-b border-slate-800 bg-[#0f172a]/95 backdrop-blur-md sticky top-0 z-10">
          <div className="flex flex-col">
            <h2 className="text-sm font-bold text-indigo-400 tracking-widest uppercase">Global Database</h2>
            <h1 className="text-2xl text-white font-light">Corporate Reputation Index</h1>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-full border border-emerald-400/20 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              PINECONE VECTORS: LIVE
            </div>
            <div className="w-10 h-10 rounded-full border border-slate-600 bg-slate-800 flex items-center justify-center overflow-hidden">
               <img src="https://i.pravatar.cc/100?img=11" alt="Avatar" className="w-full h-full object-cover"/>
            </div>
          </div>
        </header>

        <main className="p-10 max-w-6xl mx-auto">
          {/* Search Bar */}
          <div className="relative mb-12 group">
            <div className="absolute inset-0 bg-indigo-500/20 blur-xl group-hover:bg-indigo-500/30 transition-all rounded-2xl"></div>
            <div className="relative bg-[#1e293b] border border-slate-700 focus-within:border-indigo-500 rounded-2xl flex items-center px-6 py-4 shadow-2xl transition-all">
              <Search className="text-indigo-400 mr-4" size={28} />
              <input 
                type="text" 
                placeholder="Search corporation (e.g., Aeromexico, Fravega, Telcel)..." 
                className="bg-transparent w-full outline-none text-xl text-white placeholder-slate-500"
                defaultValue="Aerolineas Nacionales"
              />
              <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg font-medium text-sm transition-colors border border-indigo-400/30">
                Analyze Entity
              </button>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-8">
            
            {/* Main Entity Card */}
            <div className="col-span-8 bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-slate-700/50 rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Building2 size={200} className="text-indigo-500" />
              </div>
              
              <div className="flex items-start justify-between relative z-10 mb-10">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-4xl text-white font-light">Aerolineas Nacionales</h2>
                    <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs px-2 py-1 rounded-md font-bold tracking-wider">HGI RISK</span>
                  </div>
                  <p className="text-slate-400">Sector: Transporte Aéreo y Turismo Comercial</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-slate-500 mb-1 tracking-wider uppercase">Casos Analizados</div>
                  <div className="text-3xl font-light text-white">4,281</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 relative z-10">
                {/* Metric Circular */}
                <div className="bg-[#0f172a]/50 border border-slate-800 rounded-2xl p-6 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm text-slate-400 mb-1">Consumer Win Rate</h4>
                    <p className="text-3xl text-emerald-400 font-light flex items-center gap-2">
                       92.4% <ArrowUpRight size={24} className="text-emerald-500/50" />
                    </p>
                  </div>
                  {/* Fake Circular Progress */}
                  <div className="w-20 h-20 rounded-full border-[6px] border-slate-800 border-t-emerald-400 border-r-emerald-400 border-b-emerald-400 flex items-center justify-center transform -rotate-45">
                     <span className="transform rotate-45 text-slate-500"><TrendingUp size={20} /></span>
                  </div>
                </div>

                {/* Metric Linear */}
                <div className="bg-[#0f172a]/50 border border-slate-800 rounded-2xl p-6 flex flex-col justify-center">
                  <h4 className="text-sm text-slate-400 mb-2">Avg. Resolution Time</h4>
                  <div className="flex items-baseline gap-2 mb-3">
                     <span className="text-3xl text-amber-400 font-light">68</span>
                     <span className="text-slate-500">days</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{width: '65%'}}></div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button className="w-full mt-8 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium py-4 rounded-xl flex items-center justify-center gap-2 transition-colors relative z-10 group">
                <Shield size={18} className="text-indigo-400 group-hover:text-indigo-300" />
                Initiate Arbitration Proceeding
                <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Sidebar Stats */}
            <div className="col-span-4 flex flex-col gap-6">
              
              <div className="bg-[#1e293b] border border-slate-800 rounded-3xl p-6">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Activity size={16} className="text-rose-400" />
                  Top Defense Tactics
                </h3>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-200">Políticas Internas (No Reembolso)</span>
                      <span className="text-slate-400">45%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full"><div className="h-full bg-indigo-500 rounded-full" style={{width:'45%'}}></div></div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-200">Culpar a terceros (Clima/Banco)</span>
                      <span className="text-slate-400">28%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full"><div className="h-full bg-indigo-500 rounded-full" style={{width:'28%'}}></div></div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-200">Ignorar Notificaciones</span>
                      <span className="text-slate-400">15%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full"><div className="h-full bg-indigo-500 rounded-full" style={{width:'15%'}}></div></div>
                  </div>
                </div>
              </div>

              <div className="bg-[#1e293b] border border-slate-800 rounded-3xl p-6 flex-1 flex flex-col justify-center items-center text-center">
                 <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 mb-4">
                   <Shield size={24} />
                 </div>
                 <h4 className="text-white font-medium mb-2">Consumer Protection Law</h4>
                 <p className="text-sm text-slate-400 leading-relaxed">
                   Entities in this sector historically fail to prove *"force majeure"* causes in 9 out of 10 aviation cases according to Pinecone intelligence.
                 </p>
              </div>

            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
