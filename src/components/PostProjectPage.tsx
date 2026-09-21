import {
  ArrowLeft,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  Plus,
  Rocket,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const PostProjectPage = () => {
  const navigate = useNavigate();

  const [skills, setSkills] = useState<string[]>([
    "React",
    "Node.js",
  ]);

  const [skillInput, setSkillInput] = useState("");

  const [lookingFor, setLookingFor] = useState<string[]>([
    "Frontend",
    "Backend",
  ]);

  const addSkill = () => {
    const skill = skillInput.trim();

    if (!skill) return;

    if (!skills.includes(skill)) {
      setSkills([...skills, skill]);
    }

    setSkillInput("");
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((item) => item !== skill));
  };

  const toggleLookingFor = (role: string) => {
    if (lookingFor.includes(role)) {
      setLookingFor(
        lookingFor.filter((item) => item !== role)
      );
    } else {
      setLookingFor([...lookingFor, role]);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f9ff] text-[#12355b]">

      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-50 flex h-[70px] items-center justify-between border-b border-blue-100 bg-white px-5 shadow-sm md:px-10">

        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-[13px] font-semibold text-[#315f96] transition hover:text-[#0878e8]"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        <div className="text-[20px] font-bold tracking-[-0.7px]">
          <span className="text-[#0759bd]">Collab</span>
          <span className="text-[#6ca9e8]">Nest</span>
        </div>
      </header>

      {/* ================= MAIN ================= */}
      <main className="mx-auto max-w-[1050px] px-5 py-8 md:px-8 md:py-10">

        {/* Heading */}
        <div className="mb-8">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-[#0878e8]">
            <Rocket size={24} />
          </div>

          <h1 className="text-[30px] font-bold tracking-[-1px] text-[#123d78] md:text-[36px]">
            Post a Project 🚀
          </h1>

          <p className="mt-2 max-w-[650px] text-[13px] leading-6 text-gray-500">
            Share your idea and find students who are interested in
            building it with you.
          </p>
        </div>

        {/* ================= FORM CARD ================= */}
        <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm md:p-8">

          {/* Project Title */}
          <div>
            <label className="text-[13px] font-bold text-[#123d78]">
              Project Title
            </label>

            <input
              type="text"
              placeholder="e.g. AI Mock Interview Platform"
              className="
                mt-2
                h-[48px]
                w-full
                rounded-xl
                border
                border-gray-200
                bg-[#fbfdff]
                px-4
                text-[13px]
                text-[#12355b]
                outline-none
                transition
                placeholder:text-gray-400
                focus:border-[#1684ff]
                focus:ring-2
                focus:ring-blue-100
              "
            />
          </div>

          {/* Description */}
          <div className="mt-6">
            <label className="text-[13px] font-bold text-[#123d78]">
              Project Description
            </label>

            <textarea
              rows={5}
              placeholder="Describe your project idea, what you want to build and what problem it solves..."
              className="
                mt-2
                w-full
                resize-none
                rounded-xl
                border
                border-gray-200
                bg-[#fbfdff]
                p-4
                text-[13px]
                leading-6
                text-[#12355b]
                outline-none
                transition
                placeholder:text-gray-400
                focus:border-[#1684ff]
                focus:ring-2
                focus:ring-blue-100
              "
            />
          </div>

          {/* ================= SKILLS ================= */}
          <div className="mt-6">
            <label className="text-[13px] font-bold text-[#123d78]">
              Required Skills
            </label>

            <div className="mt-2 flex min-h-[48px] flex-wrap items-center gap-2 rounded-xl border border-gray-200 bg-[#fbfdff] p-2.5">

              {skills.map((skill) => (
                <span
                  key={skill}
                  className="flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1.5 text-[10px] font-semibold text-[#1768b8]"
                >
                  {skill}

                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="transition hover:text-red-500"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}

              <input
                type="text"
                value={skillInput}
                onChange={(e) =>
                  setSkillInput(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill();
                  }
                }}
                placeholder="Add a skill..."
                className="min-w-[130px] flex-1 bg-transparent px-2 py-1 text-[11px] outline-none placeholder:text-gray-400"
              />

              <button
                type="button"
                onClick={addSkill}
                className="flex h-8 items-center gap-1 rounded-lg bg-[#1684ff] px-3 text-[10px] font-semibold text-white transition hover:bg-[#0874e8]"
              >
                <Plus size={13} />
                Add
              </button>
            </div>

            <p className="mt-2 text-[10px] text-gray-400">
              Press Enter or click Add to add a skill.
            </p>
          </div>

          {/* ================= PROJECT TYPE + TEAM SIZE ================= */}
          <div className="mt-6 grid gap-5 md:grid-cols-2">

            {/* Project Type */}
            <div>
              <label className="text-[13px] font-bold text-[#123d78]">
                Project Type
              </label>

              <div className="relative mt-2">
                <BriefcaseBusiness
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5595d8]"
                />

                <select
                  className="
                    h-[48px]
                    w-full
                    appearance-none
                    rounded-xl
                    border
                    border-gray-200
                    bg-[#fbfdff]
                    pl-11
                    pr-10
                    text-[12px]
                    text-[#315f96]
                    outline-none
                    focus:border-[#1684ff]
                    focus:ring-2
                    focus:ring-blue-100
                  "
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select project type
                  </option>
                  <option>Web Development</option>
                  <option>Mobile App</option>
                  <option>AI / Machine Learning</option>
                  <option>UI / UX Design</option>
                  <option>Cybersecurity</option>
                  <option>Other</option>
                </select>

                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
              </div>
            </div>

            {/* Team Size */}
            <div>
              <label className="text-[13px] font-bold text-[#123d78]">
                Team Size
              </label>

              <div className="relative mt-2">
                <Users
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5595d8]"
                />

                <select
                  className="
                    h-[48px]
                    w-full
                    appearance-none
                    rounded-xl
                    border
                    border-gray-200
                    bg-[#fbfdff]
                    pl-11
                    pr-10
                    text-[12px]
                    text-[#315f96]
                    outline-none
                    focus:border-[#1684ff]
                    focus:ring-2
                    focus:ring-blue-100
                  "
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select team size
                  </option>
                  <option>2 - 3 members</option>
                  <option>3 - 5 members</option>
                  <option>5 - 8 members</option>
                  <option>8+ members</option>
                </select>

                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
              </div>
            </div>
          </div>

          {/* ================= LOOKING FOR ================= */}
          <div className="mt-7">
            <label className="text-[13px] font-bold text-[#123d78]">
              I'm Looking For
            </label>

            <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">

              {[
                "Frontend",
                "Backend",
                "UI/UX",
                "AI/ML",
              ].map((role) => {
                const selected =
                  lookingFor.includes(role);

                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() =>
                      toggleLookingFor(role)
                    }
                    className={`flex h-[48px] items-center gap-3 rounded-xl border px-4 text-left text-[11px] font-semibold transition ${
                      selected
                        ? "border-blue-300 bg-blue-50 text-[#0878e8]"
                        : "border-gray-200 bg-[#fbfdff] text-gray-500 hover:border-blue-200"
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-md border ${
                        selected
                          ? "border-[#1684ff] bg-[#1684ff] text-white"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {selected && (
                        <Check size={13} />
                      )}
                    </span>

                    {role}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ================= DIVIDER ================= */}
          <div className="my-8 h-px bg-gray-100" />

          {/* ================= ACTIONS ================= */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="
                h-[46px]
                rounded-xl
                border
                border-gray-200
                px-6
                text-[12px]
                font-semibold
                text-gray-500
                transition
                hover:bg-gray-50
              "
            >
              Cancel
            </button>

            <button
              type="button"
              className="
                flex
                h-[46px]
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-gradient-to-r
                from-[#1684ff]
                to-[#0759bd]
                px-7
                text-[12px]
                font-bold
                text-white
                shadow-lg
                shadow-blue-200
                transition
                hover:-translate-y-[1px]
                hover:shadow-xl
                active:translate-y-0
              "
            >
              <Rocket size={16} />
              Post Project
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PostProjectPage;
