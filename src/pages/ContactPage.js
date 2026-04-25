import { useState } from "react";
import SectionHeader from "../components/SectionHeader";
import Btn from "../components/Btn";

export default function ContactPage({ accent }) {
    const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
    const set = (f) => (e) => setForm(prev => ({ ...prev, [f]: e.target.value }));
    const handleSend = () => {
        const { name, email, subject, message } = form;
        if (!name || !email || !message) { alert("Name, email, and message are required."); return; }
        const b = `From: ${name} (${email})%0D%0A%0D%0A${encodeURIComponent(message)}`;
        window.open(`mailto:your@email.com?subject=${encodeURIComponent(subject || "Portfolio Contact")}&body=${b}`, "_blank");
    };
    const inputStyle = { border: "2px solid var(--border)", background: "var(--input-bg)", color: "var(--text)", outline: "none", width: "100%", padding: "8px 10px", fontSize: "14px" };
    const labelStyle = { fontFamily: "'Special Elite', monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", color: "var(--sub)", display: "block", marginBottom: "5px" };
    return (
        <div>
            <SectionHeader title="Contact" sub="get in touch" accent={accent} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 md:p-6" style={{ border: "2px solid var(--border)", background: "var(--surface)" }}>
                    <h2 className="special-elite text-sm uppercase mb-5" style={{ color: accent, letterSpacing: "2px" }}>// Send a Message</h2>
                    <div className="mb-4"><label style={labelStyle}>Name</label><input value={form.name} onChange={set("name")} placeholder="Your name" style={inputStyle} /></div>
                    <div className="mb-4"><label style={labelStyle}>Email</label><input value={form.email} onChange={set("email")} placeholder="your@email.com" style={inputStyle} /></div>
                    <div className="mb-4"><label style={labelStyle}>Subject</label><input value={form.subject} onChange={set("subject")} placeholder="What's this about?" style={inputStyle} /></div>
                    <div className="mb-5"><label style={labelStyle}>Message</label><textarea value={form.message} onChange={set("message")} rows={5} placeholder="Your message..." style={{ ...inputStyle, resize: "vertical" }} /></div>
                    <Btn onClick={handleSend} style={{ background: accent }}>Send Message</Btn>
                </div>
                <div className="p-4 md:p-6" style={{ border: "2px solid var(--border)", background: "var(--surface)" }}>
                    <h2 className="special-elite text-sm uppercase mb-5" style={{ color: accent, letterSpacing: "2px" }}>// Find Me</h2>
                    {[["Email", "debutgacc@gmail.com"], ["GitHub", "github.com/WhateversOnMyMind"], ["Location", "Gangwon, South Korea"]].map(([l, v]) => (
                        <div key={l} className="flex gap-3 mb-3 text-sm items-start">
                            <span className="special-elite text-xs uppercase pt-0.5" style={{ color: "var(--muted)", minWidth: "70px", letterSpacing: "1px" }}>{l}</span>
                            <span style={{ color: "var(--text)" }}>{v}</span>
                        </div>
                    ))}
                    <div className="mt-7 pt-6" style={{ borderTop: "1px solid var(--divider)" }}>
                        <p className="text-xs leading-relaxed" style={{ color: "var(--sub)" }}>Or just add 고동재 on facebook.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
