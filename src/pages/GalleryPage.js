import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import SectionHeader from "../components/SectionHeader";

function parseFlairs(raw) {
    try { return JSON.parse(raw || "[]"); } catch { return []; }
}

function Lightbox({ item, accent, onClose }) {
    useEffect(() => {
        const onKey = (e) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center"
             style={{ background: "rgba(0,0,0,0.88)" }} onClick={onClose}>
            <div style={{ position: "relative" }} onClick={e => e.stopPropagation()}>
                <button onClick={onClose}
                        className="absolute special-elite text-base cursor-pointer flex items-center justify-center"
                        style={{ top: "-14px", right: "-14px", width: "30px", height: "30px", background: "#fff", border: `2px solid ${accent}`, color: accent, zIndex: 1 }}>
                    ×
                </button>
                <img src={item.src || item.url} alt={item.caption || item.projectTitle || ""}
                     style={{ maxWidth: "85vw", maxHeight: "78vh", objectFit: "contain", border: `3px solid ${accent}`, display: "block" }} />
                {(item.projectTitle || item.caption) && (
                    <div className="special-elite text-xs text-center pt-2" style={{ color: "#ccc", letterSpacing: "1px" }}>
                        {item.projectTitle || item.caption}
                        {item.flairs?.length > 0 && <span style={{ color: accent }}> · {item.flairs.join(", ")}</span>}
                    </div>
                )}
            </div>
        </div>
    );
}

function ImageGrid({ items, accent, onSelect, getSrc, getAlt }) {
    return (
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}>
            {items.map((item, i) => (
                <div key={i} onClick={() => onSelect(item)} className="cursor-pointer overflow-hidden"
                     style={{ border: `2px solid ${accent}`, background: "var(--img-bg)", aspectRatio: "4/3" }}
                     onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
                     onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                    <img src={getSrc(item)} alt={getAlt(item)}
                         style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </div>
            ))}
        </div>
    );
}

export default function GalleryPage({ accent, published }) {
    const [tab, setTab] = useState("projects");
    const [galleryImages, setGalleryImages] = useState([]);
    const [lightbox, setLightbox] = useState(null);
    const [activeFlair, setActiveFlair] = useState(null);

    useEffect(() => {
        supabase.from("gallery").select("*").order("created", { ascending: false })
            .then(({ data }) => { if (data) setGalleryImages(data); });
    }, []);

    const switchTab = (newTab) => {
        if (newTab === tab) return;
        setTab(newTab);
        setActiveFlair(null);
    };

    const projectImages = published.flatMap(p => {
        const flairs = parseFlairs(p.flairs);
        return [...(p.body || "").matchAll(/<img[^>]+src="([^"]+)"/g)]
            .map(m => ({ src: m[1], projectTitle: p.title, flairs }));
    });

    const allFlairs = [...new Set(projectImages.flatMap(i => i.flairs))];
    const filteredProjectImages = activeFlair ? projectImages.filter(i => i.flairs.includes(activeFlair)) : projectImages;

    const FlairFilter = () => allFlairs.length > 0 ? (
        <div className="flex flex-wrap gap-2 mb-5">
            <button onClick={() => setActiveFlair(null)} className="special-elite text-xs px-3 py-1 cursor-pointer"
                    style={{ background: !activeFlair ? accent : "var(--img-bg)", color: !activeFlair ? "#fff" : "var(--sub)", border: `1px solid ${accent}` }}>All</button>
            {allFlairs.map(f => (
                <button key={f} onClick={() => setActiveFlair(activeFlair === f ? null : f)} className="special-elite text-xs px-3 py-1 cursor-pointer"
                        style={{ background: activeFlair === f ? accent : "var(--img-bg)", color: activeFlair === f ? "#fff" : "var(--sub)", border: `1px solid ${accent}` }}>{f}</button>
            ))}
        </div>
    ) : null;

    const renderTab = (which) => {
        if (which === "projects") return (
            <div>
                <FlairFilter />
                {filteredProjectImages.length === 0
                    ? <div className="p-5 special-elite text-xs" style={{ color: "var(--sub)", border: "2px solid var(--border)", background: "var(--surface)" }}>No project images found.</div>
                    : <ImageGrid items={filteredProjectImages} accent={accent} onSelect={setLightbox} getSrc={i => i.src} getAlt={i => i.projectTitle} />}
            </div>
        );
        return (
            <div>
                {galleryImages.length === 0
                    ? <div className="p-5 special-elite text-xs" style={{ color: "var(--sub)", border: "2px solid var(--border)", background: "var(--surface)" }}>No personal photos yet. Upload via Admin panel.</div>
                    : <ImageGrid items={galleryImages} accent={accent} onSelect={setLightbox} getSrc={i => i.url} getAlt={i => i.caption || ""} />}
            </div>
        );
    };

    return (
        <div>
            <SectionHeader title="Gallery" sub="photos & media" accent={accent} />

            <div className="flex mb-6" style={{ borderBottom: `2px solid ${accent}` }}>
                {[{ key: "projects", label: "Project Photos" }, { key: "personal", label: "Personal" }].map(t => (
                    <button key={t.key} onClick={() => switchTab(t.key)}
                            className="special-elite uppercase text-xs tracking-widest px-5 py-2 cursor-pointer"
                            style={{ background: tab === t.key ? accent : "transparent", color: tab === t.key ? "#fff" : "var(--sub)", border: "none", letterSpacing: "2px", transition: "background 0.15s, color 0.15s" }}>
                        {t.label}
                    </button>
                ))}
            </div>

            {renderTab(tab)}

            {lightbox && <Lightbox item={lightbox} accent={accent} onClose={() => setLightbox(null)} />}
        </div>
    );
}
