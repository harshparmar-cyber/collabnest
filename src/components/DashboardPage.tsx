import {
  Bell,
  BriefcaseBusiness,
  ChevronRight,
  FilePlus2,
  Home,
  MessageCircle,
  Mic,
  Code,
  Phone,
  Plus,
  Rocket,
  Search,
  Settings,
  Sparkles,
  Star,
  Users,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import students from "../assets/students.png";

type SidebarItemProps = {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  badge?: string;
  onClick?: () => void;
};

const SidebarItem = ({
  icon,
  label,
  active = false,
  badge,
  onClick,
}: SidebarItemProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        mb-2
        flex
        h-[54px]
        w-full
        items-center
        gap-4
        rounded-xl
        px-5
        text-left
        transition
        duration-200
        ${
          active
            ? "bg-white/15 text-white shadow-sm"
            : "text-blue-100 hover:bg-white/10 hover:text-white"
        }
      `}
    >
      <span className="shrink-0">{icon}</span>

      <span className="flex-1 text-[13px] font-semibold">
        {label}
      </span>

      {badge && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#1684ff] px-1.5 text-[9px] font-bold text-white">
          {badge}
        </span>
      )}
    </button>
  );
};

type QuickActionCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  iconClass: string;
  arrowClass: string;
  onClick?: () => void;
};

const QuickActionCard = ({
  icon,
  title,
  description,
  iconClass,
  arrowClass,
  onClick,
}: QuickActionCardProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        group
        rounded-2xl
        border
        border-blue-100
        bg-white
        p-5
        text-left
        shadow-sm
        transition
        duration-200
        hover:-translate-y-1
        hover:shadow-md
      "
    >
      <div className="flex items-start justify-between">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full ${arrowClass} transition group-hover:translate-x-1`}
        >
          <ChevronRight size={18} />
        </div>
      </div>

      <h3 className="mt-5 text-[16px] font-bold text-[#123d78]">
        {title}
      </h3>

      <p className="mt-2 max-w-[250px] text-[11px] leading-5 text-gray-500">
        {description}
      </p>
    </button>
  );
};

type ProjectCardProps = {
  icon: React.ReactNode;
  iconClass: string;
  title: string;
  description: string;
  tags: string[];
};

const ProjectCard = ({
  icon,
  iconClass,
  title,
  description,
  tags,
}: ProjectCardProps) => {
  return (
    <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
      <div className="flex gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-bold text-[#123d78]">
            {title}
          </h3>

          <p className="mt-2 line-clamp-2 text-[11px] leading-5 text-gray-500">
            {description}
          </p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-blue-50 px-2.5 py-1 text-[9px] font-semibold text-[#2580d8]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
        <span className="text-[9px] text-gray-400">
          Posted recently
        </span>

        <button
          type="button"
          className="text-[10px] font-semibold text-[#1684ff] hover:underline"
        >
          View Project →
        </button>
      </div>
    </div>
  );
};

type Collaborator = {
  initials: string;
  name: string;
  role: string;
  skills: string[];
};

const collaborators: Collaborator[] = [
  {
    initials: "SP",
    name: "Sneha Patel",
    role: "Frontend Developer",
    skills: ["React", "UI/UX"],
  },
  {
    initials: "AS",
    name: "Aditya Singh",
    role: "Backend Developer",
    skills: ["Node.js", "MongoDB"],
  },
  {
    initials: "NG",
    name: "Neha Gupta",
    role: "UI/UX Designer",
    skills: ["Figma", "Design"],
  },
  {
    initials: "RV",
    name: "Rajat Verma",
    role: "Full Stack Developer",
    skills: ["React", "Node.js"],
  },
];

const DashboardPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f5f9ff] text-[#12355b]">
      {/* =====================================================
          TOP NAVBAR
      ===================================================== */}
      <header className="fixed left-0 right-0 top-0 z-50 h-[70px] bg-gradient-to-r from-[#073b88] to-[#0b4da5] text-white shadow-lg">
        <div className="flex h-full items-center">

          {/* Logo */}
          <div className="flex w-[240px] shrink-0 items-center gap-3 px-7">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1684ff] shadow-lg">
              <Users size={23} strokeWidth={2.5} />
            </div>

            <span className="text-[22px] font-bold tracking-[-0.8px]">
              Collab<span className="text-[#74b9ff]">Nest</span>
            </span>
          </div>

          {/* Search */}
          <div className="flex flex-1 items-center justify-center px-5">
            <div className="flex h-[44px] w-full max-w-[580px] items-center gap-3 rounded-full bg-white/10 px-5 backdrop-blur-md">
              <Search
                size={19}
                className="text-white/80"
              />

              <input
                type="text"
                placeholder="Search projects, skills, or students..."
                className="
                  w-full
                  bg-transparent
                  text-[13px]
                  text-white
                  outline-none
                  placeholder:text-white/60
                "
              />
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4 px-6">

            <button
              type="button"
              className="relative flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-white/10"
            >
              <Bell size={21} />

              <span className="absolute right-0 top-0 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#ff5757] px-1 text-[9px] font-bold">
                3
              </span>
            </button>

            <button
              type="button"
              className="flex items-center gap-3 rounded-full px-2 py-1 transition hover:bg-white/10"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#7cc4ff] to-[#2378d8] text-[13px] font-bold">
                H
              </div>

              <span className="hidden text-[13px] font-semibold lg:block">
                Harsh Parmar
              </span>

              <ChevronRight
                size={15}
                className="hidden rotate-90 lg:block"
              />
            </button>

          </div>
        </div>
      </header>

      {/* =====================================================
          SIDEBAR
      ===================================================== */}
      <aside className="fixed bottom-0 left-0 top-[70px] z-40 hidden w-[240px] flex-col bg-gradient-to-b from-[#073b88] to-[#062f70] text-white md:flex">

        <nav className="flex-1 px-3 py-5">

          <SidebarItem
            icon={<Home size={20} />}
            label="Dashboard"
            active
            onClick={() => navigate("/dashboard")}
          />

          <SidebarItem
            icon={<BriefcaseBusiness size={20} />}
            label="Explore Projects"
          />

          <SidebarItem
            icon={<Plus size={21} />}
            label="Post a Project"
            onClick={() => navigate("/post-project")}
          />

          <SidebarItem
            icon={<Users size={20} />}
            label="My Collaborations"
          />

          <SidebarItem
            icon={<MessageCircle size={20} />}
            label="Messages"
            badge="2"
          />

          <SidebarItem
            icon={<Phone size={20} />}
            label="Calls"
          />

          <SidebarItem
            icon={<Mic size={20} />}
            label="Interview"
          />

          <SidebarItem
            icon={<Settings size={20} />}
            label="Settings"
          />

        </nav>

        {/* Sidebar CTA */}
        <div className="mx-4 mb-5 rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-sm">

          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#1684ff]">
            <Rocket size={21} />
          </div>

          <h3 className="text-[14px] font-bold">
            Build something amazing!
          </h3>

          <p className="mt-2 text-[11px] leading-5 text-blue-100/80">
            Your next big project could start with a single message.
          </p>

          <button
            type="button"
            className="mt-4 flex h-8 w-8 items-center justify-center rounded-full bg-[#1684ff] transition hover:scale-105"
          >
            <ChevronRight size={16} />
          </button>

        </div>
      </aside>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}
      <main className="h-screen overflow-y-auto pt-[70px] md:ml-[240px]">

        <div className="mx-auto max-w-[1500px] p-5 md:p-7">

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_310px]">

            {/* =================================================
                LEFT CONTENT
            ================================================= */}
            <section>

              {/* =================================================
                  WELCOME BANNER
              ================================================= */}
              <div className="relative min-h-[270px] overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-[#eaf5ff] via-[#dceeff] to-[#c9e4ff] p-7 shadow-sm">

                {/* Background shapes */}
                <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/30" />

                <div className="absolute bottom-[-90px] right-[35%] h-52 w-52 rounded-full bg-[#8cc6ff]/20" />

                {/* Text content */}
                <div className="relative z-20 max-w-[540px]">

                  <h1 className="text-[30px] font-bold leading-tight tracking-[-1px] text-[#103b76] md:text-[34px]">
                    Welcome back, Harsh!{" "}
                    <span>👋</span>
                  </h1>

                  <p className="mt-3 max-w-[520px] text-[14px] leading-6 text-[#315f96]">
                    Great to see you again! Find collaborators,
                    explore projects!
                  </p>

                  {/* Search */}
                  <div className="mt-6 flex h-[50px] w-full max-w-[520px] items-center gap-3 rounded-full bg-white px-4 shadow-md">

                    <Search
                      size={20}
                      className="shrink-0 text-[#5595d8]"
                    />

                    <input
                      type="text"
                      placeholder="Search projects, skills or students..."
                      className="
                        w-full
                        min-w-0
                        bg-transparent
                        text-[12px]
                        text-[#315f96]
                        outline-none
                        placeholder:text-gray-400
                      "
                    />

                    <button
                      type="button"
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1684ff] text-white transition hover:scale-105"
                    >
                      <Search size={18} />
                    </button>

                  </div>
                </div>

                {/* STUDENTS IMAGE */}
                <div className="pointer-events-none absolute bottom-0 right-[-5px] z-10 flex h-[245px] w-[52%] items-end justify-end">

                  <img
                    src={students}
                    alt="Students collaborating"
                    className="
                      h-full
                      w-auto
                      max-w-none
                      object-contain
                      object-bottom
                    "
                  />

                </div>

              </div>

              {/* =================================================
                  QUICK ACTIONS
              ================================================= */}
              <div className="mt-6 grid gap-4 md:grid-cols-3">

                <QuickActionCard
                  icon={<FilePlus2 size={23} />}
                  title="Post a Project"
                  description="Share your idea and find like-minded collaborators."
                  iconClass="bg-blue-100 text-blue-600"
                  arrowClass="bg-blue-100 text-blue-600"
                  onClick={() => navigate("/post-project")}
                />

                <QuickActionCard
                  icon={<Users size={23} />}
                  title="Find Collaborators"
                  description="Connect with students who share your interests."
                  iconClass="bg-purple-100 text-purple-600"
                  arrowClass="bg-purple-100 text-purple-600"
                />

                <QuickActionCard
                  icon={<MessageCircle size={23} />}
                  title="Start a Conversation"
                  description="Chat, discuss and build together."
                  iconClass="bg-emerald-100 text-emerald-600"
                  arrowClass="bg-emerald-100 text-emerald-600"
                />

              </div>

              {/* =================================================
                  FEATURED PROJECTS
              ================================================= */}
              <div className="mt-8">

                <div className="mb-4 flex items-center justify-between">

                  <div className="flex items-center gap-3">
                    <Star
                      size={25}
                      fill="currentColor"
                      className="text-[#126bc5]"
                    />

                    <h2 className="text-[21px] font-bold text-[#123d78]">
                      Featured Projects
                    </h2>
                  </div>

                  <button
                    type="button"
                    className="flex items-center gap-1 text-[11px] font-semibold text-[#0878e8] hover:underline"
                  >
                    View All
                    <ChevronRight size={14} />
                  </button>

                </div>

                <div className="grid gap-4 lg:grid-cols-2">

                  <ProjectCard
                    icon={<span className="text-[22px]">&lt;/&gt;</span>}
                    iconClass="bg-purple-100 text-purple-600"
                    title="AI Mock Interview Platform"
                    description="Build an AI-powered mock interview platform using React, Node.js and Gemini API."
                    tags={[
                      "React",
                      "Node.js",
                      "Gemini",
                      "AI",
                    ]}
                  />

                  <ProjectCard
                    icon={<Sparkles size={22} />}
                    iconClass="bg-emerald-100 text-emerald-600"
                    title="College Event Management App"
                    description="A full-stack web app to manage college events, registrations and notifications."
                    tags={[
                      "React",
                      "Firebase",
                      "Tailwind",
                      "MongoDB",
                    ]}
                  />

                  <ProjectCard
                    icon={<Code size={22} />}
                    iconClass="bg-blue-100 text-blue-600"
                    title="Student Expense Tracker"
                    description="A simple application for students to manage expenses and understand their spending habits."
                    tags={[
                      "React",
                      "Node.js",
                      "MongoDB",
                    ]}
                  />

                  <ProjectCard
                    icon={<Zap size={22} />}
                    iconClass="bg-orange-100 text-orange-600"
                    title="Smart Campus Assistant"
                    description="An intelligent campus assistant that helps students find information and services."
                    tags={[
                      "AI",
                      "React",
                      "Python",
                    ]}
                  />

                </div>

              </div>

            </section>

            {/* =================================================
                RIGHT SIDEBAR
            ================================================= */}
            <aside className="space-y-5">

              {/* =================================================
                  PROFILE COMPLETION
              ================================================= */}
              <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">

                <h2 className="text-[17px] font-bold text-[#123d78]">
                  Profile Completion
                </h2>

                <div className="mt-5 flex items-center gap-5">

                  {/* Progress circle */}
                  <div className="relative flex h-[92px] w-[92px] shrink-0 items-center justify-center rounded-full border-[9px] border-blue-100">

                    <div className="absolute inset-[-9px] rounded-full border-[9px] border-transparent border-l-[#1684ff] border-t-[#1684ff] border-r-[#1684ff] rotate-[25deg]" />

                    <span className="text-[17px] font-bold text-[#123d78]">
                      70%
                    </span>

                  </div>

                  <p className="text-[11px] leading-5 text-gray-500">
                    Complete your profile to get better matches and opportunities.
                  </p>

                </div>

                <button
                  type="button"
                  className="mt-5 flex h-[45px] w-full items-center justify-center gap-2 rounded-xl bg-[#1684ff] text-[12px] font-bold text-white transition hover:bg-[#0874e8]"
                >
                  Complete Profile
                  <ChevronRight size={16} />
                </button>

              </div>

              {/* =================================================
                  SUGGESTED COLLABORATORS
              ================================================= */}
              <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">

                <div className="flex items-center justify-between">

                  <h2 className="text-[17px] font-bold text-[#123d78]">
                    Suggested Collaborators
                  </h2>

                  <button
                    type="button"
                    className="text-[10px] font-semibold text-[#0878e8]"
                  >
                    View All →
                  </button>

                </div>

                <div className="mt-5 space-y-5">

                  {collaborators.map((person) => (
                    <div
                      key={person.name}
                      className="flex items-center gap-3"
                    >

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#70b9f5] to-[#277bc9] text-[10px] font-bold text-white">
                        {person.initials}
                      </div>

                      <div className="min-w-0 flex-1">

                        <h3 className="truncate text-[11px] font-bold text-[#123d78]">
                          {person.name}
                        </h3>

                        <p className="mt-0.5 truncate text-[9px] text-gray-400">
                          {person.role}
                        </p>

                        <div className="mt-1 flex gap-1">

                          {person.skills.map((skill) => (
                            <span
                              key={skill}
                              className="rounded-full bg-blue-50 px-2 py-0.5 text-[7px] font-semibold text-[#4d8dca]"
                            >
                              {skill}
                            </span>
                          ))}

                        </div>

                      </div>

                      <button
                        type="button"
                        className="shrink-0 rounded-lg border border-blue-200 px-3 py-1.5 text-[9px] font-semibold text-[#1684ff] transition hover:bg-blue-50"
                      >
                        Connect
                      </button>

                    </div>
                  ))}

                </div>

              </div>

              {/* =================================================
                  RECENT ACTIVITY
              ================================================= */}
              <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">

                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-2">
                    <Zap
                      size={19}
                      fill="currentColor"
                      className="text-[#1769b9]"
                    />

                    <h2 className="text-[17px] font-bold text-[#123d78]">
                      Recent Activity
                    </h2>
                  </div>

                  <button
                    type="button"
                    className="text-[10px] font-semibold text-[#0878e8]"
                  >
                    View All →
                  </button>

                </div>

                <div className="mt-5 space-y-4">

                  <ActivityItem
                    icon={<MessageCircle size={15} />}
                    text="You received a new collaboration request."
                    time="10 min ago"
                  />

                  <ActivityItem
                    icon={<Users size={15} />}
                    text="Someone viewed your project."
                    time="1 hour ago"
                  />

                  <ActivityItem
                    icon={<Star size={15} />}
                    text="Your project was featured."
                    time="3 hours ago"
                  />

                </div>

              </div>

            </aside>

          </div>

        </div>

      </main>

    </div>
  );
};

type ActivityItemProps = {
  icon: React.ReactNode;
  text: string;
  time: string;
};

const ActivityItem = ({
  icon,
  text,
  time,
}: ActivityItemProps) => {
  return (
    <div className="flex gap-3">

      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#1684ff]">
        {icon}
      </div>

      <div>
        <p className="text-[10px] leading-4 text-gray-600">
          {text}
        </p>

        <span className="text-[8px] text-gray-400">
          {time}
        </span>
      </div>

    </div>
  );
};

export default DashboardPage;