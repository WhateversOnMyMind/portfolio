export default function SectionHeader({ title, sub, accent }) {
    return (
        <div className="flex items-baseline gap-4 pb-2 mb-7" style={{ borderBottom: `3px solid ${accent}` }}>
            <h1 className="special-elite text-2xl uppercase tracking-widest">{title}</h1>
            {sub && <span className="special-elite text-xs uppercase tracking-wide" style={{ color: "#666" }}>{sub}</span>}
        </div>
    );
}
