# n8n Workflows

Esta carpeta queda reservada para exportaciones JSON de workflows de n8n.

## Convenciones

- Exportar workflows sin credenciales.
- No versionar secretos, tokens ni valores reales de OAuth.
- Usar nombres descriptivos, por ejemplo:
  - `project-application-to-suitecrm.json`
  - `contact-submission-to-suitecrm.json`

## Workflow inicial esperado

Nombre sugerido:

```text
Project Application to SuiteCRM
```

Entrada:

```text
POST /webhook/project-application
```

Responsabilidad:

1. Recibir el evento enviado por Django.
2. Validar el token compartido si `DJANGO_WEBHOOK_TOKEN` está configurado.
3. Transformar `payload` al esquema de SuiteCRM.
4. Crear o actualizar Lead/Account/Opportunity en SuiteCRM.
5. Responder HTTP 2xx si el proceso fue exitoso.

