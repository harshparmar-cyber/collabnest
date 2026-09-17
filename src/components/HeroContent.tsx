import {
  ArrowRight,
  MessageCircle,
  Rocket,
  Users,
  Video,
} from "lucide-react";

const HeroContent = () => {
  return (
    <section
      className="
        relative
        z-20
        w-full
        text-white
        md:w-[590px]
      "
    >
      {/* HEADING */}
      <h1
        className="
          text-[36px]
          font-bold
          leading-[0.98]
          tracking-[-1.7px]
          text-white
          min-[390px]:text-[39px]
          md:text-[68px]
          md:leading-[1.05]
          md:tracking-[-3px]
        "
      >
        Find your
        <br />
        project partner.
        <br />
        Turn ideas into
        <br />
        <span className="bg-gradient-to-r from-[#6ca9e8] via-[#acd5f8] to-[#5592d5] bg-clip-text text-transparent">
          real projects.
        </span>
      </h1>

      {/* DESCRIPTION */}
      <p
        className="
          mt-[9px]
          max-w-[335px]
          text-[10px]
          leading-[1.35]
          text-white/90
          min-[390px]:text-[11px]
          md:mt-[18px]
          md:w-[570px]
          md:max-w-none
          md:text-[19px]
          md:leading-[1.45]
        "
      >
        Connect with like-minded students, collaborate on projects, share
        ideas, and build something amazing — together.
      </p>

      {/* FEATURES */}
      <div
        className="
          mt-[14px]
          grid
          w-full
          max-w-[330px]
          grid-cols-4
          gap-[7px]
          md:mt-[28px]
          md:w-[570px]
          md:max-w-none
          md:gap-[20px]
        "
      >
        {/* COLLABORATORS */}
        <div className="w-[70px] md:w-[125px]">
          <div
            className="
              flex
              h-[32px]
              w-[32px]
              items-center
              justify-center
              rounded-[9px]
              border
              border-white/15
              bg-white/10
              md:h-[56px]
              md:w-[56px]
              md:rounded-[14px]
            "
          >
            <Users
              size={17}
              strokeWidth={1.7}
              className="md:hidden"
            />

            <Users
              size={27}
              strokeWidth={1.7}
              className="hidden md:block"
            />
          </div>

          <h3 className="mt-[5px] text-[7px] font-bold md:mt-[10px] md:text-[12px]">
            Find Collaborators
          </h3>

          <p className="mt-[2px] text-[6px] leading-[1.3] text-white/75 md:mt-[5px] md:text-[10px]">
            Meet students with similar goals and interests.
          </p>
        </div>

        {/* CHAT */}
        <div className="w-[70px] md:w-[125px]">
          <div
            className="
              flex
              h-[32px]
              w-[32px]
              items-center
              justify-center
              rounded-[9px]
              border
              border-white/15
              bg-white/10
              md:h-[56px]
              md:w-[56px]
              md:rounded-[14px]
            "
          >
            <MessageCircle
              size={17}
              strokeWidth={1.7}
              className="md:hidden"
            />

            <MessageCircle
              size={27}
              strokeWidth={1.7}
              className="hidden md:block"
            />
          </div>

          <h3 className="mt-[5px] text-[7px] font-bold md:mt-[10px] md:text-[12px]">
            Chat & Discuss
          </h3>

          <p className="mt-[2px] text-[6px] leading-[1.3] text-white/75 md:mt-[5px] md:text-[10px]">
            Share ideas, discuss plans, and plan your project.
          </p>
        </div>

        {/* CALLS */}
        <div className="w-[70px] md:w-[125px]">
          <div
            className="
              flex
              h-[32px]
              w-[32px]
              items-center
              justify-center
              rounded-[9px]
              border
              border-white/15
              bg-white/10
              md:h-[56px]
              md:w-[56px]
              md:rounded-[14px]
            "
          >
            <Video
              size={17}
              strokeWidth={1.7}
              className="md:hidden"
            />

            <Video
              size={27}
              strokeWidth={1.7}
              className="hidden md:block"
            />
          </div>

          <h3 className="mt-[5px] text-[7px] font-bold md:mt-[10px] md:text-[12px]">
            Join Calls
          </h3>

          <p className="mt-[2px] text-[6px] leading-[1.3] text-white/75 md:mt-[5px] md:text-[10px]">
            Connect through video calls when needed.
          </p>
        </div>

        {/* BUILD */}
        <div className="w-[70px] md:w-[125px]">
          <div
            className="
              flex
              h-[32px]
              w-[32px]
              items-center
              justify-center
              rounded-[9px]
              border
              border-white/15
              bg-white/10
              md:h-[56px]
              md:w-[56px]
              md:rounded-[14px]
            "
          >
            <Rocket
              size={17}
              strokeWidth={1.7}
              className="md:hidden"
            />

            <Rocket
              size={27}
              strokeWidth={1.7}
              className="hidden md:block"
            />
          </div>

          <h3 className="mt-[5px] text-[7px] font-bold md:mt-[10px] md:text-[12px]">
            Build & Grow
          </h3>

          <p className="mt-[2px] text-[6px] leading-[1.3] text-white/75 md:mt-[5px] md:text-[10px]">
            Turn your ideas into real-world projects.
          </p>
        </div>
      </div>

      {/* CTA */}
      <button
        className="
          mt-[13px]
          flex
          h-[35px]
          w-[120px]
          items-center
          justify-center
          gap-[7px]
          rounded-full
          bg-gradient-to-r
          from-[#6eb5f2]
          to-[#3d8bd4]
          text-[9px]
          font-semibold
          text-white
          shadow-lg
          shadow-black/10
          transition
          hover:scale-105
          min-[390px]:mt-[15px]
          md:mt-[28px]
          md:h-[56px]
          md:w-[182px]
          md:gap-[10px]
          md:text-[15px]
        "
      >
        Get Started
        <ArrowRight size={13} className="md:hidden" />
        <ArrowRight size={20} className="hidden md:block" />
      </button>
    </section>
  );
};

export default HeroContent;