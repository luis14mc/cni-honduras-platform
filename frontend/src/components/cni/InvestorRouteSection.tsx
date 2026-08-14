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

type NodeProps = {
  position: [number, number, number];
  color: string;
  index: number;
  count: number;
  isActive: boolean;
  isCni: boolean;
  onHover: (index: number | null) => void;
};

function RouteNode({ position, color, index, count, isActive, isCni, onHover }: NodeProps) {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (coreRef.current) {
      const pulse = 1 + Math.sin(t * 1.6 + index * 0.7) * 0.06;
      coreRef.current.scale.setScalar(pulse);
    }
    if (haloRef.current) {
      const haloPulse = 1 + Math.sin(t * 1.1 + index * 0.4) * 0.12;
      haloRef.current.scale.setScalar((isActive ? 1.6 : 1) * haloPulse);
      const mat = haloRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = isActive ? 0.35 : 0.18;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.4 + index;
      ringRef.current.rotation.x = Math.PI / 2 + Math.sin(t * 0.5 + index) * 0.1;
    }
  });

  return (
    <group
      ref={groupRef}
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
      <mesh ref={haloRef}>
        <sphereGeometry args={[0.85, 32, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.18} depthWrite={false} />
      </mesh>
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.35, 48, 48]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isActive ? 1.6 : 0.9}
          roughness={0.25}
          metalness={0.4}
        />
      </mesh>
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.6, 0.012, 16, 64]} />
        <meshBasicMaterial color={color} transparent opacity={0.55} />
      </mesh>
      {isCni && (
        <Html center distanceFactor={6} position={[0, 0, 0.05]} wrapperClass="pointer-events-none">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#252A58] shadow-[0_0_18px_rgba(41,171,133,0.6)] ring-2 ring-[#29AB85]">
            <Image
              src={logoCni}
              alt=""
              aria-hidden
              width={28}
              height={28}
              className="h-6 w-6 object-contain"
            />
          </div>
        </Html>
      )}
      <Html
        center
        distanceFactor={9}
        position={[0, -1.1, 0]}
        wrapperClass="pointer-events-none select-none"
        transform={false}
      >
        <div
          className={cn(
            "rounded-full border border-white/15 bg-[#252A58]/85 px-3 py-1 font-display text-[10px] font-bold uppercase tracking-[0.22em] text-white backdrop-blur-sm transition-all",
            isActive && "border-[#29AB85] text-[#29AB85] shadow-[0_0_18px_rgba(41,171,133,0.45)]",
          )}
        >
          Paso {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
        </div>
      </Html>
    </group>
  );
}

function FlowParticles({ curve, color }: { curve: THREE.CatmullRomCurve3; color: string }) {
  const ref = useRef<THREE.Points>(null);
  const count = 220;

  const { positions } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const t = i / count;
      const p = curve.getPoint(t);
      positions[i * 3] = p.x;
      positions[i * 3 + 1] = p.y;
      positions[i * 3 + 2] = p.z;
    }
    return { positions };
  }, [curve, count]);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime() * 0.06;
    const positions = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < count; i++) {
      const u = ((i / count) + t) % 1;
      const p = curve.getPoint(u);
      positions.setXYZ(i, p.x, p.y, p.z);
    }
    positions.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={count}
          itemSize={3}
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={0.12}
        sizeAttenuation
        transparent
        opacity={0.85}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function RibbonPath({
  curve,
  color,
  steps,
  activeIndex,
  onHover,
  isCniAt,
}: {
  curve: THREE.CatmullRomCurve3;
  color: string;
  steps: readonly InvestorRouteStep[];
  activeIndex: number | null;
  onHover: (index: number | null) => void;
  isCniAt: (icon: InvestorRouteStep["icon"]) => boolean;
}) {
  const tubeGeometry = useMemo(() => new THREE.TubeGeometry(curve, 240, 0.05, 16, false), [curve]);

  const points = useMemo(() => curve.getPoints(60), [curve]);

  return (
    <group>
      <mesh geometry={tubeGeometry}>
        <meshBasicMaterial color={BRAND_PALETTE.primary} transparent opacity={0.55} />
      </mesh>
      <Line
        points={points}
        color={color}
        lineWidth={1.2}
        transparent
        opacity={0.6}
        dashed
        dashSize={0.3}
        gapSize={0.18}
      />
      <FlowParticles curve={curve} color={color} />
      {steps.map((step, index) => {
        const t = steps.length === 1 ? 0.5 : index / (steps.length - 1);
        const p = curve.getPoint(t);
        const isActive = activeIndex === index;
        return (
          <RouteNode
            key={step.n}
            position={[p.x, p.y, p.z]}
            color={step.color}
            index={index}
            count={steps.length}
            isActive={isActive}
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
    cam.position.x = Math.sin(t * 0.15) * 0.4;
    cam.position.y = 1.4 + Math.sin(t * 0.2) * 0.1;
    cam.lookAt(0, 0, 0);
  });
  return null;
}

function buildCurve(count: number): THREE.CatmullRomCurve3 {
  const span = 7.2;
  const points: THREE.Vector3[] = [];
  for (let i = 0; i < count; i++) {
    const u = count === 1 ? 0.5 : i / (count - 1);
    const x = -span / 2 + u * span;
    const y = Math.sin(u * Math.PI) * 0.9;
    const z = Math.cos(u * Math.PI * 0.7) * 0.4 - 0.2;
    points.push(new THREE.Vector3(x, y, z));
  }
  return new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.5);
}

function RouteCanvas({ steps }: { steps: readonly InvestorRouteStep[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const curve = useMemo(() => buildCurve(steps.length), [steps.length]);
  const isCniIcon = (icon: InvestorRouteStep["icon"]) => icon === "cni";

  return (
    <Canvas
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      dpr={[1, 1.8]}
      camera={{ position: [0, 1.4, 5.6], fov: 45 }}
      onCreated={({ gl }) => {
        gl.setClearColor(new THREE.Color(BRAND_PALETTE.bg), 1);
      }}
    >
      <color attach="background" args={[BRAND_PALETTE.bg]} />
      <fog attach="fog" args={[BRAND_PALETTE.bg, 6, 14]} />
      <ambientLight intensity={0.55} />
      <pointLight position={[3, 4, 4]} intensity={1.2} color={BRAND_PALETTE.gold} />
      <pointLight position={[-3, -2, 3]} intensity={0.7} color={BRAND_PALETTE.secondary} />

      <Stars radius={18} depth={28} count={900} factor={2.2} fade speed={0.6} />
      <Sparkles
        count={45}
        scale={[10, 4, 4]}
        size={1.8}
        speed={0.35}
        color={BRAND_PALETTE.gold}
        opacity={0.55}
      />

      <Float speed={1.1} rotationIntensity={0.25} floatIntensity={0.4}>
        <RibbonPath
          curve={curve}
          color={BRAND_PALETTE.gold}
          steps={steps}
          activeIndex={activeIndex}
          onHover={setActiveIndex}
          isCniAt={isCniIcon}
        />
      </Float>

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
              {steps.length} hitos sincronizados con el CNI: cada nodo late con el pulso del
              capital institucional y se conecta con el siguiente a través de un flujo de datos
              soberano.
            </p>
          </header>
        </div>

        <div className="relative mt-12 h-[360px] w-full md:mt-16 md:h-[460px]">
          <RouteCanvas steps={steps} />
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
