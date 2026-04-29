import { useState, useEffect, useRef } from "react";
import SectionHeader from "../components/SectionHeader";
import ProjectCard from "../components/ProjectCard";

function parseFlairs(raw) {
    try { return JSON.parse(raw || "[]"); } catch { return []; }
}

export default function ProjectsPage({ accent, published, openProject, viewingProject, setViewingProject }) {
    const [activeFlair, setActiveFlair] = useState(null);
    const bodyRef = useRef(null);

    useEffect(() => {
        if (!viewingProject || !bodyRef.current) return;

        bodyRef.current.querySelectorAll("pre").forEach(pre => {
            if (pre.querySelector(".copy-btn")) return;
            const btn = document.createElement("button");
            btn.textContent = "Copy";
            btn.className = "copy-btn";
            btn.addEventListener("click", () => {
                navigator.clipboard.writeText(pre.innerText.replace(/^Copy\n?/, "")).then(() => {
                    btn.textContent = "Copied!";
                    setTimeout(() => { btn.textContent = "Copy"; }, 2000);
                });
            });
            pre.style.position = "relative";
            pre.appendChild(btn);
        });

        bodyRef.current.querySelectorAll("[data-video-block]").forEach(wrapper => {
            const video = wrapper.querySelector("video");
            if (!video) return;

            if (!video.getAttribute("preload")) {
                video.setAttribute("preload", "metadata");
                video.load();
            }

            if (wrapper.querySelector(".expand-btn")) return;

            const dlBtn = document.createElement("a");
            dlBtn.href = video.src;
            dlBtn.download = "";
            dlBtn.textContent = "⤓ Download";
            dlBtn.className = "expand-btn";
            dlBtn.style.right = "130px";
            wrapper.appendChild(dlBtn);

            const btn = document.createElement("button");
            btn.textContent = "⛶ Fullscreen";
            btn.className = "expand-btn";
            btn.addEventListener("click", () => {
                if (video.requestFullscreen) video.requestFullscreen();
                else if (video.webkitRequestFullscreen) video.webkitRequestFullscreen();
            });
            wrapper.appendChild(btn);
        });
    }, [viewingProject]);

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
                <div className="max-w-4xl p-4 md:p-8" style={{ border: "2px solid var(--border)", background: "var(--surface)" }}>
                    <h1 className="special-elite text-3xl mb-2" style={{ color: "var(--text)" }}>{viewingProject.title}</h1>
                    <div className="flex items-center gap-3 pb-4 mb-6" style={{ borderBottom: "2px solid var(--border)" }}>
                        <span className="special-elite text-xs uppercase" style={{ color: "var(--muted)", letterSpacing: "1px" }}>{viewingProject.date}</span>
                        {parseFlairs(viewingProject.flairs).map(f => (
                            <span key={f} className="special-elite text-xs px-2 py-0.5"
                                  style={{ background: accent, color: "#fff", letterSpacing: "1px" }}>{f}</span>
                        ))}
                    </div>
                    <div ref={bodyRef} className="prose-content" style={{ fontFamily: "Georgia, serif", fontSize: "16px", lineHeight: "1.85", color: "var(--text)" }}
                         dangerouslySetInnerHTML={{ __html: viewingProject.body }} />
                </div>
                <style>{`
                    .prose-content p { margin-bottom: 16px; }
                    .prose-content p:empty::before { content: '\\00a0'; }
                    .prose-content h1 { font-family: 'Special Elite', monospace; font-size: 26px; margin: 32px 0 12px; color: var(--text); clear: both; }
                    .prose-content h2 { font-family: 'Special Elite', monospace; font-size: 20px; margin: 28px 0 10px; border-bottom: 1px solid var(--divider); padding-bottom: 6px; color: var(--text); clear: both; }
                    .prose-content h3 { font-family: 'Special Elite', monospace; font-size: 16px; margin: 20px 0 8px; color: var(--text); clear: both; }
                    .prose-content img { max-width: 100%; border: 2px solid ${accent}; display: inline-block; vertical-align: middle; }
                    .prose-content img:not([data-float="left"]):not([data-float="right"]) { margin: 4px 8px 4px 0; }
                    .prose-content::after { content: ''; display: table; clear: both; }
                    .prose-content iframe { width: 100%; aspect-ratio: 16/9; border: 2px solid ${accent}; margin: 16px 0; border-radius: 4px; display: block; }
                    .prose-content blockquote { border-left: 4px solid ${accent}; padding-left: 16px; color: var(--sub); font-style: italic; margin: 16px 0; }
                    .prose-content ul { list-style-type: disc; padding-left: 24px; margin-bottom: 16px; }
                    .prose-content ol { list-style-type: decimal; padding-left: 24px; margin-bottom: 16px; }
                    .prose-content li { margin-bottom: 4px; color: var(--text); }
                    .prose-content a { color: ${accent}; text-decoration: underline; }
                    .prose-content code { font-family: monospace; background: rgba(0,0,0,0.07); border: 1px solid var(--divider); padding: 1px 5px; border-radius: 3px; font-size: 0.875em; }
                    .prose-content pre { position: relative; background: #1e1e1e; color: #d4d4d4; font-family: monospace; font-size: 0.875em; padding: 16px; border-radius: 4px; overflow-x: auto; margin: 16px 0; clear: both; }
                    .prose-content pre code { background: none; border: none; padding: 0; font-size: inherit; color: inherit; }
                    .copy-btn { position: absolute; top: 8px; right: 8px; font-family: monospace; font-size: 11px; padding: 3px 8px; background: rgba(255,255,255,0.12); color: #ccc; border: 1px solid rgba(255,255,255,0.2); border-radius: 3px; cursor: pointer; transition: background 0.15s; }
                    .copy-btn:hover { background: rgba(255,255,255,0.22); color: #fff; }
                    .prose-content [data-video-block] { position: relative; margin: 16px 0; background: #000; border-radius: 4px; overflow: hidden; border: 2px solid ${accent}; clear: both; }
                    .prose-content [data-video-block] video { width: 100%; display: block; max-height: 480px; }
                    .expand-btn { position: absolute; bottom: 10px; right: 10px; background: rgba(0,0,0,0.6); color: #fff; border: 1px solid rgba(255,255,255,0.25); border-radius: 4px; cursor: pointer; padding: 5px 12px; font-family: monospace; font-size: 12px; letter-spacing: 1px; transition: background 0.15s; text-decoration: none; display: inline-block; }
                    .expand-btn:hover { background: rgba(0,0,0,0.9); color: #fff; }
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
