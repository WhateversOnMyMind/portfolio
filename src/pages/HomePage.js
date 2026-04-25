import SectionHeader from "../components/SectionHeader";
import Btn from "../components/Btn";
import ProjectCard from "../components/ProjectCard";

export default function HomePage({ accent, accentDark, published, navigate, openProject }) {
    return (
        <div>
            <SectionHeader title="Hi!" sub="welcome to my portfolio" accent={accent} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 p-5 md:p-7" style={{ border: "2px solid var(--border)", background: "var(--surface)" }}>
                    <h2 className="special-elite text-3xl mb-4 leading-snug" style={{ color: "var(--text)" }}>I like making things<br />and seeing them work.</h2>
                    <p className="text-sm mb-5 leading-relaxed" style={{ color: "var(--sub)" }}>
                        This site is where I put things I've made or designed. It's a record more than a resume.
                    </p>
                    <div className="special-elite text-xs uppercase mb-6 pl-3" style={{ color: accent, borderLeft: `4px solid ${accent}`, letterSpacing: "2px" }}>
                        // Electrical Engineering
                    </div>
                    <Btn onClick={() => navigate("projects")} style={{ background: accent }}>View Projects</Btn>
                </div>
                <div className="flex flex-col gap-4">
                    <div className="p-4" style={{ border: "2px solid var(--border)", background: "var(--surface)" }}>
                        <h3 className="special-elite text-xs uppercase pb-2 mb-3" style={{ color: accent, borderBottom: "1px solid var(--divider)", letterSpacing: "2px" }}>// Recent</h3>
                        {published.length === 0
                            ? <p className="text-xs" style={{ color: "var(--muted)" }}>Nothing published yet.</p>
                            : <ul className="pl-4 text-xs space-y-1" style={{ color: "var(--sub)" }}>
                                {published.slice(0, 4).map(p => (
                                    <li key={p.id}><a onClick={() => openProject(p.id)} className="cursor-pointer hover:underline" style={{ color: accent }}>{p.title}</a></li>
                                ))}
                            </ul>}
                    </div>
                    <div className="p-4" style={{ border: "2px solid var(--border)", background: "var(--surface)" }}>
                        <h3 className="special-elite text-xs uppercase pb-2 mb-3" style={{ color: accent, borderBottom: "1px solid var(--divider)", letterSpacing: "2px" }}>// Links</h3>
                        <ul className="pl-4 text-xs space-y-1" style={{ color: "var(--sub)" }}>
                            <li><a onClick={() => navigate("resume")} className="cursor-pointer hover:underline" style={{ color: accent }}>Resume / CV</a></li>
                            <li><a onClick={() => navigate("contact")} className="cursor-pointer hover:underline" style={{ color: accent }}>Get in Touch</a></li>
                            <li><a onClick={() => navigate("projects")} className="cursor-pointer hover:underline" style={{ color: accent }}>All Projects</a></li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="mt-10">
                <div className="flex justify-between items-baseline pb-2 mb-5" style={{ borderBottom: `3px solid ${accent}` }}>
                    <h2 className="special-elite text-base uppercase tracking-widest" style={{ color: "var(--text)" }}>// Recent Projects</h2>
                    <a onClick={() => navigate("projects")} className="special-elite text-xs uppercase cursor-pointer"
                       style={{ color: accent, borderBottom: `1px solid ${accent}`, letterSpacing: "1px" }}>View All</a>
                </div>
                {published.length === 0
                    ? <div className="p-5 special-elite text-xs" style={{ color: "var(--sub)", border: "2px solid var(--border)", background: "var(--surface)" }}>No projects published yet.</div>
                    : <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {published.slice(0, 4).map(p => <ProjectCard key={p.id} p={p} onClick={() => openProject(p.id)} accent={accent} />)}
                    </div>}
            </div>
        </div>
    );
}
