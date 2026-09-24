import {
  Bell,
  BriefcaseBusiness,
  ChevronRight,
  Home,
  LogOut,
  MessageCircle,
  Mic,
  Phone,
  Plus,
  Search,
  Settings,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

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

type ProjectCardProps = {
  project: Project;
  onView: () => void;
  index: number;
};

const ProjectCard = ({
  project,
  onView,
  index,
}: ProjectCardProps) => {
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

  const iconClass =
    iconClasses[index % iconClasses.length];

  const iconSymbol =
    iconSymbols[index % iconSymbols.length];

  return (
    <div
      className="
        group
        rounded-2xl
        border
        border-blue-100
        bg-white
        p-5
        shadow-sm
        transition
        duration-200
        hover:-translate-y-1
        hover:shadow-lg
      "
    >
      {/* TOP */}

      <div className="flex gap-4">

        <div
          className={`
            flex
            h-14
            w-14
            shrink-0
            items-center
            justify-center
            rounded-xl
            ${iconClass}
          `}
        >
          <span className="text-[21px] font-semibold">
            {iconSymbol}
          </span>
        </div>

        <div className="min-w-0 flex-1">

          <div className="flex items-start justify-between gap-3">

            <div className="min-w-0">

              <h3 className="truncate text-[16px] font-bold text-[#123d78]">
                {project.title}
              </h3>

              <p className="mt-1 text-[10px] text-gray-400">
                Posted by{" "}
                <span className="font-semibold text-[#4d79a8]">
                  {project.createdBy?.name ||
                    "Unknown user"}
                </span>
              </p>

            </div>

            <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-[8px] font-semibold text-[#2580d8]">
              {project.category}
            </span>

          </div>

        </div>

      </div>

      {/* DESCRIPTION */}

      <p className="mt-4 line-clamp-3 text-[11px] leading-5 text-gray-500">
        {project.description}
      </p>

      {/* SKILLS */}

      <div className="mt-4 flex flex-wrap gap-1.5">

        {project.skills.map((skill) => (
          <span
            key={skill}
            className="
              rounded-full
              bg-blue-50
              px-2.5
              py-1
              text-[9px]
              font-semibold
              text-[#2580d8]
            "
          >
            {skill}
          </span>
        ))}

      </div>

      {/* BOTTOM */}

      <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">

        <div className="flex items-center gap-2 text-[9px] text-gray-400">

          <Users size={13} />

          <span>
            {project.teamSize}
          </span>

        </div>

        <button
          type="button"
          onClick={onView}
          className="
            flex
            items-center
            gap-1.5
            rounded-lg
            bg-[#1684ff]
            px-3.5
            py-2
            text-[9px]
            font-bold
            text-white
            transition
            hover:bg-[#0874e8]
          "
        >
          View Project
          <ChevronRight size={13} />
        </button>

      </div>
    </div>
  );
};

type ProjectDetailsModalProps = {
  project: Project;
  onClose: () => void;
};

const ProjectDetailsModal = ({
  project,
  onClose,
}: ProjectDetailsModalProps) => {
  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-[#05285c]/60
        p-4
        backdrop-blur-sm
      "
      onClick={onClose}
    >
      <div
        className="
          relative
          max-h-[90vh]
          w-full
          max-w-[620px]
          overflow-y-auto
          rounded-3xl
          bg-white
          p-6
          shadow-2xl
          md:p-8
        "
        onClick={(event) =>
          event.stopPropagation()
        }
      >

        {/* CLOSE */}

        <button
          type="button"
          onClick={onClose}
          className="
            absolute
            right-5
            top-5
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-full
            bg-gray-100
            text-gray-500
            transition
            hover:bg-gray-200
            hover:text-gray-700
          "
        >
          <X size={18} />
        </button>

        {/* ICON */}

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-[#1684ff]">
          <BriefcaseBusiness size={25} />
        </div>

        {/* TITLE */}

        <div className="mt-5 pr-10">

          <span className="rounded-full bg-blue-50 px-3 py-1 text-[9px] font-bold text-[#1684ff]">
            {project.category}
          </span>

          <h2 className="mt-3 text-[25px] font-bold tracking-[-0.5px] text-[#123d78]">
            {project.title}
          </h2>

          <p className="mt-2 text-[11px] text-gray-400">
            Posted by{" "}
            <span className="font-semibold text-[#3c6d9f]">
              {project.createdBy?.name ||
                "Unknown user"}
            </span>
          </p>

        </div>

        {/* DESCRIPTION */}

        <div className="mt-7">

          <h3 className="text-[13px] font-bold text-[#123d78]">
            About this project
          </h3>

          <p className="mt-2 text-[12px] leading-6 text-gray-600">
            {project.description}
          </p>

        </div>

        {/* DETAILS */}

        <div className="mt-7 grid gap-4 sm:grid-cols-2">

          <div className="rounded-2xl bg-[#f5f9ff] p-4">

            <p className="text-[9px] font-semibold uppercase tracking-wide text-gray-400">
              Category
            </p>

            <p className="mt-1 text-[12px] font-bold text-[#123d78]">
              {project.category}
            </p>

          </div>

          <div className="rounded-2xl bg-[#f5f9ff] p-4">

            <p className="text-[9px] font-semibold uppercase tracking-wide text-gray-400">
              Team Size
            </p>

            <p className="mt-1 text-[12px] font-bold text-[#123d78]">
              {project.teamSize}
            </p>

          </div>

        </div>

        {/* SKILLS */}

        <div className="mt-7">

          <h3 className="text-[13px] font-bold text-[#123d78]">
            Skills needed
          </h3>

          <div className="mt-3 flex flex-wrap gap-2">

            {project.skills.map(
              (skill) => (
                <span
                  key={skill}
                  className="
                    rounded-full
                    bg-blue-50
                    px-3
                    py-1.5
                    text-[10px]
                    font-semibold
                    text-[#2580d8]
                  "
                >
                  {skill}
                </span>
              )
            )}

          </div>

        </div>

        {/* OWNER */}

        <div className="mt-7 rounded-2xl border border-blue-100 bg-gradient-to-r from-[#f3f8ff] to-[#eaf4ff] p-4">

          <p className="text-[9px] font-semibold uppercase tracking-wide text-gray-400">
            Project owner
          </p>

          <div className="mt-2 flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#70b9f5] to-[#277bc9] text-[12px] font-bold text-white">
              {project.createdBy?.name
                ?.charAt(0)
                .toUpperCase() || "U"}
            </div>

            <div>

              <p className="text-[12px] font-bold text-[#123d78]">
                {project.createdBy?.name ||
                  "Unknown user"}
              </p>

              <p className="mt-0.5 text-[9px] text-gray-400">
                {project.createdBy?.email ||
                  ""}
              </p>

            </div>

          </div>

        </div>

        {/* ACTION */}

        <div className="mt-7 flex gap-3">

          <button
            type="button"
            onClick={onClose}
            className="
              flex-1
              rounded-xl
              border
              border-blue-200
              bg-white
              py-3
              text-[11px]
              font-bold
              text-[#1684ff]
              transition
              hover:bg-blue-50
            "
          >
            Close
          </button>

          <button
            type="button"
            className="
              flex-1
              rounded-xl
              bg-[#1684ff]
              py-3
              text-[11px]
              font-bold
              text-white
              transition
              hover:bg-[#0874e8]
            "
          >
            Connect / Collaborate
          </button>

        </div>

      </div>
    </div>
  );
};

const ExploreProjectsPage = () => {
  const navigate = useNavigate();

  const [userName, setUserName] =
    useState("User");

  const [projects, setProjects] =
    useState<Project[]>([]);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [selectedCategory, setSelectedCategory] =
    useState("All");

  const [selectedProject, setSelectedProject] =
    useState<Project | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const API_URL =
    import.meta.env.VITE_API_URL;

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

        const data =
          await response.json();

        setUserName(data.user.name);
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
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(
          `${API_URL}/api/projects`
        );

        if (!response.ok) {
          setError(
            "Failed to load projects."
          );
          return;
        }

        const data =
          await response.json();

        setProjects(
          data.projects || []
        );
      } catch (error) {
        console.error(
          "Fetch projects error:",
          error
        );

        setError(
          "Unable to connect to the server."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [API_URL]);

  // =====================================================
  // CATEGORIES
  // =====================================================

  const categories = useMemo(() => {
    const uniqueCategories =
      Array.from(
        new Set(
          projects
            .map(
              (project) =>
                project.category
            )
            .filter(Boolean)
        )
      );

    return [
      "All",
      ...uniqueCategories,
    ];
  }, [projects]);

  // =====================================================
  // FILTER PROJECTS
  // =====================================================

  const filteredProjects =
    useMemo(() => {
      const query =
        searchTerm
          .trim()
          .toLowerCase();

      return projects.filter(
        (project) => {
          const matchesSearch =
            !query ||
            project.title
              .toLowerCase()
              .includes(query) ||
            project.description
              .toLowerCase()
              .includes(query) ||
            project.category
              .toLowerCase()
              .includes(query) ||
            project.skills.some(
              (skill) =>
                skill
                  .toLowerCase()
                  .includes(query)
            ) ||
            project.createdBy?.name
              ?.toLowerCase()
              .includes(query);

          const matchesCategory =
            selectedCategory ===
              "All" ||
            project.category ===
              selectedCategory;

          return (
            matchesSearch &&
            matchesCategory
          );
        }
      );
    }, [
      projects,
      searchTerm,
      selectedCategory,
    ]);

  return (
    <div className="min-h-screen bg-[#f5f9ff] text-[#12355b]">

      {/* =====================================================
          TOP NAVBAR
      ===================================================== */}

      <header className="fixed left-0 right-0 top-0 z-50 h-[70px] bg-gradient-to-r from-[#073b88] to-[#0b4da5] text-white shadow-lg">

        <div className="flex h-full items-center">

          {/* LOGO */}

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

          {/* SEARCH */}

          <div className="flex flex-1 items-center justify-center px-5">

            <div className="flex h-[44px] w-full max-w-[580px] items-center gap-3 rounded-full bg-white/10 px-5 backdrop-blur-md">

              <Search
                size={19}
                className="text-white/80"
              />

              <input
                type="text"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value
                  )
                }
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

          {/* RIGHT */}

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
            label="Explore Projects"
            active
            onClick={() =>
              navigate(
                "/explore-projects"
              )
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

          <SidebarItem
            icon={<LogOut size={20} />}
            label="Logout"
          />

        </nav>
      </aside>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="min-h-screen pt-[70px] md:ml-[240px]">

        <div className="mx-auto max-w-[1500px] p-5 md:p-7">

          {/* =================================================
              PAGE HEADER
          ================================================= */}

          <div
            className="
              relative
              overflow-hidden
              rounded-3xl
              border
              border-blue-100
              bg-gradient-to-br
              from-[#eaf5ff]
              via-[#dceeff]
              to-[#c9e4ff]
              p-7
              shadow-sm
              md:p-9
            "
          >

            {/* BACKGROUND SHAPES */}

            <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-white/30" />

            <div className="absolute -bottom-28 right-[25%] h-60 w-60 rounded-full bg-[#8cc6ff]/20" />

            <div className="relative z-10">

              <div className="flex flex-wrap items-center justify-between gap-5">

                <div>

                  <div className="flex items-center gap-2">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1684ff] text-white shadow-md">
                      <Users size={21} />
                    </div>

                    <span className="rounded-full bg-white/70 px-3 py-1 text-[9px] font-bold text-[#1684ff]">
                      COLLABORATE
                    </span>

                  </div>

                  <h1 className="mt-4 text-[30px] font-bold tracking-[-1px] text-[#103b76] md:text-[38px]">
                    Find Collaborators
                  </h1>

                  <p className="mt-2 max-w-[600px] text-[12px] leading-6 text-[#315f96] md:text-[14px]">
                    Explore projects posted by
                    students and find the right
                    people to build something
                    amazing together.
                  </p>

                </div>

                <div className="rounded-2xl bg-white/70 px-5 py-4 shadow-sm">

                  <p className="text-[9px] font-semibold uppercase tracking-wide text-gray-400">
                    Available Projects
                  </p>

                  <p className="mt-1 text-[25px] font-bold text-[#123d78]">
                    {projects.length}
                  </p>

                </div>

              </div>

              {/* SEARCH */}

              <div className="mt-7 flex h-[52px] w-full max-w-[720px] items-center gap-3 rounded-full bg-white px-5 shadow-md">

                <Search
                  size={20}
                  className="shrink-0 text-[#5595d8]"
                />

                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(
                      event.target.value
                    )
                  }
                  placeholder="Search projects, skills, categories, or students..."
                  className="
                    w-full
                    bg-transparent
                    text-[12px]
                    text-[#315f96]
                    outline-none
                    placeholder:text-gray-400
                  "
                />

                {searchTerm && (
                  <button
                    type="button"
                    onClick={() =>
                      setSearchTerm("")
                    }
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200"
                  >
                    <X size={15} />
                  </button>
                )}

              </div>

            </div>

          </div>

          {/* =================================================
              FILTERS
          ================================================= */}

          <div className="mt-7 flex flex-wrap items-center justify-between gap-4">

            <div>

              <h2 className="text-[21px] font-bold text-[#123d78]">
                All Projects
              </h2>

              <p className="mt-1 text-[10px] text-gray-400">
                Discover projects and find
                students to collaborate with.
              </p>

            </div>

            {/* CATEGORY FILTER */}

            <div className="flex flex-wrap gap-2">

              {categories.map(
                (category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() =>
                      setSelectedCategory(
                        category
                      )
                    }
                    className={`
                      rounded-full
                      px-4
                      py-2
                      text-[9px]
                      font-bold
                      transition
                      ${
                        selectedCategory ===
                        category
                          ? "bg-[#1684ff] text-white shadow-sm"
                          : "border border-blue-100 bg-white text-[#4d79a8] hover:bg-blue-50"
                      }
                    `}
                  >
                    {category}
                  </button>
                )
              )}

            </div>

          </div>

          {/* =================================================
              PROJECT RESULTS
          ================================================= */}

          <div className="mt-5">

            {isLoading ? (

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

                {[1, 2, 3, 4, 5, 6].map(
                  (item) => (
                    <div
                      key={item}
                      className="
                        h-[250px]
                        animate-pulse
                        rounded-2xl
                        border
                        border-blue-100
                        bg-white
                      "
                    />
                  )
                )}

              </div>

            ) : error ? (

              <div className="rounded-2xl border border-red-100 bg-white p-10 text-center">

                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500">
                  <X size={22} />
                </div>

                <h3 className="mt-4 text-[15px] font-bold text-[#123d78]">
                  Unable to load projects
                </h3>

                <p className="mt-2 text-[11px] text-gray-500">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    window.location.reload()
                  }
                  className="mt-5 rounded-xl bg-[#1684ff] px-5 py-2.5 text-[10px] font-bold text-white transition hover:bg-[#0874e8]"
                >
                  Try Again
                </button>

              </div>

            ) : filteredProjects.length ===
              0 ? (

              <div className="rounded-2xl border border-dashed border-blue-200 bg-white p-12 text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#1684ff]">
                  <Search size={24} />
                </div>

                <h3 className="mt-5 text-[16px] font-bold text-[#123d78]">
                  No projects found
                </h3>

                <p className="mx-auto mt-2 max-w-[400px] text-[11px] leading-5 text-gray-500">
                  Try searching for a
                  different project name,
                  skill, category, or
                  student.
                </p>

                {(searchTerm ||
                  selectedCategory !==
                    "All") && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory(
                        "All"
                      );
                    }}
                    className="mt-5 rounded-xl bg-[#1684ff] px-5 py-2.5 text-[10px] font-bold text-white transition hover:bg-[#0874e8]"
                  >
                    Clear Filters
                  </button>
                )}

              </div>

            ) : (

              <>

                <div className="mb-4 flex items-center justify-between">

                  <p className="text-[10px] text-gray-400">

                    Showing{" "}
                    <span className="font-bold text-[#123d78]">
                      {filteredProjects.length}
                    </span>{" "}
                    {filteredProjects.length ===
                    1
                      ? "project"
                      : "projects"}

                  </p>

                </div>

                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

                  {filteredProjects.map(
                    (
                      project,
                      index
                    ) => (
                      <ProjectCard
                        key={
                          project._id
                        }
                        project={
                          project
                        }
                        index={index}
                        onView={() =>
                          setSelectedProject(
                            project
                          )
                        }
                      />
                    )
                  )}

                </div>

              </>

            )}

          </div>

        </div>

      </main>

      {/* =====================================================
          PROJECT DETAILS MODAL
      ===================================================== */}

      {selectedProject && (
        <ProjectDetailsModal
          project={
            selectedProject
          }
          onClose={() =>
            setSelectedProject(
              null
            )
          }
        />
      )}

    </div>
  );
};

export default ExploreProjectsPage;