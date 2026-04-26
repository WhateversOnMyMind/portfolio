// Drop your oscilloscope recording into public/osci-header.mp4
// It will autoplay looped and muted as the page header.
const HEADER_VIDEO = "/osci-header.mp4";
const P_GREEN = "#39ff14";

function OsciHeader() {
  return (
    <div style={{ width: "100%", background: "#020c02", position: "relative" }}>
      <video
        src={HEADER_VIDEO}
        autoPlay
        loop
        muted
        playsInline
        style={{ display: "block", width: "100%", height: "auto" }}
      />
    </div>
  );
}

export default function OsciArtPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#080f08", color: "#c0c0c0",
                  fontFamily: "Arial, Helvetica, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Special+Elite&display=swap');
        .se { font-family: 'Special Elite', 'Courier New', monospace; }
        * { box-sizing: border-box; }
      `}</style>

      <nav style={{ background: "#010801", borderBottom: `2px solid ${P_GREEN}`,
                    padding: "12px 24px", display: "flex", alignItems: "center", gap: "16px",
                    boxShadow: "0 0 20px rgba(57,255,20,0.12)" }}>
        <a href="/" className="se" style={{ color: P_GREEN, fontSize: "11px",
                                             letterSpacing: "2px", textDecoration: "none", opacity: 0.75 }}>
          ← BACK
        </a>
        <span style={{ color: "#1e3a1e" }}>|</span>
        <span className="se" style={{ color: "#2a6a2a", fontSize: "11px", letterSpacing: "2px" }}>
          DONGJAE.XYZ / OSCI·ART
        </span>
      </nav>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 16px" }}>
        <OsciHeader />

        <div style={{ marginTop: "28px", padding: "22px 28px",
                      border: `1px solid ${P_GREEN}`, background: "#010f01",
                      boxShadow: "0 0 18px rgba(57,255,20,0.06)" }}>
          <h2 className="se" style={{ color: P_GREEN, fontSize: "11px", letterSpacing: "2px",
                                       textTransform: "uppercase", marginBottom: "10px" }}>
            // Oscilloscope Vector Art
          </h2>
          <p style={{ fontSize: "14px", lineHeight: "1.75", color: "#777" }}>
            Designs generated on a CRT oscilloscope using custom PCBs with DAC and op-amp ICs.
            Vector paths computed via Fourier transforms and rendered as Lissajous figures
            directly on the phosphor screen — no software renderer, no display buffer.
          </p>
          <div className="se" style={{ marginTop: "18px", color: P_GREEN, opacity: 0.35,
                                        fontSize: "11px", letterSpacing: "1px" }}>
            [ GALLERY COMING SOON ]
          </div>
        </div>
      </div>
    </div>
  );
}
