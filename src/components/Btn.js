export default function Btn({ onClick, children, outline, style = {} }) {
    return (
        <button onClick={onClick}
                className="special-elite uppercase text-xs tracking-widest px-4 py-2 cursor-pointer"
                style={{ border: "2px solid var(--border)", background: outline ? "transparent" : undefined, color: outline ? "var(--text)" : "#fff", letterSpacing: "2px", ...style }}>
            {children}
        </button>
    );
}
