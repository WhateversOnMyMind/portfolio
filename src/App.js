import { useState, useEffect, useCallback } from "react";
import { supabase } from "./supabase";
import { THEMES, ADMIN_PW, PAGES, GOOGLE_FONT } from "./constants";
import Nav from "./components/Nav";
import AdminPasswordModal from "./components/AdminPasswordModal";
import AdminPanel from "./components/AdminPanel";
import PageContent from "./components/PageContent";

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
        setTimeout(() => { setTheme(t); setDisplayTheme(t); setThemeTransitioning(false); }, 180);
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
        const dir = PAGES.indexOf(to) > PAGES.indexOf(page) ? "left" : "right";
        setPrevPage(page);
        setSlideDir(dir);
        setAnimating(true);
        setPage(to);
        setViewingProject(null);
        setTimeout(() => { setAnimating(false); setPrevPage(null); setSlideDir(null); }, 350);
    }, [page, animating]);

    const submitAdminPw = () => {
        if (adminModalPw === ADMIN_PW) { setAdminUnlocked(true); setAdminErr(false); }
        else { setAdminErr(true); setAdminModalPw(""); }
    };

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

            <Nav accent={accent} page={page} adminOpen={adminOpen} adminUnlocked={adminUnlocked}
                 theme={theme} switchTheme={switchTheme} navigate={(to) => { setAdminOpen(false); navigate(to); }} goAdmin={goAdmin} />

            {adminOpen && !adminUnlocked && (
                <AdminPasswordModal accent={accent} adminModalPw={adminModalPw} setAdminModalPw={setAdminModalPw}
                                    adminErr={adminErr} onSubmit={submitAdminPw} onCancel={() => setAdminOpen(false)} />
            )}

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
                                <PageContent page={prevPage} accent={accent} accentDark={accentDark} published={published}
                                             navigate={navigate} openProject={openProject} viewingProject={null} setViewingProject={setViewingProject} />
                            </div>
                        )}
                        <div style={{ animation: animating ? `slideIn${slideDir === "left" ? "Left" : "Right"} 0.35s ease forwards` : "none" }}>
                            <PageContent page={page} accent={accent} accentDark={accentDark} published={published}
                                         navigate={navigate} openProject={openProject} viewingProject={viewingProject} setViewingProject={setViewingProject} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
