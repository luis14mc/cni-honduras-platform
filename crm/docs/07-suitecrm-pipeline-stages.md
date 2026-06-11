# 07 · Pipelines y etapas SIGI CNI

Valores recomendados para **Dropdown Editor** y pipelines en SuiteCRM. Configurar en la primera instalación manual.

## Ciclo de vida del inversionista

Campo sugerido: `estado_ciclo_vida_c` (Accounts) y/o etapa global de relación.

| Orden | Valor | Descripción |
|-------|-------|-------------|
| 1 | Conexión | Primer acercamiento, sin calificación |
| 2 | Aliado | Relación institucional no inversionista |
| 3 | Lead | Interés registrado, pendiente de calificar |
| 4 | Lead Calificado | Cumple criterios mínimos de seguimiento |
| 5 | Promotor | Activo en promoción del país / sector |
| 6 | Prospecto | Proyecto concreto en evaluación |
| 7 | Oportunidad | Proyecto en pipeline con monto y etapa |
| 8 | Inversionista | Inversión materializada o en ejecución |
| 9 | Empresa Operacional | Operando en Honduras post-inversión |

### Criterio de uso

- **Conexión → Lead**: origen web, evento o referido sin calificar.
- **Lead Calificado → Prospecto**: analista valida datos y encaje sectorial/geográfico.
- **Prospecto → Oportunidad**: existe proyecto con monto/ubicación/sector documentados.
- **Oportunidad → Inversionista**: cierre comercial o inicio de ejecución.
- **Inversionista → Empresa Operacional**: seguimiento post-inversión.

## Lead Status

Configurar en módulo **Leads** (campo estándar `status` o `estado_lead_c` en Contacts).

| Valor | Uso |
|-------|-----|
| Por contactar | Lead nuevo desde web/n8n, sin primer contacto |
| Intento de conectar | Se envió email/llamada, sin respuesta |
| Interesado | Respondió positivamente, en seguimiento |
| No interesado | Descartado por el inversionista |
| Inactivo | Sin respuesta tras ventana definida (ej. 90 días) |

### Flujo típico postulación web

```
Por contactar → Intento de conectar → Interesado → (convertir a Contact + Opportunity)
                                    ↘ No interesado / Inactivo
```

## Etapas de proyecto (Opportunities)

Alinear con backend Django (`ProjectStage`) y frontend.

| Valor CRM | Equivalente Django | Descripción |
|-----------|-------------------|-------------|
| Promoción | `promotion` | Proyecto en difusión / captación |
| Anunciado | `announced` | Anunciado públicamente |
| Arranque | `startup` | Inicio de obra o operación |
| Implementando | `implementing` | En ejecución activa |
| Parado | `stalled` | Pausado temporalmente |
| Finalizado | `finished` | Completado |
| Cancelado | `cancelled` | No procede |

Campo sugerido: `estado_proyecto_c` y/o **Sales Stage** del pipeline de Opportunities.

### Configuración del pipeline en SuiteCRM

1. Admin → **Opportunities** → configure Sales Stage dropdown con los siete valores.
2. Opcional: probabilidades por etapa (ej. Promoción 10%, Anunciado 25%, Implementando 75%).
3. No mezclar en el mismo pipeline procesos de **exportación** y **promoción de inversión** en esta fase.

## Relación entre listas

```
Lead Status          →  califica persona
Ciclo de vida        →  madurez de la relación (Account)
Etapas de proyecto   →  avance del Opportunity
```

Un mismo inversionista puede estar **Interesado** (lead) mientras su proyecto está en **Promoción** (opportunity).

## Recomendaciones

| Regla | Detalle |
|-------|---------|
| Una fuente de verdad web | Postulaciones entran vía n8n; no duplicar manualmente |
| Trazabilidad | Guardar `submission_id` y `webhook_event_id` en CRM |
| No contenido público | Oportunidades del **sitio** (Django) ≠ Opportunities del **CRM**; vincular por referencia |
| Primera fase | No abrir pipelines de exportación hasta cerrar promoción de inversión |

## Referencias

- [05-suitecrm-cni-configuration.md](05-suitecrm-cni-configuration.md)
- [06-suitecrm-custom-fields.md](06-suitecrm-custom-fields.md)
- Backend: `ProjectStage` en `apps.investment.models`
- Frontend: `ProjectStage` en `frontend/src/types/investment.ts`
