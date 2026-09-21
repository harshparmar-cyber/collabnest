import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  Code2,
  FileText,
  Lightbulb,
  Plus,
  Rocket,
  Sparkles,
  Users,
  X,
} from "lucide-react";

type Role = "Frontend" | "Backend" | "UI/UX" | "AI/ML";

const PostProjectPage = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [skills, setSkills] = useState<string[]>([
    "React",
    "Node.js",
  ]);

  const [skillInput, setSkillInput] = useState("");

  const [projectType, setProjectType] =
    useState("Web Development");

  const [teamSize, setTeamSize] =
    useState("2-5 members");

  const [selectedRoles, setSelectedRoles] =
    useState<Role[]>(["Frontend", "UI/UX"]);

  const [isPosting, setIsPosting] = useState(false);

  const projectTitle = useMemo(() => {
    return title.trim() || "Your project title";
  }, [title]);

  const projectDescription = useMemo(() => {
    return (
      description.trim() ||
      "Your project description will appear here. Explain your idea clearly so students can understand what you want to build."
    );
  }, [description]);

  const addSkill = () => {
    const value = skillInput.trim();

    if (!value) return;

    if (
      skills.some(
        (skill) =>
          skill.toLowerCase() === value.toLowerCase()
      )
    ) {
      setSkillInput("");
      return;
    }

    setSkills((prev) => [...prev, value]);
    setSkillInput("");
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills((prev) =>
      prev.filter((skill) => skill !== skillToRemove)
    );
  };

  const handleSkillKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  const toggleRole = (role: Role) => {
    setSelectedRoles((prev) =>
      prev.includes(role)
        ? prev.filter((item) => item !== role)
        : [...prev, role]
    );
  };

  const handlePostProject = async () => {
    if (!title.trim()) {
      alert("Please enter a project title.");
      return;
    }

    if (!description.trim()) {
      alert("Please describe your project.");
      return;
    }

    if (skills.length === 0) {
      alert("Please add at least one required skill.");
      return;
    }

    if (selectedRoles.length === 0) {
      alert("Please select at least one role.");
      return;
    }

    setIsPosting(true);

    /*
      Later we will replace this with:

      fetch(`${API_URL}/api/projects`, {
        method: "POST",
        ...
      })
    */

    setTimeout(() => {
      setIsPosting(false);
      alert("Project posted successfully! 🚀");
      navigate("/dashboard");
    }, 900);
  };

  return (
   
  <motion.div
    initial={{
      opacity: 0,
      x: 40,
      scale: 0.99,
    }}
    animate={{
      opacity: 1,
      x: 0,
      scale: 1,
    }}
    exit={{
      opacity: 0,
      x: -20,
    }}
    transition={{
      duration: 0.3,
      ease: "easeOut",
    }}
    className="fixed inset-0 overflow-y-auto bg-[#06152f] text-white"
  >
      {/* =====================================================
          ANIMATED BACKGROUND
      ====================================================== */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="
            absolute
            -left-[180px]
            -top-[180px]
            h-[500px]
            w-[500px]
            animate-pulse
            rounded-full
            bg-[#087cff]/15
            blur-[100px]
          "
        />

        <div
          className="
            absolute
            right-[-180px]
            top-[18%]
            h-[480px]
            w-[480px]
            animate-pulse
            rounded-full
            bg-[#7c3aed]/15
            blur-[110px]
          "
          style={{
            animationDelay: "1.5s",
          }}
        />

        <div
          className="
            absolute
            bottom-[-220px]
            left-[35%]
            h-[500px]
            w-[500px]
            animate-pulse
            rounded-full
            bg-[#06b6d4]/10
            blur-[120px]
          "
          style={{
            animationDelay: "2.5s",
          }}
        />

        <div className="absolute inset-0 opacity-[0.08]">
          <div
            className="
              absolute
              left-[8%]
              top-[25%]
              h-2
              w-2
              animate-ping
              rounded-full
              bg-blue-300
            "
          />

          <div
            className="
              absolute
              left-[78%]
              top-[20%]
              h-1.5
              w-1.5
              animate-ping
              rounded-full
              bg-purple-300
            "
            style={{
              animationDelay: "1s",
            }}
          />

          <div
            className="
              absolute
              left-[88%]
              top-[65%]
              h-2
              w-2
              animate-ping
              rounded-full
              bg-cyan-300
            "
            style={{
              animationDelay: "2s",
            }}
          />

          <div
            className="
              absolute
              left-[18%]
              top-[78%]
              h-1.5
              w-1.5
              animate-ping
              rounded-full
              bg-blue-300
            "
            style={{
              animationDelay: "1.8s",
            }}
          />
        </div>
      </div>

      {/* =====================================================
          TOP NAVBAR
      ====================================================== */}

      <header
        className="
          sticky
          top-0
          z-50
          border-b
          border-white/10
          bg-[#06152f]/85
          backdrop-blur-xl
        "
      >
        <div
          className="
            mx-auto
            flex
            h-[64px]
            max-w-[1450px]
            items-center
            justify-between
            px-5
            md:px-8
          "
        >
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="
              flex
              items-center
              gap-2
              rounded-lg
              px-2
              py-2
              text-[12px]
              font-medium
              text-blue-100
              transition
              hover:bg-white/5
              hover:text-white
            "
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">
              Back to Dashboard
            </span>
            <span className="sm:hidden">Back</span>
          </button>

          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="text-[19px] font-extrabold tracking-tight"
          >
            <span className="text-white">Collab</span>
            <span className="text-[#69b3ff]">Nest</span>
          </button>

          <div
            className="
              hidden
              items-center
              gap-2
              text-[10px]
              text-blue-200/60
              md:flex
            "
          >
            <Sparkles size={13} />
            Build together. Grow together.
          </div>
        </div>
      </header>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <main
        className="
          relative
          z-10
          mx-auto
          w-full
          max-w-[1450px]
          px-4
          pb-10
          pt-7
          md:px-8
          md:pt-9
        "
      >
        {/* ===================================================
            HEADER
        ==================================================== */}

        <section className="mx-auto max-w-[1200px]">
          <div className="text-center">
            <div
              className="
                mb-3
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-blue-400/20
                bg-blue-400/10
                px-3
                py-1.5
                text-[10px]
                font-semibold
                uppercase
                tracking-[1.5px]
                text-blue-200
              "
            >
              <Rocket size={13} />
              Create a project
            </div>

            <h1
              className="
                text-[32px]
                font-extrabold
                tracking-[-1px]
                text-white
                sm:text-[40px]
                md:text-[46px]
              "
            >
              Bring your idea to{" "}
              <span
                className="
                  bg-gradient-to-r
                  from-[#54a9ff]
                  via-[#8ac8ff]
                  to-[#a78bfa]
                  bg-clip-text
                  text-transparent
                "
              >
                life
              </span>{" "}
              🚀
            </h1>

            <p
              className="
                mx-auto
                mt-2
                max-w-[620px]
                text-[12px]
                leading-5
                text-blue-100/65
                md:text-[13px]
              "
            >
              Share your idea and find students with the skills
              and passion to build it with you.
            </p>
          </div>

          {/* =================================================
              STEP INDICATOR
          ================================================== */}

          <div
            className="
              mx-auto
              mt-7
              flex
              max-w-[520px]
              items-center
              justify-center
            "
          >
            <Step
              number="1"
              title="Project Details"
              active
            />

            <div className="h-px w-[45px] bg-gradient-to-r from-blue-500/70 to-blue-400/20 sm:w-[80px]" />

            <Step
              number="2"
              title="Build Your Team"
            />

            <div className="h-px w-[45px] bg-blue-400/15 sm:w-[80px]" />

            <Step
              number="3"
              title="Publish"
            />
          </div>
        </section>

        {/* ===================================================
            MAIN GRID
        ==================================================== */}

        <section
          className="
            mx-auto
            mt-7
            grid
            max-w-[1200px]
            gap-5
            lg:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.8fr)]
          "
        >
          {/* =================================================
              LEFT COLUMN
          ================================================== */}

          <div className="space-y-5">
            {/* PROJECT DETAILS */}

            <div
              className="
                rounded-[20px]
                border
                border-blue-300/15
                bg-gradient-to-br
                from-[#122d58]/95
                to-[#0c2347]/95
                p-5
                shadow-[0_20px_60px_rgba(0,0,0,0.18)]
                backdrop-blur-xl
                md:p-6
              "
            >
              <SectionHeading
                icon={<Lightbulb size={17} />}
                iconClass="bg-blue-500/15 text-blue-300"
                title="Project details"
                subtitle="Give students a clear understanding of your idea."
              />

              <div className="mt-5 grid gap-4">
                {/* TITLE */}

                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label
                      htmlFor="project-title"
                      className="text-[11px] font-semibold text-blue-50"
                    >
                      Project title
                    </label>

                    <span className="text-[9px] text-blue-200/40">
                      Short & clear
                    </span>
                  </div>

                  <input
                    id="project-title"
                    value={title}
                    onChange={(e) =>
                      setTitle(e.target.value)
                    }
                    placeholder="e.g. AI Mock Interview Platform"
                    maxLength={80}
                    className="
                      h-[43px]
                      w-full
                      rounded-xl
                      border
                      border-blue-200/15
                      bg-[#081a38]/80
                      px-4
                      text-[12px]
                      text-white
                      outline-none
                      placeholder:text-blue-100/35
                      transition
                      focus:border-blue-400/70
                      focus:bg-[#0a2042]
                      focus:ring-2
                      focus:ring-blue-500/10
                    "
                  />
                </div>

                {/* DESCRIPTION */}

                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label
                      htmlFor="project-description"
                      className="text-[11px] font-semibold text-blue-50"
                    >
                      Description
                    </label>

                    <span className="text-[9px] text-blue-200/40">
                      {description.length}/500
                    </span>
                  </div>

                  <textarea
                    id="project-description"
                    value={description}
                    onChange={(e) =>
                      setDescription(e.target.value)
                    }
                    placeholder="Describe your project idea, what you want to build and what problem it solves..."
                    maxLength={500}
                    rows={4}
                    className="
                      min-h-[110px]
                      w-full
                      resize-none
                      rounded-xl
                      border
                      border-blue-200/15
                      bg-[#081a38]/80
                      px-4
                      py-3
                      text-[12px]
                      leading-5
                      text-white
                      outline-none
                      placeholder:text-blue-100/35
                      transition
                      focus:border-blue-400/70
                      focus:bg-[#0a2042]
                      focus:ring-2
                      focus:ring-blue-500/10
                    "
                  />

                  <div className="mt-1.5 flex items-center gap-1.5 text-[9px] text-blue-200/40">
                    <FileText size={11} />
                    Explain your idea in simple words.
                  </div>
                </div>
              </div>
            </div>

            {/* TEAM SECTION */}

            <div
              className="
                rounded-[20px]
                border
                border-purple-300/15
                bg-gradient-to-br
                from-[#172950]/95
                to-[#101e40]/95
                p-5
                shadow-[0_20px_60px_rgba(0,0,0,0.18)]
                backdrop-blur-xl
                md:p-6
              "
            >
              <SectionHeading
                icon={<Users size={17} />}
                iconClass="bg-purple-500/15 text-purple-300"
                title="Build your team"
                subtitle="Tell students what skills and roles you need."
              />

              {/* SKILLS */}

              <div className="mt-5">
                <label className="mb-1.5 block text-[11px] font-semibold text-blue-50">
                  Required skills
                </label>

                <div
                  className="
                    flex
                    min-h-[45px]
                    flex-wrap
                    items-center
                    gap-2
                    rounded-xl
                    border
                    border-blue-200/15
                    bg-[#081a38]/80
                    px-3
                    py-2
                    transition
                    focus-within:border-purple-400/60
                  "
                >
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="
                        inline-flex
                        items-center
                        gap-1
                        rounded-full
                        border
                        border-blue-300/20
                        bg-blue-500/15
                        px-2.5
                        py-1.5
                        text-[10px]
                        font-medium
                        text-blue-100
                      "
                    >
                      {skill}

                      <button
                        type="button"
                        onClick={() =>
                          removeSkill(skill)
                        }
                        className="
                          text-blue-200/60
                          transition
                          hover:text-white
                        "
                      >
                        <X size={11} />
                      </button>
                    </span>
                  ))}

                  <input
                    value={skillInput}
                    onChange={(e) =>
                      setSkillInput(e.target.value)
                    }
                    onKeyDown={handleSkillKeyDown}
                    placeholder="Type a skill..."
                    className="
                      min-w-[120px]
                      flex-1
                      bg-transparent
                      px-1
                      py-1
                      text-[11px]
                      text-white
                      outline-none
                      placeholder:text-blue-100/30
                    "
                  />

                  <button
                    type="button"
                    onClick={addSkill}
                    className="
                      inline-flex
                      items-center
                      gap-1
                      rounded-lg
                      border
                      border-blue-300/25
                      bg-blue-400/10
                      px-2.5
                      py-1.5
                      text-[10px]
                      font-semibold
                      text-blue-200
                      transition
                      hover:border-blue-300/50
                      hover:bg-blue-400/20
                    "
                  >
                    <Plus size={12} />
                    Add
                  </button>
                </div>
              </div>

              {/* PROJECT TYPE + TEAM SIZE */}

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <SelectBox
                  label="Project type"
                  value={projectType}
                  options={[
                    "Web Development",
                    "Mobile App",
                    "AI / Machine Learning",
                    "UI/UX Design",
                    "IoT / Hardware",
                    "Other",
                  ]}
                  onChange={setProjectType}
                />

                <SelectBox
                  label="Team size"
                  value={teamSize}
                  options={[
                    "1-2 members",
                    "2-5 members",
                    "5-10 members",
                    "10+ members",
                  ]}
                  onChange={setTeamSize}
                />
              </div>

              {/* ROLES */}

              <div className="mt-4">
                <label className="mb-2 block text-[11px] font-semibold text-blue-50">
                  Who are you looking for?
                </label>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {(
                    [
                      "Frontend",
                      "Backend",
                      "UI/UX",
                      "AI/ML",
                    ] as Role[]
                  ).map((role) => {
                    const selected =
                      selectedRoles.includes(role);

                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() =>
                          toggleRole(role)
                        }
                        className={`
                          flex
                          h-[42px]
                          items-center
                          justify-center
                          gap-2
                          rounded-xl
                          border
                          text-[10px]
                          font-semibold
                          transition-all
                          duration-200
                          ${
                            selected
                              ? "border-blue-400/60 bg-blue-500/20 text-blue-100 shadow-[0_0_18px_rgba(37,132,255,0.10)]"
                              : "border-white/10 bg-[#081a38]/70 text-blue-100/55 hover:border-blue-300/30 hover:bg-blue-500/10 hover:text-blue-100"
                          }
                        `}
                      >
                        <span
                          className={`
                            flex
                            h-4
                            w-4
                            items-center
                            justify-center
                            rounded-full
                            border
                            transition
                            ${
                              selected
                                ? "border-blue-300 bg-blue-500 text-white"
                                : "border-blue-100/25"
                            }
                          `}
                        >
                          {selected && (
                            <Check size={10} />
                          )}
                        </span>

                        {role}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
              RIGHT COLUMN — LIVE PREVIEW
          ================================================== */}

          <aside className="lg:sticky lg:top-[84px] lg:self-start">
            <div
              className="
                overflow-hidden
                rounded-[22px]
                border
                border-blue-300/20
                bg-gradient-to-br
                from-[#162e59]
                via-[#11264c]
                to-[#0b1c3b]
                shadow-[0_25px_70px_rgba(0,0,0,0.25)]
              "
            >
              {/* PREVIEW HEADER */}

              <div
                className="
                  flex
                  items-center
                  justify-between
                  border-b
                  border-white/10
                  px-5
                  py-4
                "
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="
                        h-2
                        w-2
                        animate-pulse
                        rounded-full
                        bg-emerald-400
                        shadow-[0_0_10px_rgba(52,211,153,0.8)]
                      "
                    />

                    <span className="text-[9px] font-bold uppercase tracking-[1.5px] text-emerald-300">
                      Live Preview
                    </span>
                  </div>

                  <h2 className="mt-1 text-[18px] font-bold text-white">
                    Your project card
                  </h2>
                </div>

                <div
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-xl
                    bg-purple-500/15
                    text-purple-300
                  "
                >
                  <Sparkles size={17} />
                </div>
              </div>

              {/* PROJECT PREVIEW */}

              <div className="p-4">
                <div
                  className="
                    rounded-[18px]
                    border
                    border-blue-200/15
                    bg-[#081a38]/80
                    p-4
                    shadow-[0_15px_40px_rgba(0,0,0,0.18)]
                  "
                >
                  {/* Icon + title */}

                  <div className="flex items-start gap-3">
                    <div
                      className="
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-purple-500/15
                        text-purple-300
                      "
                    >
                      <Code2 size={19} />
                    </div>

                    <div className="min-w-0">
                      <h3
                        className="
                          truncate
                          text-[14px]
                          font-bold
                          text-white
                        "
                      >
                        {projectTitle}
                      </h3>

                      <p className="mt-0.5 text-[9px] text-blue-200/45">
                        Looking for collaborators
                      </p>
                    </div>
                  </div>

                  {/* Description */}

                  <p
                    className="
                      mt-4
                      line-clamp-4
                      text-[10px]
                      leading-[1.6]
                      text-blue-100/60
                    "
                  >
                    {projectDescription}
                  </p>

                  {/* Skills */}

                  <div className="mt-4">
                    <p className="mb-2 text-[8px] font-bold uppercase tracking-[1px] text-blue-200/40">
                      Required skills
                    </p>

                    <div className="flex flex-wrap gap-1.5">
                      {skills.length > 0 ? (
                        skills.map((skill) => (
                          <span
                            key={skill}
                            className="
                              rounded-full
                              bg-blue-500/15
                              px-2
                              py-1
                              text-[8px]
                              font-medium
                              text-blue-200
                            "
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-[9px] text-blue-100/30">
                          Add some skills
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Looking for */}

                  <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
                    <div>
                      <p className="text-[8px] font-bold uppercase tracking-[1px] text-blue-200/40">
                        Looking for
                      </p>

                      <p className="mt-1 text-[9px] text-blue-100/65">
                        {selectedRoles.length > 0
                          ? selectedRoles.join(" • ")
                          : "Team members"}
                      </p>
                    </div>

                    <span className="rounded-full bg-purple-500/15 px-2 py-1 text-[8px] font-semibold text-purple-200">
                      {teamSize}
                    </span>
                  </div>

                  {/* Preview Button */}

                  <button
                    type="button"
                    className="
                      mt-4
                      flex
                      h-[38px]
                      w-full
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      bg-gradient-to-r
                      from-[#238cff]
                      to-[#6366f1]
                      text-[10px]
                      font-bold
                      text-white
                      shadow-lg
                      shadow-blue-900/30
                      transition
                      hover:-translate-y-[1px]
                    "
                  >
                    View Project
                    <ArrowRight size={13} />
                  </button>
                </div>

                {/* Helpful box */}

                <div
                  className="
                    mt-3
                    flex
                    items-start
                    gap-3
                    rounded-xl
                    border
                    border-blue-200/10
                    bg-white/[0.035]
                    p-3
                  "
                >
                  <div
                    className="
                      flex
                      h-8
                      w-8
                      shrink-0
                      items-center
                      justify-center
                      rounded-lg
                      bg-blue-500/10
                      text-blue-300
                    "
                  >
                    <Sparkles size={14} />
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold text-blue-50">
                      Make your project stand out
                    </p>

                    <p className="mt-0.5 text-[9px] leading-4 text-blue-100/45">
                      Clear titles and descriptions help
                      you find better collaborators.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </section>

        {/* ===================================================
            BOTTOM ACTION BAR
        ==================================================== */}

        <section
          className="
            mx-auto
            mt-5
            max-w-[1200px]
            rounded-[18px]
            border
            border-white/10
            bg-white/[0.035]
            px-4
            py-3
            backdrop-blur-xl
            md:px-5
          "
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <div
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-lg
                  bg-white/5
                  text-blue-200/60
                "
              >
                <BriefcaseBusiness size={15} />
              </div>

              <div>
                <p className="text-[10px] font-semibold text-blue-50">
                  Almost there!
                </p>

                <p className="text-[9px] text-blue-100/40">
                  You can edit your project after posting.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() =>
                  navigate("/dashboard")
                }
                className="
                  rounded-xl
                  px-4
                  py-2.5
                  text-[10px]
                  font-semibold
                  text-blue-100/60
                  transition
                  hover:bg-white/5
                  hover:text-white
                "
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handlePostProject}
                disabled={isPosting}
                className="
                  group
                  flex
                  min-w-[145px]
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-gradient-to-r
                  from-[#1684ff]
                  via-[#287cff]
                  to-[#6366f1]
                  px-5
                  py-2.5
                  text-[10px]
                  font-bold
                  text-white
                  shadow-[0_8px_25px_rgba(37,120,255,0.28)]
                  transition-all
                  duration-200
                  hover:-translate-y-[2px]
                  hover:shadow-[0_12px_30px_rgba(37,120,255,0.4)]
                  active:translate-y-0
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {isPosting ? (
                  <>
                    <span
                      className="
                        h-3
                        w-3
                        animate-spin
                        rounded-full
                        border-2
                        border-white/30
                        border-t-white
                      "
                    />
                    Posting...
                  </>
                ) : (
                  <>
                    <Rocket
                      size={14}
                      className="
                        transition-transform
                        duration-200
                        group-hover:-translate-y-0.5
                        group-hover:rotate-[-8deg]
                      "
                    />
                    Post Project
                    <ArrowRight size={13} />
                  </>
                )}
              </button>
            </div>
          </div>
        </section>
      </main>
    </motion.div>
  );
};

/* =========================================================
   STEP COMPONENT
========================================================= */

interface StepProps {
  number: string;
  title: string;
  active?: boolean;
}

const Step = ({
  number,
  title,
  active = false,
}: StepProps) => {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`
          flex
          h-7
          w-7
          shrink-0
          items-center
          justify-center
          rounded-full
          border
          text-[10px]
          font-bold
          transition
          ${
            active
              ? "border-blue-300 bg-blue-500/20 text-blue-200 shadow-[0_0_20px_rgba(59,130,246,0.25)]"
              : "border-blue-200/15 bg-white/5 text-blue-100/35"
          }
        `}
      >
        {number}
      </div>

      <span
        className={`
          hidden
          whitespace-nowrap
          text-[9px]
          font-medium
          sm:block
          ${
            active
              ? "text-blue-100"
              : "text-blue-100/35"
          }
        `}
      >
        {title}
      </span>
    </div>
  );
};

/* =========================================================
   SECTION HEADING
========================================================= */

interface SectionHeadingProps {
  icon: React.ReactNode;
  iconClass: string;
  title: string;
  subtitle: string;
}

const SectionHeading = ({
  icon,
  iconClass,
  title,
  subtitle,
}: SectionHeadingProps) => {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`
          flex
          h-10
          w-10
          shrink-0
          items-center
          justify-center
          rounded-xl
          ${iconClass}
        `}
      >
        {icon}
      </div>

      <div>
        <h2 className="text-[14px] font-bold text-white md:text-[15px]">
          {title}
        </h2>

        <p className="mt-0.5 text-[9px] text-blue-100/45 md:text-[10px]">
          {subtitle}
        </p>
      </div>
    </div>
  );
};

/* =========================================================
   SELECT BOX
========================================================= */

interface SelectBoxProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

const SelectBox = ({
  label,
  value,
  options,
  onChange,
}: SelectBoxProps) => {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-semibold text-blue-50">
        {label}
      </label>

      <div className="relative">
        <select
          value={value}
          onChange={(e) =>
            onChange(e.target.value)
          }
          className="
            h-[43px]
            w-full
            appearance-none
            rounded-xl
            border
            border-blue-200/15
            bg-[#081a38]/80
            px-4
            pr-10
            text-[11px]
            text-blue-50
            outline-none
            transition
            focus:border-blue-400/60
            focus:ring-2
            focus:ring-blue-500/10
          "
        >
          {options.map((option) => (
            <option
              key={option}
              value={option}
              className="bg-[#0b1d3d] text-white"
            >
              {option}
            </option>
          ))}
        </select>

        <ChevronDown
          size={14}
          className="
            pointer-events-none
            absolute
            right-3
            top-1/2
            -translate-y-1/2
            text-blue-200/50
          "
        />
      </div>
    </div>
  );
};

export default PostProjectPage;