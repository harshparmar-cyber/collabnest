import {
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
  SlidersHorizontal,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type ProjectOwner = {
  _id: string;
  name: string;
  email: string;
};

type Project = {
  _id: string;
  title: string;
  description: string;
  category: string;
  skills: string[];
  teamSize: string;
  createdBy: ProjectOwner;
  createdAt: string;
};

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
        w-full
        items-center
        gap-4
        rounded-xl
        px-5
        py-3.5
        text-left
        transition
        duration-200
        ${
          active
            ? "bg-white/15 text-white shadow-sm"
            : "text-white/85 hover:bg-white/10 hover:text-white"
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

type ProjectCardProps = {
  project: Project;
  onView: () => void;
};

const ProjectCard = ({
  project,
  onView,
}: ProjectCardProps) => {
  return (
    <div
      className="
        group
        flex
        min-h-[245px]
        flex-col
        rounded-2xl
        border
        border-blue-100
        bg-white
        p-5
        shadow-sm
        transition
        duration-200
        hover:-translate-y-1
        hover:border-blue-200
        hover:shadow-lg
      "
    >
      {/* TOP */}

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-blue-100
              text-[#1684ff]
            "
          >
            <BriefcaseBusiness size={21} />
          </div>

          <div>
            <span
              className="
                inline-flex
                rounded-full
                bg-blue-50
                px-2.5
                py-1
                text-[9px]
                font-bold
                uppercase
                tracking-wide
                text-[#1684ff]
              "
            >
              {project.category}
            </span>
          </div>
        </div>
      </div>

      {/* TITLE */}

      <h3
        className="
          mt-5
          line-clamp-2
          text-[17px]
          font-bold
          leading-6
          text-[#123d78]
        "
      >
        {project.title}
      </h3>

      {/* DESCRIPTION */}

      <p
        className="
          mt-2
          line-clamp-3
          text-[11px]
          leading-5
          text-gray-500
        "
      >
        {project.description}
      </p>

      {/* SKILLS */}

      <div className="mt-4 flex flex-wrap gap-1.5">
        {project.skills.slice(0, 4).map((skill) => (
          <span
            key={skill}
            className="
              rounded-lg
              bg-[#f0f6ff]
              px-2.5
              py-1.5
              text-[9px]
              font-semibold
              text-[#2367a8]
            "
          >
            {skill}
          </span>
        ))}

        {project.skills.length > 4 && (
          <span
            className="
              rounded-lg
              bg-gray-100
              px-2.5
              py-1.5
              text-[9px]
              font-semibold
              text-gray-500
            "
          >
            +{project.skills.length - 4}
          </span>
        )}
      </div>

      {/* BOTTOM */}

      <div className="mt-auto flex items-end justify-between gap-3 pt-5">
        <div>
          <p className="text-[9px] font-medium uppercase tracking-wide text-gray-400">
            Posted by
          </p>

          <p className="mt-1 max-w-[150px] truncate text-[11px] font-bold text-[#123d78]">
            {project.createdBy?.name || "Student"}
          </p>
        </div>

        <div className="text-right">
          <p className="text-[9px] font-medium uppercase tracking-wide text-gray-400">
            Team size
          </p>

          <p className="mt-1 text-[11px] font-bold text-[#123d78]">
            {project.teamSize}
          </p>
        </div>
      </div>

      {/* VIEW BUTTON */}

      <button
        type="button"
        onClick={onView}
        className="
          mt-4
          flex
          w-full
          items-center
          justify-center
          gap-1.5
          rounded-xl
          bg-[#1684ff]
          py-2.5
          text-[10px]
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
        bg-[#062f70]/40
        p-4
        backdrop-blur-sm
      "
      onClick={onClose}
    >
      <div
        className="
          max-h-[90vh]
          w-full
          max-w-[650px]
          overflow-y-auto
          rounded-3xl
          bg-white
          shadow-2xl
        "
        onClick={(event) => event.stopPropagation()}
      >
        {/* HEADER */}

        <div
          className="
            relative
            overflow-hidden
            rounded-t-3xl
            bg-gradient-to-br
            from-[#073b88]
            to-[#1684ff]
            p-7
            text-white
          "
        >
          <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10" />

          <div className="relative flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-xl
                  bg-white/15
                "
              >
                <BriefcaseBusiness size={24} />
              </div>

              <div>
                <span
                  className="
                    rounded-full
                    bg-white/15
                    px-3
                    py-1
                    text-[9px]
                    font-bold
                    uppercase
                  "
                >
                  {project.category}
                </span>

                <h2 className="mt-2 text-[22px] font-bold leading-7">
                  {project.title}
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-white/10
                transition
                hover:bg-white/20
              "
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* BODY */}

        <div className="p-7">
          {/* OWNER */}

          <div
            className="
              flex
              items-center
              gap-3
              rounded-2xl
              border
              border-blue-100
              bg-[#f7fbff]
              p-4
            "
          >
            <div
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-full
                bg-gradient-to-br
                from-[#7cc4ff]
                to-[#2378d8]
                text-sm
                font-bold
                text-white
              "
            >
              {project.createdBy?.name
                ?.charAt(0)
                .toUpperCase() || "S"}
            </div>

            <div>
              <p className="text-[9px] font-medium uppercase tracking-wide text-gray-400">
                Posted by
              </p>

              <p className="mt-0.5 text-[13px] font-bold text-[#123d78]">
                {project.createdBy?.name || "Student"}
              </p>

              <p className="text-[10px] text-gray-500">
                {project.createdBy?.email || ""}
              </p>
            </div>
          </div>

          {/* DESCRIPTION */}

          <div className="mt-6">
            <h3 className="text-[14px] font-bold text-[#123d78]">
              About this project
            </h3>

            <p className="mt-2 text-[11px] leading-6 text-gray-600">
              {project.description}
            </p>
          </div>

          {/* INFO */}

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-blue-50 p-4">
              <p className="text-[9px] font-bold uppercase tracking-wide text-blue-400">
                Category
              </p>

              <p className="mt-1.5 text-[12px] font-bold text-[#123d78]">
                {project.category}
              </p>
            </div>

            <div className="rounded-2xl bg-blue-50 p-4">
              <p className="text-[9px] font-bold uppercase tracking-wide text-blue-400">
                Team Size
              </p>

              <p className="mt-1.5 text-[12px] font-bold text-[#123d78]">
                {project.teamSize}
              </p>
            </div>
          </div>

          {/* SKILLS */}

          <div className="mt-6">
            <h3 className="text-[14px] font-bold text-[#123d78]">
              Required Skills
            </h3>

            <div className="mt-3 flex flex-wrap gap-2">
              {project.skills.map((skill) => (
                <span
                  key={skill}
                  className="
                    rounded-xl
                    border
                    border-blue-100
                    bg-blue-50
                    px-3
                    py-2
                    text-[10px]
                    font-semibold
                    text-[#2367a8]
                  "
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* ACTIONS */}

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
                bg-gradient-to-r
                from-[#1684ff]
                to-[#0759bd]
                py-3
                text-[11px]
                font-bold
                text-white
                shadow-lg
                shadow-blue-200
                transition
                hover:-translate-y-[1px]
              "
            >
              Connect & Collaborate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ExploreProjectsPage = () => {
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;

  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState("All");

  const [selectedProject, setSelectedProject] =
    useState<Project | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] =
    useState("");

  // =====================================================
  // FETCH ALL PROJECTS
  // =====================================================

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const response = await fetch(
          `${API_URL}/api/projects`
        );

        const data = await response.json();

        if (!response.ok) {
          setErrorMessage(
            data.message ||
              "Failed to load projects."
          );
          return;
        }

        setProjects(data.projects || []);
      } catch (error) {
        console.error(
          "Fetch projects error:",
          error
        );

        setErrorMessage(
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
    const uniqueCategories = Array.from(
      new Set(
        projects
          .map((project) => project.category)
          .filter(Boolean)
      )
    );

    return ["All", ...uniqueCategories];
  }, [projects]);

  // =====================================================
  // FILTER PROJECTS
  // =====================================================

  const filteredProjects = useMemo(() => {
    const query = searchQuery
      .trim()
      .toLowerCase();

    return projects.filter((project) => {
      const matchesCategory =
        selectedCategory === "All" ||
        project.category === selectedCategory;

      if (!matchesCategory) {
        return false;
      }

      if (!query) {
        return true;
      }

      const searchableText = [
        project.title,
        project.description,
        project.category,
        project.teamSize,
        project.createdBy?.name || "",
        ...(project.skills || []),
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [
    projects,
    searchQuery,
    selectedCategory,
  ]);

  return (
    <div
      className="
        min-h-screen
        bg-[#f5f9ff]
        text-[#12355b]
      "
    >
      {/* =====================================================
          TOP NAVBAR
      ===================================================== */}

      <header
        className="
          fixed
          left-0
          right-0
          top-0
          z-50
          h-[70px]
          bg-gradient-to-r
          from-[#073b88]
          to-[#0b4da5]
          text-white
          shadow-lg
        "
      >
        <div className="flex h-full items-center">
          {/* LOGO */}

          <div
            className="
              flex
              w-[240px]
              shrink-0
              items-center
              gap-3
              px-7
            "
          >
            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-[#1684ff]
                shadow-lg
              "
            >
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

          {/* TOP SEARCH */}

          <div className="flex flex-1 items-center justify-center px-5">
            <div
              className="
                flex
                h-[44px]
                w-full
                max-w-[580px]
                items-center
                gap-3
                rounded-full
                bg-white/10
                px-5
                backdrop-blur-md
              "
            >
              <Search
                size={19}
                className="text-white/80"
              />

              <input
                type="text"
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(
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

          {/* PROFILE */}

          <div className="flex items-center gap-4 px-6">
            <div className="relative">
              <button
                type="button"
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  bg-white/10
                "
              >
                <span className="text-lg">
                  🔔
                </span>
              </button>

              <span
                className="
                  absolute
                  -right-1
                  -top-1
                  flex
                  h-5
                  min-w-5
                  items-center
                  justify-center
                  rounded-full
                  bg-red-500
                  px-1
                  text-[9px]
                  font-bold
                "
              >
                3
              </span>
            </div>

            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                bg-gradient-to-br
                from-[#7cc4ff]
                to-[#2378d8]
                text-[13px]
                font-bold
              "
            >
              H
            </div>

            <span className="hidden text-[13px] font-semibold lg:block">
              Harsh
            </span>

            <ChevronRight
              size={15}
              className="rotate-90"
            />
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
              <BriefcaseBusiness size={20} />
            }
            label="Find Projects"
            active
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
          SCROLLABLE MAIN CONTENT
      ===================================================== */}

      <main
        className="
          h-screen
          overflow-y-auto
          pt-[70px]
          md:ml-[240px]
        "
      >
        <div className="mx-auto max-w-[1500px] p-5 md:p-7">
          {/* =================================================
              HERO
          ================================================= */}

          <section
            className="
              relative
              min-h-[350px]
              overflow-hidden
              rounded-2xl
              border
              border-blue-100
              bg-gradient-to-br
              from-[#eaf5ff]
              via-[#dceeff]
              to-[#c9e4ff]
              p-7
              shadow-sm
            "
          >
            {/* DECORATIVE SHAPES */}

            <div
              className="
                absolute
                -right-16
                -top-20
                h-56
                w-56
                rounded-full
                bg-white/30
              "
            />

            <div
              className="
                absolute
                bottom-[-100px]
                right-[25%]
                h-64
                w-64
                rounded-full
                bg-[#8fc8fa]/25
              "
            />

            {/* CONTENT */}

            <div className="relative z-10 max-w-[850px]">
              <div className="flex items-center gap-3">
                <div
                  className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-xl
                    bg-[#1684ff]
                    text-white
                    shadow-lg
                  "
                >
                  <Users size={23} />
                </div>

                <span
                  className="
                    rounded-full
                    bg-white/70
                    px-3
                    py-1.5
                    text-[9px]
                    font-bold
                    uppercase
                    tracking-wide
                    text-[#1684ff]
                  "
                >
                  Collaborate
                </span>
              </div>

              <h1
                className="
                  mt-7
                  text-[38px]
                  font-bold
                  tracking-[-1.5px]
                  text-[#123d78]
                  md:text-[48px]
                "
              >
                Find Collaborators
              </h1>

              <p
                className="
                  mt-3
                  max-w-[700px]
                  text-[13px]
                  leading-6
                  text-[#2367a8]
                  md:text-[15px]
                "
              >
                Explore projects posted by
                students and find the right
                people to build something
                amazing together.
              </p>

              {/* SEARCH */}

              <div
                className="
                  mt-7
                  flex
                  h-[58px]
                  w-full
                  max-w-[800px]
                  items-center
                  gap-3
                  rounded-full
                  bg-white
                  px-6
                  shadow-lg
                "
              >
                <Search
                  size={21}
                  className="text-[#1684ff]"
                />

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) =>
                    setSearchQuery(
                      event.target.value
                    )
                  }
                  placeholder="Search projects, skills, categories, or students..."
                  className="
                    w-full
                    bg-transparent
                    text-[12px]
                    text-[#123d78]
                    outline-none
                    placeholder:text-gray-400
                    md:text-[13px]
                  "
                />

                {searchQuery && (
                  <button
                    type="button"
                    onClick={() =>
                      setSearchQuery("")
                    }
                    className="
                      flex
                      h-7
                      w-7
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-gray-100
                      text-gray-500
                      hover:bg-gray-200
                    "
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* PROJECT COUNT */}

            <div
              className="
                absolute
                right-8
                top-8
                hidden
                rounded-2xl
                border
                border-blue-100
                bg-white/80
                px-6
                py-5
                shadow-sm
                backdrop-blur
                md:block
              "
            >
              <p className="text-[9px] font-semibold uppercase tracking-wide text-gray-400">
                Available Projects
              </p>

              <p className="mt-2 text-[25px] font-bold text-[#123d78]">
                {projects.length}
              </p>
            </div>
          </section>

          {/* =================================================
              PROJECT SECTION
          ================================================= */}

          <section className="mt-8">
            {/* HEADER */}

            <div
              className="
                flex
                flex-col
                gap-4
                md:flex-row
                md:items-end
                md:justify-between
              "
            >
              <div>
                <div className="flex items-center gap-3">
                  <SlidersHorizontal
                    size={21}
                    className="text-[#1684ff]"
                  />

                  <h2
                    className="
                      text-[24px]
                      font-bold
                      text-[#123d78]
                    "
                  >
                    All Projects
                  </h2>
                </div>

                <p className="mt-1 text-[11px] text-gray-500">
                  Browse all projects posted
                  by students on CollabNest.
                </p>
              </div>

              <div
                className="
                  rounded-full
                  bg-blue-50
                  px-4
                  py-2
                  text-[10px]
                  font-bold
                  text-[#1684ff]
                "
              >
                {filteredProjects.length}{" "}
                {filteredProjects.length === 1
                  ? "Project"
                  : "Projects"}
              </div>
            </div>

            {/* CATEGORY FILTERS */}

            <div
              className="
                mt-5
                flex
                gap-2
                overflow-x-auto
                pb-2
              "
            >
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() =>
                    setSelectedCategory(
                      category
                    )
                  }
                  className={`
                    shrink-0
                    rounded-full
                    px-4
                    py-2
                    text-[10px]
                    font-bold
                    transition
                    ${
                      selectedCategory ===
                      category
                        ? "bg-[#1684ff] text-white shadow-sm"
                        : "border border-blue-100 bg-white text-[#2367a8] hover:bg-blue-50"
                    }
                  `}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* =================================================
                LOADING
            ================================================= */}

            {isLoading && (
              <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({
                  length: 6,
                }).map((_, index) => (
                  <div
                    key={index}
                    className="
                      h-[245px]
                      animate-pulse
                      rounded-2xl
                      border
                      border-blue-100
                      bg-white
                    "
                  />
                ))}
              </div>
            )}

            {/* =================================================
                ERROR
            ================================================= */}

            {!isLoading && errorMessage && (
              <div
                className="
                  mt-6
                  rounded-2xl
                  border
                  border-red-100
                  bg-white
                  p-8
                  text-center
                "
              >
                <h3 className="text-[15px] font-bold text-red-500">
                  Unable to load projects
                </h3>

                <p className="mt-2 text-[11px] text-gray-500">
                  {errorMessage}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    window.location.reload()
                  }
                  className="
                    mt-4
                    rounded-xl
                    bg-[#1684ff]
                    px-5
                    py-2.5
                    text-[10px]
                    font-bold
                    text-white
                  "
                >
                  Try Again
                </button>
              </div>
            )}

            {/* =================================================
                ALL PROJECTS
            ================================================= */}

            {!isLoading &&
              !errorMessage &&
              filteredProjects.length > 0 && (
                <div
                  className="
                    mt-6
                    grid
                    gap-5
                    md:grid-cols-2
                    xl:grid-cols-3
                  "
                >
                  {filteredProjects.map(
                    (project) => (
                      <ProjectCard
                        key={project._id}
                        project={project}
                        onView={() =>
                          setSelectedProject(
                            project
                          )
                        }
                      />
                    )
                  )}
                </div>
              )}

            {/* =================================================
                NO RESULTS
            ================================================= */}

            {!isLoading &&
              !errorMessage &&
              filteredProjects.length ===
                0 && (
                <div
                  className="
                    mt-6
                    rounded-2xl
                    border
                    border-dashed
                    border-blue-200
                    bg-white
                    p-12
                    text-center
                  "
                >
                  <div
                    className="
                      mx-auto
                      flex
                      h-14
                      w-14
                      items-center
                      justify-center
                      rounded-2xl
                      bg-blue-50
                      text-[#1684ff]
                    "
                  >
                    <Search size={24} />
                  </div>

                  <h3
                    className="
                      mt-5
                      text-[16px]
                      font-bold
                      text-[#123d78]
                    "
                  >
                    No projects found
                  </h3>

                  <p
                    className="
                      mx-auto
                      mt-2
                      max-w-[400px]
                      text-[11px]
                      leading-5
                      text-gray-500
                    "
                  >
                    Try another search term
                    or choose a different
                    category.
                  </p>

                  {(searchQuery ||
                    selectedCategory !==
                      "All") && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedCategory(
                          "All"
                        );
                      }}
                      className="
                        mt-5
                        rounded-xl
                        bg-[#1684ff]
                        px-5
                        py-2.5
                        text-[10px]
                        font-bold
                        text-white
                        transition
                        hover:bg-[#0874e8]
                      "
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              )}

            {/* BOTTOM SPACE */}

            <div className="h-10" />
          </section>
        </div>
      </main>

      {/* =====================================================
          PROJECT DETAILS MODAL
      ===================================================== */}

      {selectedProject && (
        <ProjectDetailsModal
          project={selectedProject}
          onClose={() =>
            setSelectedProject(null)
          }
        />
      )}
    </div>
  );
};

export default ExploreProjectsPage;