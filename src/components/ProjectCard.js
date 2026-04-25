export default function ProjectCard({ p, onClick, accent }) {
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
