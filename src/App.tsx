import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import HeroContent from "./components/HeroContent";
import Logo from "./components/Logo";
import PhoneSection from "./components/PhoneSection";
import AuthPage from "./components/AuthPage";
import DashboardPage from "./components/DashboardPage";


function LandingPage() {
  const DESIGN_WIDTH = 1500;
  const DESIGN_HEIGHT = 900;

  const [scale, setScale] = useState(1);

  useEffect(() => {
    const resize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      // MOBILE
      // Keep the design at its normal size
      // and allow the webpage to scroll vertically.
      if (width < 768) {
        setScale(1);
        return;
      }

      // DESKTOP
      // Keep the original 1500x900 composition
      // scaled to fit the viewport.
      const scaleX = width / DESIGN_WIDTH;
      const scaleY = height / DESIGN_HEIGHT;

      setScale(Math.min(scaleX, scaleY));
    };

    resize();

    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <main
      className="
        relative
        min-h-svh
        w-full
        overflow-x-hidden
        overflow-y-auto
        bg-[#092b5d]

        md:fixed
        md:inset-0
        md:h-svh
        md:min-h-0
        md:overflow-hidden
      "
    >
      {/* ================================================== */}
      {/* BACKGROUND */}
      {/* ================================================== */}

      <div
        className="
          absolute
          inset-0
          bg-[radial-gradient(circle_at_80%_25%,rgba(67,143,232,0.42),transparent_32%),radial-gradient(circle_at_10%_0%,rgba(62,121,202,0.35),transparent_30%),linear-gradient(135deg,#123d79_0%,#0b2f65_45%,#082753_100%)]
        "
      />

      {/* ================================================== */}
      {/* DESKTOP DECORATIVE SHAPES */}
      {/* ================================================== */}

      <div
        className="
          absolute
          -left-[180px]
          -top-[380px]
          hidden
          h-[720px]
          w-[950px]
          rotate-[28deg]
          rounded-[180px]
          bg-gradient-to-br
          from-[#386da8]/45
          to-transparent
          md:block
        "
      />

      <div
        className="
          absolute
          left-[45%]
          top-[35%]
          hidden
          h-[430px]
          w-[650px]
          rounded-full
          bg-[#164b91]/50
          md:block
        "
      />

      <div
        className="
          absolute
          -bottom-[380px]
          left-[35%]
          hidden
          h-[650px]
          w-[900px]
          rounded-full
          bg-[#22599b]/45
          md:block
        "
      />

      <div
        className="
          absolute
          -right-[260px]
          top-[38%]
          hidden
          h-[580px]
          w-[650px]
          rounded-full
          bg-[#2865ad]/35
          md:block
        "
      />

      {/* ================================================== */}
      {/* MOBILE BACKGROUND SHAPES */}
      {/* ================================================== */}

      <div
        className="
          absolute
          -bottom-[180px]
          -left-[100px]
          h-[390px]
          w-[390px]
          rounded-full
          bg-[#174b8d]/60
          md:hidden
        "
      />

      <div
        className="
          absolute
          -right-[170px]
          bottom-[30px]
          h-[350px]
          w-[350px]
          rounded-full
          bg-[#2865ad]/30
          md:hidden
        "
      />

      {/* ================================================== */}
      {/* DESIGN CANVAS */}
      {/* ================================================== */}

      <div
        className="
          absolute
          left-0
          top-0
          h-[900px]
          w-full

          md:h-[900px]
          md:w-[1500px]
        "
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {/* ================================================== */}
        {/* LOGO */}
        {/* ================================================== */}

        <div
          className="
            absolute
            left-[22px]
            top-[22px]

            md:left-[70px]
            md:top-[45px]
          "
        >
          <Logo />
        </div>

        {/* ================================================== */}
        {/* HERO */}
        {/* ================================================== */}

        <div
          className="
            absolute
            left-[22px]
            right-[22px]
            top-[92px]

            md:left-[70px]
            md:right-auto
            md:top-[165px]
          "
        >
          <HeroContent />
        </div>

        {/* ================================================== */}
        {/* PHONES */}
        {/* ================================================== */}

        <PhoneSection />
      </div>
    </main>
  );
}


/* ========================================================= */
/* MAIN APP / ROUTING */
/* ========================================================= */

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* LANDING PAGE */}
        <Route
          path="/"
          element={<LandingPage />}
        />

        {/* LOGIN */}
        <Route
          path="/login"
          element={<AuthPage />}
        />

        {/* SIGN UP */}
        <Route
          path="/signup"
          element={<AuthPage />}
        />

        <Route path="/dashboard" element={<DashboardPage />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;