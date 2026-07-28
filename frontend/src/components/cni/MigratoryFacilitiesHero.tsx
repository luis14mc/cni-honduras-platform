import Image from "next/image";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=1974&auto=format&fit=crop";

type Props = {
  title: string;
  description: string;
};

export function MigratoryFacilitiesHero({ title, description }: Props) {
  return (
    <section className="relative -mt-28 flex min-h-screen w-full items-center overflow-hidden pt-28">
      <Image
        src={HERO_IMAGE}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center scale-[1.02]"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(37,42,88,0.88) 0%, rgba(37,42,88,0.78) 38%, rgba(37,42,88,0.30) 100%)",
        }}
        aria-hidden
      />

      <div className="relative z-10 mx-auto w-full max-w-[1400px] px-6 py-20 md:px-[7%] md:py-24">
        <div className="max-w-[760px] text-white">
          <h1 className="font-display text-[2.5rem] font-extrabold leading-[0.95] tracking-[-0.06em] md:text-[3.5rem] lg:text-[4.5rem]">
            {title}
          </h1>
          <p className="mt-6 max-w-[720px] text-base leading-[1.7] text-white/92 md:mt-8 md:text-[1.35rem] md:leading-[1.8]">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}
