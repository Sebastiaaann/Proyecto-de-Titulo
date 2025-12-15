import { useState, useCallback } from 'react';

export interface ValidationRule {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: RegExp;
    custom?: (value: any) => string | null;
    message?: string;
}

export interface ValidationRules {
    [key: string]: ValidationRule;
}

export interface FormValues {
    [key: string]: any;
}

export interface FormErrors {
    [key: string]: string;
}

export interface FormTouched {
    [key: string]: boolean;
}

export const useFormValidation = (
    initialValues: FormValues,
    validationRules: ValidationRules
) => {
    const [values, setValues] = useState<FormValues>(initialValues);
    const [errors, setErrors] = useState<FormErrors>({});
    const [touched, setTouched] = useState<FormTouched>({});
    const [isValidating, setIsValidating] = useState(false);

    const validateField = useCallback(
        (fieldName: string, value: any): string | null => {
            const rules = validationRules[fieldName];
            if (!rules) return null;

            // Required validation
            if (rules.required && (!value || value.toString().trim() === '')) {
                return rules.message || `${fieldName} es requerido`;
            }

            // Skip other validations if value is empty and not required
            if (!value || value.toString().trim() === '') return null;

            // MinLength validation
            if (rules.minLength && value.toString().length < rules.minLength) {
                return rules.message || `Debe tener al menos ${rules.minLength} caracteres`;
            }

            // MaxLength validation
            if (rules.maxLength && value.toString().length > rules.maxLength) {
                return rules.message || `No debe exceder ${rules.maxLength} caracteres`;
            }

            // Min value validation
            if (rules.min !== undefined && Number(value) < rules.min) {
                return rules.message || `Debe ser mayor o igual a ${rules.min}`;
            }

            // Max value validation
            if (rules.max !== undefined && Number(value) > rules.max) {
                return rules.message || `Debe ser menor o igual a ${rules.max}`;
            }

            // Pattern validation
            if (rules.pattern && !rules.pattern.test(value.toString())) {
                return rules.message || 'Formato inválido';
            }

            // Custom validation
            if (rules.custom) {
                return rules.custom(value);
            }

            return null;
        },
        [validationRules]
    );

    const validateForm = useCallback((): boolean => {
        const newErrors: FormErrors = {};
        let isValid = true;

        Object.keys(validationRules).forEach((fieldName) => {
            const error = validateField(fieldName, values[fieldName]);
            if (error) {
                newErrors[fieldName] = error;
                isValid = false;
            }
        });

        setErrors(newErrors);
        return isValid;
    }, [values, validationRules, validateField]);

    const handleChange = useCallback(
        (fieldName: string, value: any) => {
            setValues((prev) => ({ ...prev, [fieldName]: value }));

            // Real-time validation if field has been touched
            if (touched[fieldName]) {
                const error = validateField(fieldName, value);
                setErrors((prev) => ({
                    ...prev,
                    [fieldName]: error || '',
                }));
            }
        },
        [touched, validateField]
    );

    const handleBlur = useCallback(
        (fieldName: string) => {
            setTouched((prev) => ({ ...prev, [fieldName]: true }));
            const error = validateField(fieldName, values[fieldName]);
            setErrors((prev) => ({
                ...prev,
                [fieldName]: error || '',
            }));
        },
        [values, validateField]
    );

    const resetForm = useCallback(() => {
        setValues(initialValues);
        setErrors({});
        setTouched({});
    }, [initialValues]);

    const setFieldValue = useCallback((fieldName: string, value: any) => {
        setValues((prev) => ({ ...prev, [fieldName]: value }));
    }, []);

    const setFieldError = useCallback((fieldName: string, error: string) => {
        setErrors((prev) => ({ ...prev, [fieldName]: error }));
    }, []);

    return {
        values,
        errors,
        touched,
        isValidating,
        handleChange,
        handleBlur,
        validateForm,
        validateField,
        resetForm,
        setFieldValue,
        setFieldError,
        setValues,
    };
};

export default useFormValidation;
