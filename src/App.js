import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

// TipTap Editor Imports
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import ImageResize from "tiptap-extension-resize-image";
import Youtube from "@tiptap/extension-youtube";

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const THEMES = {
    crimson: { accent: "#A51C30", dark: "#7a1423", name: "Harvard Crimson" },
    yale:    { accent: "#00356B", dark: "#002454", name: "Yale Blue" },
    black:   { accent: "#111111", dark: "#000000", name: "Black" },
};

const ADMIN_PW = process.env.REACT_APP_ADMIN_PW;
const PAGES = ["home", "about", "projects", "resume", "contact"];

const GOOGLE_FONT = `@import url('https://fonts.googleapis.com/css2?family=Special+Elite&display=swap');`;

export default function App() {
    const [theme, setTheme] = useState("crimson");
    const [page, setPage] = useState("home");
    const [prevPage, setPrevPage] = useState(null);
    const [slideDir, setSlideDir] = useState(null);
    const [animating, setAnimating] = useState(false);
    const [adminOpen, setAdminOpen] = useState(false);
    const [adminUnlocked, setAdminUnlocked] = useState(false);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewingProject, setViewingProject] = useState(null);
    const [editingProject, setEditingProject] = useState(null);
    const [adminModalPw, setAdminModalPw] = useState("");
    const [adminErr, setAdminErr] = useState(false);
    const [themeTransitioning, setThemeTransitioning] = useState(false);
    const [displayTheme, setDisplayTheme] = useState("crimson");

    const accent = THEMES[displayTheme].accent;
    const accentDark = THEMES[displayTheme].dark;

    const switchTheme = (t) => {
        if (t === theme) return;
        setThemeTransitioning(true);
        setTimeout(() => {
            setTheme(t);
            setDisplayTheme(t);
            setThemeTransitioning(false);
        }, 180);
    };

    useEffect(() => { fetchProjects(); }, []);

    const fetchProjects = async () => {
        setLoading(true);
        const { data, error } = await supabase.from("projects").select("*").order("created", { ascending: false });
        if (!error && data) setProjects(data);
        setLoading(false);
    };

    const navigate = useCallback((to) => {
        if (to === page || animating) return;
        const fromIdx = PAGES.indexOf(page);
        const toIdx = PAGES.indexOf(to);
        const dir = toIdx > fromIdx ? "left" : "right";
        setPrevPage(page);
        setSlideDir(dir);
        setAnimating(true);
        setPage(to);
        setViewingProject(null);
        setTimeout(() => { setAnimating(false); setPrevPage(null); setSlideDir(null); }, 350);
    }, [page, animating]);

    const goAdmin = () => {
        if (adminUnlocked) { setAdminOpen(true); setViewingProject(null); }
        else { setAdminModalPw(""); setAdminErr(false); setAdminOpen(true); }
    };

    const published = [...projects].filter(p => p.status === "published").sort((a, b) => b.created - a.created);

    const openProject = (id) => {
        const p = projects.find(x => x.id === id);
        if (p) { if (page !== "projects") navigate("projects"); setViewingProject(p); }
    };

    return (
        <div className="min-h-screen" style={{ background: "#f5f5f0", fontFamily: "Arial, Helvetica, sans-serif", color: "#111", opacity: themeTransitioning ? 0 : 1, transition: "opacity 0.18s ease" }}>
            <style>{`
        ${GOOGLE_FONT}
        .special-elite { font-family: 'Special Elite', 'Courier New', monospace; }
        * { box-sizing: border-box; }
        @keyframes slideInLeft  { from { transform: translateX(100%);  } to { transform: translateX(0); } }
        @keyframes slideInRight { from { transform: translateX(-100%); } to { transform: translateX(0); } }
      `}</style>

            {/* NAV */}
            <nav className="sticky top-0 z-50 flex items-stretch" style={{ background: accent, borderBottom: "3px solid #222", minHeight: "56px", transition: "background 0.18s ease" }}>
                <div className="special-elite flex items-center px-6 text-white tracking-widest uppercase text-xl" style={{ borderRight: "3px solid rgba(255,255,255,0.3)", letterSpacing: "4px" }}>dongjae.xyz</div>
                <div className="flex flex-1">
                    {PAGES.map(p => (
                        <a key={p} onClick={() => { setAdminOpen(false); navigate(p); }}
                           className="special-elite flex items-center px-5 text-white uppercase tracking-wide cursor-pointer text-xs"
                           style={{ borderRight: "1px solid rgba(255,255,255,0.2)", background: page === p && !adminOpen ? "rgba(0,0,0,0.22)" : "transparent", transition: "background 0.1s", letterSpacing: "2px" }}>
                            {p === "resume" ? "Resum\u00e9" : p}
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

            {/* ADMIN PASSWORD MODAL */}
            {adminOpen && !adminUnlocked && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center" style={{ background: "rgba(0,0,0,0.72)" }}>
                    <div className="p-8 w-[360px]" style={{ background: "#fff", border: "3px solid #222" }}>
                        <h2 className="special-elite uppercase tracking-widest text-base mb-5 pb-2" style={{ borderBottom: `2px solid ${accent}` }}>// Admin Access</h2>
                        <input type="password" value={adminModalPw}
                               onChange={e => setAdminModalPw(e.target.value)}
                               onKeyDown={e => e.key === "Enter" && (() => { if (adminModalPw === ADMIN_PW) { setAdminUnlocked(true); setAdminErr(false); } else { setAdminErr(true); setAdminModalPw(""); } })()}
                               placeholder="Enter password..." autoFocus
                               className="w-full p-2.5 mb-3 text-sm special-elite" style={{ border: "2px solid #222", background: "#f5f5f0", outline: "none" }} />
                        {adminErr && <div className="text-xs mb-2 special-elite" style={{ color: "#cc0000" }}>Incorrect password.</div>}
                        <div className="flex gap-2.5">
                            <button onClick={() => { if (adminModalPw === ADMIN_PW) { setAdminUnlocked(true); setAdminErr(false); } else { setAdminErr(true); setAdminModalPw(""); } }}
                                    className="special-elite uppercase text-xs tracking-widest px-4 py-2 text-white cursor-pointer"
                                    style={{ background: accent, border: "2px solid #222" }}>Enter</button>
                            <button onClick={() => setAdminOpen(false)}
                                    className="special-elite uppercase text-xs tracking-widest px-4 py-2 cursor-pointer"
                                    style={{ background: "transparent", border: "2px solid #222" }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MAIN CONTENT */}
            <div className="max-w-[1100px] mx-auto px-5 py-8 relative overflow-hidden">
                {adminOpen && adminUnlocked ? (
                    <AdminPanel accent={accent} projects={projects} setProjects={setProjects}
                                editingProject={editingProject} setEditingProject={setEditingProject} fetchProjects={fetchProjects} />
                ) : loading ? (
                    <div className="flex items-center justify-center h-64">
                        <span className="special-elite text-sm" style={{ color: "#555" }}>Loading...</span>
                    </div>
                ) : (
                    <div className="relative overflow-hidden">
                        {animating && prevPage && (
                            <div className="absolute inset-0" style={{ transform: slideDir === "left" ? "translateX(-100%)" : "translateX(100%)", transition: "transform 0.35s ease" }}>
                                <PageContent page={prevPage} accent={accent} accentDark={accentDark} published={published} projects={projects}
                                             navigate={navigate} openProject={openProject} viewingProject={null} setViewingProject={setViewingProject} />
                            </div>
                        )}
                        <div style={{ animation: animating ? `slideIn${slideDir === "left" ? "Left" : "Right"} 0.35s ease forwards` : "none" }}>
                            <PageContent page={page} accent={accent} accentDark={accentDark} published={published} projects={projects}
                                         navigate={navigate} openProject={openProject} viewingProject={viewingProject} setViewingProject={setViewingProject} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function PageContent({ page, accent, accentDark, published, projects, navigate, openProject, viewingProject, setViewingProject }) {
    switch (page) {
        case "home":     return <HomePage accent={accent} accentDark={accentDark} published={published} navigate={navigate} openProject={openProject} />;
        case "about":    return <AboutPage accent={accent} accentDark={accentDark} navigate={navigate} />;
        case "projects": return <ProjectsPage accent={accent} published={published} openProject={openProject} viewingProject={viewingProject} setViewingProject={setViewingProject} />;
        case "resume":   return <ResumePage accent={accent} />;
        case "contact":  return <ContactPage accent={accent} />;
        default: return null;
    }
}

function SectionHeader({ title, sub, accent }) {
    return (
        <div className="flex items-baseline gap-4 pb-2 mb-7" style={{ borderBottom: `3px solid ${accent}` }}>
            <h1 className="special-elite text-2xl uppercase tracking-widest">{title}</h1>
            {sub && <span className="special-elite text-xs uppercase tracking-wide" style={{ color: "#666" }}>{sub}</span>}
        </div>
    );
}

function Btn({ onClick, children, outline, style = {} }) {
    return (
        <button onClick={onClick}
                className="special-elite uppercase text-xs tracking-widest px-4 py-2 cursor-pointer"
                style={{ border: "2px solid #222", background: outline ? "transparent" : undefined, color: outline ? "#111" : "#fff", letterSpacing: "2px", ...style }}>
            {children}
        </button>
    );
}

function ProjectCard({ p, onClick, accent }) {
    const tmp = document.createElement("div");
    tmp.innerHTML = p.body || "";
    const txt = tmp.textContent || "";
    const imgMatch = (p.body || "").match(/<img[^>]+src="([^"]+)"/);
    return (
        <div onClick={onClick} className="cursor-pointer" style={{ border: "2px solid #222", background: "#fff", transition: "background 0.1s" }}
             onMouseEnter={e => e.currentTarget.style.background = "#f0eded"}
             onMouseLeave={e => e.currentTarget.style.background = "#fff"}>
            <div className="h-40 flex items-center justify-center text-xs overflow-hidden special-elite"
                 style={{ background: "#e0e0e0", color: "#999", borderBottom: "2px solid #222" }}>
                {imgMatch ? <img src={imgMatch[1]} className="w-full h-full object-cover" alt="" /> : "[ no image ]"}
            </div>
            <div className="p-4">
                <h3 className="special-elite text-sm mb-1" style={{ letterSpacing: "1px" }}>{p.title}</h3>
                <div className="special-elite text-xs uppercase mb-2" style={{ color: "#777", letterSpacing: "1px" }}>{p.date}</div>
                <p className="text-xs leading-relaxed" style={{ color: "#555", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{txt}</p>
            </div>
        </div>
    );
}

function HomePage({ accent, accentDark, published, navigate, openProject }) {
    return (
        <div>
            <SectionHeader title="Hi!" sub="welcome to my portfolio" accent={accent} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 p-7" style={{ border: "2px solid #222", background: "#fff" }}>
                    <h2 className="special-elite text-3xl mb-4 leading-snug">I like making things<br />and seeing them work.</h2>
                    <p className="text-sm mb-5 leading-relaxed" style={{ color: "#555" }}>
                        This site is where I put things I've made or designed. It's a record more than a resume.
                    </p>
                    <div className="special-elite text-xs uppercase mb-6 pl-3" style={{ color: accent, borderLeft: `4px solid ${accent}`, letterSpacing: "2px" }}>
                        // Electrical Engineering
                    </div>
                    <Btn onClick={() => navigate("projects")} style={{ background: accent }}>View Projects</Btn>
                </div>
                <div className="flex flex-col gap-4">
                    <div className="p-4" style={{ border: "2px solid #222", background: "#fff" }}>
                        <h3 className="special-elite text-xs uppercase pb-2 mb-3" style={{ color: accent, borderBottom: "1px solid #ddd", letterSpacing: "2px" }}>// Recent</h3>
                        {published.length === 0
                            ? <p className="text-xs" style={{ color: "#999" }}>Nothing published yet.</p>
                            : <ul className="pl-4 text-xs space-y-1" style={{ color: "#555" }}>
                                {published.slice(0, 4).map(p => (
                                    <li key={p.id}><a onClick={() => openProject(p.id)} className="cursor-pointer hover:underline" style={{ color: accent }}>{p.title}</a></li>
                                ))}
                            </ul>}
                    </div>
                    <div className="p-4" style={{ border: "2px solid #222", background: "#fff" }}>
                        <h3 className="special-elite text-xs uppercase pb-2 mb-3" style={{ color: accent, borderBottom: "1px solid #ddd", letterSpacing: "2px" }}>// Links</h3>
                        <ul className="pl-4 text-xs space-y-1" style={{ color: "#555" }}>
                            <li><a onClick={() => navigate("resume")} className="cursor-pointer hover:underline" style={{ color: accent }}>Resume / CV</a></li>
                            <li><a onClick={() => navigate("contact")} className="cursor-pointer hover:underline" style={{ color: accent }}>Get in Touch</a></li>
                            <li><a onClick={() => navigate("projects")} className="cursor-pointer hover:underline" style={{ color: accent }}>All Projects</a></li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="mt-10">
                <div className="flex justify-between items-baseline pb-2 mb-5" style={{ borderBottom: `3px solid ${accent}` }}>
                    <h2 className="special-elite text-base uppercase tracking-widest">// Recent Projects</h2>
                    <a onClick={() => navigate("projects")} className="special-elite text-xs uppercase cursor-pointer"
                       style={{ color: accent, borderBottom: `1px solid ${accent}`, letterSpacing: "1px" }}>View All</a>
                </div>
                {published.length === 0
                    ? <div className="p-5 special-elite text-xs" style={{ color: "#555", border: "2px solid #222", background: "#fff" }}>No projects published yet.</div>
                    : <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {published.slice(0, 4).map(p => <ProjectCard key={p.id} p={p} onClick={() => openProject(p.id)} accent={accent} />)}
                    </div>}
            </div>
        </div>
    );
}

function AboutPage({ accent, accentDark, navigate }) {
    return (
        <div>
            <SectionHeader title="About" sub="the human behind the work" accent={accent} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center justify-center special-elite text-xs text-center p-5"
                     style={{ border: "2px solid #222", background: "#ddd", color: "#999", aspectRatio: "1" }}>
                    <img src="picture.jpg" alt="Profile"></img>
                </div>
                <div className="md:col-span-2 p-6" style={{ border: "2px solid #222", background: "#fff" }}>
                    <h2 className="special-elite text-2xl mb-1">Dongjae Ko</h2>
                    <div className="special-elite text-xs uppercase mb-5" style={{ color: accent, letterSpacing: "2px" }}>// Electrical Engineering</div>
                    <p className="text-sm mb-3 leading-relaxed" style={{ color: "#555" }}>I enjoy building novel stuff because its fun.</p>
                    <p className="text-sm mb-3 leading-relaxed" style={{ color: "#555" }}>Currently studying at the Korean Minjok Leadership Academy. Focused on electrical engineering and currently interested in RF.</p>
                    <p className="text-sm mb-6 leading-relaxed" style={{ color: "#555" }}>This site exists to document the work.</p>
                    <Btn onClick={() => navigate("contact")} style={{ background: accent }}>Get in Touch</Btn>
                </div>
            </div>
        </div>
    );
}

function ProjectsPage({ accent, published, openProject, viewingProject, setViewingProject }) {
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

function ResumePage({ accent }) {
    const sections = [
        {
            title: "Education",
            items: [
                {
                    title: "Korean Minjok Leadership Academy",
                    date: "2025 – Present",
                    bullets: ["Minjok Herald (Deputy Editor)", "혜움나래 (Team Captain)"],
                },
            ],
        },
        {
            title: "Projects",
            items: [
                {
                    title: "Dual-IMU Gait Analysis System",
                    date: "2025 – Present",
                    sub: "Independent Research",
                    bullets: [
                        "Built a wearable dual-IMU system to detect arm-swing asymmetry in visually impaired runners; validated against optical body tracking. Filing provisional patent.",
                    ],
                },
                {
                    title: "Oscilloscope Vector Imagery",
                    date: "2026",
                    sub: "Art / Engineering",
                    bullets: [
                        "Designed custom PCBs using DAC and op-amp ICs; generated Lissajous-based video and audio via computed Fourier transforms on a CRT oscilloscope.",
                    ],
                },
                {
                    title: "Yut Motion Analysis",
                    date: "2026",
                    sub: "Physics Research",
                    bullets: [
                        "Tracked 6-DoF tumbling and collision dynamics of Yut using custom IMU circuits; identified tennis-racket-theorem instability in traditional Korean dice.",
                    ],
                },
                {
                    title: "Hanji-Property Replication",
                    date: "2026",
                    sub: "Materials Research · Korean Chemistry Tournament Gold",
                    bullets: [
                        "Simulated fiber-level interactions to model a low-cost paper matching Hanji's tensile strength, porosity, and Young's modulus.",
                    ],
                },
                {
                    title: "Physics Research",
                    date: "2025 – Present",
                    sub: "Club Captain",
                    bullets: [
                        "Led campus research on optics, classical mechanics, and turbulent fluid dynamics; 1st place, school science competition.",
                    ],
                },
            ],
        },
        {
            title: "Skills",
            items: [
                {
                    lines: [
                        "Hardware: PCB design (KiCAD), Oscilloscopes, Soldering, Spectrometers",
                        "Software: Python, JavaScript, Java, C++, Git, OceanView",
                        "Sim: Ansys Mechanical, LAMMPS, OVITO, Moltemplate, Basilisk CFD"
                    ],
                },
            ],
        },
    ];
    return (
        <div>
            <SectionHeader title="Resume" sub="experience & skills" accent={accent} />
            <div className="max-w-3xl p-8" style={{ border: "2px solid #222", background: "#fff" }}>
                <div className="special-elite text-3xl mb-1">Dongjae Ko</div>
                <div className="special-elite text-xs mb-7" style={{ color: "#666", letterSpacing: "1px" }}>debutgacc@gmail.com &nbsp;&middot;&nbsp; Gangwon, South Korea &nbsp;&middot;&nbsp; github.com/WhateversOnMyMind</div>
                {sections.map(sec => (
                    <div key={sec.title} className="mb-7">
                        <h2 className="special-elite text-xs uppercase pb-1 mb-4" style={{ color: accent, borderBottom: `2px solid ${accent}`, letterSpacing: "2px" }}>{sec.title}</h2>
                        {sec.items.map((it, i) => (
                            <div key={i} className="mb-4">
                                {it.title && (
                                    <div className="flex justify-between mb-0.5">
                                        <span className="font-bold text-sm">{it.title}</span>
                                        <span className="special-elite text-xs" style={{ color: "#666" }}>{it.date}</span>
                                    </div>
                                )}
                                {it.sub && <div className="text-xs mb-1" style={{ color: "#666" }}>{it.sub}</div>}
                                {it.bullets && <ul className="pl-4 text-xs space-y-0.5" style={{ color: "#555" }}>{it.bullets.map((b, j) => <li key={j}>{b}</li>)}</ul>}
                                {it.lines && <div className="text-xs space-y-1" style={{ color: "#555" }}>{it.lines.map((l, j) => <div key={j}>{l}</div>)}</div>}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

function ContactPage({ accent }) {
    const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
    const set = (f) => (e) => setForm(prev => ({ ...prev, [f]: e.target.value }));
    const handleSend = () => {
        const { name, email, subject, message } = form;
        if (!name || !email || !message) { alert("Name, email, and message are required."); return; }
        const b = `From: ${name} (${email})%0D%0A%0D%0A${encodeURIComponent(message)}`;
        window.open(`mailto:your@email.com?subject=${encodeURIComponent(subject || "Portfolio Contact")}&body=${b}`, "_blank");
    };
    const inputStyle = { border: "2px solid #222", background: "#f5f5f0", outline: "none", width: "100%", padding: "8px 10px", fontSize: "14px" };
    const labelStyle = { fontFamily: "'Special Elite', monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", color: "#666", display: "block", marginBottom: "5px" };
    return (
        <div>
            <SectionHeader title="Contact" sub="get in touch" accent={accent} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6" style={{ border: "2px solid #222", background: "#fff" }}>
                    <h2 className="special-elite text-sm uppercase mb-5" style={{ color: accent, letterSpacing: "2px" }}>// Send a Message</h2>
                    <div className="mb-4"><label style={labelStyle}>Name</label><input value={form.name} onChange={set("name")} placeholder="Your name" style={inputStyle} /></div>
                    <div className="mb-4"><label style={labelStyle}>Email</label><input value={form.email} onChange={set("email")} placeholder="your@email.com" style={inputStyle} /></div>
                    <div className="mb-4"><label style={labelStyle}>Subject</label><input value={form.subject} onChange={set("subject")} placeholder="What's this about?" style={inputStyle} /></div>
                    <div className="mb-5"><label style={labelStyle}>Message</label><textarea value={form.message} onChange={set("message")} rows={5} placeholder="Your message..." style={{ ...inputStyle, resize: "vertical" }} /></div>
                    <Btn onClick={handleSend} style={{ background: accent }}>Send Message</Btn>
                </div>
                <div className="p-6" style={{ border: "2px solid #222", background: "#fff" }}>
                    <h2 className="special-elite text-sm uppercase mb-5" style={{ color: accent, letterSpacing: "2px" }}>// Find Me</h2>
                    {[["Email", "debutgacc@gmail.com"], ["GitHub", "github.com/WhateversOnMyMind"], ["Location", "Gangwon, South Korea"]].map(([l, v]) => (
                        <div key={l} className="flex gap-3 mb-3 text-sm items-start">
                            <span className="special-elite text-xs uppercase pt-0.5" style={{ color: "#777", minWidth: "70px", letterSpacing: "1px" }}>{l}</span>
                            <span style={{ color: "#333" }}>{v}</span>
                        </div>
                    ))}
                    <div className="mt-7 pt-6" style={{ borderTop: "1px solid #ddd" }}>
                        <p className="text-xs leading-relaxed" style={{ color: "#666" }}>Or just add 고동재 on facebook.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}


export function AdminPanel({ accent, projects, setProjects, editingProject, setEditingProject, fetchProjects }) {
    const [title, setTitle] = useState("");
    const [date, setDate] = useState(
        new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    );
    const [status, setStatus] = useState("draft");
    const [saveMsg, setSaveMsg] = useState("");
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    // Image Upload Handler
    const handleImageUpload = async (file) => {
        setUploadingImage(true);
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

        const { error } = await supabase.storage
            .from('portfolio-images')
            .upload(fileName, file);

        if (error) {
            alert("Image upload failed: " + error.message);
            setUploadingImage(false);
            return null;
        }

        const { data } = supabase.storage.from('portfolio-images').getPublicUrl(fileName);
        setUploadingImage(false);
        return data.publicUrl;
    };

    // Tiptap Editor Configuration
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Link.configure({ openOnClick: false, autolink: true }),
            ImageResize, // Adds resize handles and alignment
            Youtube.configure({
                inline: false,
                width: 640,
                height: 480,
                HTMLAttributes: {
                    class: 'w-full rounded-md border-2 border-gray-800 my-4 aspect-video',
                },
            }),
        ],
        content: "<p>Start writing...</p>",
        editorProps: {
            attributes: {
                class: 'prose-content min-h-[500px] outline-none',
            },
            handlePaste: (view, event) => {
                const items = event.clipboardData?.items;
                if (!items) return false;
                for (const item of items) {
                    if (item.type.indexOf("image") === 0) {
                        event.preventDefault();
                        const file = item.getAsFile();
                        handleImageUpload(file).then(url => {
                            if (url) editor.chain().focus().setImage({ src: url }).run();
                        });
                        return true;
                    }
                }
                return false;
            },
            handleDrop: (view, event, slice, moved) => {
                if (!moved && event.dataTransfer?.files?.length > 0) {
                    const file = event.dataTransfer.files[0];
                    if (file.type.indexOf("image") === 0) {
                        event.preventDefault();
                        handleImageUpload(file).then(url => {
                            if (url) editor.chain().focus().setImage({ src: url }).run();
                        });
                        return true;
                    }
                }
                return false;
            }
        },
    });

    useEffect(() => {
        if (editingProject && editor) {
            const p = projects.find(x => x.id === editingProject);
            if (p) {
                setTitle(p.title);
                setDate(p.date);
                setStatus(p.status);
                editor.commands.setContent(p.body || "");
            }
        }
    }, [editingProject, editor]);

    const clearEditor = () => {
        setEditingProject(null);
        setTitle("");
        setDate(new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }));
        setStatus("draft");
        editor?.commands.clearContent();
        setSaveMsg("");
    };

    const save = async () => {
        if (!title.trim()) return alert("Title required.");
        setSaving(true);
        const body = editor?.getHTML() || "";
        const payload = { title, date, status, body, updated: Date.now() };

        if (editingProject) {
            const { error } = await supabase.from("projects").update(payload).eq("id", editingProject);
            if (error) alert("Save failed: " + error.message);
        } else {
            const id = Date.now();
            const { error } = await supabase.from("projects").insert([{ id, ...payload, created: id }]);
            if (error) alert("Save failed: " + error.message);
            else setEditingProject(id);
        }

        await fetchProjects();
        setSaving(false);
        setSaveMsg("Saved.");
        setTimeout(() => setSaveMsg(""), 3000);
    };

    const deleteProject = async (id) => {
        if (!window.confirm("Delete this project?")) return;
        await supabase.from("projects").delete().eq("id", id);
        if (editingProject === id) clearEditor();
        await fetchProjects();
    };

    const togglePublish = async (id, currentStatus) => {
        const newStatus = currentStatus === "published" ? "draft" : "published";
        await supabase.from("projects").update({ status: newStatus }).eq("id", id);
        await fetchProjects();
    };

    // UI Helpers
    const tbBtn = (label, action, isActive = false) => (
        <button
            onClick={action}
            className="px-2 py-1 text-xs cursor-pointer rounded-sm transition-colors"
            style={{
                fontFamily: "monospace",
                background: isActive ? accent : "transparent",
                color: isActive ? "#fff" : "#333",
                border: "1px solid transparent"
            }}
            onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "#e0e0e0"; }}
            onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
        >
            {label}
        </button>
    );

    const setLink = () => {
        const url = window.prompt('URL');
        if (url === null) return;
        if (url === '') editor.chain().focus().extendMarkRange('link').unsetLink().run();
        else editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    const insertImgManual = () => {
        const url = window.prompt('Image URL');
        if (url) editor.chain().focus().setImage({ src: url }).run();
    };

    const addYoutubeVideo = () => {
        const url = window.prompt("Enter YouTube URL:");
        if (url) {
            editor.chain().focus().setYoutubeVideo({ src: url }).run();
        }
    };

    const sorted = [...projects].sort((a, b) => b.created - a.created);

    return (
        <div>
            {/* Metadata Header */}
            <div className="flex justify-between items-baseline pb-2 mb-5" style={{ borderBottom: `3px solid ${accent}` }}>
                <h1 className="special-elite text-2xl uppercase tracking-widest">Workspace</h1>
                {editingProject && <span className="special-elite text-xs text-gray-500">Editing ID: {editingProject}</span>}
            </div>

            <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: "1fr 150px 120px" }}>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Document Title"
                       className="p-3 text-lg font-bold" style={{ border: "1px solid #ccc", outline: `2px solid transparent`, outlineColor: "focus:black" }} />
                <input value={date} onChange={e => setDate(e.target.value)}
                       className="p-3 text-sm special-elite" style={{ border: "1px solid #ccc" }} />
                <select value={status} onChange={e => setStatus(e.target.value)}
                        className="p-3 text-sm special-elite" style={{ border: "1px solid #ccc" }}>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                </select>
            </div>

            {/* Google Docs Style Editor Container */}
            <div style={{ background: "#f8f9fa", border: "1px solid #c7c7c7", borderRadius: "4px" }}>
                {/* Sticky Toolbar */}
                <div className="sticky top-14 z-40 flex flex-wrap gap-1 p-2 items-center" style={{ background: "#edf2fa", borderBottom: "1px solid #c7c7c7", borderRadius: "4px 4px 0 0" }}>
                    {editor && (
                        <>
                            <div className="flex gap-1 pr-2 mr-2" style={{ borderRight: "1px solid #ccc" }}>
                                {tbBtn("B", () => editor.chain().focus().toggleBold().run(), editor.isActive("bold"))}
                                {tbBtn("I", () => editor.chain().focus().toggleItalic().run(), editor.isActive("italic"))}
                                {tbBtn("U", () => editor.chain().focus().toggleUnderline().run(), editor.isActive("underline"))}
                                {tbBtn("S", () => editor.chain().focus().toggleStrike().run(), editor.isActive("strike"))}
                            </div>

                            <div className="flex gap-1 pr-2 mr-2" style={{ borderRight: "1px solid #ccc" }}>
                                {tbBtn("H1", () => editor.chain().focus().toggleHeading({ level: 1 }).run(), editor.isActive("heading", { level: 1 }))}
                                {tbBtn("H2", () => editor.chain().focus().toggleHeading({ level: 2 }).run(), editor.isActive("heading", { level: 2 }))}
                                {tbBtn("H3", () => editor.chain().focus().toggleHeading({ level: 3 }).run(), editor.isActive("heading", { level: 3 }))}
                                {tbBtn("P", () => editor.chain().focus().setParagraph().run(), editor.isActive("paragraph"))}
                            </div>

                            <div className="flex gap-1 pr-2 mr-2" style={{ borderRight: "1px solid #ccc" }}>
                                {tbBtn("Left", () => editor.chain().focus().setTextAlign('left').run(), editor.isActive({ textAlign: 'left' }))}
                                {tbBtn("Center", () => editor.chain().focus().setTextAlign('center').run(), editor.isActive({ textAlign: 'center' }))}
                                {tbBtn("Right", () => editor.chain().focus().setTextAlign('right').run(), editor.isActive({ textAlign: 'right' }))}
                                {tbBtn("Justify", () => editor.chain().focus().setTextAlign('justify').run(), editor.isActive({ textAlign: 'justify' }))}
                            </div>

                            <div className="flex gap-1 pr-2 mr-2" style={{ borderRight: "1px solid #ccc" }}>
                                {tbBtn("List", () => editor.chain().focus().toggleBulletList().run(), editor.isActive("bulletList"))}
                                {tbBtn("Num", () => editor.chain().focus().toggleOrderedList().run(), editor.isActive("orderedList"))}
                                {tbBtn("Quote", () => editor.chain().focus().toggleBlockquote().run(), editor.isActive("blockquote"))}
                            </div>

                            <div className="flex gap-1 pr-2 mr-2" style={{ borderRight: "1px solid #ccc" }}>
                                {tbBtn("Link", setLink, editor.isActive("link"))}
                                {tbBtn("Img(URL)", insertImgManual)}
                                {tbBtn("YouTube", addYoutubeVideo)}
                            </div>

                            {/* Visual indicator for Drag & Drop / Paste */}
                            <div className="text-xs text-gray-500 ml-auto flex items-center gap-2">
                                {uploadingImage ? "Uploading image..." : "Drag/Paste images supported"}
                            </div>
                        </>
                    )}
                </div>

                {/* Editor Paper Canvas */}
                <div className="p-8 mx-auto my-4 bg-white shadow-sm" style={{ maxWidth: "850px", border: "1px solid #ddd", minHeight: "600px" }}>
                    <EditorContent editor={editor} />
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-4 items-center">
                <button onClick={save} disabled={saving} className="special-elite uppercase text-xs tracking-widest px-6 py-3 cursor-pointer text-white" style={{ background: accent, opacity: saving ? 0.7 : 1 }}>
                    {saving ? "Saving..." : "Commit Document"}
                </button>
                <button onClick={clearEditor} className="special-elite uppercase text-xs tracking-widest px-6 py-3 cursor-pointer" style={{ border: "2px solid #222" }}>
                    Start Fresh
                </button>
                {saveMsg && <span className="special-elite text-sm text-green-700 ml-2">{saveMsg}</span>}
            </div>

            {/* Document Index */}
            <div className="mt-16 pt-8" style={{ borderTop: "3px solid #222" }}>
                <h3 className="special-elite text-sm uppercase mb-6 tracking-widest" style={{ color: accent }}>// Document Registry</h3>
                <div className="grid gap-2">
                    {sorted.map(p => (
                        <div key={p.id} className="flex justify-between items-center p-4 bg-white" style={{ border: "1px solid #222" }}>
                            <div>
                                <span className="font-bold text-lg mr-3">{p.title}</span>
                                {p.status === "draft" && <span className="text-xs px-2 py-1 bg-yellow-200 text-yellow-800 rounded-sm font-mono">DRAFT</span>}
                                <div className="text-sm text-gray-500 mt-1 font-mono">{p.date} &middot; ID: {p.id}</div>
                            </div>
                            <div className="flex gap-3 special-elite text-sm">
                                <button onClick={() => setEditingProject(p.id)} className="hover:underline text-blue-700">Load</button>
                                <button onClick={() => togglePublish(p.id, p.status)} className="hover:underline">
                                    {p.status === "published" ? "Unpublish" : "Publish"}
                                </button>
                                <button onClick={() => deleteProject(p.id)} className="hover:underline text-red-600">Drop</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Global Styles for the Editor Content */}
            <style>{`
                .ProseMirror { outline: none; }
                .ProseMirror p { margin-bottom: 1em; }
                .ProseMirror img { max-width: 100%; height: auto; display: block; }
                .ProseMirror img.ProseMirror-selectednode { outline: 3px solid ${accent}; }
                .ProseMirror blockquote { border-left: 4px solid #ddd; padding-left: 1rem; color: #666; }
                .ProseMirror a { color: ${accent}; text-decoration: underline; cursor: pointer; }
                .ProseMirror iframe { border-radius: 4px; border: 2px solid #222; }
            `}</style>
        </div>
    );
}