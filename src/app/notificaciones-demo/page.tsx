'use client';
import React, { useState } from 'react';
import { Bell, Settings, LogOut, Check, Scale, MessageSquare, Briefcase, FileText } from 'lucide-react';

export default function NotificacionesDemo() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(true); // Open by default for demo
  const [unreadCount, setUnreadCount] = useState(2);

  const markAllRead = () => {
    setUnreadCount(0);
  };

  return (
    <div className="flex h-screen bg-[#0f172a] text-slate-300 font-sans relative overflow-hidden">
      
       {/* Background decorative elements to make it look like inside the app */}
       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 blur-sm pointer-events-none"></div>

      {/* App Header */}
      <header className="h-16 w-full border-b border-slate-800 bg-[#0f172a]/90 backdrop-blur-xl flex items-center justify-between px-8 relative z-20 shadow-xl">
        
        {/* Logo */}
        <div className="flex flex-col">
           <h1 className="text-xl font-bold tracking-wider text-indigo-400 leading-tight">JUSTIA<span className="text-cyan-400">OS</span></h1>
        </div>

        {/* Global Navigation Mock */}
        <nav className="hidden md:flex space-x-8 text-sm font-medium uppercase tracking-wider">
          <a href="#" className="text-white border-b-2 border-indigo-500 pb-1">Casos</a>
          <a href="#" className="text-slate-500 hover:text-white transition-colors">Base Datos</a>
        </nav>
        
        {/* Right Tools & Avatar */}
        <div className="flex items-center gap-6">
          
          {/* NOTIFICATION COMPONENT HERE */}
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`relative p-2 rounded-full transition-all ${isDropdownOpen ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
              <Bell size={22} className={unreadCount > 0 ? "animate-[wiggle_3s_ease-in-out_infinite]" : ""} />
              
              {/* Unread Badge */}
              {unreadCount > 0 && (
                <span className="absolute 1 top-1.5 right-1.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 border border-[#0f172a]"></span>
                </span>
              )}
            </button>

            {/* Dropdown Menu Overlay */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-3 w-96 max-h-[85vh] bg-[#1e293b] border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col transform opacity-100 scale-100 transition-all origin-top-right z-50">
                
                {/* Dropdown Header */}
                <div className="px-6 py-4 border-b border-slate-800/80 bg-slate-800/20 flex justify-between items-center">
                  <h3 className="font-medium text-white flex items-center gap-2">
                    Notificaciones
                    {unreadCount > 0 && (
                      <span className="bg-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{unreadCount} nuevas</span>
                    )}
                  </h3>
                  <button onClick={markAllRead} className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1">
                    <Check size={14}/> Marcar como leído
                  </button>
                </div>

                {/* Dropdown List */}
                <div className="flex-1 overflow-y-auto">
                  
                  {/* Item 1 - Unread */}
                  <div className={`p-4 border-b border-slate-800/50 hover:bg-slate-800/50 cursor-pointer transition-colors relative ${unreadCount > 0 ? 'bg-indigo-500/5' : ''}`}>
                    {unreadCount > 0 && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"></div>}
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/20 flex items-center justify-center shrink-0">
                        <MessageSquare size={18} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-white font-medium mb-1">¡Fravega ha contestado!</p>
                        <p className="text-xs text-slate-400 leading-snug mb-2">La empresa ha enviado un descargo de 3 páginas y una oferta de compensación parcial.</p>
                        <span className="text-[10px] uppercase font-bold text-slate-500">Hace 5 min</span>
                      </div>
                    </div>
                  </div>

                  {/* Item 2 - Unread */}
                  <div className={`p-4 border-b border-slate-800/50 hover:bg-slate-800/50 cursor-pointer transition-colors relative ${unreadCount > 0 ? 'bg-indigo-500/5' : ''}`}>
                    {unreadCount > 0 && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"></div>}
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                        <FileText size={18} />
                      </div>
                      <div className="flex-1">
                         <p className="text-sm text-white font-medium mb-1">Tu documento de Escalación está listo</p>
                        <p className="text-xs text-slate-400 leading-snug mb-2">JustIA ha finalizado de redactar tu acta formal para PROFECO basándose en la resolución previa.</p>
                        <span className="text-[10px] uppercase font-bold text-slate-500">Hace 2 horas</span>
                      </div>
                    </div>
                  </div>

                  {/* Item 3 - Read */}
                  <div className="p-4 border-b border-slate-800/50 hover:bg-slate-800/50 cursor-pointer transition-colors opacity-70 hover:opacity-100">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                        <Scale size={18} />
                      </div>
                      <div className="flex-1">
                         <p className="text-sm text-white font-medium mb-1">Análisis IA de Jurisprudencia completado</p>
                        <p className="text-xs text-slate-500 leading-snug mb-2">Se cruzaron 142 vectores en Pinecone. Probabilidad de éxito actualizada a 92%.</p>
                        <span className="text-[10px] uppercase font-bold text-slate-600">Ayer</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Dropdown Footer */}
                <div className="p-3 bg-slate-800/40 text-center border-t border-slate-700/50">
                  <button className="text-xs font-semibold text-slate-400 hover:text-white transition-colors w-full p-2">
                    Ver todo el historial de eventos
                  </button>
                </div>

              </div>
            )}
          </div>

          <button className="text-slate-400 hover:text-white transition-colors">
            <Settings size={22} />
          </button>
          
          <div className="w-9 h-9 rounded-full border-2 border-slate-600 bg-slate-800 flex items-center justify-center overflow-hidden cursor-pointer hover:border-indigo-400 transition-colors">
             <img src="https://i.pravatar.cc/100?img=11" alt="Avatar" className="w-full h-full object-cover"/>
          </div>

        </div>
      </header>

      {/* Main Empty Content Area just to show the dropdown context */}
      <main className="flex-1 p-10 flex flex-col items-center justify-center text-center">
         <div className="w-24 h-24 mb-6 text-slate-800">
            <Scale strokeWidth={0.5} className="w-full h-full" />
         </div>
         <h2 className="text-3xl font-light text-slate-500 mb-4">Módulo de Notificaciones Interactivo</h2>
         <p className="text-slate-600 max-w-lg mb-8">
            Haz clic en la campana titilante del menú superior para simular cómo tus usuarios recibirán actualizaciones en vivo impulsadas por Supabase Realtime, sin depender de sus correos electrónicos.
         </p>
         
         <div className="bg-[#1e293b] p-6 rounded-2xl border border-dashed border-slate-700 max-w-md text-sm text-slate-400 text-left">
           <span className="font-bold text-indigo-400 uppercase tracking-widest text-xs mb-2 block">Dato Técnico</span>
           Cuando implementemos Supabase en el futuro, inyectaremos un *listener* (Canal) aquí. Si un script Python de la IA termina un trabajo a medianoche, insertará una fila en la base de datos y esta campanita se pondrá roja al instante sin que el usuario recargue la página.
         </div>
      </main>

    </div>
  );
}
