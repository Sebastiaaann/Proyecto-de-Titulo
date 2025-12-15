import React from 'react';
import { FileSignature, User, CreditCard, Clock, FileText, X } from 'lucide-react';

interface DeliveryProof {
  signature: string;
  clientName?: string;
  clientId?: string;
  deliveredAt: number;
  notes?: string;
}

interface DeliveryProofViewerProps {
  deliveryProof: DeliveryProof;
  onClose: () => void;
}

const DeliveryProofViewer: React.FC<DeliveryProofViewerProps> = ({ deliveryProof, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-dark-900 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-600 to-brand-500 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <FileSignature className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Comprobante de Entrega</h3>
                <p className="text-sm text-brand-100">Prueba de entrega firmada</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Client Information */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
            <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
              Información del Cliente
            </h4>

            {deliveryProof.clientName && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-500/10 rounded-lg">
                  <User className="w-4 h-4 text-brand-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Nombre</p>
                  <p className="text-white font-semibold">{deliveryProof.clientName}</p>
                </div>
              </div>
            )}

            {deliveryProof.clientId && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-500/10 rounded-lg">
                  <CreditCard className="w-4 h-4 text-brand-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">RUT/Cédula</p>
                  <p className="text-white font-semibold">{deliveryProof.clientId}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-500/10 rounded-lg">
                <Clock className="w-4 h-4 text-brand-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Fecha y Hora de Entrega</p>
                <p className="text-white font-semibold">
                  {new Date(deliveryProof.deliveredAt).toLocaleString('es-CL', {
                    dateStyle: 'full',
                    timeStyle: 'short'
                  })}
                </p>
              </div>
            </div>

            {deliveryProof.notes && (
              <div className="flex items-start gap-3 pt-2 border-t border-white/10">
                <div className="p-2 bg-brand-500/10 rounded-lg">
                  <FileText className="w-4 h-4 text-brand-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-400 mb-1">Observaciones</p>
                  <p className="text-white text-sm">{deliveryProof.notes}</p>
                </div>
              </div>
            )}
          </div>

          {/* Signature */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
              Firma del Cliente
            </h4>
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex items-center justify-center min-h-[200px]">
              <img
                src={deliveryProof.signature}
                alt="Firma del cliente"
                className="max-w-full max-h-[200px] object-contain invert-0"
              />
            </div>
            <p className="text-xs text-slate-400 mt-3 text-center">
              Firma digital capturada el {new Date(deliveryProof.deliveredAt).toLocaleDateString('es-CL')}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                // Download signature
                const link = document.createElement('a');
                link.download = `comprobante-${deliveryProof.deliveredAt}.png`;
                link.href = deliveryProof.signature;
                link.click();
              }}
              className="flex-1 bg-brand-500/10 border border-brand-500/20 text-brand-400 py-3 rounded-xl font-semibold hover:bg-brand-500/20 transition-colors"
            >
              Descargar Firma
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-white/5 border border-white/10 text-white py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryProofViewer;
