# SuiteCRM · Mapa Funcional

Referencia para integrar los formularios de la plataforma con un CRM tipo **SuiteCRM**.

## Módulos SuiteCRM relevantes
| Módulo | Uso en CNI |
|--------|-----------|
| **Leads** | Prospecto inicial desde formularios web. |
| **Contacts** | Persona calificada tras seguimiento. |
| **Accounts** | Empresa / organización del inversionista. |
| **Opportunities** | Oportunidad de inversión en pipeline. |
| **Cases** | Soporte / trámites del inversionista. |
| **Tasks / Calls / Meetings** | Actividades de seguimiento del equipo CNI. |

## Mapeo formulario → CRM
| Formulario (frontend) | Entidad destino | Campos clave |
|-----------------------|-----------------|--------------|
| Contacto (`/contacto`) | Lead | nombre, email, teléfono, mensaje, origen |
| Postulación de proyectos (`/postulacion-de-proyectos`) | Lead → Opportunity | empresa, sector, departamento, monto, descripción |
| Asesoría (`/asesoria`) | Lead + Task | tipo de asesoría, sector, contacto |

## Campos de origen (trazabilidad)
- `lead_source`: web.
- `campaign / sector`: sector de interés.
- `department`: departamento de interés.
- `locale`: es / en.

## Integración técnica (a definir en ADR)
- **API**: SuiteCRM v8 REST (OAuth2) o módulo v4.1 legacy.
- **Patrón**: backend Django recibe el form → valida (zod en front, serializer en back) → crea Lead vía API CRM.
- **Idempotencia**: deduplicar por email / identificador.
- **Errores**: si el CRM falla, persistir el lead localmente y reintentar (cola).

## Pendientes
- [ ] Confirmar versión y endpoint de SuiteCRM.
- [ ] Definir credenciales/secretos (no en repo).
- [ ] ADR-0002 con la decisión de integración.
