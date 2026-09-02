# Map Geospatial API

All endpoints below are available under `/api/v1/`.

## Boundary GeoJSON

- `GET /geo/departments/geojson/` returns active departments as a GeoJSON `FeatureCollection`.
- `GET /geo/municipalities/geojson/` returns active municipalities for legacy consumers. The investment map does not call this unfiltered endpoint.
- `GET /geo/municipalities/geojson/?department=<slug>` limits municipalities to one department.
- `GET /geo/municipalities/geojson/?region=<slug>` limits municipalities to departments in a CNI region.

Boundary feature properties are deliberately limited to `name`, `slug`, `code`, `department` (municipalities only), `center_lat`, and `center_lng`. Coordinates use SRID 4326 and GeoJSON order: longitude, latitude.

## Projects

`GET /investment/projects/` retains the existing filters: `sector`, `department`, `region`, `municipality`, `stage`, and `featured`. `has_location=true|false` filters projects by their canonical `location` PointField.

Project responses expose `location` as a GeoJSON Point plus `latitude` and `longitude`. All three values are null when no point is stored. The point coordinates are always `[longitude, latitude]`; coordinates are never inferred from a municipality. List requests with `has_location=true` use the lightweight marker serializer and return an unpaginated array scoped by the requested filters.

## Map Summary

`GET /investment/map-summary/` returns department aggregates. It accepts `sector=<slug>` and `stage=<project_stage>`. Sector filters apply to projects and legacy Django opportunities. Stage filters apply to projects; because opportunities have no project stage, they contribute zero to stage-filtered summaries. No new Strapi synchronization is introduced.

## Strategic Infrastructure

`GET /geo/infrastructure/geojson/` returns active strategic infrastructure as a lightweight GeoJSON `FeatureCollection`. The endpoint accepts:

- `type=airport`
- `department=<slug>`
- `municipality=<slug>`

Point coordinates follow GeoJSON order `[longitude, latitude]` in SRID 4326. Each feature exposes `id`, `name`, `slug`, `infrastructure_type`, compact department and municipality objects, `operator`, `status`, `source_name`, and `source_url`. It does not expose editorial descriptions, internal metadata, or timestamps.

The canonical data model is `geo.StrategicInfrastructure`. It is separate from investment projects, so infrastructure layers never affect project totals or sector filters. The public endpoint always excludes inactive records.

### Implemented Layer

Only `airport` is currently published. The versioned snapshot contains the eight Honduran airports marked `scheduled_service=1` by OurAirports on 2026-09-02. Coordinates are copied from the source, never inferred from municipality centers. Department and municipality relations are assigned at import time with GeoDjango polygon coverage.

- Dataset: `backend/apps/geo/data/strategic_infrastructure/ourairports-hn-scheduled-2026-09-02.json`
- Source: [OurAirports Honduras CSV](https://ourairports.com/countries/HN/airports.csv)
- Source revision: `d27027ba44140de187960d71a98260de6a94b38e`
- License: [The Unlicense](https://github.com/davidmegginson/ourairports-data/blob/main/LICENSE), public-domain dedication
- Import: `python manage.py import_strategic_infrastructure`

OurAirports is a public collaborative dataset and provides no warranty. The layer indicates strategic geographic context, not certified real-time operational status. Names remain the source's canonical proper names; type and interface labels are localized ES/EN.

### Deferred Categories

- Ports: the repository has no port dataset. NGA World Port Index was evaluated, but its available snapshot is dated 2019 and redistribution terms were not explicit enough for inclusion. ENP pages do not provide downloadable geometries.
- Customs: Aduanas Honduras and WFP publish institutional information, but no stable, openly licensed GIS dataset was verified.
- Roads: SINIT documents major corridors but exposes no reusable vector geometry with a clear license. OSM/Geofabrik would require a dedicated ODbL-compliant ETL and a reviewed lightweight corridor subset; no road endpoint is published.
- Industrial zones and logistics nodes: no authoritative national inventory with real coordinates/geometries and clear reuse terms was verified.

These categories are not shown in the layer control. Empty or mock layers must not be presented as real data.

### Frontend Loading

Infrastructure is not fetched during initial map load. Activating a supported layer starts one request and stores its `FeatureCollection` in an in-memory session cache. Deactivation hides the markers without deleting cached data; reactivation does not refetch. In-flight requests are deduplicated, and sector changes neither alter active infrastructure layers nor request them again.

### Frontend URL State

The App Router map page supports `sector`, `department`, `municipality`, and `project` slug query parameters. Values are validated against each dataset as it loads in that order; invalid or stale values are omitted from the canonical URL. The transient search text is never persisted.

Marker clustering is intentionally deferred. Current requests are department-scoped and the observed marker volume does not justify the extra interaction complexity or dependency; clustering should be reconsidered if production volumes cause measurable overlap or rendering degradation.
