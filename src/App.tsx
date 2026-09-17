import { useEffect, useState } from "react";

import HeroContent from "./components/HeroContent";
import Logo from "./components/Logo";
import PhoneSection from "./components/PhoneSection";

function App() {
  const DESIGN_WIDTH = 1500;
  const DESIGN_HEIGHT = 900;

  const [scale, setScale] = useState(1);

  useEffect(() => {
    const resize = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      const scaleX = viewportWidth / DESIGN_WIDTH;
      const scaleY = viewportHeight / DESIGN_HEIGHT;

      // Always make the complete 1500x900 design fit
      const calculatedScale = Math.min(scaleX, scaleY);

      setScale(calculatedScale);
    };

    resize();

    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#092b5d]">

      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div
        className="
          absolute
          inset-0
          bg-[radial-gradient(circle_at_80%_25%,rgba(67,143,232,0.42),transparent_32%),radial-gradient(circle_at_10%_0%,rgba(62,121,202,0.35),transparent_30%),linear-gradient(135deg,#123d79_0%,#0b2f65_45%,#082753_100%)]
        "
      />

      {/* Top-left background shape */}

      <div
        className="
          absolute
          -left-[180px]
          -top-[380px]
          h-[720px]
          w-[950px]
          rotate-[28deg]
          rounded-[180px]
          bg-gradient-to-br
          from-[#386da8]/45
          to-transparent
        "
      />

      {/* Center background glow */}

      <div
        className="
          absolute
          left-[45%]
          top-[35%]
          h-[430px]
          w-[650px]
          rounded-full
          bg-[#164b91]/50
        "
      />

      {/* Bottom background shape */}

      <div
        className="
          absolute
          -bottom-[380px]
          left-[35%]
          h-[650px]
          w-[900px]
          rounded-full
          bg-[#22599b]/45
        "
      />

      {/* Right background shape */}

      <div
        className="
          absolute
          -right-[260px]
          top-[38%]
          h-[580px]
          w-[650px]
          rounded-full
          bg-[#2865ad]/35
        "
      />

      {/* =====================================================
          FIXED DESIGN
      ===================================================== */}

      <div
        className="
          absolute
          left-0
          top-0
          h-[900px]
          w-[1500px]
        "
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >

        {/* ===================================================
            LOGO
        =================================================== */}

        <div
          className="
            absolute
            left-[70px]
            top-[45px]
          "
        >
          <Logo />
        </div>

        {/* ===================================================
            HERO
        =================================================== */}

        <div
          className="
            absolute
            left-[70px]
            top-[165px]
          "
        >
          <HeroContent />
        </div>

        {/* ===================================================
            PHONES
        =================================================== */}

        <PhoneSection />

      </div>

    </div>
  );
}

export default App;