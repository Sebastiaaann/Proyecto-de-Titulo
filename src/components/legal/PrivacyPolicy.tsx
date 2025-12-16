import React from 'react';
import { ArrowLeft, Shield, Lock, Eye, FileText, Server } from 'lucide-react';
import { useStore } from '@store/useStore';
import { AppView } from '@/types';

const PrivacyPolicy: React.FC = () => {
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
              <Shield className="w-8 h-8 text-brand-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Política de Privacidad</h1>
              <p className="text-slate-400 mt-1">Última actualización: Diciembre 2025</p>
            </div>
          </div>

          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5 text-brand-400" />
                1. Introducción
              </h2>
              <p className="leading-relaxed">
                En FleetTech ("nosotros", "nuestro"), respetamos su privacidad y estamos comprometidos a proteger sus datos personales. 
                Esta política de privacidad le informará sobre cómo cuidamos sus datos personales cuando visita nuestro sitio web o utiliza nuestra aplicación de gestión de flotas, 
                y le informará sobre sus derechos de privacidad y cómo la ley lo protege.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5 text-brand-400" />
                2. Datos que Recopilamos
              </h2>
              <p className="mb-4">Podemos recopilar, usar, almacenar y transferir diferentes tipos de datos personales sobre usted, que hemos agrupado de la siguiente manera:</p>
              <ul className="list-disc pl-6 space-y-2 text-slate-400">
                <li><strong className="text-slate-200">Datos de Identidad:</strong> incluye nombre, apellido, nombre de usuario o identificador similar.</li>
                <li><strong className="text-slate-200">Datos de Contacto:</strong> incluye dirección de facturación, dirección de entrega, dirección de correo electrónico y números de teléfono.</li>
                <li><strong className="text-slate-200">Datos Técnicos:</strong> incluye dirección IP, datos de inicio de sesión, tipo y versión del navegador, configuración de zona horaria y ubicación.</li>
                <li><strong className="text-slate-200">Datos de Uso:</strong> incluye información sobre cómo utiliza nuestro sitio web, productos y servicios (ej. rutas, telemetría).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Server className="w-5 h-5 text-brand-400" />
                3. Cómo Usamos sus Datos
              </h2>
              <p className="mb-4">Solo utilizaremos sus datos personales cuando la ley lo permita. Comúnmente, utilizaremos sus datos personales en las siguientes circunstancias:</p>
              <ul className="list-disc pl-6 space-y-2 text-slate-400">
                <li>Para registrarlo como nuevo cliente o conductor.</li>
                <li>Para procesar y entregar sus pedidos y gestionar rutas.</li>
                <li>Para administrar nuestra relación con usted.</li>
                <li>Para mejorar nuestro sitio web, productos/servicios, marketing, relaciones con los clientes y experiencias.</li>
                <li>Para cumplir con obligaciones legales y regulatorias.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand-400" />
                4. Seguridad de los Datos
              </h2>
              <p className="leading-relaxed">
                Hemos implementado medidas de seguridad apropiadas para evitar que sus datos personales se pierdan accidentalmente, se utilicen o se acceda a ellos de forma no autorizada, se alteren o se divulguen. 
                Además, limitamos el acceso a sus datos personales a aquellos empleados, agentes, contratistas y otros terceros que tengan una necesidad comercial de conocerlos.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">5. Sus Derechos Legales</h2>
              <p className="leading-relaxed mb-4">
                Bajo ciertas circunstancias, usted tiene derechos bajo las leyes de protección de datos en relación con sus datos personales, incluyendo el derecho a:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-400">
                <li>Solicitar acceso a sus datos personales.</li>
                <li>Solicitar la corrección de sus datos personales.</li>
                <li>Solicitar la eliminación de sus datos personales.</li>
                <li>Oponerse al procesamiento de sus datos personales.</li>
                <li>Solicitar la restricción del procesamiento de sus datos personales.</li>
                <li>Solicitar la transferencia de sus datos personales.</li>
                <li>Retirar el consentimiento.</li>
              </ul>
            </section>

            <div className="mt-12 pt-8 border-t border-white/10 text-center text-sm text-slate-500">
              <p>Si tiene alguna pregunta sobre esta política de privacidad, por favor contáctenos en soporte@fleettech.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
