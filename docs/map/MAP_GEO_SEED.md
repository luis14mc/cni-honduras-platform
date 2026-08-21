# Honduras Geographic Seed

The versioned boundary files in `backend/apps/geo/data/honduras/` come from the public
[`SEFINHN-UIT/hn-geo`](https://github.com/SEFINHN-UIT/hn-geo) repository
(upstream `main` observed at `ee0d490ef40de08cfa9042e8453983e9077294e4`). The
upstream repository does not publish an explicit license and warns that source
data may have usage restrictions; this must be clarified with SEFIN before
redistribution outside this platform.

## Staging Operation

The import is intentionally **not** part of `backend/scripts/start.sh`. It is a
one-time, explicit, transactional operation and never downloads external data.

For environments with a one-off job or deploy command using the same service
image and `DATABASE_URL`, run:

```bash
cd backend
python manage.py migrate --noinput
python manage.py import_honduras_geo
```

Expected validation:

```text
Departments created: 18
Departments updated: 0
Municipalities created: 298
Municipalities updated: 0
Honduras geographic seed validated successfully.
```

Subsequent executions are safe and report 18/298 updated records. The command
rolls back if the final active counts are not exactly 18 departments and 298
municipalities.

### Render without shell access

`backend/scripts/start.sh` supports an explicit one-time bootstrap flag:

1. Add `IMPORT_HONDURAS_GEO=true` to the backend service environment.
2. Trigger one manual deploy and confirm the five success lines above in logs.
3. Verify `/api/v1/geo/departments/geojson/` returns 18 features.
4. Remove `IMPORT_HONDURAS_GEO` (or set it to `false`) immediately and deploy
   again.

The flag is disabled by default. Keeping it disabled prevents parsing and
updating 316 geometries during normal restarts.
