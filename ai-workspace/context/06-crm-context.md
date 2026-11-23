# 06 · Contexto del CRM

Django persiste los formularios públicos y agrega un evento a la cola `WebhookEvent`. El comando `process_webhook_events` entrega los eventos al servicio externo `cni-crm`.

[Contrato de entrega, configuración y operación](../../docs/integrations/cni-crm-intake.md).
