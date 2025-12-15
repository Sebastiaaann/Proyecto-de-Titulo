/**
 * Zod Validation Schemas for Vehicle Entity
 */

import { z } from 'zod';

/**
 * Vehicle Status enum
 */
export const VehicleStatusSchema = z.enum(['Active', 'Maintenance', 'Idle'], {
    message: 'Estado debe ser Active, Maintenance o Idle',
});

export type VehicleStatus = z.infer<typeof VehicleStatusSchema>;

/**
 * Vehicle Location schema
 */
export const VehicleLocationSchema = z.object({
    lat: z.number()
        .min(-90, 'Latitud debe estar entre -90 y 90')
        .max(90, 'Latitud debe estar entre -90 y 90'),
    lng: z.number()
        .min(-180, 'Longitud debe estar entre -180 y 180')
        .max(180, 'Longitud debe estar entre -180 y 180'),
});

export type VehicleLocation = z.infer<typeof VehicleLocationSchema>;

/**
 * Chilean plate validation regex
 * Formats: XX-YY-12 or XXXX-12
 */
const CHILEAN_PLATE_REGEX = /^(?:[A-Z]{2}-[A-Z]{2}-\d{2}|[A-Z]{4}-\d{2})$/i;

const normalizeChileanPlate = (value: unknown) => {
    if (typeof value !== 'string') return value;

    const trimmed = value.trim().toUpperCase();
    const oldFormat = /^[A-Z]{2}-[A-Z]{2}-\d{2}$/;
    const newFormat = /^[A-Z]{4}-\d{2}$/;
    if (oldFormat.test(trimmed) || newFormat.test(trimmed)) return trimmed;

    // Remove all non-alphanumeric characters
    const compact = trimmed.replace(/[^A-Z0-9]/g, '');

    // Pattern 1: XXXX12 (4 letters + 2 numbers) -> XXXX-12
    if (/^[A-Z]{4}\d{2}$/.test(compact)) {
        return `${compact.slice(0, 4)}-${compact.slice(4)}`;
    }

    // Pattern 2: XX12XX (2 letters + 2 numbers + 2 letters) -> XX-XX-12
    if (/^[A-Z]{2}\d{2}[A-Z]{2}$/.test(compact)) {
        return `${compact.slice(0, 2)}-${compact.slice(4, 6)}-${compact.slice(2, 4)}`;
    }

    // Pattern 3: XXYY12 (2 letters + 2 letters + 2 numbers) -> XX-YY-12
    if (/^[A-Z]{2}[A-Z]{2}\d{2}$/.test(compact)) {
        return `${compact.slice(0, 2)}-${compact.slice(2, 4)}-${compact.slice(4)}`;
    }

    return trimmed;
};

/**
 * Complete Vehicle schema for creation
 */
export const VehicleCreateSchema = z.object({
    id: z.string().uuid('ID debe ser un UUID válido'),
    plate: z.string()
        .min(1, 'Patente debe tener al menos 1 caracter')
        .max(6, 'Patente no debe exceder 6 caracteres')
        .transform(val => val.toUpperCase().trim()),
    model: z.string()
        .min(3, 'Modelo debe tener al menos 3 caracteres')
        .max(50, 'Modelo no debe exceder 50 caracteres')
        .trim(),
    status: VehicleStatusSchema,
    mileage: z.number()
        .int('Kilometraje debe ser un número entero')
        .min(0, 'Kilometraje no puede ser negativo')
        .max(10000000, 'Kilometraje parece incorrecto'),
    fuelLevel: z.number()
        .min(0, 'Nivel de combustible debe estar entre 0 y 100')
        .max(100, 'Nivel de combustible debe estar entre 0 y 100'),
    nextService: z.string()
        .datetime('Fecha de servicio debe ser una fecha válida')
        .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)')),
    city: z.string()
        .min(2, 'Ciudad debe tener al menos 2 caracteres')
        .max(50, 'Ciudad no debe exceder 50 caracteres')
        .trim()
        .optional(),
    location: VehicleLocationSchema.optional(),
    insuranceExpiry: z.string()
        .datetime('Fecha de vencimiento debe ser una fecha válida')
        .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)'))
        .optional(),
    documents: z.array(z.any()).optional(),
});

export type VehicleCreate = z.infer<typeof VehicleCreateSchema>;

/**
 * Vehicle update schema (all fields optional except id)
 */
export const VehicleUpdateSchema = z.object({
    plate: z.string()
        .min(1, 'Patente debe tener al menos 1 caracter')
        .max(6, 'Patente no debe exceder 6 caracteres')
        .transform(val => val.toUpperCase().trim())
        .optional(),
    model: z.string()
        .min(3, 'Modelo debe tener al menos 3 caracteres')
        .max(50, 'Modelo no debe exceder 50 caracteres')
        .trim()
        .optional(),
    status: VehicleStatusSchema.optional(),
    mileage: z.number()
        .int('Kilometraje debe ser un número entero')
        .min(0, 'Kilometraje no puede ser negativo')
        .max(10000000, 'Kilometraje parece incorrecto')
        .optional(),
    fuelLevel: z.number()
        .min(0, 'Nivel de combustible debe estar entre 0 y 100')
        .max(100, 'Nivel de combustible debe estar entre 0 y 100')
        .optional(),
    nextService: z.string()
        .datetime('Fecha de servicio debe ser una fecha válida')
        .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido'))
        .optional(),
    city: z.string()
        .min(2, 'Ciudad debe tener al menos 2 caracteres')
        .max(50, 'Ciudad no debe exceder 50 caracteres')
        .trim()
        .optional(),
    location: VehicleLocationSchema.optional(),
    insuranceExpiry: z.string()
        .datetime('Fecha de vencimiento debe ser una fecha válida')
        .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido'))
        .optional(),
    documents: z.array(z.any()).optional(),
});

export type VehicleUpdate = z.infer<typeof VehicleUpdateSchema>;

/**
 * Vehicle schema for display (from database)
 */
export const VehicleSchema = VehicleCreateSchema.extend({
    id: z.string(),
});

export type Vehicle = z.infer<typeof VehicleSchema>;
