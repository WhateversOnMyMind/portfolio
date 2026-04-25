import SectionHeader from "../components/SectionHeader";
import ProjectCard from "../components/ProjectCard";

export default function ProjectsPage({ accent, published, openProject, viewingProject, setViewingProject }) {
    if (viewingProject) {
        return (
            <div>
                <span onClick={() => setViewingProject(null)}
                      className="special-elite text-xs uppercase cursor-pointer mb-5 inline-block"
                      style={{ color: accent, borderBottom: `1px solid ${accent}`, letterSpacing: "1px" }}>
                    &larr; Back to Projects
                </span>
                <div className="max-w-3xl p-8" style={{ border: "2px solid #222", background: "#fff" }}>
                    <h1 className="special-elite text-3xl mb-2">{viewingProject.title}</h1>
                    <div className="special-elite text-xs uppercase pb-4 mb-6" style={{ color: "#666", borderBottom: "2px solid #222", letterSpacing: "1px" }}>{viewingProject.date}</div>
                    <div className="prose-content" style={{ fontFamily: "Georgia, serif", fontSize: "16px", lineHeight: "1.85", color: "#1a1a1a" }}
                         dangerouslySetInnerHTML={{ __html: viewingProject.body }} />
                </div>
                <style>{`.prose-content p{margin-bottom:16px}.prose-content h2{font-family:'Special Elite',monospace;font-size:20px;margin:28px 0 10px;border-bottom:1px solid #ddd;padding-bottom:6px}.prose-content h3{font-family:'Special Elite',monospace;font-size:16px;margin:20px 0 8px}.prose-content img{max-width:100%;border:2px solid #222;margin:16px 0;display:block}.prose-content iframe{width:100%;aspect-ratio:16/9;border:2px solid #222;margin:16px 0;border-radius:4px;display:block}.prose-content blockquote{border-left:4px solid ${accent};padding-left:16px;color:#666;font-style:italic;margin:16px 0}.prose-content ul,.prose-content ol{padding-left:24px;margin-bottom:16px}.prose-content li{margin-bottom:4px}`}</style>
            </div>
        );
    }
    return (
        <div>
            <SectionHeader title="Projects" sub="things built and written about" accent={accent} />
            {published.length === 0
                ? <div className="p-5 special-elite text-xs" style={{ color: "#555", border: "2px solid #222", background: "#fff" }}>Nothing published yet.</div>
                : <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {published.map(p => <ProjectCard key={p.id} p={p} onClick={() => openProject(p.id)} accent={accent} />)}
                </div>}
        </div>
    );
}
