export default function AdminPasswordModal({ accent, adminModalPw, setAdminModalPw, adminErr, onSubmit, onCancel }) {
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center" style={{ background: "rgba(0,0,0,0.72)" }}>
            <div className="p-8 w-[360px]" style={{ background: "#fff", border: "3px solid #222" }}>
                <h2 className="special-elite uppercase tracking-widest text-base mb-5 pb-2" style={{ borderBottom: `2px solid ${accent}` }}>// Admin Access</h2>
                <input type="password" value={adminModalPw}
                       onChange={e => setAdminModalPw(e.target.value)}
                       onKeyDown={e => e.key === "Enter" && onSubmit()}
                       placeholder="Enter password..." autoFocus
                       className="w-full p-2.5 mb-3 text-sm special-elite" style={{ border: "2px solid #222", background: "#f5f5f0", outline: "none" }} />
                {adminErr && <div className="text-xs mb-2 special-elite" style={{ color: "#cc0000" }}>Incorrect password.</div>}
                <div className="flex gap-2.5">
                    <button onClick={onSubmit}
                            className="special-elite uppercase text-xs tracking-widest px-4 py-2 text-white cursor-pointer"
                            style={{ background: accent, border: "2px solid #222" }}>Enter</button>
                    <button onClick={onCancel}
                            className="special-elite uppercase text-xs tracking-widest px-4 py-2 cursor-pointer"
                            style={{ background: "transparent", border: "2px solid #222" }}>Cancel</button>
                </div>
            </div>
        </div>
    );
}
