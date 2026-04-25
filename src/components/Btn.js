export default function Btn({ onClick, children, outline, style = {} }) {
    return (
        <button onClick={onClick}
                className="special-elite uppercase text-xs tracking-widest px-4 py-2 cursor-pointer"
                style={{ border: "2px solid #222", background: outline ? "transparent" : undefined, color: outline ? "#111" : "#fff", letterSpacing: "2px", ...style }}>
            {children}
        </button>
    );
}
