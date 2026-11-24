import { cn } from "@/src/lib/utils";
import { type as t } from "@/src/lib/typography";
import type { HomePageModel } from "./useHomePage";
import { HomeInvestmentChart } from "./HomeInvestmentChart";
import { HomeGrowthChart } from "./HomeGrowthChart";
import { HomeBusinessClimateChart } from "./HomeBusinessClimateChart";

export function HomeEconomicDashboard({
  locale, L, shell, iedHoveredBar, setIedHoveredBar, pibHoveredIdx, setPibHoveredIdx, climaHoveredBar, setClimaHoveredBar, activeChart, chartLoading, handleSwitchChart, IED_DATA, PIB_DATA, CLIMA_DATA, dCopy
}: Pick<HomePageModel, "locale" | "L" | "shell" | "iedHoveredBar" | "setIedHoveredBar" | "pibHoveredIdx" | "setPibHoveredIdx" | "climaHoveredBar" | "setClimaHoveredBar" | "activeChart" | "chartLoading" | "handleSwitchChart" | "IED_DATA" | "PIB_DATA" | "CLIMA_DATA" | "dCopy">) {
  return (
    <section className="py-32 bg-white overflow-hidden">
        <div className="max-w-screen-2xl mx-auto px-8">

          <div className="mb-16 flex flex-col md:flex-row justify-between items-end gap-10">
            <div className="max-w-xl">
              <p className={cn("mb-4", t.eyebrow, "!text-[#16744F] tracking-[0.4em]")}>
                {dCopy.eyebrow}
              </p>
              <h2 className={cn(t.h2Upper, "mb-6 leading-tight")}>
                {locale === "es" ? (
                  <>Comparativa <span className="text-[#16744F]">Regional</span></>
                ) : (
                  <>Regional <span className="text-[#16744F]">Comparison</span></>
                )}
              </h2>
              <div className="h-1.5 w-28 bg-cni-gold"></div>
            </div>

            {/* Switch Buttons */}
            <nav className="flex flex-wrap gap-2 bg-cni-primary/5 p-1.5 rounded-full border border-cni-primary/10">
              <button
                aria-pressed={activeChart === "ied"}
                onClick={() => handleSwitchChart("ied")}
                className={`px-8 py-3 rounded-full font-headline font-bold text-[11px] uppercase tracking-widest transition-all ${activeChart === "ied"
                  ? "bg-cni-primary text-white shadow-lg"
                  : "text-cni-primary hover:bg-cni-primary/10"
                  }`}
              >
                {locale === "es" ? "Inversión Extranjera" : "Foreign Investment"}
              </button>
              <button
                aria-pressed={activeChart === "pib"}
                onClick={() => handleSwitchChart("pib")}
                className={`px-8 py-3 rounded-full font-headline font-bold text-[11px] uppercase tracking-widest transition-all ${activeChart === "pib"
                  ? "bg-cni-primary text-white shadow-lg"
                  : "text-cni-primary hover:bg-cni-primary/10"
                  }`}
              >
                {locale === "es" ? "Crecimiento PIB" : "GDP Growth"}
              </button>
              <button
                aria-pressed={activeChart === "clima"}
                onClick={() => handleSwitchChart("clima")}
                className={`px-8 py-3 rounded-full font-headline font-bold text-[11px] uppercase tracking-widest transition-all ${activeChart === "clima"
                  ? "bg-cni-primary text-white shadow-lg"
                  : "text-cni-primary hover:bg-cni-primary/10"
                  }`}
              >
                {locale === "es" ? "Facilidad de Negocios" : "Ease of Doing Business"}
              </button>
            </nav>
          </div>

          <div className="relative bg-cni-primary rounded-xl overflow-hidden shadow-2xl border border-white/10 group min-h-[650px]">

            {/* Loading Overlay */}
            <div
              className={`absolute inset-0 bg-cni-primary/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-4 transition-opacity duration-300 ${chartLoading ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
            >
              <div aria-hidden="true" className="w-12 h-12 border-4 border-cni-gold border-t-transparent rounded-full animate-spin"></div>
              <p className="font-headline text-[10px] uppercase tracking-[0.3em] text-white">
                {locale === "es" ? "Actualizando Datos..." : "Updating Data..."}
              </p>
            </div>

            {/* Background Dot Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: shell.dotGrid,
                  backgroundSize: "32px 32px"
                }}
              ></div>
            </div>

            {/* Dashboard Container */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 relative z-10 min-h-[650px] w-full">

              {/* Left Sidebar Stats */}
              <div className="lg:col-span-4 p-12 bg-white/5 border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col justify-between">
                <div>
                  <div className="mb-12">
                    <span className="inline-block px-3 py-1 bg-[#16744F] !text-white font-headline font-extrabold text-[9px] uppercase tracking-widest mb-6 rounded-full">
                      {dCopy[activeChart].label}
                    </span>
                    <h3 className={cn(t.h2OnDark, "uppercase leading-none mb-6")}>
                      {dCopy[activeChart].title}
                    </h3>
                    <p className="text-white/60 font-body text-sm leading-relaxed">
                      {dCopy[activeChart].desc}
                    </p>
                  </div>

                  <div className="space-y-8">
                    <div>
                      <p className="text-white/40 font-headline text-[10px] uppercase tracking-widest mb-2">
                        {locale === "es" ? "Valor Destacado (Honduras)" : "Featured Value (Honduras)"}
                      </p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-display font-extrabold text-cni-gold">
                          {dCopy[activeChart].value}
                        </span>
                        <span className="material-symbols-outlined text-sm text-cni-gold al-accent-metric">trending_up</span>
                      </div>
                    </div>

                    <div className="p-6 bg-white/5 border border-white/10 rounded-lg">
                      <div className="flex items-center gap-4 mb-4">
                        <span className="material-symbols-outlined text-cni-gold">insights</span>
                        <p className="font-headline text-xs font-bold uppercase text-white tracking-wider">
                          {locale === "es" ? "Insight del Sector" : "Sector Insight"}
                        </p>
                      </div>
                      <p className="text-white/50 text-xs leading-relaxed font-body">
                        {dCopy[activeChart].insight}
                      </p>
                    </div>
                  </div>
                </div>

                <a
                  href={L("/recursos")}
                  className="mt-12 w-full py-4 border border-white/20 text-white font-headline text-[11px] font-bold uppercase tracking-widest hover:bg-white hover:text-cni-primary transition-all flex items-center justify-center gap-3 text-center"
                >
                  {dCopy.downloadBtn}
                  <span className="material-symbols-outlined text-[16px]">download</span>
                </a>
              </div>

              {/* Right Chart display */}
              <div className="lg:col-span-8 p-8 md:p-16 flex flex-col justify-center">
                <div className="relative flex-grow bg-white/[0.02] rounded-xl border border-white/5 overflow-visible flex items-center justify-center min-h-[350px]">
                  {/* Active Chart view - Dynamic Chart */}
                  <div className="w-full h-full p-6 flex flex-col justify-end min-h-[400px] text-white">
                    <style dangerouslySetInnerHTML={{__html: `
                      @keyframes bounceShort {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(-3px); }
                      }
                      .animate-bounce-short {
                        animation: bounceShort 1.5s ease-in-out infinite;
                      }
                    `}} />

                    {activeChart === "ied" && <HomeInvestmentChart locale={locale} iedHoveredBar={iedHoveredBar} setIedHoveredBar={setIedHoveredBar} IED_DATA={IED_DATA} />}

                    {activeChart === "pib" && <HomeGrowthChart locale={locale} pibHoveredIdx={pibHoveredIdx} setPibHoveredIdx={setPibHoveredIdx} PIB_DATA={PIB_DATA} />}

                    {activeChart === "clima" && <HomeBusinessClimateChart climaHoveredBar={climaHoveredBar} setClimaHoveredBar={setClimaHoveredBar} CLIMA_DATA={CLIMA_DATA} />}
                  </div>
                </div>

                <div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-6 w-full">
                  <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center md:justify-start">
                    {activeChart === "ied" && IED_DATA.datasets.map((ds, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ds.color }} />
                        <span className="text-white/70 font-headline text-[10px] uppercase tracking-widest">{ds.label}</span>
                      </div>
                    ))}
                    {activeChart === "pib" && PIB_DATA.datasets.map((ds, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ds.color }} />
                        <span className="text-white/70 font-headline text-[10px] uppercase tracking-widest">{ds.label}</span>
                      </div>
                    ))}
                    {activeChart === "clima" && CLIMA_DATA.datasets.map((ds, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ds.color }} />
                        <span className="text-white/70 font-headline text-[10px] uppercase tracking-widest">{ds.label}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-white/40 text-[10px] font-body italic text-center md:text-right">
                    {dCopy[activeChart].source}
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>
  );
}
