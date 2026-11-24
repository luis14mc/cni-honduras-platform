import type { HomePageModel } from "./useHomePage";

export function HomeInvestmentChart({
  locale, iedHoveredBar, setIedHoveredBar, IED_DATA
}: Pick<HomePageModel, "locale" | "iedHoveredBar" | "setIedHoveredBar" | "IED_DATA">) {
  return (
    <div className="w-full h-full flex flex-col justify-between min-h-[350px]">
                        {/* Grid / Values Container */}
                        <div className="relative flex-grow h-72 w-full flex items-end border-b border-white/10 pb-2">
                          {/* Grid Lines */}
                          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[9px] text-white/30">
                            {[1200, 900, 600, 300, 0].map((v, i) => (
                              <div key={i} className="w-full flex items-center gap-2 h-0">
                                <span className="w-8 text-right select-none">{v}</span>
                                <div className="flex-grow border-t border-white/5" />
                              </div>
                            ))}
                          </div>

                          {/* Columns Container */}
                          <div className="w-full h-full flex justify-between items-end pl-10 pr-2 z-10">
                            {IED_DATA.labels.map((year, yearIdx) => {
                              const totalVal = IED_DATA.datasets[0].data[yearIdx];
                              const semestreVal = IED_DATA.datasets[1].data[yearIdx];

                              const totalHeight = totalVal ? (totalVal / 1200) * 100 : 0;
                              const semestreHeight = (semestreVal / 1200) * 100;

                              return (
                                <div key={year} className="flex-1 flex flex-col items-center justify-end h-full relative group">
                                  {/* Bars Row - Hover wrappers covering full height */}
                                  <div className="flex items-end gap-1 md:gap-2.5 h-full pb-1 w-full justify-center">
                                    {/* Total Bar Hover Wrapper */}
                                    {totalVal !== undefined && (
                                      <div
                                        className="h-full flex-1 flex items-end justify-center cursor-pointer px-0.5 md:px-1"
                                        role="img"
                                        tabIndex={0}
                                        aria-label={`${IED_DATA.datasets[0].label} · ${year} · ${totalVal}`}
                                        onFocus={() => setIedHoveredBar({ year, type: "total" })}
                                        onBlur={() => setIedHoveredBar(null)}
                                        onMouseEnter={() => setIedHoveredBar({ year, type: "total" })}
                                        onMouseLeave={() => setIedHoveredBar(null)}
                                      >
                                        <div
                                          className="w-2.5 md:w-5 rounded-t transition-all duration-300 relative"
                                          style={{
                                            height: `${totalHeight}%`,
                                            backgroundColor: IED_DATA.datasets[0].color,
                                            opacity: iedHoveredBar ? (iedHoveredBar.year === year && iedHoveredBar.type === "total" ? 1 : 0.5) : 0.9,
                                            transform: iedHoveredBar?.year === year && iedHoveredBar?.type === "total" ? "scaleY(1.02)" : "scaleY(1)",
                                            transformOrigin: "bottom"
                                          }}
                                        >
                                        </div>
                                      </div>
                                    )}

                                    {/* Semestre Bar Hover Wrapper */}
                                    <div
                                      className="h-full flex-1 flex items-end justify-center cursor-pointer px-0.5 md:px-1"
                                      role="img"
                                      tabIndex={0}
                                      aria-label={`${IED_DATA.datasets[1].label} · ${year} · ${semestreVal}`}
                                      onFocus={() => setIedHoveredBar({ year, type: "semestre" })}
                                      onBlur={() => setIedHoveredBar(null)}
                                      onMouseEnter={() => setIedHoveredBar({ year, type: "semestre" })}
                                      onMouseLeave={() => setIedHoveredBar(null)}
                                    >
                                      <div
                                        className="w-2.5 md:w-5 rounded-t transition-all duration-300 relative"
                                        style={{
                                          height: `${semestreHeight}%`,
                                          backgroundColor: IED_DATA.datasets[1].color,
                                          opacity: iedHoveredBar ? (iedHoveredBar.year === year && iedHoveredBar.type === "semestre" ? 1 : 0.5) : 0.9,
                                          transform: iedHoveredBar?.year === year && iedHoveredBar?.type === "semestre" ? "scaleY(1.02)" : "scaleY(1)",
                                          transformOrigin: "bottom"
                                        }}
                                      >
                                      </div>
                                    </div>
                                  </div>

                                  {/* Tooltip */}
                                  {iedHoveredBar?.year === year && (
                                    <div className="absolute bottom-full mb-3 bg-white text-cni-primary p-3 rounded-lg shadow-2xl border-b-4 border-cni-gold pointer-events-none z-20 flex flex-col items-center min-w-[120px] transition-all">
                                      <span className="font-headline text-[9px] font-extrabold uppercase text-cni-primary/60 tracking-wider">
                                        {year} - {iedHoveredBar.type === "total" ? "Total" : (locale === "es" ? "I Semestre" : "1st Sem.")}
                                      </span>
                                      <span className="font-display text-base font-extrabold text-cni-primary mt-0.5 animate-bounce-short">
                                        ${iedHoveredBar.type === "total" ? totalVal : semestreVal}M
                                      </span>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* X Axis Labels */}
                        <div className="w-full flex justify-between pl-10 pr-2 pt-3 text-[10px] md:text-xs font-headline font-bold uppercase tracking-wider text-white/50">
                          {IED_DATA.labels.map((year) => (
                            <div key={year} className="flex-1 text-center">
                              {year}
                            </div>
                          ))}
                        </div>
                      </div>
  );
}
