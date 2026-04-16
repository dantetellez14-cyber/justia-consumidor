import React from 'react';
import { Settings, LogOut, LayoutDashboard, Briefcase, Lock, LineChart, Calendar, FileText, ArrowLeft, Download, Save, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, SpellCheck, Scale } from 'lucide-react';

export default function DocumentEditor() {
  return (
    <div className="flex h-screen bg-[#0f172a] text-slate-300 font-sans">
      
      {/* Sidebar - Minimized Version */}
      <div className="w-20 bg-[#1e293b] border-r border-slate-800 flex flex-col items-center py-6 justify-between">
        <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
          <Scale size={20} />
        </div>
        <nav className="flex flex-col gap-8">
          <a href="#" className="p-3 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"><LayoutDashboard size={22} /></a>
          <a href="#" className="p-3 text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-xl transition-colors"><FileText size={22} /></a>
          <a href="#" className="p-3 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"><LineChart size={22} /></a>
        </nav>
        <div className="flex flex-col gap-6">
          <button className="text-slate-500 hover:text-white transition-colors"><Settings size={22} /></button>
          <button className="text-slate-500 hover:text-rose-400 transition-colors"><LogOut size={22} /></button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* Editor Top Bar */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-slate-800 bg-[#1e293b] shrink-0 z-10 shadow-md">
          <div className="flex items-center gap-4">
            <button className="text-slate-400 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors">
              <ArrowLeft size={16} /> Returns to Case SL-2904-X
            </button>
            <div className="h-6 border-l border-slate-700 mx-2"></div>
            <div className="flex flex-col">
              <h2 className="text-white font-medium text-sm">Escrito Formal de Queja (Autogenerado)</h2>
              <span className="text-xs text-indigo-400">Autosaved 2 mins ago</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              <Save size={16} /> Save Draft
            </button>
            <button className="flex items-center gap-2 text-white bg-indigo-600 hover:bg-indigo-500 border border-indigo-500 px-5 py-2 rounded-lg text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all">
              <Download size={16} /> Export to PDF
            </button>
          </div>
        </header>

        {/* Editor Wrapper */}
        <div className="flex-1 overflow-auto bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
          
          {/* Main Container */}
          <div className="max-w-4xl mx-auto py-10 px-4">
            
            {/* Toolbar Floating */}
            <div className="sticky top-4 z-20 flex justify-center mb-6">
              <div className="flex items-center gap-1 bg-[#1e293b] border border-slate-700 rounded-full px-4 py-2 shadow-2xl backdrop-blur-xl">
                 <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors"><Bold size={16} /></button>
                 <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors"><Italic size={16} /></button>
                 <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors"><Underline size={16} /></button>
                 <div className="w-px h-5 bg-slate-700 mx-2"></div>
                 <button className="p-2 text-white bg-slate-700 rounded-md transition-colors"><AlignLeft size={16} /></button>
                 <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors"><AlignCenter size={16} /></button>
                 <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors"><AlignRight size={16} /></button>
                 <div className="w-px h-5 bg-slate-700 mx-2"></div>
                 <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors"><List size={16} /></button>
                 <button className="p-2 text-indigo-400 hover:bg-slate-700 rounded-md transition-colors ml-2 flex gap-1 items-center bg-indigo-500/10 px-3">
                   <SpellCheck size={16} /> <span className="text-xs font-bold">AI Fix</span>
                 </button>
              </div>
            </div>

            {/* The Document / Paper sheet */}
            <div className="w-full bg-[#f8fafc] text-slate-900 rounded-lg shadow-2xl shadow-black/40 min-h-[1000px] border border-slate-300 relative overflow-hidden">
             
              {/* Document Inner Padding limits */}
              <div 
                className="p-16 md:p-24 outline-none selection:bg-indigo-300"
                contentEditable={true}
                suppressContentEditableWarning={true}
              >
                 <p className="text-right text-sm text-slate-600 mb-8 font-serif">
                   Ciudad Autónoma de Buenos Aires, a 16 de Abril de 2026.
                 </p>

                 <p className="font-bold text-lg mb-8 font-serif leading-relaxed">
                   AL SEÑOR DIRECTOR GENERAL DE DEFENSA Y PROTECCIÓN DEL CONSUMIDOR<br/>
                   (PROCURACIÓN GENERAL, GOBIERNO DE LA CIUDAD DE BUENOS AIRES)<br/>
                   S _____________ / _____________ D
                 </p>

                 <p className="mb-6 text-justify text-slate-800 font-serif leading-relaxed text-[15px]">
                   Quien suscribe, <strong>[NOMBRE DEL USUARIO]</strong>, con DNI N° <strong>[INGRESE SU DNI AQUÍ]</strong>, constituyendo domicilio legal y electrónico en la presente plataforma judicial, me presento ante Usted muy respetuosamente a fin de promover denuncia formal contra la empresa comercial <strong>[NOMBRE DE LA EMPRESA MOCK: Fravega S.A.]</strong>, con domicilio en [DOMICILIO EMPRESA], por reiteradas infracciones a la <strong>Ley 24.240 de Defensa del Consumidor</strong>.
                 </p>

                 <h3 className="font-bold border-b border-slate-400 pb-2 mb-4 font-serif">I. OBJETO</h3>
                 <p className="mb-6 text-justify text-slate-800 font-serif leading-relaxed text-[15px]">
                   Vengo por este acto a incoar formal reclamo y solicitar su intervención inmediata debido al grave y manifiesto incumplimiento contractual referente a <em>"Negativa a hacer válida garantía por producto electrónico defectuoso"</em>.
                 </p>

                 <h3 className="font-bold border-b border-slate-400 pb-2 mb-4 font-serif">II. HECHOS Y FUNDAMENTOS</h3>
                 <p className="mb-6 text-justify text-slate-800 font-serif leading-relaxed text-[15px]">
                   Que con fecha 02 de enero de 2026 adquirí a través del portal de la demandada un Lavarropas Automático de 10KG (Factura Electrónica N° A-000342). Que el mismo fue entregado con defectos graves de funcionamiento, inundando mi propiedad. Que a sabiendas de este defecto de fábrica, el proveedor aludió a "Políticas Internas", evadiendo dolosamente su responsabilidad, la cual es mandatoria por ley.
                 </p>

                 <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 mb-6 rounded-r-md">
                   <p className="text-indigo-900 font-serif text-sm italic font-medium">
                     *Párrafo sugerido por Inteligencia Artificial basado en Jurisprudencia Previa (Expediente #74, CSJN)*
                   </p>
                   <p className="text-slate-800 font-serif leading-relaxed text-[15px] mt-2">
                     En estricto apego al <strong>Artículo 11 y 17 de la Ley N° 24.240</strong>, es un derecho inalienable del consumidor la reparación, reposición de la cosa por otra de idénticas características, o la devolución íntegra de la suma pagada si la reparación no resulta satisfactoria, y la empresa no tiene la facultad legal de negarla escudándose en reglamentos comerciales privados.
                   </p>
                 </div>

                 <h3 className="font-bold border-b border-slate-400 pb-2 mb-4 mt-8 font-serif">III. PETITORIO</h3>
                 <p className="mb-6 text-justify text-slate-800 font-serif leading-relaxed text-[15px]">
                   Por todo lo expuesto, a Usted Señor Director, solicito:<br/><br/>
                   1. Tenga por presentada en tiempo y forma la presente denuncia contra la requerida.<br/>
                   2. Se fije inquebrantable e inaplazable audiencia de conciliación conforme los términos de la ley aplicable.<br/>
                   3. Oportunamente, y ante la falta de avenimiento, se apliquen las multas máximas previstas, exigiéndose el reembolso íntegro de la suma abonada más daños punitivos.
                 </p>

                 <br/><br/>
                 <p className="text-center font-bold font-serif text-lg">PROVEER DE CONFORMIDAD,<br/>SERÁ JUSTIA.</p>
              </div>

               {/* Hint badge at the edge of the paper */}
               <div className="absolute top-8 -right-10 bg-indigo-500 text-white font-bold text-[10px] py-1 px-10 shadow-lg transform rotate-45 uppercase tracking-widest">
                 DRAFT MODE
               </div>
            </div>
            
            <div className="h-20"></div> {/* Bottom spacer */}
          </div>
        </div>

      </div>
    </div>
  );
}
