# Checklist de salida a producción

Use este checklist con la [guía de Railway](railway.md). Registre fecha, responsables, commit aprobado, identificadores de despliegue y evidencia en el ticket de salida. El responsable del corte debe confirmar el punto de reversión antes de tocar DNS.

## Antes del corte

- [ ] Integre los cambios por PR a `master` y promueva por PR de `master` a `testing`. Verifique la CI posterior al merge y confirme el SHA que Railway desplegó en staging.
- [ ] Ejecute el [smoke en staging](../CMS_STAGING_SMOKE_TEST.md) para ese SHA. Abra el PR de `testing` hacia `production` con la evidencia, CI verde y aprobación humana del CNI. Si cambia el SHA de `testing`, vuelva a verificar la versión que se va a promover.
- [ ] Tras el merge a `production`, confirme la CI del push y el autodeploy de Railway. Registre el SHA desplegado y compruebe los healthchecks antes del corte DNS.
- [ ] Revise los resultados de `npm audit --omit=dev` en Strapi. Registre cada aviso alto o crítico pendiente, su alcance en producción y la decisión del responsable antes de autorizar el corte.
- [ ] Verifique los orígenes de producción y staging, las listas CORS y CSRF, el acceso al admin, los tokens de lectura y las claves distintas por entorno. Confirme que el frontend de staging devuelve `X-Robots-Tag: noindex, nofollow` y `Disallow: /` y que producción sirve su sitemap.
- [ ] Guarde el estado DNS anterior con nombres, tipos, valores, TTL y estado del proxy en Cloudflare. Identifique los despliegues anteriores sanos y conserve el origen anterior para la ventana de reversión.
- [ ] Tome un backup reciente de cada PostgreSQL afectado y compruebe que se puede restaurar en una base aislada. Verifique el acceso a los objetos públicos y privados de R2 y preserve los archivos referenciados por ambas versiones.
- [ ] Confirme Django con migraciones aplicadas, incluida `investment.0011`, y el portafolio importado. Verifique que Strapi publica las entradas migradas y que el origen de banners corresponde a la configuración aprobada.
- [ ] En los destinos nuevos, compruebe Django `/health/` (200), Strapi `/_health` (204), `/api/health` (base conectada) y `/admin`, Next `/` (200) y Umami `/api/heartbeat` (200). Valide los destinos mediante staging o el dominio temporal de cada servicio. Confirme la preparación de los certificados y las verificaciones DNS que emita Railway.
- [ ] Compruebe el cron de cinco minutos y la entrega de una postulación y un registro de descarga al CRM **de pruebas**. Identifique sus referencias y verifique que cada evento se procesó una vez.
- [ ] Antes de cambiar de base o de origen, acuerde una ventana sin escrituras editoriales. Detenga el consumidor anterior cuando corresponda. Registre el estado de la cola de integraciones y el procedimiento para conservar escrituras nuevas.

## Corte y confirmación

1. Aplique los registros de la [guía DNS](railway.md#dns-y-almacenamiento) y conserve el estado previo para restaurarlo. Verifique propagación y TLS para cada host antes de declarar el corte completo.
2. Confirme que `https://www.cni.hn` responde 301 a `https://cni.hn` y preserva ruta y query. Verifique CORS y sesión en los hosts nuevos y que producción no envía el encabezado de bloqueo de staging.
3. Abra en producción, de forma anónima, inicio ES/EN, noticia, mapa con filtros y ficha, y una descarga libre. Compruebe que un archivo privado exige formulario y que el enlace firmado permite la descarga. Use registros de prueba acordados para cualquier envío.
4. Revise errores HTTP, salud de los servicios, cola del cron y eventos del sitio correcto en Umami. Verifique sitemap y origen canónico en Search Console. Reabra escrituras cuando las comprobaciones estén en verde.

## Marcha atrás

- [ ] Si falla el TLS, hay errores repetidos o se pierde un flujo clave, detenga la promoción, pause autodeploy y cron, y registre qué cambió y a qué hora.
- [ ] Si el fallo está en el código y el esquema sigue siendo compatible, vuelva al último despliegue sano de cada servicio afectado. Restablezca sus variables y banderas de origen. Si el fallo es del corte, reponga los registros y el estado del proxy guardados y confirme la propagación.
- [ ] Si el esquema o los datos resultan incompatibles, restaure el backup en una base separada. Concilie escrituras posteriores al corte antes de reconectar la aplicación y conserve los objetos R2 correspondientes. Evite correr dos consumidores de CRM simultáneamente.
- [ ] Repita healthchecks, TLS y los flujos críticos sobre el destino recuperado. Compare los eventos pendientes y procesados con el CRM antes de reactivar el cron y documente el cierre de la incidencia.
- [ ] Para reconciliar Git después de un rollback de producción, abra un PR de reversión o un hotfix desde `production` hacia `production`. Exija CI y aprobación humana. Valide el autodeploy y reincorpore la corrección por PR a `testing` y `master`.

## Resultado de la auditoría de Strapi para #86

El audit de producción pasó de 7 críticos y 33 altos a 0 críticos y 12 altos al actualizar Strapi de 5.52.0 a 5.63.0 y aplicar los parches transitivos compatibles. La imagen y CI usan Node 22.19 o posterior dentro de la rama 22, según el requisito de Undici en esta versión de Strapi. Ambos usan npm 11.4.2 para resolver el mismo lockfile con la corrección de Zod 4.

Los 12 avisos altos restantes incluyen dependencias afectadas indirectamente. El aviso directo es Zod 3.25.76, requerido por `koa-body` y `koa-session`. El aviso publicado señala 4.6.6 como primera versión corregida y npm no ofrece arreglo compatible para los consumidores de Zod 3. Las instancias de Zod 4 que venían fijadas a 4.4.3 se actualizaron a 4.6.7. Registre el tratamiento de Zod 3 antes de autorizar el corte. [Aviso GHSA-mrhx-c7xc-m3w5](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5).
