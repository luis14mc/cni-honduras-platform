# 06 · Campos personalizados SIGI CNI

Campos personalizados recomendados para configurar en **Admin → Studio** durante la primera instalación de SuiteCRM.

Convención de sufijo `_c` (custom). Ajustar tipos según versión de SuiteCRM (Dropdown, Text, Currency, Date, etc.).

## Accounts — Empresas

| Campo | Etiqueta sugerida | Tipo recomendado | Uso |
|-------|-------------------|------------------|-----|
| `tipo_entidad_c` | Tipo de entidad | Dropdown | Empresa, ONG, gobierno, fondo, etc. |
| `pais_origen_c` | País de origen | Dropdown / Text | País del inversionista |
| `sector_economico_c` | Sector económico | Dropdown | Alineado con sectores CNI (agro, turismo, energía…) |
| `cliente_objetivo_c` | Cliente objetivo | Checkbox / Dropdown | Si aplica segmentación interna |
| `estado_ciclo_vida_c` | Estado ciclo de vida | Dropdown | Ver [07-suitecrm-pipeline-stages.md](07-suitecrm-pipeline-stages.md) |
| `responsable_cni_c` | Responsable CNI | Relate User | Analista o promotor asignado |
| `fuente_contacto_c` | Fuente de contacto | Dropdown | Web, evento, referido, campaña |
| `monto_potencial_c` | Monto potencial | Currency | Estimación de inversión |
| `empleos_potenciales_c` | Empleos potenciales | Integer | Estimación de empleos |
| `fecha_primer_contacto_c` | Fecha primer contacto | Date | Primera interacción registrada |
| `ultima_interaccion_c` | Última interacción | Datetime | Actualizar en Tasks/Meetings/Calls |

## Contacts — Contactos

| Campo | Etiqueta sugerida | Tipo recomendado | Uso |
|-------|-------------------|------------------|-----|
| `estado_lead_c` | Estado del lead | Dropdown | Ver Lead Status en doc 07 |
| `idioma_preferido_c` | Idioma preferido | Dropdown | `es`, `en` |
| `sector_interes_c` | Sector de interés | Dropdown | Sector declarado en formulario |
| `fuente_entrada_c` | Fuente de entrada | Dropdown | Postulación web, contacto, asesoría, recurso |
| `consentimiento_comunicaciones_c` | Consentimiento comunicaciones | Checkbox | Equivalente a `consent` en Django |
| `cargo_institucional_c` | Cargo institucional | Text | Rol en la empresa |
| `pais_contacto_c` | País del contacto | Dropdown / Text | País de residencia u origen |

## Opportunities — Proyectos de inversión

| Campo | Etiqueta sugerida | Tipo recomendado | Uso |
|-------|-------------------|------------------|-----|
| `sector_c` | Sector | Dropdown | Sector del proyecto |
| `monto_inversion_c` | Monto de inversión | Currency | Monto estimado o confirmado |
| `empleos_estimados_c` | Empleos estimados | Integer | Empleos del proyecto |
| `departamento_c` | Departamento | Dropdown / Text | Ubicación Honduras |
| `municipio_c` | Municipio | Dropdown / Text | Ubicación fina |
| `fecha_anuncio_c` | Fecha de anuncio | Date | Anuncio público del proyecto |
| `fecha_inicio_estimada_c` | Fecha inicio estimada | Date | Arranque previsto |
| `fecha_finalizacion_estimada_c` | Fecha finalización estimada | Date | Cierre previsto |
| `obstaculos_identificados_c` | Obstáculos identificados | Textarea | Riesgos o bloqueos |
| `instituciones_involucradas_c` | Instituciones involucradas | Textarea | SAG, DEI, municipalidades, etc. |
| `prioridad_c` | Prioridad | Dropdown | Alta, media, baja |
| `tipo_inversion_c` | Tipo de inversión | Dropdown | Greenfield, expansión, M&A, etc. |
| `estado_proyecto_c` | Estado del proyecto | Dropdown | Etapas en doc 07 (alineado con Django `project_stage`) |

## Campos de trazabilidad (recomendados en Lead y/o Opportunity)

Crear al integrar n8n; útiles desde la primera carga web:

| Campo | Etiqueta | Tipo | Origen |
|-------|----------|------|--------|
| `django_submission_id_c` | ID postulación Django | Integer / Text | `payload.submission_id` |
| `webhook_event_id_c` | ID evento webhook | Integer / Text | `event_id` de n8n |
| `fuente_web_c` | Fuente web | Dropdown | Valor fijo `website` |

## Mapeo desde postulación web (referencia n8n)

| Payload Django / WebhookEvent | Campo CRM sugerido |
|-------------------------------|-------------------|
| `full_name` | Contact name / Lead name |
| `email` | Email |
| `phone` | Phone |
| `company` | Account name / Company |
| `country` | `pais_contacto_c` / `pais_origen_c` |
| `project_name` | Opportunity name |
| `sector` | `sector_c` / `sector_interes_c` |
| `department` | `departamento_c` |
| `project_location` | Nota o `municipio_c` |
| `investment_range` | Nota o rango en dropdown |
| `estimated_investment` | `monto_inversion_c` |
| `expected_jobs` | `empleos_estimados_c` |
| `details` / `message` | Description / notas |
| `consent` | `consentimiento_comunicaciones_c` |
| `submission_id` | `django_submission_id_c` |

## Notas de implementación en Studio

1. Crear campos en el módulo correspondiente (Accounts, Contacts, Opportunities).
2. Agregar campos a layouts de **Edit** y **Detail** visibles para roles operativos.
3. Marcar campos de trazabilidad como **solo lectura** para usuarios no admin si se cargan vía n8n.
4. Reutilizar los mismos valores de dropdown que en la plataforma web cuando existan (sectores, departamentos).

## Referencias

- [05-suitecrm-cni-configuration.md](05-suitecrm-cni-configuration.md)
- [07-suitecrm-pipeline-stages.md](07-suitecrm-pipeline-stages.md)
- [03-suitecrm-integration-flow.md](03-suitecrm-integration-flow.md)
