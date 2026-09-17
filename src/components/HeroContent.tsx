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
        w-[590px]
        shrink-0
        text-white
      "
    >
      {/* =========================================
          MAIN HEADING
      ========================================= */}

      <h1
        className="
          text-[68px]
          font-bold
          leading-[1.05]
          tracking-[-3px]
          text-white
        "
      >
        Find your
        <br />

        project partner.
        <br />

        Turn ideas into
        <br />

        <span
          className="
            bg-gradient-to-r
            from-[#6ca9e8]
            via-[#acd5f8]
            to-[#5592d5]
            bg-clip-text
            text-transparent
          "
        >
          real projects.
        </span>
      </h1>

      {/* =========================================
          UNDERLINE
      ========================================= */}

      <div
        className="
          relative
          mt-[10px]
          h-[8px]
          w-[295px]
        "
      >
        <div
          className="
            absolute
            left-0
            top-0
            h-[3px]
            w-[285px]
            rotate-[-3deg]
            rounded-full
            bg-[#9bc9f5]
          "
        />

        <div
          className="
            absolute
            right-0
            top-[2px]
            h-[6px]
            w-[6px]
            rounded-full
            bg-[#9bc9f5]
          "
        />
      </div>

      {/* =========================================
          DESCRIPTION
      ========================================= */}

      <p
        className="
          mt-[20px]
          w-[570px]
          text-[19px]
          font-normal
          leading-[1.65]
          text-[#c8dcf2]
        "
      >
        Connect with like-minded students, collaborate
        <br />
        on projects, share ideas, and build something
        <br />
        amazing — together.
      </p>

      {/* =========================================
          FEATURE CARDS
      ========================================= */}

      <div
        className="
          mt-[32px]
          grid
          grid-cols-4
          gap-x-[18px]
        "
      >
        {/* -----------------------------------------
            FIND COLLABORATORS
        ----------------------------------------- */}

        <div className="w-[125px]">
          <div
            className="
              flex
              h-[56px]
              w-[56px]
              items-center
              justify-center
              rounded-[15px]
              border
              border-[#5793d3]/40
              bg-gradient-to-br
              from-[#2868ac]
              to-[#174d8b]
              shadow-[0_8px_25px_rgba(0,0,0,0.18)]
            "
          >
            <Users
              size={27}
              strokeWidth={1.8}
              className="text-[#e4f2ff]"
            />
          </div>

          <h3
            className="
              mt-[12px]
              whitespace-nowrap
              text-[14px]
              font-semibold
              text-white
            "
          >
            Find Collaborators
          </h3>

          <p
            className="
              mt-[5px]
              text-[12px]
              leading-[1.45]
              text-[#a9c7e6]
            "
          >
            Meet students with
            <br />
            similar goals and
            <br />
            interests.
          </p>
        </div>

        {/* -----------------------------------------
            CHAT & DISCUSS
        ----------------------------------------- */}

        <div className="w-[125px]">
          <div
            className="
              flex
              h-[56px]
              w-[56px]
              items-center
              justify-center
              rounded-[15px]
              border
              border-[#5793d3]/40
              bg-gradient-to-br
              from-[#2868ac]
              to-[#174d8b]
              shadow-[0_8px_25px_rgba(0,0,0,0.18)]
            "
          >
            <MessageCircle
              size={27}
              strokeWidth={1.8}
              className="text-[#e4f2ff]"
            />
          </div>

          <h3
            className="
              mt-[12px]
              whitespace-nowrap
              text-[14px]
              font-semibold
              text-white
            "
          >
            Chat & Discuss
          </h3>

          <p
            className="
              mt-[5px]
              text-[12px]
              leading-[1.45]
              text-[#a9c7e6]
            "
          >
            Share ideas, ask
            <br />
            questions, plan your
            <br />
            project.
          </p>
        </div>

        {/* -----------------------------------------
            JOIN CALLS
        ----------------------------------------- */}

        <div className="w-[125px]">
          <div
            className="
              flex
              h-[56px]
              w-[56px]
              items-center
              justify-center
              rounded-[15px]
              border
              border-[#5793d3]/40
              bg-gradient-to-br
              from-[#2868ac]
              to-[#174d8b]
              shadow-[0_8px_25px_rgba(0,0,0,0.18)]
            "
          >
            <Video
              size={27}
              strokeWidth={1.8}
              className="text-[#e4f2ff]"
            />
          </div>

          <h3
            className="
              mt-[12px]
              whitespace-nowrap
              text-[14px]
              font-semibold
              text-white
            "
          >
            Join Calls
          </h3>

          <p
            className="
              mt-[5px]
              text-[12px]
              leading-[1.45]
              text-[#a9c7e6]
            "
          >
            Connect through voice
            <br />
            or video.
          </p>
        </div>

        {/* -----------------------------------------
            BUILD & GROW
        ----------------------------------------- */}

        <div className="w-[125px]">
          <div
            className="
              flex
              h-[56px]
              w-[56px]
              items-center
              justify-center
              rounded-[15px]
              border
              border-[#5793d3]/40
              bg-gradient-to-br
              from-[#2868ac]
              to-[#174d8b]
              shadow-[0_8px_25px_rgba(0,0,0,0.18)]
            "
          >
            <Rocket
              size={27}
              strokeWidth={1.8}
              className="text-[#e4f2ff]"
            />
          </div>

          <h3
            className="
              mt-[12px]
              whitespace-nowrap
              text-[14px]
              font-semibold
              text-white
            "
          >
            Build & Grow
          </h3>

          <p
            className="
              mt-[5px]
              text-[12px]
              leading-[1.45]
              text-[#a9c7e6]
            "
          >
            Turn your ideas into
            <br />
            real-world projects.
          </p>
        </div>
      </div>

      {/* =========================================
          CTA
      ========================================= */}

      <div
        className="
          mt-[31px]
          flex
          items-center
          gap-[15px]
        "
      >
        {/* Get Started */}

        <button
          type="button"
          className="
            group
            flex
            h-[56px]
            w-[182px]
            items-center
            justify-center
            gap-[22px]
            rounded-full
            bg-gradient-to-r
            from-[#79b6f0]
            to-[#2776d4]
            text-[16px]
            font-semibold
            text-white
            shadow-[0_12px_35px_rgba(35,111,201,0.35)]
            transition-transform
            duration-200
            hover:scale-[1.02]
          "
        >
          <span>Get Started</span>

          <ArrowRight
            size={21}
            strokeWidth={2}
            className="
              transition-transform
              duration-200
              group-hover:translate-x-1
            "
          />
        </button>

        {/* CTA supporting text */}

        <p
          className="
            text-[12px]
            leading-[1.45]
            text-[#8fb5dc]
          "
        >
          Your next big project
          <br />
          might be just a message away.
        </p>
      </div>
    </section>
  );
};

export default HeroContent;