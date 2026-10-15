import {
  ArrowLeft,
  BriefcaseBusiness,
  CheckCircle2,
  Code2,
  ExternalLink,
  Globe,
  Link2,
  Pencil,
  Plus,
  Save,
  Sparkles,
  Trash2,
  User,
  X,
} from "lucide-react";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

type PortfolioProject = {
  _id?: string;
  title: string;
  description: string;
  link: string;
  image: string;
};

type PostedProject = {
  _id: string;
  title: string;
  description: string;
  category: string;
  skills: string[];
  teamSize: string;
  createdBy:
    | string
    | {
        _id: string;
        name: string;
        email?: string;
        profilePhoto?: string;
      };
  createdAt: string;
  updatedAt: string;
};

type UserProfile = {
  id: string;
  name: string;
  email?: string;
  bio: string;
  skills: string[];
  profilePhoto: string;
  portfolio: PortfolioProject[];
  createdAt?: string;
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const API_URL = import.meta.env.VITE_API_URL;

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [postedProjects, setPostedProjects] = useState<PostedProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [profilePhoto, setProfilePhoto] = useState("");
  const [portfolio, setPortfolio] = useState<PortfolioProject[]>([]);
  const [skillInput, setSkillInput] = useState("");

  const [newProject, setNewProject] = useState<PortfolioProject>({
    title: "",
    description: "",
    link: "",
    image: "",
  });

  const [showPortfolioForm, setShowPortfolioForm] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("");

  const isOwnProfile =
    !userId || (currentUserId !== "" && userId === currentUserId);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        let response: Response;

        if (userId) {
          response = await fetch(`${API_URL}/api/auth/users/${userId}`);
        } else {
          response = await fetch(`${API_URL}/api/auth/me`, {
            credentials: "include",
          });
        }

        const data = await response.json();

        if (!response.ok) {
          setErrorMessage(data.message || "Unable to load profile.");
          return;
        }

        const loadedProfile: UserProfile = data.user;

        setProfile(loadedProfile);
        setName(loadedProfile.name || "");
        setBio(loadedProfile.bio || "");
        setSkills(loadedProfile.skills || []);
        setProfilePhoto(loadedProfile.profilePhoto || "");
        setPortfolio(loadedProfile.portfolio || []);

        if (!userId) {
          setCurrentUserId(String(loadedProfile.id));
        }
      } catch (error) {
        console.error("Fetch profile error:", error);
        setErrorMessage("Unable to connect to the server.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [API_URL, userId]);

  useEffect(() => {
    if (!userId) return;

    const fetchCurrentUser = async () => {
      try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
          credentials: "include",
        });

        if (!response.ok) return;

        const data = await response.json();

        if (data.user?.id) {
          setCurrentUserId(String(data.user.id));
        }
      } catch (error) {
        console.error("Fetch current user error:", error);
      }
    };

    fetchCurrentUser();
  }, [API_URL, userId]);

  useEffect(() => {
    if (!profile?.id) return;

    const fetchUserProjects = async () => {
      try {
        setProjectsLoading(true);

        const response = await fetch(`${API_URL}/api/projects`);
        const data = await response.json();

        if (!response.ok) {
          console.error(data.message || "Failed to load projects.");
          return;
        }

        const allProjects: PostedProject[] = data.projects || [];

        const userProjects = allProjects.filter((project) => {
          if (!project.createdBy) return false;

          if (typeof project.createdBy === "string") {
            return project.createdBy === String(profile.id);
          }

          return String(project.createdBy._id) === String(profile.id);
        });

        setPostedProjects(userProjects);
      } catch (error) {
        console.error("Fetch user projects error:", error);
      } finally {
        setProjectsLoading(false);
      }
    };

    fetchUserProjects();
  }, [API_URL, profile?.id]);

  const handleProfilePhotoClick = () => {
    if (!isOwnProfile || !isEditing) return;
    fileInputRef.current?.click();
  };

  const handleProfilePhotoChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      alert("Please choose a JPG, PNG, or WebP image.");
      event.target.value = "";
      return;
    }

    const maxSize = 3 * 1024 * 1024;

    if (file.size > maxSize) {
      alert("Profile photo must be smaller than 3 MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") setProfilePhoto(result);
    };

    reader.onerror = () => {
      alert("Unable to read the selected image.");
    };

    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleAddSkill = () => {
    const skill = skillInput.trim();
    if (!skill) return;

    if (skills.includes(skill)) {
      setSkillInput("");
      return;
    }

    setSkills((currentSkills) => [...currentSkills, skill]);
    setSkillInput("");
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills((currentSkills) =>
      currentSkills.filter((skill) => skill !== skillToRemove)
    );
  };

  const handleAddPortfolioProject = () => {
    if (!newProject.title.trim()) {
      alert("Please enter a project title.");
      return;
    }

    setPortfolio((currentProjects) => [
      ...currentProjects,
      {
        title: newProject.title.trim(),
        description: newProject.description.trim(),
        link: newProject.link.trim(),
        image: newProject.image.trim(),
      },
    ]);

    setNewProject({
      title: "",
      description: "",
      link: "",
      image: "",
    });

    setShowPortfolioForm(false);
  };

  const handleRemovePortfolioProject = (index: number) => {
    setPortfolio((currentProjects) =>
      currentProjects.filter((_, projectIndex) => projectIndex !== index)
    );
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      alert("Name is required.");
      return;
    }

    try {
      setIsSaving(true);

      const response = await fetch(`${API_URL}/api/auth/profile`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          bio: bio.trim(),
          skills,
          profilePhoto,
          portfolio,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to update your profile.");
        return;
      }

      const updatedProfile: UserProfile = data.user;

      setProfile(updatedProfile);
      setName(updatedProfile.name || "");
      setBio(updatedProfile.bio || "");
      setSkills(updatedProfile.skills || []);
      setProfilePhoto(updatedProfile.profilePhoto || "");
      setPortfolio(updatedProfile.portfolio || []);
      setIsEditing(false);

      alert("Profile updated successfully.");
    } catch (error) {
      console.error("Save profile error:", error);
      alert("Unable to connect to the server. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEditing = () => {
    if (!profile) return;

    setName(profile.name || "");
    setBio(profile.bio || "");
    setSkills(profile.skills || []);
    setProfilePhoto(profile.profilePhoto || "");
    setPortfolio(profile.portfolio || []);
    setSkillInput("");

    setNewProject({
      title: "",
      description: "",
      link: "",
      image: "",
    });

    setShowPortfolioForm(false);
    setIsEditing(false);
  };

  const handleEditPostedProject = (project: PostedProject) => {
    navigate("/post-project", {
      state: {
        editMode: true,
        project,
      },
    });
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f7fc]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200/80 border-t-[#1684ff]" />
          <p className="mt-4 text-sm font-medium text-[#315f96]">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  if (errorMessage || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f7fc] px-5">
        <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
            <X size={25} />
          </div>

          <h2 className="mt-5 text-xl font-bold text-[#123d78]">
            Unable to load profile
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            {errorMessage || "The requested profile could not be found."}
          </p>

          <button
            type="button"
            onClick={handleBack}
            className="mt-6 rounded-xl bg-[#1684ff] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0874e8]"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const displayName = profile.name || "Student";

  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-[#f7faff] via-[#f3f7fc] to-[#edf3fb] text-[#172f52]">
      <header className="fixed left-0 right-0 top-0 z-50 h-[72px] border-b border-white/10 bg-[#092b5d]/95 text-white shadow-[0_8px_30px_-18px_rgba(0,0,0,0.5)] backdrop-blur-xl">
        <div className="flex h-full items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleBack}
              className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-white/10"
              aria-label="Go back"
            >
              <ArrowLeft size={20} />
            </button>

            <div>
              <div className="text-[20px] font-bold tracking-[-0.7px]">
                Collab<span className="text-[#74b9ff]">Nest</span>
              </div>
              <p className="hidden text-xs text-blue-100/80 sm:block">
                Student collaboration profile
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isOwnProfile && !isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex h-10 items-center gap-2 rounded-xl bg-white/10 px-4 text-sm font-semibold transition hover:bg-white/20"
              >
                <Pencil size={15} />
                Edit Profile
              </button>
            )}

            {isOwnProfile && isEditing && (
              <>
                <button
                  type="button"
                  onClick={handleCancelEditing}
                  disabled={isSaving}
                  className="flex h-10 items-center gap-2 rounded-xl bg-white/10 px-4 text-sm font-semibold transition hover:bg-white/20 disabled:opacity-50"
                >
                  <X size={15} />
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="flex h-10 items-center gap-2 rounded-xl bg-[#1684ff] px-4 text-sm font-bold text-white shadow-lg transition hover:bg-[#0874e8] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save size={15} />
                  {isSaving ? "Saving..." : "Save Profile"}
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="w-full overflow-visible pt-[72px]">
  <div className="mx-auto w-full max-w-[1320px] px-4 py-6 md:px-8 md:py-10">
          <section className="relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_20px_55px_-35px_rgba(15,45,90,0.35)]">
            <div className="absolute inset-x-0 top-0 h-[190px] bg-gradient-to-r from-[#092b5d] via-[#104782] to-[#1676d2]" />
            <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/10" />
            <div className="absolute right-[25%] top-20 h-40 w-40 rounded-full bg-white/5" />

            <div className="relative px-6 pb-8 pt-28 md:px-10">
              <div className="flex flex-col gap-6 md:flex-row md:items-end">
                <div className="relative mx-auto shrink-0 md:mx-0">
                  <div className="relative h-36 w-36 overflow-hidden rounded-full border-[6px] border-white bg-gradient-to-br from-[#70b9f5] to-[#277bc9] shadow-[0_14px_30px_-12px_rgba(9,43,93,0.45)]">
                    {profilePhoto ? (
                      <img
                        src={profilePhoto}
                        alt={displayName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-white">
                        {initials || "U"}
                      </div>
                    )}

                    {isOwnProfile && isEditing && (
                      <button
                        type="button"
                        onClick={handleProfilePhotoClick}
                        className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/45 text-white opacity-100 transition hover:bg-black/55"
                        aria-label="Change profile photo"
                      >
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                          <Pencil size={20} />
                        </div>
                      </button>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleProfilePhotoChange}
                  />

                  {isOwnProfile && isEditing && (
                    <div className="mt-3 text-center">
                      <p className="text-xs font-medium text-gray-400">
                        Click the ✏️ button to change photo
                      </p>
                      <p className="mt-1 text-sm text-gray-400">
                        JPG, PNG or WebP · Max 3 MB
                      </p>
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1 translate-y-6 text-center md:translate-y-8 md:text-left">
                  {isEditing && isOwnProfile ? (
                    <div className="max-w-[520px]">
                      <label className="text-xs font-bold uppercase tracking-[0.08em] text-gray-400">
                        Name
                      </label>

                      <input
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        maxLength={60}
                        className="mt-1 h-12 w-full rounded-xl border border-slate-200/80 bg-white px-4 text-xl font-bold text-[#123d78] outline-none transition focus:border-[#1684ff] focus:ring-4 focus:ring-blue-100/70"
                      />
                    </div>
                  ) : (
                    <h1 className="break-words text-3xl font-bold leading-tight text-[#092b5d] md:text-4xl">
                      {displayName}
                    </h1>
                  )}

                  {profile.email && (
                    <p className="mt-2 text-sm text-gray-400">
                      {profile.email}
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap justify-center gap-2 md:justify-start">
                    {skills.length > 0 ? (
                      skills.slice(0, 5).map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full border border-blue-100 bg-blue-50/80 px-3.5 py-2 text-xs font-semibold text-[#1265c7]"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400">
                        No skills added yet
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 justify-center gap-8 md:pb-3">
                  <div className="text-center">
                    <p className="text-xl font-bold text-[#123d78]">
                      {postedProjects.length}
                    </p>
                    <p className="mt-1 text-xs font-medium text-gray-400">
                      Projects
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="text-xl font-bold text-[#123d78]">
                      {skills.length}
                    </p>
                    <p className="mt-1 text-xs font-medium text-gray-400">
                      Skills
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="text-xl font-bold text-[#123d78]">
                      {portfolio.length}
                    </p>
                    <p className="mt-1 text-xs font-medium text-gray-400">
                      Portfolio
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
                    <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.85fr)]">
            <div className="min-w-0 space-y-6">
              {/* About */}
              <section className="rounded-[24px] border border-slate-200/80 bg-white p-6 shadow-[0_12px_35px_-28px_rgba(15,45,90,0.35)] md:p-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#1684ff]">
                    <User size={19} />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-[#123d78]">
                      About me
                    </h2>
                    <p className="text-xs text-gray-400">
                      A little introduction
                    </p>
                  </div>
                </div>

                {isEditing && isOwnProfile ? (
                  <textarea
                    value={bio}
                    onChange={(event) => setBio(event.target.value)}
                    rows={5}
                    maxLength={1000}
                    placeholder="Tell other students about yourself, your interests, and what you enjoy building..."
                    className="mt-6 w-full resize-y rounded-xl border border-slate-200 bg-[#fbfdff] p-4 text-sm leading-7 text-slate-700 outline-none transition placeholder:text-gray-400 focus:border-[#1684ff] focus:ring-4 focus:ring-blue-100/70"
                  />
                ) : (
                  <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-slate-600">
                    {profile.bio?.trim() ||
                      "This student hasn't added an introduction yet."}
                  </p>
                )}
              </section>

              {/* Skills */}
              <section className="rounded-[24px] border border-slate-200/80 bg-white p-6 shadow-[0_12px_35px_-28px_rgba(15,45,90,0.35)] md:p-8">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                      <Code2 size={19} />
                    </div>

                    <div>
                      <h2 className="text-lg font-bold text-[#123d78]">
                        Skills & expertise
                      </h2>
                      <p className="text-xs text-gray-400">
                        Technologies and skills
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                    {skills.length} {skills.length === 1 ? "skill" : "skills"}
                  </span>
                </div>

                {isEditing && isOwnProfile && (
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <input
                      value={skillInput}
                      onChange={(event) => setSkillInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          handleAddSkill();
                        }
                      }}
                      placeholder="e.g. React, TypeScript, UI/UX"
                      className="h-11 min-w-0 flex-1 rounded-xl border border-slate-200 bg-[#fbfdff] px-4 text-sm outline-none transition focus:border-[#1684ff] focus:ring-4 focus:ring-blue-100/70"
                    />

                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#1265c7] px-5 text-sm font-semibold text-white transition hover:bg-[#0c53a8]"
                    >
                      <Plus size={16} />
                      Add skill
                    </button>
                  </div>
                )}

                {skills.length > 0 ? (
                  <div className="mt-6 flex flex-wrap gap-2.5">
                    {skills.map((skill) => (
                      <div
                        key={skill}
                        className="group inline-flex items-center gap-2 rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-[#f7fbff] px-3.5 py-2.5 text-sm font-medium text-[#285b99] transition hover:border-blue-200 hover:shadow-sm"
                      >
                        <span>{skill}</span>

                        {isEditing && isOwnProfile && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="flex h-5 w-5 items-center justify-center rounded-full text-slate-400 transition hover:bg-red-100 hover:text-red-600"
                            aria-label={`Remove ${skill}`}
                          >
                            <X size={13} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-5 py-8 text-center">
                    <Code2
                      size={25}
                      className="mx-auto text-slate-300"
                    />
                    <p className="mt-3 text-sm font-semibold text-slate-500">
                      No skills added yet
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      Add your skills to help other students discover your
                      expertise.
                    </p>
                  </div>
                )}
              </section>

              {/* Projects posted on CollabNest */}
              <section className="rounded-[24px] border border-slate-200/80 bg-white p-6 shadow-[0_12px_35px_-28px_rgba(15,45,90,0.35)] md:p-8">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                      <BriefcaseBusiness size={19} />
                    </div>

                    <div>
                      <h2 className="text-lg font-bold text-[#123d78]">
                        Projects on CollabNest
                      </h2>
                      <p className="text-xs text-gray-400">
                        Ideas and opportunities shared
                      </p>
                    </div>
                  </div>

                  {isOwnProfile && (
                    <button
                      type="button"
                      onClick={() => navigate("/post-project")}
                      className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl bg-blue-50 px-3 text-xs font-semibold text-[#1265c7] transition hover:bg-blue-100"
                    >
                      <Plus size={14} />
                      <span className="hidden sm:inline">Post project</span>
                      <span className="sm:hidden">Post</span>
                    </button>
                  )}
                </div>

                {projectsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-blue-100 border-t-[#1684ff]" />
                  </div>
                ) : postedProjects.length > 0 ? (
                  <div className="mt-6 space-y-4">
                    {postedProjects.map((project) => (
                      <article
                        key={project._id}
                        className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white to-slate-50/70 p-5 transition hover:border-blue-200 hover:shadow-[0_12px_30px_-24px_rgba(18,101,199,0.45)]"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0 flex-1">
                            <h3 className="break-words text-base font-bold text-[#123d78]">
                              {project.title}
                            </h3>

                            {project.category && (
                              <span className="mt-2 inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-600">
                                {project.category}
                              </span>
                            )}
                          </div>

                          {isOwnProfile && (
                            <button
                              type="button"
                              onClick={() =>
                                handleEditPostedProject(project)
                              }
                              className="inline-flex h-9 shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                            >
                              <Pencil size={13} />
                              Edit project
                            </button>
                          )}
                        </div>

                        {project.description && (
                          <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">
                            {project.description}
                          </p>
                        )}

                        {project.skills?.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {project.skills.map((skill) => (
                              <span
                                key={skill}
                                className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-600"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">
                          <span className="text-xs text-slate-400">
                            {project.createdAt
                              ? `Posted ${new Date(
                                  project.createdAt
                                ).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}`
                              : "Project"}
                          </span>

                          {project.teamSize && (
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                              <User size={13} />
                              Team size: {project.teamSize}
                            </span>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-5 py-10 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
                      <BriefcaseBusiness size={22} />
                    </div>
                    <p className="mt-3 text-sm font-semibold text-slate-600">
                      No projects posted yet
                    </p>
                    <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-400">
                      Share a project idea and find students who want to build
                      something together.
                    </p>

                    {isOwnProfile && (
                      <button
                        type="button"
                        onClick={() => navigate("/post-project")}
                        className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-[#1265c7] px-4 text-sm font-semibold text-white transition hover:bg-[#0c53a8]"
                      >
                        <Plus size={15} />
                        Create a project
                      </button>
                    )}
                  </div>
                )}
              </section>

              {/* Portfolio */}
              <section className="rounded-[24px] border border-slate-200/80 bg-white p-6 shadow-[0_12px_35px_-28px_rgba(15,45,90,0.35)] md:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                      <Globe size={19} />
                    </div>

                    <div>
                      <h2 className="text-lg font-bold text-[#123d78]">
                        Portfolio
                      </h2>
                      <p className="text-xs text-gray-400">
                        Projects and work you're proud of
                      </p>
                    </div>
                  </div>

                  {isOwnProfile && isEditing && (
                    <button
                      type="button"
                      onClick={() =>
                        setShowPortfolioForm((current) => !current)
                      }
                      className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-xl bg-violet-50 px-4 text-sm font-semibold text-violet-700 transition hover:bg-violet-100 sm:self-auto"
                    >
                      {showPortfolioForm ? (
                        <X size={15} />
                      ) : (
                        <Plus size={15} />
                      )}
                      {showPortfolioForm ? "Cancel" : "Add portfolio item"}
                    </button>
                  )}
                </div>

                {showPortfolioForm && isOwnProfile && isEditing && (
                  <div className="mt-6 rounded-2xl border border-violet-100 bg-violet-50/40 p-5">
                    <h3 className="text-sm font-bold text-[#123d78]">
                      Add a portfolio project
                    </h3>

                    <div className="mt-4 grid grid-cols-1 gap-4">
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                          Project title *
                        </label>
                        <input
                          value={newProject.title}
                          onChange={(event) =>
                            setNewProject({
                              ...newProject,
                              title: event.target.value,
                            })
                          }
                          placeholder="e.g. EV Charging Locator"
                          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100/70"
                        />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                          Description
                        </label>
                        <textarea
                          value={newProject.description}
                          onChange={(event) =>
                            setNewProject({
                              ...newProject,
                              description: event.target.value,
                            })
                          }
                          rows={3}
                          placeholder="What does this project do?"
                          className="w-full resize-y rounded-xl border border-slate-200 bg-white p-3.5 text-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100/70"
                        />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                          Project URL
                        </label>
                        <input
                          type="url"
                          value={newProject.link}
                          onChange={(event) =>
                            setNewProject({
                              ...newProject,
                              link: event.target.value,
                            })
                          }
                          placeholder="https://github.com/your-project"
                          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100/70"
                        />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                          Image URL (optional)
                        </label>
                        <input
                          type="url"
                          value={newProject.image}
                          onChange={(event) =>
                            setNewProject({
                              ...newProject,
                              image: event.target.value,
                            })
                          }
                          placeholder="https://example.com/project-image.png"
                          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100/70"
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={handleAddPortfolioProject}
                          className="inline-flex h-10 items-center gap-2 rounded-xl bg-violet-600 px-5 text-sm font-semibold text-white transition hover:bg-violet-700"
                        >
                          <Plus size={15} />
                          Add to portfolio
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {portfolio.length > 0 ? (
                  <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {portfolio.map((item, index) => (
                      <article
                        key={item._id || `${item.title}-${index}`}
                        className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg"
                      >
                        {item.image ? (
                          <div className="h-40 overflow-hidden bg-slate-100">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                            />
                          </div>
                        ) : (
                          <div className="flex h-32 items-center justify-center bg-gradient-to-br from-[#edf5ff] via-[#f7faff] to-violet-50">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#1684ff] shadow-sm">
                              <Code2 size={25} />
                            </div>
                          </div>
                        )}

                        <div className="p-5">
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="break-words text-base font-bold text-[#123d78]">
                              {item.title}
                            </h3>

                            {isEditing && isOwnProfile && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemovePortfolioProject(index)
                                }
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                                aria-label={`Remove ${item.title}`}
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>

                          {item.description && (
                            <p className="mt-2 line-clamp-3 whitespace-pre-wrap break-words text-sm leading-6 text-slate-500">
                              {item.description}
                            </p>
                          )}

                          {item.link && (
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#1265c7] transition hover:text-[#084a96]"
                            >
                              <Link2 size={15} />
                              View project
                              <ExternalLink size={13} />
                            </a>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-5 py-10 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
                      <Globe size={22} />
                    </div>
                    <p className="mt-3 text-sm font-semibold text-slate-600">
                      Nothing in the portfolio yet
                    </p>
                    <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-400">
                      Showcase your best work, add project links, and help
                      potential collaborators see what you can do.
                    </p>

                    {isOwnProfile && isEditing && (
                      <button
                        type="button"
                        onClick={() => setShowPortfolioForm(true)}
                        className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl border border-violet-200 bg-white px-4 text-sm font-semibold text-violet-700 transition hover:bg-violet-50"
                      >
                        <Plus size={15} />
                        Add your first project
                      </button>
                    )}
                  </div>
                )}
              </section>
                          </div>

            {/* Right sidebar */}
            <aside className="min-w-0 space-y-6">
              {/* Profile summary */}
              <section className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-[0_12px_35px_-28px_rgba(15,45,90,0.35)]">
                <div className="bg-gradient-to-r from-[#092b5d] to-[#1265c7] px-6 py-5">
                  <div className="flex items-center gap-2 text-white">
                    <Sparkles size={18} />
                    <h2 className="text-base font-bold">Profile overview</h2>
                  </div>
                  <p className="mt-1 text-xs text-blue-100/80">
                    Your collaboration snapshot
                  </p>
                </div>

                <div className="space-y-5 p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <BriefcaseBusiness size={18} />
                      </div>
                      <span className="text-sm text-slate-600">
                        Projects posted
                      </span>
                    </div>
                    <span className="text-lg font-bold text-[#123d78]">
                      {postedProjects.length}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                        <Code2 size={18} />
                      </div>
                      <span className="text-sm text-slate-600">
                        Skills listed
                      </span>
                    </div>
                    <span className="text-lg font-bold text-[#123d78]">
                      {skills.length}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                        <Globe size={18} />
                      </div>
                      <span className="text-sm text-slate-600">
                        Portfolio items
                      </span>
                    </div>
                    <span className="text-lg font-bold text-[#123d78]">
                      {portfolio.length}
                    </span>
                  </div>

                  <div className="border-t border-slate-100 pt-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                        <CheckCircle2 size={18} />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-[#123d78]">
                          Keep your profile updated
                        </p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          Highlight your skills and projects to help other
                          students find you for collaboration.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Member since */}
              <section className="rounded-[24px] border border-slate-200/80 bg-white p-6 shadow-[0_12px_35px_-28px_rgba(15,45,90,0.35)]">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                    <User size={18} />
                  </div>

                  <div>
                    <h2 className="text-base font-bold text-[#123d78]">
                      Community member
                    </h2>
                    <p className="mt-1 text-xs text-slate-400">
                      Part of CollabNest
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-xl bg-slate-50 px-4 py-3.5">
                  <p className="text-xs font-medium text-slate-400">
                    Member since
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {profile.createdAt
                      ? new Date(profile.createdAt).toLocaleDateString(
                          "en-IN",
                          {
                            month: "long",
                            year: "numeric",
                          }
                        )
                      : "CollabNest community"}
                  </p>
                </div>
              </section>

              {/* Collaboration message */}
              <section className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#092b5d] via-[#104782] to-[#1676d2] p-6 text-white shadow-[0_18px_40px_-25px_rgba(9,43,93,0.7)]">
                <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/[0.07]" />
                <div className="absolute -bottom-12 -left-10 h-32 w-32 rounded-full bg-white/[0.06]" />

                <div className="relative">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/10">
                    <Sparkles size={21} />
                  </div>

                  <h2 className="mt-5 text-lg font-bold">
                    Great things happen together.
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-blue-100/90">
                    Share ideas, learn from other students, and build
                    meaningful projects as a team.
                  </p>

                  {isOwnProfile && (
                    <button
                      type="button"
                      onClick={() => navigate("/post-project")}
                      className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-sm font-bold text-[#104782] transition hover:bg-blue-50"
                    >
                      <Plus size={15} />
                      Start a project
                    </button>
                  )}
                </div>
              </section>
            </aside>
          </div>

          <footer className="mt-10 border-t border-slate-200/80 py-6 text-center">
            <p className="text-xs text-slate-400">
              © {new Date().getFullYear()} CollabNest · Better together.
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;