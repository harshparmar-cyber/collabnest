import {
  Bell,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  Code,
  FilePlus2,
  Home,
  Lightbulb,
  MessageCircle,
  Mic,
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

import students from "../assets/students.png";

const DashboardPage = () => {
  return (
    <div className="min-h-screen bg-[#f5f9ff] text-[#12355b]">
      {/* =========================================================
          TOP NAVBAR
      ========================================================= */}
      <header className="fixed left-0 right-0 top-0 z-50 h-[70px] bg-gradient-to-r from-[#073b88] to-[#0b4da5] text-white shadow-lg">
        <div className="flex h-full items-center">
          {/* Logo */}
          <div className="flex w-[240px] shrink-0 items-center gap-3 px-7">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1684ff] shadow-lg">
              <Users size={22} strokeWidth={2.5} />
            </div>

            <span className="text-[22px] font-bold tracking-[-0.8px]">
              Collab<span className="text-[#74b9ff]">Nest</span>
            </span>
          </div>

          {/* Top Search */}
          <div className="flex flex-1 items-center justify-center px-5">
            <div className="flex h-[42px] w-full max-w-[510px] items-center gap-3 rounded-full bg-white/10 px-5 backdrop-blur-md transition hover:bg-white/15">
              <Search size={19} className="text-white/80" />

              <input
                type="text"
                placeholder="Search projects, skills, or students..."
                className="w-full bg-transparent text-[13px] text-white outline-none placeholder:text-white/60"
              />
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-5 px-6">
            <button
              type="button"
              className="relative flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-white/10"
            >
              <Bell size={20} />

              <span className="absolute right-0 top-0 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#ff5757] px-1 text-[9px] font-bold">
                3
              </span>
            </button>

            <button
              type="button"
              className="flex items-center gap-3 rounded-full px-1 py-1 transition hover:bg-white/10"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#7cc4ff] to-[#2378d8] text-[13px] font-bold">
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

      {/* =========================================================
          SIDEBAR
      ========================================================= */}
      <aside className="fixed bottom-0 left-0 top-[70px] z-40 hidden w-[240px] flex-col bg-gradient-to-b from-[#073b88] to-[#062f70] text-white md:flex">
        <nav className="flex-1 px-3 py-5">
          <SidebarItem
            icon={<Home size={20} />}
            label="Dashboard"
            active
          />

          <SidebarItem
            icon={<BriefcaseBusiness size={20} />}
            label="Explore Projects"
          />

          <SidebarItem
            icon={<Plus size={21} />}
            label="Post a Project"
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

        {/* Bottom CTA */}
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

      {/* =========================================================
          MAIN CONTENT
      ========================================================= */}
      <main className="h-screen overflow-y-auto pt-[70px] md:ml-[240px]">
        <div className="mx-auto max-w-[1500px] p-5 md:p-7">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_310px]">

            {/* =====================================================
                LEFT CONTENT
            ===================================================== */}
            <section>

              {/* ===================================================
                  WELCOME BANNER
              =================================================== */}
              <div className="relative min-h-[240px] overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-[#eaf5ff] via-[#dceeff] to-[#c9e4ff] p-7 shadow-sm">

                {/* Decorative circles */}
                <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-white/30" />

                <div className="absolute bottom-[-80px] right-[35%] h-48 w-48 rounded-full bg-[#8cc6ff]/20" />

                {/* LEFT CONTENT */}
                <div className="relative z-20 w-full max-w-[520px]">
                  <h1 className="text-[30px] font-bold leading-tight tracking-[-1px] text-[#103b76] md:text-[32px]">
                    Welcome back, Harsh!{" "}
                    <span className="inline-block">👋</span>
                  </h1>

                  <p className="mt-3 max-w-[500px] text-[14px] leading-6 text-[#315f96]">
                    Great to see you again! Find collaborators & explore
                    projects
                  </p>

                  {/* Search */}
                  <div className="mt-6 flex h-[48px] w-full max-w-[470px] items-center gap-3 rounded-full bg-white px-4 shadow-md">
                    <Search
                      size={19}
                      className="shrink-0 text-[#5595d8]"
                    />

                    <input
                      type="text"
                      placeholder="Search projects, skills or students..."
                      className="w-full min-w-0 bg-transparent text-[12px] text-[#12355b] outline-none placeholder:text-gray-400"
                    />

                    <button
                      type="button"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1684ff] text-white transition hover:bg-[#0874e8]"
                    >
                      <Search size={17} />
                    </button>
                  </div>
                </div>

                {/* =================================================
                    STUDENTS PNG
                ================================================= */}
                <div className="absolute bottom-0 right-[-5px] hidden w-[360px] lg:block xl:w-[400px]">
                  <img
                    src={students}
                    alt="Students collaborating on a project"
                    className="block w-full object-contain object-bottom"
                  />
                </div>
              </div>

              {/* ===================================================
                  QUICK ACTIONS
              =================================================== */}
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <QuickActionCard
                  icon={<FilePlus2 size={22} />}
                  title="Post a Project"
                  description="Share your idea and find like-minded collaborators."
                  iconClass="bg-blue-100 text-blue-600"
                  arrowClass="bg-blue-100 text-blue-600"
                />

                <QuickActionCard
                  icon={<Users size={22} />}
                  title="Find Collaborators"
                  description="Connect with students who share your interests."
                  iconClass="bg-purple-100 text-purple-600"
                  arrowClass="bg-purple-100 text-purple-600"
                />

                <QuickActionCard
                  icon={<MessageCircle size={22} />}
                  title="Start a Conversation"
                  description="Chat, discuss and build together."
                  iconClass="bg-emerald-100 text-emerald-600"
                  arrowClass="bg-emerald-100 text-emerald-600"
                />
              </div>

              {/* ===================================================
                  FEATURED PROJECTS
              =================================================== */}
              <div className="mt-8">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star
                      size={22}
                      className="fill-[#1558a8] text-[#1558a8]"
                    />

                    <h2 className="text-[19px] font-bold text-[#123d78]">
                      Featured Projects
                    </h2>
                  </div>

                  <button
                    type="button"
                    className="flex items-center gap-1 text-[12px] font-semibold text-[#0878e8] hover:underline"
                  >
                    View All
                    <ChevronRight size={15} />
                  </button>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <ProjectCard
                    icon={<Code size={23} />}
                    iconClass="bg-purple-100 text-purple-600"
                    title="AI Mock Interview Platform"
                    description="Build an AI-powered mock interview platform using React, Node.js and Gemini API."
                    tags={[
                      "React",
                      "Node.js",
                      "Gemini",
                      "AI",
                    ]}
                    user="Priya Sharma"
                    time="3 days ago"
                    members="4/5"
                  />

                  <ProjectCard
                    icon={<Sparkles size={23} />}
                    iconClass="bg-emerald-100 text-emerald-600"
                    title="College Event Management App"
                    description="A full-stack web app to manage college events, registrations and notifications."
                    tags={[
                      "React",
                      "Firebase",
                      "Tailwind",
                      "MongoDB",
                    ]}
                    user="Rohan Mehta"
                    time="5 days ago"
                    members="2/4"
                  />

                  <ProjectCard
                    icon={<BriefcaseBusiness size={23} />}
                    iconClass="bg-blue-100 text-blue-600"
                    title="Food Delivery App"
                    description="A responsive food delivery app with real-time tracking and payment integration."
                    tags={[
                      "React Native",
                      "Node.js",
                      "MongoDB",
                      "Socket.io",
                    ]}
                    user="Simran Kaur"
                    time="1 week ago"
                    members="3/5"
                  />

                  <ProjectCard
                    icon={<Lightbulb size={23} />}
                    iconClass="bg-purple-100 text-purple-600"
                    title="Smart Notes Generator"
                    description="Upload PDFs and generate simplified notes, MCQs and viva questions using Gemini."
                    tags={[
                      "React",
                      "Firebase",
                      "Gemini",
                      "PDF.js",
                    ]}
                    user="Aman Verma"
                    time="1 week ago"
                    members="2/4"
                  />
                </div>
              </div>
            </section>

            {/* =====================================================
                RIGHT COLUMN
            ===================================================== */}
            <aside className="space-y-5">

              {/* Profile Completion */}
              <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
                <h2 className="text-[16px] font-bold text-[#123d78]">
                  Profile Completion
                </h2>

                <div className="mt-4 flex items-center gap-4">
                  <div className="relative flex h-[78px] w-[78px] shrink-0 items-center justify-center rounded-full border-[8px] border-[#dceeff]">
                    <div className="absolute inset-[-8px] rotate-[-30deg] rounded-full border-[8px] border-transparent border-l-[#1684ff] border-r-[#1684ff] border-t-[#1684ff]" />

                    <span className="text-[17px] font-bold text-[#123d78]">
                      70%
                    </span>
                  </div>

                  <p className="text-[12px] leading-5 text-gray-500">
                    Complete your profile to get better matches and
                    opportunities.
                  </p>
                </div>

                <button
                  type="button"
                  className="mt-4 flex h-[38px] w-full items-center justify-center gap-2 rounded-lg bg-[#1684ff] text-[12px] font-semibold text-white transition hover:bg-[#0874e8]"
                >
                  Complete Profile
                  <ChevronRight size={15} />
                </button>
              </div>

              {/* Suggested Collaborators */}
              <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="text-[16px] font-bold text-[#123d78]">
                    Suggested Collaborators
                  </h2>

                  <button
                    type="button"
                    className="text-[11px] font-semibold text-[#0878e8]"
                  >
                    View All →
                  </button>
                </div>

                <div className="mt-4 space-y-4">
                  <Collaborator
                    initials="SP"
                    name="Sneha Patel"
                    role="Frontend Developer"
                    skills={["React", "UI/UX"]}
                  />

                  <Collaborator
                    initials="AS"
                    name="Aditya Singh"
                    role="Backend Developer"
                    skills={["Node.js", "MongoDB"]}
                  />

                  <Collaborator
                    initials="NG"
                    name="Neha Gupta"
                    role="UI/UX Designer"
                    skills={["Figma", "Design"]}
                  />

                  <Collaborator
                    initials="RV"
                    name="Rajat Verma"
                    role="Full Stack Developer"
                    skills={["React", "Node.js"]}
                  />
                </div>
              </div>

              {/* Recent Activity */}
              <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-[16px] font-bold text-[#123d78]">
                    <Zap
                      size={18}
                      className="fill-[#1558a8] text-[#1558a8]"
                    />
                    Recent Activity
                  </h2>

                  <button
                    type="button"
                    className="text-[11px] font-semibold text-[#0878e8]"
                  >
                    View All →
                  </button>
                </div>

                <div className="mt-5 space-y-5">
                  <ActivityItem
                    icon={<CheckCircle2 size={16} />}
                    iconClass="bg-blue-100 text-blue-600"
                    title="You joined the project"
                    subtitle="AI Mock Interview Platform"
                    time="2 hours ago"
                  />

                  <ActivityItem
                    icon={<MessageCircle size={16} />}
                    iconClass="bg-gray-100 text-gray-600"
                    title="Rohan Mehta sent you a message"
                    subtitle=""
                    time="4 hours ago"
                  />

                  <ActivityItem
                    icon={<FilePlus2 size={16} />}
                    iconClass="bg-emerald-100 text-emerald-600"
                    title="New project posted"
                    subtitle="College Event Management App"
                    time="6 hours ago"
                  />

                  <ActivityItem
                    icon={<Star size={16} />}
                    iconClass="bg-purple-100 text-purple-600"
                    title="Neha Gupta liked your profile"
                    subtitle=""
                    time="1 day ago"
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

/* =========================================================
   SIDEBAR ITEM
========================================================= */

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  badge?: string;
}

const SidebarItem = ({
  icon,
  label,
  active = false,
  badge,
}: SidebarItemProps) => {
  return (
    <button
      type="button"
      className={`mb-1 flex h-[48px] w-full items-center gap-4 rounded-xl px-4 text-left transition ${
        active
          ? "bg-white/15 shadow-sm"
          : "text-blue-100/90 hover:bg-white/10"
      }`}
    >
      <span
        className={
          active ? "text-white" : "text-blue-100"
        }
      >
        {icon}
      </span>

      <span className="flex-1 text-[13px] font-medium">
        {label}
      </span>

      {badge && (
        <span className="flex h-[19px] min-w-[19px] items-center justify-center rounded-full bg-[#1684ff] px-1 text-[9px] font-bold">
          {badge}
        </span>
      )}
    </button>
  );
};

/* =========================================================
   QUICK ACTION CARD
========================================================= */

interface QuickActionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  iconClass: string;
  arrowClass: string;
}

const QuickActionCard = ({
  icon,
  title,
  description,
  iconClass,
  arrowClass,
}: QuickActionCardProps) => {
  return (
    <button
      type="button"
      className="group relative rounded-2xl border border-blue-100 bg-white p-5 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>

        <div
          className={`flex h-9 w-9 items-center justify-center rounded-full transition group-hover:translate-x-1 ${arrowClass}`}
        >
          <ChevronRight size={17} />
        </div>
      </div>

      <h3 className="mt-4 text-[15px] font-bold text-[#123d78]">
        {title}
      </h3>

      <p className="mt-2 max-w-[220px] text-[11px] leading-5 text-gray-500">
        {description}
      </p>
    </button>
  );
};

/* =========================================================
   PROJECT CARD
========================================================= */

interface ProjectCardProps {
  icon: React.ReactNode;
  iconClass: string;
  title: string;
  description: string;
  tags: string[];
  user: string;
  time: string;
  members: string;
}

const ProjectCard = ({
  icon,
  iconClass,
  title,
  description,
  tags,
  user,
  time,
  members,
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
          <h3 className="truncate text-[14px] font-bold text-[#123d78]">
            {title}
          </h3>

          <p className="mt-2 line-clamp-2 text-[11px] leading-5 text-gray-500">
            {description}
          </p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-[#eef6ff] px-2 py-1 text-[9px] font-medium text-[#2170c5]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#8ac7ff] to-[#367bc5] text-[8px] font-bold text-white">
            {user
              .split(" ")
              .map((word) => word[0])
              .join("")}
          </div>

          <div>
            <p className="text-[9px] font-semibold text-[#315b8e]">
              {user}
            </p>

            <div className="flex items-center gap-2 text-[8px] text-gray-400">
              <span>•</span>
              <span>{time}</span>
              <span>•</span>
              <Users size={10} />
              <span>{members}</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="flex items-center gap-1 rounded-lg border border-blue-100 bg-[#f4f9ff] px-3 py-2 text-[9px] font-semibold text-[#0878e8] transition hover:bg-blue-50"
        >
          View Project
          <ChevronRight size={12} />
        </button>
      </div>
    </div>
  );
};

/* =========================================================
   COLLABORATOR
========================================================= */

interface CollaboratorProps {
  initials: string;
  name: string;
  role: string;
  skills: string[];
}

const Collaborator = ({
  initials,
  name,
  role,
  skills,
}: CollaboratorProps) => {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#78bfff] to-[#286bb6] text-[10px] font-bold text-white">
        {initials}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] font-bold text-[#123d78]">
          {name}
        </p>

        <p className="mt-0.5 truncate text-[9px] text-gray-400">
          {role}
        </p>

        <div className="mt-1 flex gap-1">
          {skills.map((skill) => (
            <span
              key={skill}
              className="rounded-full bg-[#eef6ff] px-1.5 py-0.5 text-[7px] font-medium text-[#3779bb]"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      <button
        type="button"
        className="rounded-lg border border-blue-200 px-2.5 py-1.5 text-[9px] font-semibold text-[#0878e8] transition hover:bg-blue-50"
      >
        Connect
      </button>
    </div>
  );
};

/* =========================================================
   ACTIVITY ITEM
========================================================= */

interface ActivityItemProps {
  icon: React.ReactNode;
  iconClass: string;
  title: string;
  subtitle: string;
  time: string;
}

const ActivityItem = ({
  icon,
  iconClass,
  title,
  subtitle,
  time,
}: ActivityItemProps) => {
  return (
    <div className="flex gap-3">
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconClass}`}
      >
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-semibold leading-4 text-[#315b8e]">
          {title}
        </p>

        {subtitle && (
          <p className="truncate text-[9px] text-[#6790b9]">
            {subtitle}
          </p>
        )}

        <p className="mt-0.5 text-[8px] text-gray-400">
          {time}
        </p>
      </div>
    </div>
  );
};

export default DashboardPage;