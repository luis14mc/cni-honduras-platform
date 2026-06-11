# Apache configuration for SuiteCRM

This folder holds Apache virtual host configuration for the local SuiteCRM stack.

## Files

- `vhost.conf` — mounted into the `suitecrm-app` container as the default site.

## Notes

- SuiteCRM 8+ serves the application from the `public/` directory inside `crm/suitecrm/`.
- For production (`crm.cni.hn`), replace this with TLS termination (reverse proxy or managed load balancer).
- Do not commit real certificates or production secrets to Git.
