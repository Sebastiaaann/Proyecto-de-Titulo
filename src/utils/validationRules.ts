// Chilean RUT Validator (Modulo 11)
export const validateChileanRut = (rut: string): string | null => {
    if (!rut) return "RUT es requerido";

    const clean = rut.replace(/[^0-9kK]/g, '');
    if (clean.length < 7) return "RUT es muy corto. Formato: 12345678-9";

    const body = clean.slice(0, -1);
    const dv = clean.slice(-1).toUpperCase();

    if (!/^\d+$/.test(body)) return "Formato de RUT inválido. Formato: 12345678-9";

    let sum = 0;
    let multiplier = 2;
    for (let i = body.length - 1; i >= 0; i--) {
        sum += parseInt(body[i]) * multiplier;
        multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }

    const mod = 11 - (sum % 11);
    const expectedDv = mod === 11 ? '0' : mod === 10 ? 'K' : mod.toString();

    console.log(`[VALIDATOR] Input: ${rut}, Clean: ${clean}, Body: ${body}, DV: ${dv}, Sum: ${sum}, Mod: ${mod}, Expected: ${expectedDv}`);

    if (dv !== expectedDv) {
        return `Dígito Verificador inválido. Debería ser ${expectedDv}`;
    }

    return null;
};

// Chilean License Plate Validator
export const validateChileanPlate = (plate: string): string | null => {
    if (!plate) return "Patente es requerida";

    const normalized = plate.trim().toUpperCase();

    // Format: XX-YY-12 or XXXX-12 (allow typing without separators)
    const oldFormat = /^[A-Z]{2}-[A-Z]{2}-\d{2}$/;
    const newFormat = /^[A-Z]{4}-\d{2}$/;
    const compact = normalized.replace(/[^A-Z0-9]/g, '');
    const compactFormat = /^[A-Z]{4}\d{2}$/;

    if (!oldFormat.test(normalized) && !newFormat.test(normalized) && !compactFormat.test(compact)) {
        return "Formato inválido. Use XX-YY-12 o XXXX-12";
    }

    return null;
};

// Email Validator
export const validateEmail = (email: string): string | null => {
    if (!email) return "Email es requerido";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return "Email inválido. Ejemplo: usuario@ejemplo.com";
    }

    return null;
};

// Positive Number Validator
export const validatePositiveNumber = (value: number, fieldName: string = "Valor"): string | null => {
    if (value === undefined || value === null) return `${fieldName} es requerido`;

    if (isNaN(value)) return `${fieldName} debe ser un número`;

    if (value < 0) return `${fieldName} debe ser positivo`;

    return null;
};

// Range Validator
export const validateRange = (
    value: number,
    min: number,
    max: number,
    fieldName: string = "Valor"
): string | null => {
    if (value === undefined || value === null) return `${fieldName} es requerido`;

    if (isNaN(value)) return `${fieldName} debe ser un número`;

    if (value < min || value > max) {
        return `${fieldName} debe estar entre ${min} y ${max}`;
    }

    return null;
};

// Date Validator (not in the past)
export const validateFutureDate = (date: string, fieldName: string = "Fecha"): string | null => {
    if (!date) return `${fieldName} es requerida`;

    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
        return `${fieldName} no puede ser en el pasado`;
    }

    return null;
};

// Phone Number Validator (Chilean format)
export const validateChileanPhone = (phone: string): string | null => {
    if (!phone) return "Teléfono es requerido";

    const clean = phone.replace(/\D/g, '');

    // Chilean phone numbers: 9 digits (mobile) or 8 digits (landline)
    if (clean.length !== 9 && clean.length !== 8) {
        return "Teléfono inválido. Debe tener 8 o 9 dígitos";
    }

    // Mobile numbers start with 9
    if (clean.length === 9 && !clean.startsWith('9')) {
        return "Número móvil debe comenzar con 9";
    }

    return null;
};

// Required Field Validator
export const validateRequired = (value: any, fieldName: string = "Campo"): string | null => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
        return `${fieldName} es requerido`;
    }
    return null;
};

// Min Length Validator
export const validateMinLength = (
    value: string,
    minLength: number,
    fieldName: string = "Campo"
): string | null => {
    if (!value) return null; // Use validateRequired for required check

    if (value.length < minLength) {
        return `${fieldName} debe tener al menos ${minLength} caracteres`;
    }

    return null;
};

// Max Length Validator
export const validateMaxLength = (
    value: string,
    maxLength: number,
    fieldName: string = "Campo"
): string | null => {
    if (!value) return null;

    if (value.length > maxLength) {
        return `${fieldName} no debe exceder ${maxLength} caracteres`;
    }

    return null;
};

export default {
    validateChileanRut,
    validateChileanPlate,
    validateEmail,
    validatePositiveNumber,
    validateRange,
    validateFutureDate,
    validateChileanPhone,
    validateRequired,
    validateMinLength,
    validateMaxLength,
};
