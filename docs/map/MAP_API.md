# MAP-001 Geospatial API

All endpoints below are available under `/api/v1/`.

## Boundary GeoJSON

- `GET /geo/departments/geojson/` returns active departments as a GeoJSON `FeatureCollection`.
- `GET /geo/municipalities/geojson/` returns active municipalities.
- `GET /geo/municipalities/geojson/?department=<slug>` limits municipalities to one department.
- `GET /geo/municipalities/geojson/?region=<slug>` limits municipalities to departments in a CNI region.

Boundary feature properties are deliberately limited to `name`, `slug`, `code`, `department` (municipalities only), `center_lat`, and `center_lng`. Coordinates use SRID 4326 and GeoJSON order: longitude, latitude.

## Projects

`GET /investment/projects/` retains the existing filters: `sector`, `department`, `region`, `municipality`, `stage`, and `featured`. `has_location=true|false` filters projects by their canonical `location` PointField.

Project responses expose `location` as a GeoJSON Point plus `latitude` and `longitude`. All three values are null when no point is stored. The point coordinates are always `[longitude, latitude]`; coordinates are never inferred from a municipality.

## Map Summary

`GET /investment/map-summary/` returns department aggregates. It accepts `sector=<slug>` and `stage=<project_stage>`. Sector filters apply to projects and legacy Django opportunities. Stage filters apply to projects; because opportunities have no project stage, they contribute zero to stage-filtered summaries. No new Strapi synchronization is introduced.
