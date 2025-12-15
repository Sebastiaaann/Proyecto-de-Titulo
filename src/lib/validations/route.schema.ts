/**
 * Zod Validation Schemas for Route Entity
 */

import { z } from 'zod';

/**
 * Route Status enum
 */
export const RouteStatusSchema = z.enum(['Pending', 'In Progress', 'Completed'], {
    message: 'Estado debe ser Pending, In Progress o Completed',
});

export type RouteStatus = z.infer<typeof RouteStatusSchema>;

/**
 * Vehicle Type enum
 */
export const VehicleTypeSchema = z.enum([
    'Camión Pequeño',
    'Camión Mediano',
    'Camión Grande',
    'Camioneta',
    'Furgón',
], {
    message: 'Tipo de vehículo inválido',
});

export type VehicleType = z.infer<typeof VehicleTypeSchema>;

/**
 * Delivery Proof schema
 */
export const DeliveryProofSchema = z.object({
    signature: z.string()
        .min(10, 'Firma es requerida')
        .startsWith('data:image', 'Firma debe ser una imagen válida'),
    clientName: z.string()
        .min(3, 'Nombre del cliente debe tener al menos 3 caracteres')
        .max(100, 'Nombre del cliente no debe exceder 100 caracteres')
        .trim()
        .optional(),
    clientId: z.string()
        .min(9, 'RUT del cliente debe tener al menos 9 caracteres')
        .max(12, 'RUT del cliente no debe exceder 12 caracteres')
        .optional(),
    deliveredAt: z.number()
        .int('Timestamp debe ser un número entero')
        .positive('Timestamp debe ser positivo'),
    notes: z.string()
        .max(500, 'Notas no deben exceder 500 caracteres')
        .trim()
        .optional(),
});

export type DeliveryProof = z.infer<typeof DeliveryProofSchema>;

/**
 * Complete Route schema for creation
 */
export const RouteCreateSchema = z.object({
    id: z.string().uuid('ID debe ser un UUID válido'),
    origin: z.string()
        .min(3, 'Origen debe tener al menos 3 caracteres')
        .max(200, 'Origen no debe exceder 200 caracteres')
        .trim(),
    destination: z.string()
        .min(3, 'Destino debe tener al menos 3 caracteres')
        .max(200, 'Destino no debe exceder 200 caracteres')
        .trim(),
    distance: z.string()
        .regex(/^\d+(\.\d+)?\s*(km|KM)$/, 'Distancia debe estar en formato: "123 km"'),
    estimatedPrice: z.string()
        .regex(/^\$?\d{1,3}(,\d{3})*(\.\d{2})?$/, 'Precio debe estar en formato: "$1,234.56"'),
    vehicleType: VehicleTypeSchema,
    driver: z.string()
        .min(3, 'Nombre del conductor debe tener al menos 3 caracteres')
        .max(100, 'Nombre del conductor no debe exceder 100 caracteres')
        .trim()
        .optional(),
    vehicle: z.string()
        .min(6, 'Patente del vehículo debe tener al menos 6 caracteres')
        .max(9, 'Patente del vehículo no debe exceder 9 caracteres')
        .optional(),
    timestamp: z.number()
        .int('Timestamp debe ser un número entero')
        .positive('Timestamp debe ser positivo'),
    status: RouteStatusSchema,
    deliveryProof: DeliveryProofSchema.optional(),
});

export type RouteCreate = z.infer<typeof RouteCreateSchema>;

/**
 * Route update schema
 */
export const RouteUpdateSchema = z.object({
    origin: z.string()
        .min(3, 'Origen debe tener al menos 3 caracteres')
        .max(200, 'Origen no debe exceder 200 caracteres')
        .trim()
        .optional(),
    destination: z.string()
        .min(3, 'Destino debe tener al menos 3 caracteres')
        .max(200, 'Destino no debe exceder 200 caracteres')
        .trim()
        .optional(),
    distance: z.string()
        .regex(/^\d+(\.\d+)?\s*(km|KM)$/, 'Distancia debe estar en formato: "123 km"')
        .optional(),
    estimatedPrice: z.string()
        .regex(/^\$?\d{1,3}(,\d{3})*(\.\d{2})?$/, 'Precio debe estar en formato: "$1,234.56"')
        .optional(),
    vehicleType: VehicleTypeSchema.optional(),
    driver: z.string()
        .min(3, 'Nombre del conductor debe tener al menos 3 caracteres')
        .max(100, 'Nombre del conductor no debe exceder 100 caracteres')
        .trim()
        .optional(),
    vehicle: z.string()
        .min(6, 'Patente del vehículo debe tener al menos 6 caracteres')
        .max(9, 'Patente del vehículo no debe exceder 9 caracteres')
        .optional(),
    status: RouteStatusSchema.optional(),
    deliveryProof: DeliveryProofSchema.optional(),
});

export type RouteUpdate = z.infer<typeof RouteUpdateSchema>;

/**
 * Route schema for display (from database)
 */
export const RouteSchema = RouteCreateSchema.extend({
    id: z.string(),
});

export type Route = z.infer<typeof RouteSchema>;

/**
 * Pending Route Data schema (for route builder)
 */
export const PendingRouteDataSchema = z.object({
    origin: z.string()
        .min(3, 'Origen debe tener al menos 3 caracteres')
        .max(200, 'Origen no debe exceder 200 caracteres')
        .trim(),
    destination: z.string()
        .min(3, 'Destino debe tener al menos 3 caracteres')
        .max(200, 'Destino no debe exceder 200 caracteres')
        .trim(),
    distance: z.string()
        .regex(/^\d+(\.\d+)?\s*(km|KM)$/, 'Distancia debe estar en formato: "123 km"'),
    cargoDescription: z.string()
        .min(10, 'Descripción de carga debe tener al menos 10 caracteres')
        .max(500, 'Descripción de carga no debe exceder 500 caracteres')
        .trim(),
    estimatedPrice: z.string()
        .regex(/^\$?\d{1,3}(,\d{3})*(\.\d{2})?$/, 'Precio debe estar en formato: "$1,234.56"'),
    vehicleType: VehicleTypeSchema,
});

export type PendingRouteData = z.infer<typeof PendingRouteDataSchema>;
