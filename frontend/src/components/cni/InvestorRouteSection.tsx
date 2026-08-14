"use client";

import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Html, Line, Sparkles, Stars } from "@react-three/drei";
import * as THREE from "three";
import Image from "next/image";
import logoCni from "@/src/img/logos/Logo_CNI.png";
import { MaterialIcon } from "@/src/components/ui/MaterialIcon";
import { layout, type as t } from "@/src/lib/typography";
import { cn } from "@/src/lib/utils";

export type InvestorRouteStep = {
  n: number;
  label: string;
  labelPosition?: "above" | "below";
  icon: "cni" | string;
  color: string;
};

type Props = {
  eyebrow: string;
  titlePrefix: string;
  titleHighlight: string;
  steps: readonly InvestorRouteStep[];
};

const BRAND_PALETTE = {
  bg: "#0A1024",
  bgSoft: "#11193A",
  primary: "#252A58",
  secondary: "#0E7A7C",
  gold: "#29AB85",
  goldSoft: "#35A963",
  lime: "#8DC046",
} as const;

// Mainland Honduras outline (lng, lat) — natural-earth simplified.
const HONDURAS_OUTLINE: [number, number][] = [
  [-83.147219, 14.995829], [-83.489989, 15.016267], [-83.628585, 14.880074],
  [-83.975721, 14.749436], [-84.228342, 14.748764], [-84.449336, 14.621614],
  [-84.649582, 14.666805], [-84.820037, 14.819587], [-84.924501, 14.790493],
  [-85.052787, 14.551541], [-85.148751, 14.560197], [-85.165365, 14.35437],
  [-85.514413, 14.079012], [-85.698665, 13.960078], [-85.801295, 13.836055],
  [-86.096264, 14.038187], [-86.312142, 13.771356], [-86.520708, 13.778487],
  [-86.755087, 13.754845], [-86.733822, 13.263093], [-86.880557, 13.254204],
  [-87.005769, 13.025794], [-87.316654, 12.984686], [-87.489409, 13.297535],
  [-87.793111, 13.38448], [-87.723503, 13.78505], [-87.859515, 13.893312],
  [-88.065343, 13.964626], [-88.503998, 13.845486], [-88.541231, 13.980155],
  [-88.843073, 14.140507], [-89.058512, 14.340029], [-89.353326, 14.424133],
  [-89.145535, 14.678019], [-89.22522, 14.874286], [-89.154811, 15.066419],
  [-88.68068, 15.346247], [-88.225023, 15.727722], [-88.121153, 15.688655],
  [-87.901813, 15.864458], [-87.61568, 15.878799], [-87.522921, 15.797279],
  [-87.367762, 15.84694], [-86.903191, 15.756713], [-86.440946, 15.782835],
  [-86.119234, 15.893449], [-86.001954, 16.005406], [-85.683317, 15.953652],
  [-85.444004, 15.885749], [-85.182444, 15.909158], [-84.983722, 15.995923],
  [-84.52698, 15.857224], [-84.368256, 15.835158], [-84.063055, 15.648244],
  [-83.773977, 15.424072], [-83.410381, 15.270903], [-83.147219, 14.995829],
];

// Geographic anchor points for the 5 milestones of the investor journey.
const CITY_ANCHORS: Array<{ name: string; lng: number; lat: number }> = [
  { name: "Tegucigalpa", lng: -87.1921, lat: 14.0723 },
  { name: "Comayagua", lng: -87.6375, lat: 14.4603 },
  { name: "San Pedro Sula", lng: -88.025, lat: 15.5047 },
  { name: "Puerto Cortés", lng: -87.9297, lat: 15.8254 },
  { name: "Roatán", lng: -86.4378, lat: 16.3249 },
];

const BBOX = {
  minLng: -89.4,
  maxLng: -83.0,
  minLat: 12.9,
  maxLat: 16.5,
};

const MAP_WIDTH = 7.2;
const MAP_HEIGHT = 5.4;

function project(lng: number, lat: number): [number, number] {
  const x = ((lng - BBOX.minLng) / (BBOX.maxLng - BBOX.minLng)) * MAP_WIDTH - MAP_WIDTH / 2;
  const y = MAP_HEIGHT / 2 - ((lat - BBOX.minLat) / (BBOX.maxLat - BBOX.minLat)) * MAP_HEIGHT;
  return [x, y];
}

function StepIcon({ icon, color }: { icon: InvestorRouteStep["icon"]; color: string }) {
  if (icon === "cni") {
    return (
      <Image
        src={logoCni}
        alt=""
        aria-hidden
        className="h-9 w-auto object-contain md:h-10"
        sizes="72px"
      />
    );
  }

  return <MaterialIcon name={icon} className="text-[2rem] md:text-[2.25rem]" style={{ color }} />;
}

type MapNodeProps = {
  position: [number, number, number];
  color: string;
  index: number;
  total: number;
  city: string;
  isActive: boolean;
  isCni: boolean;
  onHover: (index: number | null) => void;
};

function MapNode({ position, color, index, total, city, isActive, isCni, onHover }: MapNodeProps) {
  const coreRef = useRef<THREE.Mesh>(null);
  const beamRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (coreRef.current) {
      const pulse = 1 + Math.sin(t * 1.6 + index * 0.7) * 0.1;
      coreRef.current.scale.setScalar(pulse);
    }
    if (beamRef.current) {
      const mat = beamRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.35 + Math.sin(t * 1.2 + index) * 0.15;
    }
    if (haloRef.current) {
      const haloPulse = 1 + Math.sin(t * 1.0 + index * 0.4) * 0.18;
      haloRef.current.scale.setScalar((isActive ? 1.7 : 1) * haloPulse);
      const mat = haloRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = isActive ? 0.5 : 0.28;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.35 + index;
    }
  });

  return (
    <group
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(index);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        onHover(null);
        document.body.style.cursor = "auto";
      }}
    >
      <mesh ref={haloRef} position={[0, 0, 0.02]}>
        <circleGeometry args={[0.55, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.28} depthWrite={false} />
      </mesh>
      <mesh ref={beamRef} position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.04, 0.18, 1.8, 16, 1, true]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.4}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh ref={coreRef} position={[0, 0, 0.06]}>
        <sphereGeometry args={[0.18, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isActive ? 1.8 : 1.1}
          roughness={0.2}
          metalness={0.5}
        />
      </mesh>
      <mesh ref={ringRef} position={[0, 0, 0.05]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.32, 0.012, 16, 64]} />
        <meshBasicMaterial color={color} transparent opacity={0.6} />
      </mesh>
      {isCni && (
        <Html center position={[0, 0, 0.18]} wrapperClass="pointer-events-none">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#252A58] shadow-[0_0_16px_rgba(41,171,133,0.7)] ring-2 ring-[#29AB85]">
            <Image src={logoCni} alt="" aria-hidden width={18} height={18} className="h-4 w-4 object-contain" />
          </div>
        </Html>
      )}
      <Html
        center
        position={[0, -0.55, 0.1]}
        wrapperClass="pointer-events-none select-none"
        transform={false}
      >
        <div className="flex flex-col items-center gap-1">
          <div
            className={cn(
              "rounded-full border border-white/20 bg-[#252A58]/85 px-2.5 py-0.5 font-display text-[9px] font-bold uppercase tracking-[0.22em] text-white backdrop-blur-sm transition-all",
              isActive && "border-[#29AB85] text-[#29AB85] shadow-[0_0_18px_rgba(41,171,133,0.45)]",
            )}
          >
            {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </div>
          <div
            className={cn(
              "rounded-md bg-black/40 px-2 py-0.5 font-display text-[10px] font-bold uppercase tracking-[0.18em] text-white/90 backdrop-blur-sm transition-all",
              isActive && "bg-[#29AB85]/30 text-white",
            )}
          >
            {city}
          </div>
        </div>
      </Html>
    </group>
  );
}

function HondurasMap() {
  const outlineGeom = useMemo(() => {
    const shape = new THREE.Shape();
    const first = project(HONDURAS_OUTLINE[0][0], HONDURAS_OUTLINE[0][1]);
    shape.moveTo(first[0], first[1]);
    for (let i = 1; i < HONDURAS_OUTLINE.length; i++) {
      const [x, y] = project(HONDURAS_OUTLINE[i][0], HONDURAS_OUTLINE[i][1]);
      shape.lineTo(x, y);
    }
    shape.closePath();
    const geom = new THREE.ShapeGeometry(shape, 24);
    return geom;
  }, []);

  const extrudeGeom = useMemo(() => {
    const shape = new THREE.Shape();
    const first = project(HONDURAS_OUTLINE[0][0], HONDURAS_OUTLINE[0][1]);
    shape.moveTo(first[0], first[1]);
    for (let i = 1; i < HONDURAS_OUTLINE.length; i++) {
      const [x, y] = project(HONDURAS_OUTLINE[i][0], HONDURAS_OUTLINE[i][1]);
      shape.lineTo(x, y);
    }
    shape.closePath();
    const geom = new THREE.ExtrudeGeometry(shape, {
      depth: 0.18,
      bevelEnabled: true,
      bevelThickness: 0.04,
      bevelSize: 0.04,
      bevelSegments: 2,
      steps: 1,
      curveSegments: 12,
    });
    geom.rotateX(-Math.PI / 2);
    return geom;
  }, []);

  return (
    <group>
      <mesh geometry={extrudeGeom} position={[0, 0, 0]}>
        <meshStandardMaterial
          color="#1B2350"
          emissive="#0E7A7C"
          emissiveIntensity={0.18}
          roughness={0.55}
          metalness={0.35}
          transparent
          opacity={0.95}
        />
      </mesh>
      <mesh geometry={outlineGeom} position={[0, 0, 0.2]}>
        <meshBasicMaterial
          color="#29AB85"
          transparent
          opacity={0.34}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[extrudeGeom, 1]} />
        <lineBasicMaterial color="#29AB85" transparent opacity={0.55} />
      </lineSegments>
    </group>
  );
}

function RouteCorridor({
  points,
  activeIndex,
  onHover,
  steps,
  isCniAt,
}: {
  points: THREE.Vector3[];
  activeIndex: number | null;
  onHover: (index: number | null) => void;
  steps: readonly InvestorRouteStep[];
  isCniAt: (icon: InvestorRouteStep["icon"]) => boolean;
}) {
  const linePoints = useMemo(() => points.map((p) => [p.x, 0.22, p.z] as [number, number, number]), [points]);

  const flowCount = 140;
  const flowRef = useRef<THREE.Points>(null);

  const { flowPositions } = useMemo(() => {
    const positions = new Float32Array(flowCount * 3);
    for (let i = 0; i < flowCount; i++) {
      const t = i / flowCount;
      const p = points[Math.floor(t * (points.length - 1))];
      positions[i * 3] = p.x;
      positions[i * 3 + 1] = 0.22;
      positions[i * 3 + 2] = p.z;
    }
    return { flowPositions: positions };
  }, [points]);

  useFrame((state) => {
    if (!flowRef.current) return;
    const t = state.clock.getElapsedTime() * 0.05;
    const positions = flowRef.current.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < flowCount; i++) {
      const u = (i / flowCount + t) % 1;
      const idx = u * (points.length - 1);
      const i0 = Math.floor(idx);
      const i1 = Math.min(points.length - 1, i0 + 1);
      const frac = idx - i0;
      const p0 = points[i0];
      const p1 = points[i1];
      const x = p0.x + (p1.x - p0.x) * frac;
      const z = p0.z + (p1.z - p0.z) * frac;
      positions.setXYZ(i, x, 0.22, z);
    }
    positions.needsUpdate = true;
  });

  return (
    <group>
      <Line points={linePoints} color="#29AB85" lineWidth={1.6} transparent opacity={0.65} dashed dashSize={0.22} gapSize={0.12} />
      <points ref={flowRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" array={flowPositions} count={flowCount} itemSize={3} args={[flowPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#29AB85" size={0.09} sizeAttenuation transparent opacity={0.9} depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
      {steps.map((step, index) => {
        const p = points[index];
        return (
          <MapNode
            key={step.n}
            position={[p.x, 0.22, p.z]}
            color={step.color}
            index={index}
            total={steps.length}
            city={CITY_ANCHORS[index]?.name ?? step.label}
            isActive={activeIndex === index}
            isCni={isCniAt(step.icon)}
            onHover={onHover}
          />
        );
      })}
    </group>
  );
}

function SceneRig() {
  useFrame((state) => {
    const cam = state.camera;
    const t = state.clock.getElapsedTime();
    cam.position.x = Math.sin(t * 0.12) * 0.4;
    cam.position.y = 4.2 + Math.sin(t * 0.18) * 0.15;
    cam.position.z = 6.6 + Math.cos(t * 0.12) * 0.2;
    cam.lookAt(0, 0.2, 0);
  });
  return null;
}

function MapCanvas({ steps }: { steps: readonly InvestorRouteStep[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const routePoints = useMemo(
    () =>
      CITY_ANCHORS.slice(0, steps.length).map((c) => {
        const [x, y] = project(c.lng, c.lat);
        return new THREE.Vector3(x, 0, y);
      }),
    [steps.length],
  );

  const isCniIcon = (icon: InvestorRouteStep["icon"]) => icon === "cni";

  return (
    <Canvas
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      dpr={[1, 1.8]}
      camera={{ position: [0, 4.2, 6.6], fov: 38 }}
    >
      <color attach="background" args={[BRAND_PALETTE.bg]} />
      <fog attach="fog" args={[BRAND_PALETTE.bg, 7, 14]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 6, 3]} intensity={0.7} color={BRAND_PALETTE.gold} />
      <pointLight position={[-3, 4, -2]} intensity={0.6} color={BRAND_PALETTE.secondary} />
      <pointLight position={[3, 1, 3]} intensity={0.4} color={BRAND_PALETTE.lime} />

      <Stars radius={18} depth={28} count={900} factor={2.2} fade speed={0.6} />
      <Sparkles count={30} scale={[12, 4, 12]} size={1.2} speed={0.25} color={BRAND_PALETTE.gold} opacity={0.4} />

      <Float speed={0.7} rotationIntensity={0.12} floatIntensity={0.25}>
        <HondurasMap />
      </Float>
      <RouteCorridor
        points={routePoints}
        activeIndex={activeIndex}
        onHover={setActiveIndex}
        steps={steps}
        isCniAt={isCniIcon}
      />

      <SceneRig />
    </Canvas>
  );
}

function StepCard({
  step,
  index,
  isActive,
  onHover,
}: {
  step: InvestorRouteStep;
  index: number;
  isActive: boolean;
  onHover: (i: number | null) => void;
}) {
  return (
    <li
      className="relative flex min-w-0 flex-1 flex-col"
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(index)}
      onBlur={() => onHover(null)}
    >
      <article
        className={cn(
          "group relative flex h-full flex-col overflow-hidden rounded-xl border border-white/15 bg-[#11193A]/85 p-5 text-white shadow-[0_30px_60px_rgba(8,12,32,0.45)] backdrop-blur-md transition-all duration-300 md:p-6",
          isActive
            ? "-translate-y-1 border-[#29AB85]/70 shadow-[0_30px_60px_rgba(41,171,133,0.25)]"
            : "hover:-translate-y-1 hover:border-[#29AB85]/40",
        )}
        tabIndex={0}
      >
        <div className="h-1.5 w-full shrink-0" style={{ backgroundColor: step.color }} />

        <div className="flex flex-1 flex-col">
          <div className="mb-4 flex items-start justify-between gap-3">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-display text-sm font-extrabold text-white shadow-sm"
              style={{ backgroundColor: step.color }}
            >
              {step.n}
            </span>
            <span
              className="font-display text-4xl font-extrabold leading-none tabular-nums opacity-20"
              style={{ color: step.color }}
              aria-hidden
            >
              {String(step.n).padStart(2, "0")}
            </span>
          </div>

          <div
            className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border transition-colors duration-300 group-hover:border-transparent"
            style={{
              backgroundColor: `${step.color}1F`,
              borderColor: `${step.color}40`,
            }}
          >
            <StepIcon icon={step.icon} color={step.color} />
          </div>

          <h3 className={cn(t.h3Card, "text-white")}>{step.label}</h3>
          <p className="mt-2 text-xs uppercase tracking-[0.18em] text-white/50">
            {CITY_ANCHORS[index]?.name ?? ""}
          </p>
        </div>
      </article>
    </li>
  );
}

export function InvestorRouteSection({ eyebrow, titlePrefix, titleHighlight, steps }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <section
      id="ruta-inversionista"
      className="relative overflow-hidden bg-[#0A1024] text-white"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-12 h-72 w-72 rounded-full bg-[#29AB85]/20 blur-[120px]" />
        <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-[#0E7A7C]/25 blur-[120px]" />
      </div>

      <div className="relative z-10">
        <div className={layout.container}>
          <header className="mx-auto max-w-3xl pt-20 text-center md:pt-24">
            <p className={cn(t.eyebrow, "text-[#29AB85]")}>{eyebrow}</p>
            <h2 className={cn("mt-3 text-white", t.h2OnDark)}>
              {titlePrefix}{" "}
              <span className="bg-gradient-to-r from-[#29AB85] via-[#35A963] to-[#8DC046] bg-clip-text text-transparent">
                {titleHighlight}
              </span>
            </h2>
            <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-gradient-to-r from-[#29AB85] to-[#8DC046]" />
            <p className="mx-auto mt-6 max-w-2xl text-sm text-white/70 md:text-base">
              {steps.length} hitos sincronizados con el CNI sobre el territorio hondureño: cada
              parada es una ciudad ancla de la inversión y el corredor pulsa con datos soberanos
              en tiempo real.
            </p>
          </header>
        </div>

        <div className="relative mt-12 h-[420px] w-full md:mt-16 md:h-[520px]">
          <MapCanvas steps={steps} />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-[#0A1024]" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-t from-transparent to-[#0A1024]" />
        </div>

        <div className={layout.container}>
          <ol
            className="relative grid gap-5 pb-20 sm:grid-cols-2 lg:flex lg:items-stretch lg:gap-4 xl:gap-5 md:pb-24"
            onMouseLeave={() => setActiveIndex(null)}
          >
            {steps.map((step, index) => (
              <StepCard
                key={step.n}
                step={step}
                index={index}
                isActive={activeIndex === index}
                onHover={setActiveIndex}
              />
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
