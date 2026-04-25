export default function ProjectCard({ p, onClick, accent }) {
    const tmp = document.createElement("div");
    tmp.innerHTML = p.body || "";
    const txt = tmp.textContent || "";
    const imgMatch = (p.body || "").match(/<img[^>]+src="([^"]+)"/);
    return (
        <div onClick={onClick} className="cursor-pointer"
             style={{ border: "2px solid var(--border)", background: "var(--surface)", transition: "background 0.1s" }}
             onMouseEnter={e => e.currentTarget.style.background = "var(--hover)"}
             onMouseLeave={e => e.currentTarget.style.background = "var(--surface)"}>
            <div className="h-40 flex items-center justify-center text-xs overflow-hidden special-elite"
                 style={{ background: "var(--img-bg)", color: "var(--muted)", borderBottom: "2px solid var(--border)" }}>
                {imgMatch ? <img src={imgMatch[1]} className="w-full h-full object-cover" alt="" /> : "[ no image ]"}
            </div>
            <div className="p-4">
                <h3 className="special-elite text-sm mb-1" style={{ letterSpacing: "1px", color: "var(--text)" }}>{p.title}</h3>
                <div className="special-elite text-xs uppercase mb-2" style={{ color: "var(--muted)", letterSpacing: "1px" }}>{p.date}</div>
                <p className="text-xs leading-relaxed" style={{ color: "var(--sub)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{txt}</p>
            </div>
        </div>
    );
}
