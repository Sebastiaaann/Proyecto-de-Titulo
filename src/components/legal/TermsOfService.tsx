import React from 'react';
import { ArrowLeft, Scale, FileText, AlertCircle, CheckCircle2, Gavel } from 'lucide-react';
import { useStore } from '@store/useStore';
import { AppView } from '@/types';

const TermsOfService: React.FC = () => {
  const { setView } = useStore();

  return (
    <div className="min-h-screen bg-dark-950 text-slate-300 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => setView(AppView.HOME)}
          className="flex items-center gap-2 text-brand-400 hover:text-brand-300 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver al Inicio
        </button>

        <div className="bg-dark-900 border border-white/10 rounded-2xl p-8 md:p-12 shadow-2xl">
          <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-8">
            <div className="p-3 bg-brand-500/10 rounded-xl">
              <Scale className="w-8 h-8 text-brand-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Términos de Servicio</h1>
              <p className="text-slate-400 mt-1">Última actualización: Diciembre 2025</p>
            </div>
          </div>

          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand-400" />
                1. Aceptación de los Términos
              </h2>
              <p className="leading-relaxed">
                Al acceder y utilizar la plataforma FleetTech ("el Servicio"), usted acepta estar legalmente vinculado por estos Términos de Servicio. 
                Si no está de acuerdo con alguna parte de estos términos, no podrá acceder al Servicio.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-brand-400" />
                2. Uso del Servicio
              </h2>
              <p className="mb-4">Usted se compromete a utilizar el Servicio únicamente para fines legales y de acuerdo con estos Términos.</p>
              <ul className="list-disc pl-6 space-y-2 text-slate-400">
                <li>Es responsable de mantener la confidencialidad de su cuenta y contraseña.</li>
                <li>No debe utilizar el Servicio para transmitir malware o contenido ilegal.</li>
                <li>Nos reservamos el derecho de suspender su cuenta si detectamos actividad sospechosa.</li>
                <li>El uso de la API está sujeto a límites de tasa y uso justo.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-brand-400" />
                3. Propiedad Intelectual
              </h2>
              <p className="leading-relaxed">
                El Servicio y su contenido original, características y funcionalidad son y seguirán siendo propiedad exclusiva de FleetTech y sus licenciantes. 
                El Servicio está protegido por derechos de autor, marcas registradas y otras leyes tanto de Chile como de países extranjeros.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Gavel className="w-5 h-5 text-brand-400" />
                4. Limitación de Responsabilidad
              </h2>
              <p className="leading-relaxed">
                En ningún caso FleetTech, ni sus directores, empleados, socios, agentes, proveedores o afiliados, serán responsables por daños indirectos, incidentales, especiales, consecuentes o punitivos, 
                incluyendo, sin limitación, pérdida de beneficios, datos, uso, buena voluntad u otras pérdidas intangibles, resultantes de su acceso o uso o la imposibilidad de acceder o usar el Servicio.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">5. Cambios en los Términos</h2>
              <p className="leading-relaxed mb-4">
                Nos reservamos el derecho, a nuestra sola discreción, de modificar o reemplazar estos Términos en cualquier momento. 
                Si una revisión es material, intentaremos proporcionar un aviso de al menos 30 días antes de que entren en vigor los nuevos términos.
              </p>
            </section>

            <div className="mt-12 pt-8 border-t border-white/10 text-center text-sm text-slate-500">
              <p>Si tiene alguna pregunta sobre estos términos, por favor contáctenos en legal@fleettech.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
