"use client";

import { cn } from "@/src/lib/utils";
import { InterestLinksSection } from "@/src/components/cni/InterestLinksSection";
import { HomeHeroSection } from "@/src/components/cni/HomeHeroSection";
import { useHomePage, type HomePageProps } from "./home/useHomePage";
import { HomeActionEntries } from "./home/HomeActionEntries";
import { HomeMigrationServices } from "./home/HomeMigrationServices";
import { HomeProjectSubmission } from "./home/HomeProjectSubmission";
import { HomeWhyHonduras } from "./home/HomeWhyHonduras";
import { HomeEconomicDashboard } from "./home/HomeEconomicDashboard";
import { HomeFigures } from "./home/HomeFigures";
import { HomeStrategicSectors } from "./home/HomeStrategicSectors";
import { HomePartnershipBenefits } from "./home/HomePartnershipBenefits";
import { HomeStrategicAllies } from "./home/HomeStrategicAllies";
import { HomeSuccessStories } from "./home/HomeSuccessStories";
import { HomeNews } from "./home/HomeNews";

export function HomePageView(props: HomePageProps) {
  const {
    L,
    actionCards,
    hc,
    locale,
    postExtra,
    whyHondurasIndex,
    totalWhyHondurasSlides,
    moveWhyHonduras,
    iedHoveredBar,
    setIedHoveredBar,
    IED_DATA,
    pibHoveredIdx,
    setPibHoveredIdx,
    PIB_DATA,
    climaHoveredBar,
    setClimaHoveredBar,
    CLIMA_DATA,
    shell,
    activeChart,
    chartLoading,
    handleSwitchChart,
    dCopy,
    sectorsStatus,
    sectorsData,
    partnerBenefits,
    featuredStoriesStatus,
    testimonialsCopy,
    countryLabel,
    testimonialCards,
    caseHref,
    latestNewsStatus,
    visibleNews,
    prensaCopy,
    interestLinks,
    interestLinksStatus,
  } = useHomePage(props);

  return (
    <div className={cn("flex flex-1 flex-col overflow-hidden", shell.root)}>

      {/* 1. Hero estructural estático (no CMS) */}
      <HomeHeroSection
        locale={locale}
        title={
          <>
            {hc.hero.titleLine1} <br />
            <span className="text-cni-gold">{hc.hero.titleGrow}</span>
          </>
        }
      />

      {/* 2. Action Entry Points */}
      <HomeActionEntries L={L} actionCards={actionCards} />

      {/* 3. Facilidades Migratorias */}
      <HomeMigrationServices hc={hc} L={L} />

      {/* 4. Project Submission */}
      <HomeProjectSubmission locale={locale} hc={hc} L={L} postExtra={postExtra} />

      <InterestLinksSection
        locale={locale}
        links={interestLinks}
        status={interestLinksStatus}
      />

      {/* 5. Why Honduras Slider */}
      <HomeWhyHonduras locale={locale} hc={hc} L={L} whyHondurasIndex={whyHondurasIndex} totalWhyHondurasSlides={totalWhyHondurasSlides} moveWhyHonduras={moveWhyHonduras} />

      {/* 6. Economic Indicators Slider (Dashboard) */}
      <HomeEconomicDashboard locale={locale} L={L} shell={shell} iedHoveredBar={iedHoveredBar} setIedHoveredBar={setIedHoveredBar} pibHoveredIdx={pibHoveredIdx} setPibHoveredIdx={setPibHoveredIdx} climaHoveredBar={climaHoveredBar} setClimaHoveredBar={setClimaHoveredBar} activeChart={activeChart} chartLoading={chartLoading} handleSwitchChart={handleSwitchChart} IED_DATA={IED_DATA} PIB_DATA={PIB_DATA} CLIMA_DATA={CLIMA_DATA} dCopy={dCopy} />

      {/* 7. Honduras in Figures */}
      <HomeFigures locale={locale} />

      {/* 8. Sectores Estratégicos */}
      <HomeStrategicSectors locale={locale} sectorsStatus={sectorsStatus} L={L} sectorsData={sectorsData} />

      {/* 8.5. Socio Estratégico */}
      <HomePartnershipBenefits locale={locale} L={L} partnerBenefits={partnerBenefits} />

      {/* 9. Two-Level Partners Carousel */}
      <HomeStrategicAllies locale={locale} />

      {/* 10. Casos de Éxito — feature editorial + cards secundarios */}
      <HomeSuccessStories locale={locale} featuredStoriesStatus={featuredStoriesStatus} L={L} shell={shell} testimonialsCopy={testimonialsCopy} countryLabel={countryLabel} testimonialCards={testimonialCards} caseHref={caseHref} />

      {/* 11. CNI al día — últimas noticias */}
      <HomeNews locale={locale} latestNewsStatus={latestNewsStatus} L={L} visibleNews={visibleNews} prensaCopy={prensaCopy} />

    </div>
  );
}
