import React from 'react';
import { Bell, Settings, LogOut, HelpCircle, Plus, LayoutDashboard, Briefcase, Lock, LineChart, Calendar, Check, Hourglass, Bot } from 'lucide-react';

export default function SeguimientoCaso() {
  return (
    <div className="flex h-screen bg-[#0f172a] text-slate-300 font-sans">
      
      {/* Sidebar */}
      <div className="w-64 bg-[#1e293b] border-r border-slate-800 flex flex-col justify-between">
        <div>
          <div className="p-6">
            <h1 className="text-xl font-bold tracking-wider text-indigo-400">JUSTIA<span className="text-cyan-400">OS</span></h1>
            <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Intelligence Unit</p>
          </div>
          
          <nav className="mt-6 px-4 space-y-2">
            <a href="#" className="flex items-center gap-3 px-4 py-3 bg-indigo-500/10 text-indigo-300 rounded-lg border border-indigo-500/20">
              <LayoutDashboard size={18} />
              <span className="font-medium">Dashboard</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 rounded-lg transition-colors">
              <Briefcase size={18} />
              <span>Active Cases</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 rounded-lg transition-colors">
              <Lock size={18} />
              <span>Vault</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 rounded-lg transition-colors">
              <LineChart size={18} />
              <span>Intelligence</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 rounded-lg transition-colors">
              <Calendar size={18} />
              <span>Calendar</span>
            </a>
          </nav>
        </div>

        <div className="p-6 space-y-4">
          <button className="w-full flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white py-2.5 rounded-lg font-medium transition-all">
            <Plus size={18} />
            <span>New Case</span>
          </button>
          <div className="pt-4 border-t border-slate-700 space-y-2">
            <a href="#" className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors">
              <HelpCircle size={18} />
              <span className="text-sm">Help Center</span>
            </a>
            <a href="#" className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors">
              <LogOut size={18} />
              <span className="text-sm">Sign Out</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-[#0f172a]/80 backdrop-blur-md sticky top-0 z-10">
          <nav className="flex space-x-6 text-sm font-medium uppercase tracking-wider">
            <a href="#" className="text-white border-b-2 border-indigo-500 pb-1">Cases</a>
            <a href="#" className="text-slate-500 hover:text-white transition-colors">Documents</a>
            <a href="#" className="text-slate-500 hover:text-white transition-colors">Clients</a>
            <a href="#" className="text-slate-500 hover:text-white transition-colors">Billing</a>
          </nav>
          <div className="flex items-center gap-4">
            <button className="text-slate-400 hover:text-white relative">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0f172a]"></span>
            </button>
            <button className="text-slate-400 hover:text-white">
              <Settings size={20} />
            </button>
            <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 overflow-hidden ml-2">
              <img src="https://i.pravatar.cc/100?img=11" alt="Avatar" className="w-full h-full object-cover"/>
            </div>
          </div>
        </header>

        <main className="p-8 max-w-7xl mx-auto flex gap-12">
          
          {/* Left Column - Stepper */}
          <div className="flex-1">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
              CASE #SL-2904-X
            </div>
            <h2 className="text-3xl font-light text-white mb-2">Seguimiento de Caso</h2>
            <p className="text-slate-400 mb-12">Demanda por Incumplimiento Contractual - Alpha Corp vs. Omega Ltd</p>

            <div className="relative border-l-2 border-slate-800 ml-5 space-y-12">
              
              {/* Step 1 */}
              <div className="relative pl-10">
                <div className="absolute -left-[21px] top-1 w-10 h-10 bg-[#1e293b] border border-slate-600 rounded-lg flex items-center justify-center text-slate-300">
                  <Check size={20} />
                </div>
                <h3 className="text-xl text-white font-medium mb-1">Consulta Recibida</h3>
                <p className="text-slate-400 mb-2">La solicitud ha sido registrada y clasificada en el sistema central.</p>
                <div className="text-xs font-medium text-slate-600 uppercase tracking-widest">FINALIZADO: 12 OCT, 09:42</div>
              </div>

              {/* Step 2 */}
              <div className="relative pl-10">
                <div className="absolute -left-[21px] top-1 w-10 h-10 bg-[#1e293b] border border-slate-600 rounded-lg flex items-center justify-center text-slate-300">
                  <Check size={20} />
                </div>
                <h3 className="text-xl text-white font-medium mb-1">IA Analizando</h3>
                <p className="text-slate-400 mb-2">Nuestros modelos procesaron 142 páginas de evidencia documental.</p>
                <div className="text-xs font-medium text-slate-600 uppercase tracking-widest">FINALIZADO: 12 OCT, 11:15</div>
              </div>

              {/* Step 3 */}
              <div className="relative pl-10">
                <div className="absolute -left-[21px] top-1 w-10 h-10 bg-indigo-500/20 border border-indigo-500 rounded-lg flex items-center justify-center text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                  <Hourglass size={20} className="animate-pulse" />
                </div>
                <h3 className="text-xl text-white font-medium mb-1">Esperando Respuesta de Empresa</h3>
                <p className="text-slate-400 mb-4">Se ha enviado la notificación formal. Pendiente de recepción de descargos legales.</p>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300 uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                  EN PROGRESO
                </span>
              </div>

              {/* Step 4 */}
              <div className="relative pl-10 opacity-40">
                <div className="absolute -left-[21px] top-1 w-10 h-10 bg-[#1e293b] border border-slate-800 rounded-lg flex items-center justify-center text-slate-600">
                  <Bot size={20} />
                </div>
                <h3 className="text-xl text-white font-medium mb-1">Mediación IA</h3>
                <p className="text-slate-400 mb-2">Apertura de canal de resolución asistida por agentes autónomos.</p>
                <div className="text-xs font-medium text-slate-600 uppercase tracking-widest">ESTIMADO: PRÓXIMAMENTE</div>
              </div>

            </div>
          </div>

          {/* Right Column - Metrics */}
          <div className="w-[400px] flex flex-col gap-6">
            
            {/* Card 1 */}
            <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-8">
              <div className="w-10 h-10 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-400 mb-6">
                <Hourglass size={20} />
              </div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Estimated Resolution</h4>
              <div className="text-5xl font-light text-white mb-4">45 days</div>
              <div className="flex items-center gap-2 text-emerald-400 font-medium text-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
                -12% lower than average
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-8">
              <div className="flex justify-between items-end mb-4">
                <h4 className="text-white font-medium">Win Probability<br/><span className="text-xs text-slate-500 font-normal">AI-calculated outcome likelihood</span></h4>
                <div className="text-3xl font-light text-emerald-400">84%</div>
              </div>
              
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden mb-6">
                <div className="h-full bg-emerald-400 rounded-full" style={{width: '84%'}}></div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Evidence strength</span>
                  <span className="text-white font-medium">Excellent</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Precedent alignment</span>
                  <span className="text-white font-medium">High</span>
                </div>
              </div>
            </div>

            {/* Card 3 (Image/Preview) */}
            <div className="bg-[#1e293b] border border-slate-800 rounded-xl overflow-hidden relative group cursor-pointer">
              <div className="h-40 bg-slate-800 bg-gradient-to-t from-[#1e293b] to-transparent relative">
                 <div className="absolute inset-0 bg-cyan-900/20 mix-blend-overlay"></div>
                 <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-[#1e293b] to-transparent">
                   <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Intelligence Node</div>
                   <div className="text-white font-medium">Supreme Court Precedent #82A</div>
                 </div>
              </div>
              <div className="p-4 border-t border-slate-800 flex justify-center text-sm font-medium text-slate-400 group-hover:text-white transition-colors">
                View Reference Materials
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
