import SectionHeader from "../components/SectionHeader";
import Btn from "../components/Btn";

export default function AboutPage({ accent, navigate }) {
    return (
        <div>
            <SectionHeader title="About" sub="the human behind the work" accent={accent} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center justify-center special-elite text-xs text-center p-5"
                     style={{ border: "2px solid #222", background: "#ddd", color: "#999", aspectRatio: "1" }}>
                    <img src="picture.jpg" alt="Profile" />
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
