"""Descarga la red vial principal de Honduras desde OpenStreetMap (Overpass) y genera
red-vial-principal-osm.geojson junto a este script (backend/apps/geo/data/roads/).
Uso (necesita internet, 1–2 minutos):
    pip install requests shapely
    python descargar_red_vial_osm.py
Licencia: datos © colaboradores de OpenStreetMap, ODbL. Mostrar atribución en el mapa.

Filtro: solo vías con `ref` nacional (CA-n / RN-n; `N-15` se normaliza a `RN-15`). Las vías sin
ref son bulevares, anillos y calles urbanas, y los refs numéricos sueltos son ambiguos; ambos se
descartan, igual que los corredores de menos de 10 km (tramos urbanos sueltos)."""
import collections, datetime, json, pathlib, re, requests
from shapely.geometry import LineString, MultiLineString, mapping
from shapely.ops import linemerge, unary_union

OVERPASS = "https://overpass-api.de/api/interpreter"
QUERY = """
[out:json][timeout:180];
area["ISO3166-1"="HN"][admin_level=2]->.hn;
way(area.hn)["highway"~"^(motorway|trunk|primary)$"];
out tags geom;
"""
CLASS = {"motorway": "primaria", "trunk": "primaria", "primary": "secundaria"}
REF = re.compile(r"^(CA|RN|N)-?(\d+[A-Z]?)$")
SIMPLIFY = 0.0005
DECIMALS = 5
KM_PER_DEGREE = 108
MIN_KM = 10
OUT = pathlib.Path(__file__).resolve().parent / "red-vial-principal-osm.geojson"


def normalize_ref(raw: str) -> str | None:
    match = REF.match(raw.strip().upper().replace(" ", ""))
    if not match:
        return None
    prefix, number = match.groups()
    return f"{'RN' if prefix == 'N' else prefix}-{number}"


def round_coords(coords):
    if coords and isinstance(coords[0], (int, float)):
        return [round(value, DECIMALS) for value in coords]
    return [round_coords(item) for item in coords]


def main():
    r = requests.post(OVERPASS, data={"data": QUERY}, timeout=240, headers={"User-Agent": "CNI-Honduras-map/1.0"})
    r.raise_for_status()
    build(r.json()["elements"])


def build(elements):
    groups = {}
    skipped = collections.Counter()
    for el in elements:
        tags = el.get("tags", {})
        coords = [(p["lon"], p["lat"]) for p in el.get("geometry", [])]
        if len(coords) < 2:
            continue
        ref = normalize_ref((tags.get("ref") or "").split(";")[0])
        if not ref:
            skipped[tags.get("ref") or tags.get("name") or "sin-ref"] += 1
            continue
        line = LineString(coords)
        g = groups.setdefault(ref, {"cls": CLASS[tags["highway"]], "lines": [], "names": collections.Counter(), "km": 0.0})
        if CLASS[tags["highway"]] == "primaria":
            g["cls"] = "primaria"
        g["lines"].append(line)
        # Dual carriageways are two oneway ways; count each at half length.
        g["km"] += line.length * KM_PER_DEGREE * (0.5 if tags.get("oneway") == "yes" else 1)
        if tags.get("name"):
            g["names"][tags["name"]] += 1
    feats = []
    for ref, g in sorted(groups.items()):
        merged = unary_union(g["lines"])
        if isinstance(merged, MultiLineString):
            merged = linemerge(merged)
        geom = merged.simplify(SIMPLIFY, preserve_topology=False)
        km = round(g["km"])
        if km < MIN_KM:
            continue
        geometry = mapping(geom)
        geometry["coordinates"] = round_coords(geometry["coordinates"])
        feats.append({"type": "Feature", "properties": {
            "code": ref.lower(), "ref": ref, "name": g["names"].most_common(1)[0][0] if g["names"] else ref,
            "road_class": g["cls"], "length_km": km,
            "source_name": "OpenStreetMap (ODbL)", "source_url": "https://www.openstreetmap.org/copyright",
            "retrieved": datetime.date.today().isoformat()}, "geometry": geometry})
    OUT.write_text(json.dumps({"type": "FeatureCollection", "features": feats}, ensure_ascii=False))
    print(f"{len(feats)} corredores -> {OUT} ({OUT.stat().st_size // 1024} KB)")
    for f in feats:
        print(f"  {f['properties']['ref']:<12} {f['properties']['road_class']:<10} {f['properties']['length_km']:>4} km  {f['properties']['name']}")
    print(f"Descartados sin ref nacional: {sum(skipped.values())} ways ({len(skipped)} nombres/refs)")


if __name__ == "__main__":
    main()
