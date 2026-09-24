import {
  Bell,
  BriefcaseBusiness,
  ChevronRight,
  FilePlus2,
  Home,
  LogOut,
  MessageCircle,
  Mic,
  Phone,
  Plus,
  Pencil,
  Trash2,
  Search,
  Settings,
  Star,
  Users,
  Zap,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
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
        ${active
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
  isOwner?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onView?: () => void;
  isDeleting?: boolean;
};

type Project = {
  _id: string;
  title: string;
  description: string;
  category: string;
  skills: string[];
  teamSize: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
};

const ProjectCard = ({
  icon,
  iconClass,
  title,
  description,
  tags,
  isOwner = false,
  onEdit,
  onDelete,
  onView,
  isDeleting = false,
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

        {isOwner ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onEdit}
              disabled={isDeleting}
              className="flex items-center gap-1.5 rounded-lg border border-blue-200 px-2.5 py-1.5 text-[9px] font-semibold text-[#1684ff] transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Pencil size={11} />
              Edit
            </button>

            <button
              type="button"
              onClick={onDelete}
              disabled={isDeleting}
              className="flex items-center gap-1.5 rounded-lg border border-red-200 px-2.5 py-1.5 text-[9px] font-semibold text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 size={11} />
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onView}
            className="text-[10px] font-semibold text-[#1684ff] hover:underline"
          >
            View Project →
          </button>
        )}
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

  const [userName, setUserName] = useState("User");
  const [currentUserId, setCurrentUserId] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(
    null
  );
  const [selectedProject, setSelectedProject] =
    useState<Project | null>(null);

  const API_URL = import.meta.env.VITE_API_URL;

  // =====================================================
  // FETCH CURRENT USER
  // =====================================================

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/auth/me`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        setUserName(data.user.name);
        setCurrentUserId(data.user.id);
      } catch (error) {
        console.error(
          "Failed to fetch current user:",
          error
        );
      }
    };

    fetchCurrentUser();
  }, [API_URL]);

  // =====================================================
  // FETCH ALL PROJECTS
  // =====================================================

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/projects`
        );

        if (!response.ok) {
          console.error(
            "Failed to fetch projects."
          );
          return;
        }

        const data = await response.json();

        setProjects(data.projects || []);
      } catch (error) {
        console.error(
          "Failed to fetch projects:",
          error
        );
      }
    };

    fetchProjects();
  }, [API_URL]);

  // =====================================================
  // DELETE PROJECT
  // =====================================================

  const handleDeleteProject = async (
    projectId: string
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (!confirmed) return;

    setDeletingProjectId(projectId);

    try {
      const response = await fetch(
        `${API_URL}/api/projects/${projectId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
          "Failed to delete project."
        );
        return;
      }

      setProjects((currentProjects) =>
        currentProjects.filter(
          (project) =>
            project._id !== projectId
        )
      );

      alert("Project deleted successfully.");
    } catch (error) {
      console.error(
        "Delete project error:",
        error
      );

      alert(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setDeletingProjectId(null);
    }
  };

  // =====================================================
  // EDIT PROJECT
  // =====================================================

  const handleEditProject = (
    project: Project
  ) => {
    navigate("/post-project", {
      state: {
        editMode: true,
        project,
      },
    });
  };

  // =====================================================
  // VIEW PROJECT
  // =====================================================

  const handleViewProject = (
    project: Project
  ) => {
    setSelectedProject(project);
  };

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
              <Users
                size={23}
                strokeWidth={2.5}
              />
            </div>

            <span className="text-[22px] font-bold tracking-[-0.8px]">
              Collab
              <span className="text-[#74b9ff]">
                Nest
              </span>
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
                {userName
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <span className="hidden text-[13px] font-semibold lg:block">
                {userName}
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

      <aside
        className="
          fixed
          bottom-0
          left-0
          top-[70px]
          z-40
          hidden
          w-[240px]
          flex-col
          overflow-y-auto
          bg-gradient-to-b
          from-[#073b88]
          to-[#062f70]
          text-white
          md:flex
        "
      >
        <nav className="flex-1 px-3 py-5">

          <SidebarItem
            icon={<Home size={20} />}
            label="Dashboard"
            active
            onClick={() =>
              navigate("/dashboard")
            }
          />

          <SidebarItem
            icon={
              <BriefcaseBusiness
                size={20}
              />
            }
            label="Find Projects"
            onClick={() =>
              navigate("/explore-projects")
            }
          />

          <SidebarItem
            icon={<Plus size={21} />}
            label="Post a Project"
            onClick={() =>
              navigate("/post-project")
            }
          />

          <SidebarItem
            icon={<Users size={20} />}
            label="My Collaborations"
          />

          <SidebarItem
            icon={
              <MessageCircle size={20} />
            }
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

          {/* Logout */}

          <SidebarItem
            icon={<LogOut size={20} />}
            label="Logout"
          />

        </nav>
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
                    Welcome back,{" "}
                    {userName.split(" ")[0]}!{" "}
                    <span>👋</span>
                  </h1>

                  <p className="mt-3 max-w-[520px] text-[14px] leading-6 text-[#315f96]">
                    Great to see you again!
                    Find collaborators,
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

                <div className="pointer-events-none absolute bottom-0 right-[-20px] z-10 flex h-[165px] w-[35%] items-end justify-end">
                  <img
                    src={students}
                    alt="Students collaborating"
                    className="
      h-full
      w-auto
      max-w-none
      object-contain
      object-right-bottom
    "
                  />
                </div>

              </div>

              {/* =================================================
                  QUICK ACTIONS
              ================================================= */}

              <div className="mt-6 grid gap-4 md:grid-cols-3">

                {/* POST PROJECT */}

                <QuickActionCard
                  icon={
                    <FilePlus2 size={23} />
                  }
                  title="Post a Project"
                  description="Share your idea and find like-minded collaborators."
                  iconClass="bg-blue-100 text-blue-600"
                  arrowClass="bg-blue-100 text-blue-600"
                  onClick={() =>
                    navigate("/post-project")
                  }
                />

                {/* FIND COLLABORATORS */}

                <QuickActionCard
                  icon={
                    <Users size={23} />
                  }
                  title="Find Projects"
                  description="Connect with students who share your interests."
                  iconClass="bg-purple-100 text-purple-600"
                  arrowClass="bg-purple-100 text-purple-600"
                  onClick={() =>
                    navigate(
                      "/explore-projects"
                    )
                  }
                />

                {/* START CONVERSATION */}

                <QuickActionCard
                  icon={
                    <MessageCircle
                      size={23}
                    />
                  }
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

                  {/* VIEW ALL */}

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        "/explore-projects"
                      )
                    }
                    className="flex items-center gap-1 text-[11px] font-semibold text-[#0878e8] hover:underline"
                  >
                    View All
                    <ChevronRight
                      size={14}
                    />
                  </button>

                </div>

                {/* =================================================
                    ONLY FIRST 4 PROJECTS
                ================================================= */}

                {projects.length > 0 ? (
                  <div className="grid gap-4 lg:grid-cols-2">

                    {projects
                      .slice(0, 4)
                      .map(
                        (
                          project,
                          index
                        ) => {

                          const iconClasses = [
                            "bg-purple-100 text-purple-600",
                            "bg-emerald-100 text-emerald-600",
                            "bg-blue-100 text-blue-600",
                            "bg-orange-100 text-orange-600",
                          ];

                          const iconSymbols = [
                            "</>",
                            "✦",
                            "⌘",
                            "⚡",
                          ];

                          return (
                            <ProjectCard
                              key={
                                project._id
                              }
                              icon={
                                <span className="text-[20px]">
                                  {
                                    iconSymbols[
                                    index %
                                    iconSymbols.length
                                    ]
                                  }
                                </span>
                              }
                              iconClass={
                                iconClasses[
                                index %
                                iconClasses.length
                                ]
                              }
                              title={
                                project.title
                              }
                              description={
                                project.description
                              }
                              tags={
                                project.skills
                              }
                              isOwner={
                                currentUserId ===
                                project
                                  .createdBy
                                  ?._id
                              }
                              onEdit={() =>
                                handleEditProject(
                                  project
                                )
                              }
                              onDelete={() =>
                                handleDeleteProject(
                                  project._id
                                )
                              }
                              onView={() =>
                                handleViewProject(
                                  project
                                )
                              }
                              isDeleting={
                                deletingProjectId ===
                                project._id
                              }
                            />
                          );
                        }
                      )}

                  </div>
                ) : (

                  /* =================================================
                     NO PROJECTS
                  ================================================= */

                  <div className="rounded-2xl border border-dashed border-blue-200 bg-white p-8 text-center">

                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#1684ff]">
                      <Plus size={22} />
                    </div>

                    <h3 className="mt-4 text-[15px] font-bold text-[#123d78]">
                      No projects posted yet
                    </h3>

                    <p className="mx-auto mt-2 max-w-[360px] text-[11px] leading-5 text-gray-500">
                      Be the first to share
                      a project idea and
                      find collaborators.
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          "/post-project"
                        )
                      }
                      className="mt-4 rounded-xl bg-[#1684ff] px-5 py-2.5 text-[10px] font-bold text-white transition hover:bg-[#0874e8]"
                    >
                      Post a Project
                    </button>

                  </div>
                )}

                {/* =================================================
                    VIEW ALL PROJECTS MESSAGE
                ================================================= */}

                {projects.length > 4 && (
                  <div className="mt-4 flex justify-center">

                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          "/explore-projects"
                        )
                      }
                      className="rounded-xl border border-blue-200 bg-white px-5 py-2.5 text-[10px] font-bold text-[#1684ff] transition hover:bg-blue-50"
                    >
                      View all{" "}
                      {projects.length}{" "}
                      projects →
                    </button>

                  </div>
                )}

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

                    <div className="absolute inset-[-9px] rotate-[25deg] rounded-full border-[9px] border-transparent border-l-[#1684ff] border-t-[#1684ff] border-r-[#1684ff]" />

                    <span className="text-[17px] font-bold text-[#123d78]">
                      70%
                    </span>

                  </div>

                  <p className="text-[11px] leading-5 text-gray-500">
                    Complete your profile
                    to get better matches
                    and opportunities.
                  </p>

                </div>

                <button
                  type="button"
                  className="mt-5 flex h-[45px] w-full items-center justify-center gap-2 rounded-xl bg-[#1684ff] text-[12px] font-bold text-white transition hover:bg-[#0874e8]"
                >
                  Complete Profile
                  <ChevronRight
                    size={16}
                  />
                </button>

              </div>

              {/* =================================================
                  SUGGESTED COLLABORATORS
              ================================================= */}

              <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">

                <div className="flex items-center justify-between">

                  <h2 className="text-[17px] font-bold text-[#123d78]">
                    Suggested
                    Collaborators
                  </h2>

                  <button
                    type="button"
                    className="text-[10px] font-semibold text-[#0878e8]"
                  >
                    View All →
                  </button>

                </div>

                <div className="mt-5 space-y-5">

                  {collaborators.map(
                    (person) => (
                      <div
                        key={
                          person.name
                        }
                        className="flex items-center gap-3"
                      >

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#70b9f5] to-[#277bc9] text-[10px] font-bold text-white">
                          {
                            person.initials
                          }
                        </div>

                        <div className="min-w-0 flex-1">

                          <h3 className="truncate text-[11px] font-bold text-[#123d78]">
                            {
                              person.name
                            }
                          </h3>

                          <p className="mt-0.5 truncate text-[9px] text-gray-400">
                            {
                              person.role
                            }
                          </p>

                          <div className="mt-1 flex gap-1">

                            {person.skills.map(
                              (skill) => (
                                <span
                                  key={
                                    skill
                                  }
                                  className="rounded-full bg-blue-50 px-2 py-0.5 text-[7px] font-semibold text-[#4d8dca]"
                                >
                                  {
                                    skill
                                  }
                                </span>
                              )
                            )}

                          </div>

                        </div>

                        <button
                          type="button"
                          className="shrink-0 rounded-lg border border-blue-200 px-3 py-1.5 text-[9px] font-semibold text-[#1684ff] transition hover:bg-blue-50"
                        >
                          Connect
                        </button>

                      </div>
                    )
                  )}

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
                    icon={
                      <MessageCircle
                        size={15}
                      />
                    }
                    text="You received a new collaboration request."
                    time="10 min ago"
                  />

                  <ActivityItem
                    icon={
                      <Users size={15} />
                    }
                    text="Someone viewed your project."
                    time="1 hour ago"
                  />

                  <ActivityItem
                    icon={
                      <Star size={15} />
                    }
                    text="Your project was featured."
                    time="3 hours ago"
                  />

                </div>

              </div>

            </aside>

          </div>

        </div>

      </main>

      {/* =====================================================
          PROJECT DETAILS MODAL
      ===================================================== */}

      {selectedProject && (
        <div
          className="
            fixed
            inset-0
            z-[100]
            flex
            items-center
            justify-center
            bg-black/45
            px-4
            backdrop-blur-sm
          "
          onClick={() => setSelectedProject(null)}
        >
          <div
            className="
              relative
              w-full
              max-w-[620px]
              overflow-hidden
              rounded-[24px]
              border
              border-blue-100
              bg-white
              shadow-[0_25px_80px_rgba(0,0,0,0.20)]
            "
            onClick={(event) => event.stopPropagation()}
          >
            {/* Blue header */}
            <div
              className="
                relative
                overflow-hidden
                bg-gradient-to-br
                from-[#0b5fc7]
                via-[#1684ff]
                to-[#5aa9f5]
                px-6
                pb-7
                pt-6
                text-white
              "
            >
              <div
                className="
                  pointer-events-none
                  absolute
                  -right-12
                  -top-16
                  h-[150px]
                  w-[150px]
                  rounded-full
                  bg-white/10
                "
              />

              <div
                className="
                  pointer-events-none
                  absolute
                  -bottom-20
                  right-20
                  h-[130px]
                  w-[130px]
                  rounded-full
                  bg-white/10
                "
              />

              {/* Close */}
              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                className="
                  absolute
                  right-5
                  top-5
                  z-10
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-full
                  bg-white/15
                  text-white
                  transition
                  hover:bg-white/25
                "
                aria-label="Close project details"
              >
                <X size={18} />
              </button>

              {/* Category */}
              <div
                className="
                  mb-3
                  inline-flex
                  items-center
                  rounded-full
                  bg-white/15
                  px-3
                  py-1.5
                  text-[10px]
                  font-semibold
                  backdrop-blur-sm
                "
              >
                {selectedProject.category}
              </div>

              {/* Title */}
              <h2
                className="
                  relative
                  z-10
                  max-w-[500px]
                  pr-10
                  text-[24px]
                  font-bold
                  leading-tight
                  tracking-[-0.5px]
                  md:text-[28px]
                "
              >
                {selectedProject.title}
              </h2>

              {/* Owner */}
              <div
                className="
                  relative
                  z-10
                  mt-4
                  flex
                  items-center
                  gap-3
                "
              >
                <div
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-full
                    bg-white/20
                    text-[12px]
                    font-bold
                    uppercase
                  "
                >
                  {selectedProject.createdBy?.name?.charAt(0) || "U"}
                </div>

                <div>
                  <p className="text-[11px] text-white/70">
                    Posted by
                  </p>

                  <p className="text-[13px] font-semibold">
                    {selectedProject.createdBy?.name || "Unknown user"}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal content */}
            <div className="max-h-[60vh] overflow-y-auto px-6 py-6">
              {/* Description */}
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <div
                    className="
                      flex
                      h-7
                      w-7
                      items-center
                      justify-center
                      rounded-lg
                      bg-blue-50
                      text-[#1684ff]
                    "
                  >
                    <FilePlus2 size={14} />
                  </div>

                  <h3
                    className="
                      text-[13px]
                      font-bold
                      text-[#102a43]
                    "
                  >
                    About the project
                  </h3>
                </div>

                <p
                  className="
                    rounded-xl
                    bg-[#f7fbff]
                    p-4
                    text-[12px]
                    leading-[1.7]
                    text-slate-600
                  "
                >
                  {selectedProject.description}
                </p>
              </div>

              {/* Project information */}
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div
                  className="
                    rounded-xl
                    border
                    border-slate-100
                    bg-white
                    p-4
                    shadow-sm
                  "
                >
                  <p
                    className="
                      text-[9px]
                      font-semibold
                      uppercase
                      tracking-wide
                      text-slate-400
                    "
                  >
                    Category
                  </p>

                  <p
                    className="
                      mt-1
                      text-[12px]
                      font-semibold
                      text-[#102a43]
                    "
                  >
                    {selectedProject.category}
                  </p>
                </div>

                <div
                  className="
                    rounded-xl
                    border
                    border-slate-100
                    bg-white
                    p-4
                    shadow-sm
                  "
                >
                  <p
                    className="
                      text-[9px]
                      font-semibold
                      uppercase
                      tracking-wide
                      text-slate-400
                    "
                  >
                    Team Size
                  </p>

                  <p
                    className="
                      mt-1
                      text-[12px]
                      font-semibold
                      text-[#102a43]
                    "
                  >
                    {selectedProject.teamSize}
                  </p>
                </div>
              </div>

              {/* Skills */}
              <div className="mt-5">
                <div className="mb-2 flex items-center gap-2">
                  <div
                    className="
                      flex
                      h-7
                      w-7
                      items-center
                      justify-center
                      rounded-lg
                      bg-purple-50
                      text-purple-600
                    "
                  >
                    <Zap size={14} />
                  </div>

                  <h3
                    className="
                      text-[13px]
                      font-bold
                      text-[#102a43]
                    "
                  >
                    Skills needed
                  </h3>
                </div>

                <div className="flex flex-wrap gap-2">
                  {selectedProject.skills?.length > 0 ? (
                    selectedProject.skills.map((skill) => (
                      <span
                        key={skill}
                        className="
                          rounded-full
                          bg-blue-50
                          px-3
                          py-1.5
                          text-[10px]
                          font-semibold
                          text-[#1676d2]
                        "
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-[11px] text-slate-400">
                      No specific skills mentioned.
                    </span>
                  )}
                </div>
              </div>

              {/* Project owner */}
              <div
                className="
                  mt-5
                  rounded-xl
                  border
                  border-slate-100
                  bg-slate-50
                  p-4
                "
              >
                <p
                  className="
                    text-[9px]
                    font-semibold
                    uppercase
                    tracking-wide
                    text-slate-400
                  "
                >
                  Project owner
                </p>

                <div className="mt-2 flex items-center gap-3">
                  <div
                    className="
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      rounded-full
                      bg-gradient-to-br
                      from-[#1684ff]
                      to-[#0759bd]
                      text-[12px]
                      font-bold
                      uppercase
                      text-white
                    "
                  >
                    {selectedProject.createdBy?.name?.charAt(0) || "U"}
                  </div>

                  <div>
                    <p
                      className="
                        text-[12px]
                        font-bold
                        text-[#102a43]
                      "
                    >
                      {selectedProject.createdBy?.name || "Unknown user"}
                    </p>

                    <p
                      className="
                        text-[10px]
                        text-slate-400
                      "
                    >
                      {selectedProject.createdBy?.email || ""}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div
                className="
                  mt-6
                  flex
                  flex-col-reverse
                  gap-3
                  sm:flex-row
                  sm:justify-end
                "
              >
                <button
                  type="button"
                  onClick={() => setSelectedProject(null)}
                  className="
                    h-[42px]
                    rounded-xl
                    border
                    border-slate-200
                    px-5
                    text-[11px]
                    font-semibold
                    text-slate-600
                    transition
                    hover:bg-slate-50
                  "
                >
                  Close
                </button>

                <button
                  type="button"
                  className="
                    flex
                    h-[42px]
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-gradient-to-r
                    from-[#1684ff]
                    to-[#0759bd]
                    px-5
                    text-[11px]
                    font-semibold
                    text-white
                    shadow-lg
                    shadow-blue-500/20
                    transition
                    hover:-translate-y-[1px]
                    hover:shadow-xl
                  "
                >
                  <MessageCircle size={15} />
                  Connect / Collaborate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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