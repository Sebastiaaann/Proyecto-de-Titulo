# Estándares y Cumplimiento Normativo - FletesM

## 1. Introducción
Este documento detalla los estándares técnicos y legales adoptados en el desarrollo de FletesM para garantizar la calidad, seguridad y legalidad de la plataforma.

## 2. Marco Legal Chileno
### 2.1 Ley de Protección de Datos Personales (Nueva Ley 2024)
FletesM se adhiere a la **Nueva Ley de Protección de Datos Personales de Chile (2024)**, que actualiza la Ley N° 19.628. Para dar cumplimiento a esta normativa, la plataforma implementa:

*   **Principio de Licitud:** Los datos de conductores y clientes se procesan solo para fines contractuales y operativos explícitos.
*   **Seguridad de la Información:** Uso de encriptación en tránsito (HTTPS/TLS 1.2+) y en reposo (Base de datos Supabase).
*   **Derechos ARCO:** Se habilitan canales para que los titulares ejerzan sus derechos de Acceso, Rectificación, Cancelación y Oposición.
*   **Responsabilidad Proactiva:** Mantenimiento de registros de actividades de tratamiento (Logs de sistema).

## 3. Estándares Técnicos y de Seguridad
### 3.1 OWASP Top 10 (2021)
Se han mitigado las vulnerabilidades web más críticas identificadas por OWASP:
*   **A01:2021-Broken Access Control:** Implementación estricta de Row Level Security (RLS) en base de datos para segregar datos entre usuarios.
*   **A02:2021-Cryptographic Failures:** No se almacenan contraseñas en texto plano; se utiliza hashing seguro provisto por Supabase Auth (GoTrue).
*   **A03:2021-Injection:** Uso de consultas parametrizadas y ORM para prevenir SQL Injection.

### 3.2 Estándares de Código
*   **Tipado Estático:** Uso de TypeScript para reducir errores en tiempo de compilación.
*   **Linting:** Adhesión a reglas ESLint Standard para consistencia de código.
*   **Format:** Prettier para estilo de código unificado.

## 4. Estándares de Interoperabilidad
*   **RESTful API:** Diseño de API siguiendo principios REST para comunicación cliente-servidor.
*   **JSON:** Formato estándar para intercambio de mensajes.
