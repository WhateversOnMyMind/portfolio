import { THEMES, PAGES } from "../constants";

export default function Nav({ accent, page, adminOpen, adminUnlocked, theme, switchTheme, navigate, goAdmin }) {
    return (
        <nav className="sticky top-0 z-50 flex items-stretch" style={{ background: accent, borderBottom: "3px solid #222", minHeight: "56px", transition: "background 0.18s ease" }}>
            <div className="special-elite flex items-center px-6 text-white tracking-widest uppercase text-xl" style={{ borderRight: "3px solid rgba(255,255,255,0.3)", letterSpacing: "4px" }}>dongjae.xyz</div>
            <div className="flex flex-1">
                {PAGES.map(p => (
                    <a key={p} onClick={() => navigate(p)}
                       className="special-elite flex items-center px-5 text-white uppercase tracking-wide cursor-pointer text-xs"
                       style={{ borderRight: "1px solid rgba(255,255,255,0.2)", background: page === p && !adminOpen ? "rgba(0,0,0,0.22)" : "transparent", transition: "background 0.1s", letterSpacing: "2px" }}>
                        {p === "resume" ? "Resumé" : p}
                    </a>
                ))}
            </div>
            <div className="flex items-center gap-3 px-4" style={{ borderLeft: "1px solid rgba(255,255,255,0.2)" }}>
                <div className="flex gap-2 items-center">
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
            </div>
        </nav>
    );
}
