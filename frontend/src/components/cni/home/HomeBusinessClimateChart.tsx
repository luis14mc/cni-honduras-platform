import type { HomePageModel } from "./useHomePage";

export function HomeBusinessClimateChart({
  climaHoveredBar, setClimaHoveredBar, CLIMA_DATA
}: Pick<HomePageModel, "climaHoveredBar" | "setClimaHoveredBar" | "CLIMA_DATA">) {
  return (
    <div className="w-full h-full flex flex-col justify-between min-h-[350px]">
                        {/* Grid / Values Container */}
                        <div className="relative flex-grow h-72 w-full flex items-end border-b border-white/10 pb-2">
                          {/* Grid Lines */}
                          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[9px] text-white/30">
                            {[70, 60, 50, 40, 30, 20, 10, 0].map((v, i) => (
                              <div key={i} className="w-full flex items-center gap-2 h-0">
                                <span className="w-8 text-right select-none">{v}</span>
                                <div className="flex-grow border-t border-white/5" />
                              </div>
                            ))}
                          </div>

                          {/* Columns Container */}
                          <div className="w-full h-full flex justify-around items-end pl-10 pr-2 z-10">
                            {CLIMA_DATA.labels.map((year, yearIdx) => {
                              return (
                                <div key={year} className="flex-1 flex flex-col items-center justify-end h-full relative group px-1 md:px-3">
                                  {/* Bars Row - Hover wrappers covering full height */}
                                  <div className="flex items-end gap-0.5 md:gap-1.5 h-full pb-1 w-full justify-center">
                                    {CLIMA_DATA.datasets.map((dataset, cIdx) => {
                                      const val = dataset.data[yearIdx];
                                      const barHeight = (val / 70) * 100;
                                      const isHovered = climaHoveredBar?.year === year && climaHoveredBar?.countryIndex === cIdx;

                                      return (
                                        <div
                                          key={cIdx}
                                          className="h-full flex-1 flex items-end justify-center cursor-pointer px-0.5"
                                          role="img"
                                          tabIndex={0}
                                          aria-label={`${dataset.label} · ${year} · ${val}`}
                                          onFocus={() => setClimaHoveredBar({ year, countryIndex: cIdx })}
                                          onBlur={() => setClimaHoveredBar(null)}
                                          onMouseEnter={() => setClimaHoveredBar({ year, countryIndex: cIdx })}
                                          onMouseLeave={() => setClimaHoveredBar(null)}
                                        >
                                          <div
                                            className="w-[5px] md:w-3.5 rounded-t transition-all duration-300 relative"
                                            style={{
                                              height: `${barHeight}%`,
                                              backgroundColor: dataset.color,
                                              opacity: climaHoveredBar ? (isHovered ? 1.0 : 0.4) : 0.9,
                                              transform: isHovered ? "scaleY(1.02)" : "scaleY(1)",
                                              transformOrigin: "bottom"
                                            }}
                                          >
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>

                                  {/* Tooltip */}
                                  {climaHoveredBar?.year === year && (
                                    <div className="absolute bottom-full mb-3 bg-white text-cni-primary p-3 rounded-lg shadow-2xl border-b-4 border-cni-gold pointer-events-none z-20 flex flex-col items-center min-w-[130px] transition-all">
                                      <span className="font-headline text-[9px] font-extrabold uppercase text-cni-primary/60 tracking-wider text-center">
                                        {CLIMA_DATA.datasets[climaHoveredBar.countryIndex].label} - {year}
                                      </span>
                                      <span className="font-display text-base font-extrabold text-cni-primary mt-0.5 animate-bounce-short">
                                        {CLIMA_DATA.datasets[climaHoveredBar.countryIndex].data[yearIdx]} Pts
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
                          {CLIMA_DATA.labels.map((year) => (
                            <div key={year} className="flex-1 text-center">
                              {year}
                            </div>
                          ))}
                        </div>
                      </div>
  );
}
