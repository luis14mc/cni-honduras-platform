import type { HomePageModel } from "./useHomePage";

export function HomeGrowthChart({
  locale, pibHoveredIdx, setPibHoveredIdx, PIB_DATA
}: Pick<HomePageModel, "locale" | "pibHoveredIdx" | "setPibHoveredIdx" | "PIB_DATA">) {
  return (
    <div className="w-full h-full flex flex-col justify-between min-h-[350px] relative">
                        {/* SVG container */}
                        <div className="relative flex-grow w-full h-72">
                          <svg
                            viewBox="0 0 600 300"
                            className="w-full h-full overflow-visible"
                          >
                            {/* Horizontal grid lines */}
                            {[4.0, 3.5, 3.0, 2.5].map((v, i) => {
                              const y = 30 + ((4.0 - v) / 1.5) * 225;
                              return (
                                <g key={i}>
                                  <line
                                    x1="50"
                                    y1={y}
                                    x2="570"
                                    y2={y}
                                    stroke="rgba(255,255,255,0.08)"
                                    strokeDasharray="4 4"
                                  />
                                  <text
                                    x="40"
                                    y={y + 3}
                                    fill="rgba(255,255,255,0.4)"
                                    fontSize="10"
                                    textAnchor="end"
                                    className="font-headline font-bold"
                                  >
                                    {v.toFixed(1)}%
                                  </text>
                                </g>
                              );
                            })}

                            {/* X Axis labels inside SVG to align perfectly */}
                            {PIB_DATA.labels.map((year, idx) => {
                              const x = 50 + (idx / 5) * 520;
                              return (
                                <text
                                  key={idx}
                                  x={x}
                                  y="285"
                                  fill="rgba(255,255,255,0.4)"
                                  fontSize="10"
                                  textAnchor="middle"
                                  className="font-headline font-bold"
                                >
                                  {year}
                                </text>
                              );
                            })}

                            {/* Hover vertical guideline */}
                            {pibHoveredIdx !== null && (
                              <line
                                x1={50 + (pibHoveredIdx / 5) * 520}
                                y1="30"
                                x2={50 + (pibHoveredIdx / 5) * 520}
                                y2="255"
                                stroke="#cbb281"
                                strokeWidth="1.5"
                                strokeDasharray="3 3"
                              />
                            )}

                            {/* Lines */}
                            {PIB_DATA.datasets.map((dataset, cIdx) => {
                              const d = dataset.data
                                .map((val, idx) => {
                                  const x = 50 + (idx / 5) * 520;
                                  const y = 30 + ((4.0 - val) / 1.5) * 225;
                                  return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
                                })
                                .join(" ");

                              return (
                                <path
                                  key={cIdx}
                                  d={d}
                                  stroke={dataset.color}
                                  strokeWidth={pibHoveredIdx !== null ? "2" : "3"}
                                  fill="none"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="transition-all duration-300"
                                  style={{
                                    opacity: pibHoveredIdx !== null ? 0.3 : 1
                                  }}
                                />
                              );
                            })}

                            {/* Highlighted active country lines on hover */}
                            {pibHoveredIdx !== null && PIB_DATA.datasets.map((dataset, cIdx) => {
                              const d = dataset.data
                                .map((val, idx) => {
                                  const x = 50 + (idx / 5) * 520;
                                  const y = 30 + ((4.0 - val) / 1.5) * 225;
                                  return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
                                })
                                .join(" ");

                              return (
                                <path
                                  key={`highlight-${cIdx}`}
                                  d={d}
                                  stroke={dataset.color}
                                  strokeWidth="3.5"
                                  fill="none"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="pointer-events-none"
                                  style={{
                                    clipPath: `inset(0px ${600 - (50 + (pibHoveredIdx / 5) * 520 + 8)}px 0px ${50 + (pibHoveredIdx / 5) * 520 - 8}px)`
                                  }}
                                />
                              );
                            })}

                            {/* Dots for each point */}
                            {PIB_DATA.datasets.map((dataset, cIdx) => {
                              return dataset.data.map((val, idx) => {
                                const x = 50 + (idx / 5) * 520;
                                const y = 30 + ((4.0 - val) / 1.5) * 225;
                                const isCurrentYearHovered = pibHoveredIdx === idx;

                                return (
                                  <circle
                                    key={`${cIdx}-${idx}`}
                                    cx={x}
                                    cy={y}
                                    r={isCurrentYearHovered ? "5" : "0"}
                                    fill={dataset.color}
                                    stroke="white"
                                    strokeWidth={isCurrentYearHovered ? "1.5" : "0"}
                                    className="transition-all duration-300 pointer-events-none"
                                    style={{
                                      opacity: pibHoveredIdx !== null && !isCurrentYearHovered ? 0 : 1
                                    }}
                                  />
                                );
                              });
                            })}

                            {/* Transparent columns for hovering */}
                            {PIB_DATA.labels.map((year, idx) => {
                              const x = 50 + (idx / 5) * 520;
                              const colW = 520 / 5;
                              const hoverX = x - colW / 2;
                              return (
                                <rect
                                  key={idx}
                                  x={hoverX}
                                  y="10"
                                  width={colW}
                                  height="270"
                                  fill="transparent"
                                  className="cursor-pointer"
                                  role="img"
                                  tabIndex={0}
                                  aria-label={`${year} · ${PIB_DATA.datasets.map((dataset) => `${dataset.label}: ${dataset.data[idx] ?? "—"} %`).join(" · ")}`}
                                  onFocus={() => setPibHoveredIdx(idx)}
                                  onBlur={() => setPibHoveredIdx(null)}
                                  onMouseEnter={() => setPibHoveredIdx(idx)}
                                  onMouseLeave={() => setPibHoveredIdx(null)}
                                />
                              );
                            })}
                          </svg>

                          {/* Consolidate Tooltip showing all countries */}
                          {pibHoveredIdx !== null && (
                            <div
                              className="absolute bg-white text-cni-primary p-3 rounded-lg shadow-2xl border-b-4 border-cni-gold pointer-events-none z-20 flex flex-col gap-1.5 min-w-[150px] transition-all"
                              style={{
                                bottom: "80px",
                                left: `${Math.min(Math.max(50 + (pibHoveredIdx / 5) * 520 - 75, 10), 440)}px`
                              }}
                            >
                              <span className="font-headline text-[9px] font-extrabold uppercase text-cni-primary/60 tracking-wider text-center border-b border-cni-primary/10 pb-1 mb-1">
                                {locale === "es" ? "Proyección" : "Projection"} {PIB_DATA.labels[pibHoveredIdx]}
                              </span>
                              {PIB_DATA.datasets.map((ds, cIdx) => (
                                <div key={cIdx} className="flex justify-between items-center gap-4 text-xs">
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ds.color }} />
                                    <span className="font-headline font-bold text-cni-primary">{ds.label}</span>
                                  </div>
                                  <span className="font-display font-extrabold text-cni-primary">
                                    {ds.data[pibHoveredIdx]}%
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
  );
}
