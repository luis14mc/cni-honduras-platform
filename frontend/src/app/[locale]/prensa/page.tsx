import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { isLocale, type Locale } from "@/src/i18n/config";
import { designImages } from "@/src/lib/designAssets";
import { resolveHref } from "@/src/i18n/path";
import { MaterialIcon } from "@/src/components/ui/MaterialIcon";
import { makeGenerateMetadata } from "@/src/lib/seo";
import { PAGE_SEO } from "@/src/config/pageSeo";

export const generateMetadata = makeGenerateMetadata(PAGE_SEO.prensa);
import { slugify } from "@/src/lib/slugify";

const copy = {
  es: {
    eyebrow: "Canal Oficial",
    title: "Sala de Prensa",
    description:
      "Manténgase informado sobre las últimas noticias, eventos y comunicados del Consejo Nacional de Inversiones (CNI). Transparencia y visión estratégica para el desarrollo de Honduras.",
    destacadasTitle: "Noticias Destacadas",
    destacadasSub: "Los hitos más recientes de nuestra gestión estratégica.",
    viewArchive: "Ver todo el archivo",
    feature: {
      tag: "NOTICIA PRINCIPAL — 15 MAY 2026",
      title: "Reunión CCIA: “Estamos listos para facilitar procesos y lograr que la inversión llegue al litoral atlántico”",
      desc: "Epaminondas Marinakys lidera el fortalecimiento del diálogo estratégico entre gobierno, empresarios y autoridades locales en el litoral atlántico.",
    },
    side1: { tag: "CONFERENCIA EMPRESARIAL", title: "Conferencia OLA: Innovación y Crecimiento en el Sector Industrial", desc: "Presentación de nuevas estrategias para la modernización de la industria hondureña bajo la visión del CNI.", cta: "Leer noticia" },
    side2: { tag: "GESTIÓN ESTRATÉGICA", title: "Articulación multisectorial SPS: Unificando esfuerzos en el Norte", desc: "Alianzas territoriales para potenciar el Valle de Sula como hub logístico centroamericano.", cta: "Más detalles" },
    chroniclesTitle: "Crónicas de Inversión",
    searchPlaceholder: "Buscar en el archivo...",
    articles: [
      { img: designImages.prensa.article1, tag: "Infraestructura", date: "08 May 2026", title: "Expo Construye 2026: El motor del desarrollo físico", desc: "Participación del CNI en la feria líder del sector construcción, impulsando nuevos proyectos de capital público y privado." },
      { img: designImages.prensa.article2, tag: "Cooperación", date: "06 May 2026", title: "Conferencia Sinergias UE-CA: Alianzas Transatlánticas", desc: "Fortalecimiento de la hoja de ruta entre la Unión Europea y Centroamérica para posicionar a Honduras como destino competitivo." },
      { img: designImages.prensa.article3, tag: "Diplomacia", date: "18 Abr 2026", title: "Agenda Económica en Washington", desc: "El Ministro de Inversiones lidera misiones ante el FMI y el Banco Mundial para asegurar financiamiento estratégico." },
      { img: designImages.prensa.article4, tag: "Exportaciones", date: "23 Mar 2026", title: "CAFEXPO 2026: Valor agregado en el sector café", desc: "Impulsando oportunidades en transformación y comercialización de cafés especiales para el mercado global." },
      { img: designImages.prensa.article5, tag: "Energía", date: "13 Mar 2026", title: "Alianza IRESA y SUNGROW: Energía Renovable", desc: "Inversión de $300 millones impulsada por la firma de Carta de Intención para proyectos de almacenamiento energético." },
    ],
    featuredDark: { icon: "verified", tag: "Institucional", title: "Juramentación de la Nueva Junta Directiva del CNI", desc: "Consolidación del liderazgo estratégico para el período 2026-2028, asegurando continuidad en la atracción de inversiones.", cta: "Leer comunicado oficial" },
    loadMore: "Cargar más noticias",
    videoTitle: "Archivo Multimedia",
    videoSub: "Vídeos institucionales y testimonios de éxito.",
    youtubeLink: "Ir al canal de YouTube",
    videos: [
      { img: designImages.prensa.video1, title: "Video Institucional CNI" },
      { img: designImages.prensa.video2, title: "Puerto de Omoa: Terminal Marítima" },
      { img: designImages.prensa.video3, title: "Expoconstruye 2024 - Highlights" },
    ],
    newsletterTitle: "Siga el pulso de la inversión en Honduras",
    newsletterDesc: "Reciba los boletines oficiales y actualizaciones de prensa directamente en su bandeja de entrada. Información estratégica para la toma de decisiones.",
    newsletterPlaceholder: "Su correo electrónico profesional",
    newsletterCta: "Suscribirse",
    newsletterDisclaimer: "Al suscribirse, acepta nuestra Política de Privacidad y el tratamiento de sus datos con fines informativos.",
    readArticle: "Explorar",
  },
  en: {
    eyebrow: "Official Channel",
    title: "Press Room",
    description:
      "Stay informed about the latest news, events and communiqués from the National Investment Council (CNI). Transparency and strategic vision for Honduras's development.",
    destacadasTitle: "Featured News",
    destacadasSub: "The most recent milestones of our strategic management.",
    viewArchive: "View full archive",
    feature: {
      tag: "MAIN STORY — 15 MAY 2026",
      title: "CCIA Meeting: “We are ready to facilitate processes and bring investment to the Atlantic coast”",
      desc: "Epaminondas Marinakys leads the strengthening of strategic dialogue between government, entrepreneurs and local authorities on the Atlantic coast.",
    },
    side1: { tag: "BUSINESS CONFERENCE", title: "OLA Conference: Innovation and Growth in the Industrial Sector", desc: "Presentation of new strategies for the modernization of the Honduran industry under the CNI vision.", cta: "Read news" },
    side2: { tag: "STRATEGIC MANAGEMENT", title: "Multi-sector SPS articulation: Unifying efforts in the North", desc: "Territorial alliances to boost the Sula Valley as a Central American logistics hub.", cta: "More details" },
    chroniclesTitle: "Investment Chronicles",
    searchPlaceholder: "Search the archive...",
    articles: [
      { img: designImages.prensa.article1, tag: "Infrastructure", date: "08 May 2026", title: "Expo Construye 2026: The engine of physical development", desc: "CNI participation in the leading construction fair, driving new public and private capital projects." },
      { img: designImages.prensa.article2, tag: "Cooperation", date: "06 May 2026", title: "EU-CA Synergies Conference: Transatlantic Alliances", desc: "Strengthening the roadmap between the European Union and Central America to position Honduras as a competitive destination." },
      { img: designImages.prensa.article3, tag: "Diplomacy", date: "18 Apr 2026", title: "Economic Agenda in Washington", desc: "The Minister of Investments leads missions before the IMF and the World Bank to secure strategic financing." },
      { img: designImages.prensa.article4, tag: "Exports", date: "23 Mar 2026", title: "CAFEXPO 2026: Added value in the coffee sector", desc: "Driving opportunities in transformation and commercialization of specialty coffee for the global market." },
      { img: designImages.prensa.article5, tag: "Energy", date: "13 Mar 2026", title: "IRESA and SUNGROW Alliance: Renewable Energy", desc: "$300 million investment driven by the Letter of Intent for energy storage projects." },
    ],
    featuredDark: { icon: "verified", tag: "Institutional", title: "Inauguration of the New CNI Board of Directors", desc: "Consolidation of strategic leadership for the 2026-2028 period, ensuring continuity in attracting investments.", cta: "Read official communiqué" },
    loadMore: "Load more news",
    videoTitle: "Multimedia Archive",
    videoSub: "Institutional videos and success testimonials.",
    youtubeLink: "Go to YouTube channel",
    videos: [
      { img: designImages.prensa.video1, title: "CNI Institutional Video" },
      { img: designImages.prensa.video2, title: "Port of Omoa: Maritime Terminal" },
      { img: designImages.prensa.video3, title: "Expoconstruye 2024 - Highlights" },
    ],
    newsletterTitle: "Follow the pulse of investment in Honduras",
    newsletterDesc: "Receive official newsletters and press updates directly in your inbox. Strategic information for decision-making.",
    newsletterPlaceholder: "Your professional email",
    newsletterCta: "Subscribe",
    newsletterDisclaimer: "By subscribing, you accept our Privacy Policy and the treatment of your data for informational purposes.",
    readArticle: "Explore",
  },
} as const;

export default async function PrensaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const c = copy[locale];
  const L = (p: string) => resolveHref(locale, p);
  const articleHref = (title: string) => L(`/prensa/${slugify(title)}`);

  return (
    <div className="-mt-28 flex flex-1 flex-col bg-[#f8f9fa]">
      <section className="relative flex h-[60vh] items-center overflow-hidden premium-gradient">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute inset-0 bg-[#000a1e]/60" />
          <Image src={designImages.prensa.hero} alt="Press" fill priority sizes="100vw" className="object-cover" />
        </div>
        <div className="relative z-10 mx-auto w-full max-w-7xl px-8">
          <div className="max-w-2xl">
            <span className="mb-6 inline-block rounded-sm bg-[#e9c176] px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#261900]">{c.eyebrow}</span>
            <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tighter text-white md:text-6xl">{c.title}</h1>
            <p className="text-lg font-light leading-relaxed text-white/80">{c.description}</p>
          </div>
        </div>
      </section>

      <section className="bg-[#f8f9fa] px-8 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex items-end justify-between border-l-4 border-[#e9c176] pl-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-[#000a1e]">{c.destacadasTitle}</h2>
              <p className="mt-2 text-[#44474e]">{c.destacadasSub}</p>
            </div>
            <Link href="#archive" className="hidden items-center space-x-2 font-semibold text-[#000a1e] transition-colors hover:text-[#3a5f94] md:flex">
              <span>{c.viewArchive}</span>
              <MaterialIcon name="arrow_forward" />
            </Link>
          </div>
          <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12">
            <Link
              href={articleHref(c.feature.title)}
              className="group block cursor-pointer overflow-hidden rounded-xl bg-white shadow-2xl shadow-[#000a1e]/5 transition-all hover:-translate-y-1 lg:col-span-8"
            >
              <div className="relative h-[450px]">
                <Image src={designImages.prensa.feature} alt="Main" fill sizes="(min-width:1024px) 66vw, 100vw" className="object-cover transition-all duration-700 group-hover:grayscale-0" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#000a1e]/90 via-[#000a1e]/20 to-transparent" />
                <div className="absolute bottom-0 p-10 text-white">
                  <p className="mb-4 text-xs tracking-widest text-[#e9c176]">{c.feature.tag}</p>
                  <h3 className="mb-4 max-w-3xl text-4xl font-bold leading-tight transition-colors group-hover:text-[#e9c176]">{c.feature.title}</h3>
                  <p className="line-clamp-2 max-w-xl text-white/70">{c.feature.desc}</p>
                </div>
              </div>
            </Link>
            <div className="flex flex-col gap-8 lg:col-span-4">
              <Link href={articleHref(c.side1.title)} className="flex-1 rounded-xl border-t-4 border-[#e9c176] bg-white p-8 shadow-lg shadow-[#000a1e]/5 transition-all hover:bg-[#f3f4f5]">
                <p className="mb-3 text-xs tracking-widest text-[#3a5f94]">{c.side1.tag}</p>
                <h4 className="mb-4 text-xl font-bold leading-snug text-[#000a1e]">{c.side1.title}</h4>
                <p className="mb-6 text-sm leading-relaxed text-[#44474e]">{c.side1.desc}</p>
                <span className="group inline-flex items-center text-sm font-bold text-[#000a1e]">
                  {c.side1.cta}
                  <MaterialIcon name="chevron_right" className="ml-1 text-sm transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
              <Link href={articleHref(c.side2.title)} className="flex-1 rounded-xl bg-[#000a1e] p-8 text-white shadow-lg shadow-[#000a1e]/20 transition-all hover:bg-[#002147]">
                <p className="mb-3 text-xs tracking-widest text-[#e9c176]">{c.side2.tag}</p>
                <h4 className="mb-4 text-xl font-bold leading-snug">{c.side2.title}</h4>
                <p className="mb-6 text-sm leading-relaxed text-white/70">{c.side2.desc}</p>
                <span className="group inline-flex items-center text-sm font-bold text-[#e9c176]">
                  {c.side2.cta}
                  <MaterialIcon name="chevron_right" className="ml-1 text-sm transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="archive" className="bg-[#f3f4f5] px-8 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <h2 className="text-4xl font-extrabold tracking-tight text-[#000a1e]">{c.chroniclesTitle}</h2>
            <div className="flex items-center rounded-full bg-white px-6 py-2 shadow-sm">
              <MaterialIcon name="search" className="mr-3 text-[#74777f]" />
              <input className="w-64 border-none bg-transparent text-sm focus:ring-0" placeholder={c.searchPlaceholder} type="text" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
            {c.articles.map((a) => (
              <Link
                key={a.title}
                href={articleHref(a.title)}
                className="flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-md transition-all duration-300 hover:shadow-xl"
              >
                <div className="h-56 overflow-hidden">
                  <Image src={a.img} alt={a.title} width={600} height={400} className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" unoptimized />
                </div>
                <div className="flex flex-1 flex-col p-8">
                  <div className="mb-4 flex items-center gap-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-[#3a5f94]">{a.tag}</span>
                    <span className="text-xs text-[#74777f]">{a.date}</span>
                  </div>
                  <h3 className="mb-4 text-xl font-bold leading-tight text-[#000a1e]">{a.title}</h3>
                  <p className="mb-8 line-clamp-3 text-sm text-[#44474e]">{a.desc}</p>
                  <div className="mt-auto border-t border-[#e7e8e9] pt-6">
                    <span className="flex items-center gap-2 font-bold text-[#000a1e]">
                      {c.readArticle}
                      <MaterialIcon name="north_east" className="text-sm" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
            <Link
              href={articleHref(c.featuredDark.title)}
              className="group flex h-full flex-col overflow-hidden rounded-xl bg-[#000a1e] text-white shadow-md transition-all duration-300 hover:shadow-xl"
            >
              <div className="flex h-full flex-col justify-center p-10">
                <div className="mb-8">
                  <MaterialIcon name={c.featuredDark.icon} className="text-5xl text-[#e9c176]" />
                </div>
                <span className="mb-4 text-xs font-bold uppercase tracking-widest text-[#e9c176]">{c.featuredDark.tag}</span>
                <h3 className="mb-6 text-2xl font-bold transition-colors group-hover:text-[#ffdea5]">{c.featuredDark.title}</h3>
                <p className="mb-10 text-sm text-white/70">{c.featuredDark.desc}</p>
                <span className="inline-flex w-fit items-center gap-2 border-b border-[#e9c176]/30 pb-1 font-bold text-[#e9c176] hover:border-[#e9c176]">
                  {c.featuredDark.cta}
                </span>
              </div>
            </Link>
          </div>
          <div className="mt-20 flex justify-center">
            <button type="button" className="flex items-center gap-3 rounded-full bg-[#e1e3e4] px-10 py-4 font-bold text-[#000a1e] transition-all hover:bg-[#d9dadb]">
              {c.loadMore}
              <MaterialIcon name="refresh" />
            </button>
          </div>
        </div>
      </section>

      <section className="bg-[#002147] px-8 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 flex flex-col items-end justify-between gap-6 md:flex-row">
            <div className="border-l-4 border-[#e9c176] pl-6">
              <h2 className="text-3xl font-bold tracking-tight text-white">{c.videoTitle}</h2>
              <p className="mt-2 text-white/60">{c.videoSub}</p>
            </div>
            <Link href="#" className="flex items-center gap-2 font-bold text-[#e9c176] hover:underline">
              {c.youtubeLink} <MaterialIcon name="open_in_new" className="text-sm" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {c.videos.map((v) => (
              <div key={v.title} className="group relative aspect-video cursor-pointer overflow-hidden rounded-xl">
                <Image src={v.img} alt={v.title} fill sizes="(min-width:1024px) 33vw, 100vw" className="object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-[#000a1e]/40 transition-all group-hover:bg-[#000a1e]/20">
                  <MaterialIcon name="play_circle" filled className="text-6xl text-white transition-transform group-hover:scale-110" />
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#000a1e]/80 to-transparent p-6">
                  <p className="font-bold text-white">{v.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-[#edeeef] bg-[#f8f9fa] px-8 py-24">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-6 text-3xl font-extrabold leading-tight text-[#000a1e]">{c.newsletterTitle}</h2>
          <p className="mx-auto mb-10 max-w-2xl text-[#44474e]">{c.newsletterDesc}</p>
          <form className="mx-auto flex max-w-xl flex-col gap-4 sm:flex-row">
            <input className="flex-1 rounded-lg border-none bg-[#e7e8e9] px-6 py-4 transition-all focus:ring-2 focus:ring-[#3a5f94]/20" placeholder={c.newsletterPlaceholder} type="email" />
            <button type="button" className="rounded-lg bg-[#000a1e] px-10 py-4 font-bold text-white shadow-lg shadow-[#000a1e]/10 transition-all hover:bg-[#3a5f94]">
              {c.newsletterCta}
            </button>
          </form>
          <p className="mt-6 text-xs text-[#74777f]">{c.newsletterDisclaimer}</p>
        </div>
      </section>
    </div>
  );
}
