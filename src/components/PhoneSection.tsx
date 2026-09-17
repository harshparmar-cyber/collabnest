import ProjectPhone from "./ProjectPhone";
import ChatPhone from "./ChatPhone";

const PhoneSection = () => {
  return (
    <section
      className="
        absolute
        left-0
        top-[330px]
        h-[390px]
        w-full

        md:left-[690px]
        md:top-[90px]
        md:h-[760px]
        md:w-[900px]
      "
    >
      {/* BETTER TOGETHER */}
<div
  className="
    absolute
    left-1/2
    top-[88px]
    z-40
    -translate-x-1/2
    rotate-[-8deg]
    text-center
    font-[cursive]
    leading-[0.9]
    text-[#c7e1fb]

    md:left-auto
    md:right-[105px]
    md:top-0
    md:translate-x-0
    md:rotate-[-9deg]
  "
>
  <div className="text-[19px] md:text-[30px]">
    Better
  </div>

  <div className="mt-1 text-[19px] md:text-[29px]">
    Together!
  </div>
</div>

      {/* DECORATIVE LINES - DESKTOP ONLY */}
      <div
        className="
          absolute
          right-[240px]
          top-[28px]
          z-40
          hidden
          h-[2px]
          w-[18px]
          rotate-[12deg]
          bg-[#b9d9f7]
          md:block
        "
      />

      <div
        className="
          absolute
          right-[235px]
          top-[55px]
          z-40
          hidden
          h-[2px]
          w-[13px]
          rotate-[-12deg]
          bg-[#b9d9f7]
          md:block
        "
      />

      <div
        className="
          absolute
          right-[90px]
          top-[35px]
          z-40
          hidden
          h-[2px]
          w-[15px]
          rotate-[25deg]
          bg-[#b9d9f7]
          md:block
        "
      />

      {/* PHONE GROUP */}
      <div
        className="
          absolute
          left-1/2
          top-[10px]
          z-20
          flex
          w-[555px]
          -translate-x-1/2
          origin-top-center
          scale-[0.50]
          items-start

          md:left-[40px]
          md:top-[20px]
          md:w-auto
          md:translate-x-0
          md:scale-100
        "
      >
        {/* PROJECT PHONE */}
        <div className="relative z-10">
          <ProjectPhone />
        </div>

        {/* CHAT PHONE */}
        <div className="relative z-20">
          <ChatPhone />
        </div>
      </div>

      {/* DOTS - DESKTOP ONLY */}
      <div
        className="
          absolute
          bottom-[20px]
          right-[55px]
          z-30
          hidden
          grid-cols-3
          gap-[15px]
          md:grid
        "
      >
        {Array.from({ length: 9 }).map((_, index) => (
          <span
            key={index}
            className="h-[5px] w-[5px] rounded-full bg-[#5590cf]"
          />
        ))}
      </div>
    </section>
  );
};

export default PhoneSection;