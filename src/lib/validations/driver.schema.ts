/**
 * Zod Validation Schemas for Driver Entity
 */

import { z } from 'zod';

/**
 * Driver Status enum
 */
export const DriverStatusSchema = z.enum(['Available', 'On Route', 'Off Duty'], {
    message: 'Estado debe ser Available, On Route u Off Duty',
});

export type DriverStatus = z.infer<typeof DriverStatusSchema>;

/**
 * License Type enum (Chilean licenses)
 */
export const LicenseTypeSchema = z.enum(['A1', 'A2', 'A3', 'A4', 'A5', 'B', 'C', 'D', 'E', 'F'], {
    message: 'Tipo de licencia inválido',
});

export type LicenseType = z.infer<typeof LicenseTypeSchema>;

/**
 * Chilean RUT validation
 */
function validateChileanRut(rut: string): boolean {
    // Remove dots and hyphens
    const cleanRut = rut.replace(/\./g, '').replace(/-/g, '');

    // Must have at least 8 characters (7 digits + 1 verifier)
    if (cleanRut.length < 8) return false;

    // Extract number and verifier
    const rutNumber = cleanRut.slice(0, -1);
    const verifier = cleanRut.slice(-1).toUpperCase();

    // Calculate expected verifier
    let sum = 0;
    let multiplier = 2;

    for (let i = rutNumber.length - 1; i >= 0; i--) {
        sum += parseInt(rutNumber[i]) * multiplier;
        multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }

    const expectedVerifier = 11 - (sum % 11);
    const expectedVerifierStr = expectedVerifier === 11 ? '0' : expectedVerifier === 10 ? 'K' : expectedVerifier.toString();

    return verifier === expectedVerifierStr;
}

/**
 * RUT schema with custom validation
 */
export const RutSchema = z.string()
    .min(9, 'RUT debe tener al menos 9 caracteres')
    .max(12, 'RUT no debe exceder 12 caracteres')
    .regex(/^[\d.]+-[\dkK]$/, 'Formato de RUT inválido. Use: 12345678-9')
    .refine(validateChileanRut, {
        message: 'RUT inválido. Verifica el dígito verificador',
    });

/**
 * Complete Driver schema for creation
 */
export const DriverCreateSchema = z.object({
    id: z.string().min(1, 'ID es requerido'),
    name: z.string()
        .min(3, 'Nombre debe tener al menos 3 caracteres')
        .max(100, 'Nombre no debe exceder 100 caracteres')
        .trim()
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Nombre solo debe contener letras'),
    rut: RutSchema,
    licenseType: LicenseTypeSchema,
    licenseExpiry: z.string()
        .datetime('Fecha de vencimiento debe ser una fecha válida')
        .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)'))
        .refine((date) => {
            const expiryDate = new Date(date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return expiryDate >= today;
        }, {
            message: 'La fecha debe ser futura (vencimiento de la licencia de conducir)',
        }),
    status: DriverStatusSchema,
    user_id: z.string().optional(), // Link to Supabase Auth User
});

export type DriverCreate = z.infer<typeof DriverCreateSchema>;

/**
 * Driver update schema (all fields optional except id)
 */
export const DriverUpdateSchema = z.object({
    name: z.string()
        .min(3, 'Nombre debe tener al menos 3 caracteres')
        .max(100, 'Nombre no debe exceder 100 caracteres')
        .trim()
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Nombre solo debe contener letras')
        .optional(),
    rut: RutSchema.optional(),
    licenseType: LicenseTypeSchema.optional(),
    licenseExpiry: z.string()
        .datetime('Fecha de vencimiento debe ser una fecha válida')
        .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido'))
        .optional(),
    status: DriverStatusSchema.optional(),
    user_id: z.string().optional(),
});

export type DriverUpdate = z.infer<typeof DriverUpdateSchema>;

/**
 * Driver schema for display (from database)
 */
export const DriverSchema = DriverCreateSchema.extend({
    id: z.string(),
});

export type Driver = z.infer<typeof DriverSchema>;
