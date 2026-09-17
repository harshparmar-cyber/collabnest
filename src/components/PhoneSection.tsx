

import ProjectPhone from "./ProjectPhone";
import ChatPhone from "./ChatPhone";

const PhoneSection = () => {
  return (
    <section
      className="
        absolute
        left-[690px]
        top-[90px]
        h-[760px]
        w-[900px]
      "
    >
      {/* =========================================
          BETTER TOGETHER
      ========================================= */}

      <div
        className="
          absolute
          right-[105px]
          top-[5px]
          z-40
          rotate-[-9deg]
          text-center
          font-[cursive]
          leading-[0.95]
          text-[#c7e1fb]
        "
      >
        <div className="text-[30px]">
          Better
        </div>

        <div className="mt-1 text-[29px]">
          Together!
        </div>
      </div>

      {/* =========================================
          DECORATIVE STROKES
      ========================================= */}

      <div
        className="
          absolute
          right-[240px]
          top-[28px]
          z-40
          h-[2px]
          w-[18px]
          rotate-[12deg]
          bg-[#b9d9f7]
        "
      />

      <div
        className="
          absolute
          right-[235px]
          top-[55px]
          z-40
          h-[2px]
          w-[13px]
          rotate-[-12deg]
          bg-[#b9d9f7]
        "
      />

      <div
        className="
          absolute
          right-[90px]
          top-[35px]
          z-40
          h-[2px]
          w-[15px]
          rotate-[25deg]
          bg-[#b9d9f7]
        "
      />

      
      {/* =========================================
          PHONES
      ========================================= */}

      <div
        className="
          absolute
          left-[40px]
          top-[20px]
          z-20
          flex
          items-start
        "
      >
        {/* Back Phone */}

        <div className="relative z-10">
          <ProjectPhone />
        </div>

        {/* Front Phone */}

        <div className="relative z-20">
          <ChatPhone />
        </div>
      </div>

      {/* =========================================
          DOT GRID
      ========================================= */}

      <div
        className="
          absolute
          bottom-[20px]
          right-[55px]
          z-30
          grid
          grid-cols-3
          gap-[15px]
        "
      >
        {Array.from({ length: 9 }).map((_, index) => (
          <span
            key={index}
            className="
              h-[5px]
              w-[5px]
              rounded-full
              bg-[#5590cf]
            "
          />
        ))}
      </div>
    </section>
  );
};

export default PhoneSection;