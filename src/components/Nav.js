import { useState } from "react";
import { THEMES, PAGES } from "../constants";

export default function Nav({ accent, page, adminOpen, adminUnlocked, theme, switchTheme, navigate, goAdmin }) {
    const [menuOpen, setMenuOpen] = useState(false);

    const linkStyle = (p) => ({
        borderRight: "1px solid rgba(255,255,255,0.2)",
        background: page === p && !adminOpen ? "rgba(0,0,0,0.22)" : "transparent",
        transition: "background 0.1s",
        letterSpacing: "2px",
    });

    return (
        <>
            <nav className="sticky top-0 z-50 flex items-stretch" style={{ background: accent, borderBottom: "3px solid #222", minHeight: "56px", transition: "background 0.18s ease" }}>
                {/* Logo */}
                <div className="special-elite flex items-center px-4 text-white uppercase" style={{ borderRight: "3px solid rgba(255,255,255,0.3)", letterSpacing: "3px", fontSize: "clamp(13px, 2.5vw, 18px)", whiteSpace: "nowrap" }}>
                    dongjae.xyz
                </div>

                {/* Desktop page links */}
                <div className="hidden md:flex flex-1">
                    {PAGES.map(p => (
                        <a key={p} onClick={() => navigate(p)}
                           className="special-elite flex items-center px-4 text-white uppercase tracking-wide cursor-pointer text-xs"
                           style={linkStyle(p)}>
                            {p === "resume" ? "Resumé" : p}
                        </a>
                    ))}
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-2 px-3 ml-auto md:ml-0" style={{ borderLeft: "1px solid rgba(255,255,255,0.2)" }}>
                    <div className="hidden md:flex gap-2 items-center mr-1">
                        {Object.entries(THEMES).map(([k, v]) => (
                            <div key={k} onClick={() => switchTheme(k)} title={v.name}
                                 className="w-5 h-5 cursor-pointer"
                                 style={{ background: v.accent, border: theme === k ? "2px solid #fff" : "2px solid rgba(255,255,255,0.4)", outline: theme === k ? "2px solid rgba(255,255,255,0.7)" : "none", transition: "transform 0.15s, border 0.15s" }}
                                 onMouseEnter={e => e.currentTarget.style.transform = "scale(1.25)"}
                                 onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"} />
                        ))}
                    </div>
                    <button onClick={goAdmin}
                            className="special-elite uppercase text-xs tracking-widest px-3 py-1.5 cursor-pointer"
                            style={{ background: adminOpen && adminUnlocked ? "#222" : "#fff", color: adminOpen && adminUnlocked ? "#fff" : accent, border: "2px solid #fff", letterSpacing: "2px", transition: "background 0.15s, color 0.15s" }}>
                        ADMIN
                    </button>
                    <button onClick={() => setMenuOpen(m => !m)}
                            className="md:hidden cursor-pointer text-white text-2xl flex items-center justify-center"
                            style={{ background: "none", border: "none", width: "32px", height: "32px", lineHeight: 1 }}>
                        {menuOpen ? "×" : "☰"}
                    </button>
                </div>
            </nav>

            {/* Mobile dropdown */}
            {menuOpen && (
                <div className="md:hidden sticky top-14 z-40" style={{ background: accent, borderBottom: "3px solid #222" }}>
                    {PAGES.map(p => (
                        <a key={p} onClick={() => { navigate(p); setMenuOpen(false); }}
                           className="special-elite flex items-center px-6 py-3 text-white uppercase text-xs cursor-pointer"
                           style={{ borderBottom: "1px solid rgba(255,255,255,0.15)", background: page === p && !adminOpen ? "rgba(0,0,0,0.22)" : "transparent", letterSpacing: "2px" }}>
                            {p === "resume" ? "Resumé" : p}
                        </a>
                    ))}
                    <div className="flex gap-3 px-6 py-3 items-center" style={{ borderTop: "1px solid rgba(255,255,255,0.15)" }}>
                        <span className="special-elite text-xs text-white uppercase" style={{ letterSpacing: "1px", opacity: 0.7 }}>Theme:</span>
                        {Object.entries(THEMES).map(([k, v]) => (
                            <div key={k} onClick={() => { switchTheme(k); setMenuOpen(false); }} title={v.name}
                                 className="w-6 h-6 cursor-pointer"
                                 style={{ background: v.accent, border: theme === k ? "2px solid #fff" : "2px solid rgba(255,255,255,0.4)", outline: theme === k ? "2px solid rgba(255,255,255,0.7)" : "none" }} />
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}
