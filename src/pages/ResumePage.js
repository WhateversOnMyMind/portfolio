import SectionHeader from "../components/SectionHeader";

const RESUME_SECTIONS = [
    {
        title: "Education",
        items: [
            { title: "Korean Minjok Leadership Academy", date: "2025 – Present", bullets: ["Minjok Herald (Deputy Editor)", "혜움나래 (Team Captain)"] },
        ],
    },
    {
        title: "Projects",
        items: [
            { title: "Dual-IMU Gait Analysis System", date: "2025 – Present", sub: "Independent Research", bullets: ["Built a wearable dual-IMU system to detect arm-swing asymmetry in visually impaired runners; validated against optical body tracking. Filing provisional patent."] },
            { title: "Oscilloscope Vector Imagery", date: "2026", sub: "Art / Engineering", bullets: ["Designed custom PCBs using DAC and op-amp ICs; generated Lissajous-based video and audio via computed Fourier transforms on a CRT oscilloscope."] },
            { title: "Yut Motion Analysis", date: "2026", sub: "Physics Research", bullets: ["Tracked 6-DoF tumbling and collision dynamics of Yut using custom IMU circuits; identified tennis-racket-theorem instability in traditional Korean dice."] },
            { title: "Hanji-Property Replication", date: "2026", sub: "Materials Research · Korean Chemistry Tournament Gold", bullets: ["Simulated fiber-level interactions to model a low-cost paper matching Hanji's tensile strength, porosity, and Young's modulus."] },
            { title: "Physics Research", date: "2025 – Present", sub: "Club Captain", bullets: ["Led campus research on optics, classical mechanics, and turbulent fluid dynamics; 1st place, school science competition."] },
        ],
    },
    {
        title: "Skills",
        items: [
            { lines: ["Hardware: PCB design (KiCAD), Oscilloscopes, Soldering, Spectrometers", "Software: Python, JavaScript, Java, C++, Git, OceanView", "Sim: Ansys Mechanical, LAMMPS, OVITO, Moltemplate, Basilisk CFD"] },
        ],
    },
];

export default function ResumePage({ accent }) {
    return (
        <div>
            <SectionHeader title="Resume" sub="experience & skills" accent={accent} />
            <div className="max-w-3xl p-4 md:p-8" style={{ border: "2px solid var(--border)", background: "var(--surface)" }}>
                <div className="special-elite text-3xl mb-1" style={{ color: "var(--text)" }}>Dongjae Ko</div>
                <div className="special-elite text-xs mb-7" style={{ color: "var(--muted)", letterSpacing: "1px" }}>debutgacc@gmail.com &nbsp;&middot;&nbsp; Gangwon, South Korea &nbsp;&middot;&nbsp; github.com/WhateversOnMyMind</div>
                {RESUME_SECTIONS.map(sec => (
                    <div key={sec.title} className="mb-7">
                        <h2 className="special-elite text-xs uppercase pb-1 mb-4" style={{ color: accent, borderBottom: `2px solid ${accent}`, letterSpacing: "2px" }}>{sec.title}</h2>
                        {sec.items.map((it, i) => (
                            <div key={i} className="mb-4">
                                {it.title && (
                                    <div className="flex justify-between mb-0.5">
                                        <span className="font-bold text-sm" style={{ color: "var(--text)" }}>{it.title}</span>
                                        <span className="special-elite text-xs" style={{ color: "var(--muted)" }}>{it.date}</span>
                                    </div>
                                )}
                                {it.sub && <div className="text-xs mb-1" style={{ color: "var(--sub)" }}>{it.sub}</div>}
                                {it.bullets && <ul className="pl-4 text-xs space-y-0.5" style={{ color: "var(--sub)", listStyleType: "disc" }}>{it.bullets.map((b, j) => <li key={j}>{b}</li>)}</ul>}
                                {it.lines && <div className="text-xs space-y-1" style={{ color: "var(--sub)" }}>{it.lines.map((l, j) => <div key={j}>{l}</div>)}</div>}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
