import React, { useState } from 'react';
import { Star, X } from 'lucide-react';
import { showToast } from '@components/common/Toast';

interface RatingModalProps {
    routeId: string;
    driverName: string;
    onClose: () => void;
    onSubmit: (rating: RatingData) => void;
}

export interface RatingData {
    routeId: string;
    rating: number;
    tags: string[];
    comment: string;
    timestamp: number;
}

const RATING_TAGS = [
    'Puntual',
    'Profesional',
    'Cuidadoso con la carga',
    'Amable',
    'Vehículo limpio',
    'Buena comunicación',
    'Ruta eficiente',
    'Documentación completa',
];

const RatingModal: React.FC<RatingModalProps> = ({
    routeId,
    driverName,
    onClose,
    onSubmit,
}) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) {
            showToast.warning('Selecciona una calificación', 'Debes seleccionar al menos una estrella');
            return;
        }

        setIsSubmitting(true);
        try {
            const ratingData: RatingData = {
                routeId,
                rating,
                tags: selectedTags,
                comment,
                timestamp: Date.now(),
            };

            await onSubmit(ratingData);
            showToast.success('¡Gracias por tu calificación!', `Has calificado a ${driverName} con ${rating} estrellas`);
            onClose();
        } catch (error) {
            showToast.error('Error al enviar calificación', 'Intenta nuevamente');
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleTag = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-md bg-dark-900 rounded-2xl border border-white/10 shadow-2xl animate-slide-up">
                {/* Header */}
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-white">Califica tu experiencia</h2>
                            <p className="text-sm text-slate-400 mt-1">¿Cómo fue tu viaje con {driverName}?</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            aria-label="Cerrar"
                        >
                            <X className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Star Rating */}
                    <div className="text-center">
                        <p className="text-sm font-semibold text-slate-400 mb-4">CALIFICACIÓN</p>
                        <div className="flex gap-3 justify-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-brand-500 rounded"
                                >
                                    <Star
                                        className={`w-12 h-12 transition-colors ${star <= (hoverRating || rating)
                                                ? 'text-yellow-400 fill-yellow-400'
                                                : 'text-slate-600'
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>
                        {rating > 0 && (
                            <p className="text-sm text-slate-400 mt-3">
                                {rating === 5 && '¡Excelente! 🌟'}
                                {rating === 4 && 'Muy bueno 👍'}
                                {rating === 3 && 'Bueno 👌'}
                                {rating === 2 && 'Regular 😐'}
                                {rating === 1 && 'Necesita mejorar 😕'}
                            </p>
                        )}
                    </div>

                    {/* Tags */}
                    <div>
                        <p className="text-sm font-semibold text-slate-400 mb-3">ETIQUETAS (OPCIONAL)</p>
                        <div className="flex flex-wrap gap-2">
                            {RATING_TAGS.map((tag) => (
                                <button
                                    key={tag}
                                    onClick={() => toggleTag(tag)}
                                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${selectedTags.includes(tag)
                                            ? 'bg-brand-500 text-white shadow-glow-brand'
                                            : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10'
                                        }`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Comment */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-400 mb-2">
                            COMENTARIOS (OPCIONAL)
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Comparte más detalles sobre tu experiencia..."
                            rows={3}
                            maxLength={500}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all resize-none"
                        />
                        <p className="text-xs text-slate-500 mt-1 text-right">
                            {comment.length}/500 caracteres
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/10 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 bg-white/5 text-white rounded-xl font-bold hover:bg-white/10 transition-colors border border-white/10"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={rating === 0 || isSubmitting}
                        className="flex-1 px-4 py-3 bg-brand-500 text-white rounded-xl font-bold hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-glow-brand"
                    >
                        {isSubmitting ? 'Enviando...' : 'Enviar Calificación'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RatingModal;
