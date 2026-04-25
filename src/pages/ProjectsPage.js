import { useState } from "react";
import SectionHeader from "../components/SectionHeader";
import ProjectCard from "../components/ProjectCard";

function parseFlairs(raw) {
    try { return JSON.parse(raw || "[]"); } catch { return []; }
}

export default function ProjectsPage({ accent, published, openProject, viewingProject, setViewingProject }) {
    const [activeFlair, setActiveFlair] = useState(null);

    const allFlairs = [...new Set(published.flatMap(p => parseFlairs(p.flairs)))];
    const filtered = activeFlair ? published.filter(p => parseFlairs(p.flairs).includes(activeFlair)) : published;

    if (viewingProject) {
        return (
            <div>
                <span onClick={() => setViewingProject(null)}
                      className="special-elite text-xs uppercase cursor-pointer mb-5 inline-block"
                      style={{ color: accent, borderBottom: `1px solid ${accent}`, letterSpacing: "1px" }}>
                    &larr; Back to Projects
                </span>
                <div className="max-w-3xl p-4 md:p-8" style={{ border: "2px solid var(--border)", background: "var(--surface)" }}>
                    <h1 className="special-elite text-3xl mb-2" style={{ color: "var(--text)" }}>{viewingProject.title}</h1>
                    <div className="flex items-center gap-3 pb-4 mb-6" style={{ borderBottom: "2px solid var(--border)" }}>
                        <span className="special-elite text-xs uppercase" style={{ color: "var(--muted)", letterSpacing: "1px" }}>{viewingProject.date}</span>
                        {parseFlairs(viewingProject.flairs).map(f => (
                            <span key={f} className="special-elite text-xs px-2 py-0.5"
                                  style={{ background: accent, color: "#fff", letterSpacing: "1px" }}>{f}</span>
                        ))}
                    </div>
                    <div className="prose-content" style={{ fontFamily: "Georgia, serif", fontSize: "16px", lineHeight: "1.85", color: "var(--text)" }}
                         dangerouslySetInnerHTML={{ __html: viewingProject.body }} />
                </div>
                <style>{`
                    .prose-content p { margin-bottom: 16px; }
                    .prose-content h2 { font-family: 'Special Elite', monospace; font-size: 20px; margin: 28px 0 10px; border-bottom: 1px solid var(--divider); padding-bottom: 6px; color: var(--text); }
                    .prose-content h3 { font-family: 'Special Elite', monospace; font-size: 16px; margin: 20px 0 8px; color: var(--text); }
                    .prose-content img { max-width: 100%; border: 2px solid ${accent}; margin: 16px 0; display: block; }
                    .prose-content iframe { width: 100%; aspect-ratio: 16/9; border: 2px solid ${accent}; margin: 16px 0; border-radius: 4px; display: block; }
                    .prose-content blockquote { border-left: 4px solid ${accent}; padding-left: 16px; color: var(--sub); font-style: italic; margin: 16px 0; }
                    .prose-content ul { list-style-type: disc; padding-left: 24px; margin-bottom: 16px; }
                    .prose-content ol { list-style-type: decimal; padding-left: 24px; margin-bottom: 16px; }
                    .prose-content li { margin-bottom: 4px; color: var(--text); }
                    .prose-content a { color: ${accent}; text-decoration: underline; }
                `}</style>
            </div>
        );
    }

    return (
        <div>
            <SectionHeader title="Projects" sub="things built and written about" accent={accent} />
            {allFlairs.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-5">
                    <button onClick={() => setActiveFlair(null)} className="special-elite text-xs px-3 py-1 cursor-pointer"
                            style={{ background: !activeFlair ? accent : "var(--img-bg)", color: !activeFlair ? "#fff" : "var(--sub)", border: `1px solid ${accent}` }}>All</button>
                    {allFlairs.map(f => (
                        <button key={f} onClick={() => setActiveFlair(activeFlair === f ? null : f)} className="special-elite text-xs px-3 py-1 cursor-pointer"
                                style={{ background: activeFlair === f ? accent : "var(--img-bg)", color: activeFlair === f ? "#fff" : "var(--sub)", border: `1px solid ${accent}` }}>{f}</button>
                    ))}
                </div>
            )}
            {filtered.length === 0
                ? <div className="p-5 special-elite text-xs" style={{ color: "var(--sub)", border: "2px solid var(--border)", background: "var(--surface)" }}>Nothing published yet.</div>
                : <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filtered.map(p => <ProjectCard key={p.id} p={p} onClick={() => openProject(p.id)} accent={accent} />)}
                </div>}
        </div>
    );
}
