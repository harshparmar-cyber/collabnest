import {
  ArrowLeft,
  BriefcaseBusiness,
  CheckCircle2,
  Code2,
  ExternalLink,
  Globe,
  ImagePlus,
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

  const [postedProjects, setPostedProjects] = useState<PostedProject[]>(
    []
  );

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

  /*
   * ============================================================
   * DETERMINE WHETHER THIS IS THE LOGGED-IN USER'S PROFILE
   * ============================================================
   */

  const [currentUserId, setCurrentUserId] = useState("");

  const isOwnProfile =
    !userId || (currentUserId !== "" && userId === currentUserId);

  /*
   * ============================================================
   * FETCH PROFILE
   * ============================================================
   */

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        let response: Response;

        if (userId) {
          response = await fetch(
            `${API_URL}/api/auth/users/${userId}`
          );
        } else {
          response = await fetch(`${API_URL}/api/auth/me`, {
            credentials: "include",
          });
        }

        const data = await response.json();

        if (!response.ok) {
          setErrorMessage(
            data.message || "Unable to load profile."
          );
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

        setErrorMessage(
          "Unable to connect to the server."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [API_URL, userId]);

  /*
   * ============================================================
   * GET CURRENT USER ID WHEN VIEWING A PUBLIC PROFILE
   * ============================================================
   */

  useEffect(() => {
    if (!userId) {
      return;
    }

    const fetchCurrentUser = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/auth/me`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        if (data.user?.id) {
          setCurrentUserId(String(data.user.id));
        }
      } catch (error) {
        console.error(
          "Fetch current user error:",
          error
        );
      }
    };

    fetchCurrentUser();
  }, [API_URL, userId]);

  /*
   * ============================================================
   * FETCH PROJECTS POSTED BY THIS USER
   * ============================================================
   */

  useEffect(() => {
    if (!profile?.id) {
      return;
    }

    const fetchUserProjects = async () => {
      try {
        setProjectsLoading(true);

        const response = await fetch(
          `${API_URL}/api/projects`
        );

        const data = await response.json();

        if (!response.ok) {
          console.error(
            data.message || "Failed to load projects."
          );
          return;
        }

        const allProjects: PostedProject[] =
          data.projects || [];

        const userProjects = allProjects.filter(
          (project) => {
            if (!project.createdBy) {
              return false;
            }

            if (typeof project.createdBy === "string") {
              return (
                project.createdBy === String(profile.id)
              );
            }

            return (
              String(project.createdBy._id) ===
              String(profile.id)
            );
          }
        );

        setPostedProjects(userProjects);
      } catch (error) {
        console.error(
          "Fetch user projects error:",
          error
        );
      } finally {
        setProjectsLoading(false);
      }
    };

    fetchUserProjects();
  }, [API_URL, profile?.id]);

  /*
   * ============================================================
   * OPEN FILE PICKER
   * ============================================================
   */

  const handleProfilePhotoClick = () => {
    if (!isOwnProfile || !isEditing) {
      return;
    }

    fileInputRef.current?.click();
  };

  /*
   * ============================================================
   * HANDLE PROFILE PHOTO
   * ============================================================
   */

  const handleProfilePhotoChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert(
        "Please choose a JPG, PNG, or WebP image."
      );

      event.target.value = "";
      return;
    }

    const maxSize = 3 * 1024 * 1024;

    if (file.size > maxSize) {
      alert(
        "Profile photo must be smaller than 3 MB."
      );

      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;

      if (typeof result === "string") {
        setProfilePhoto(result);
      }
    };

    reader.onerror = () => {
      alert(
        "Unable to read the selected image."
      );
    };

    reader.readAsDataURL(file);

    /*
     * Allow selecting the same file again later.
     */
    event.target.value = "";
  };

  /*
   * ============================================================
   * ADD SKILL
   * ============================================================
   */

  const handleAddSkill = () => {
    const skill = skillInput.trim();

    if (!skill) {
      return;
    }

    if (skills.includes(skill)) {
      setSkillInput("");
      return;
    }

    setSkills((currentSkills) => [
      ...currentSkills,
      skill,
    ]);

    setSkillInput("");
  };

  /*
   * ============================================================
   * REMOVE SKILL
   * ============================================================
   */

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills((currentSkills) =>
      currentSkills.filter(
        (skill) => skill !== skillToRemove
      )
    );
  };

  /*
   * ============================================================
   * ADD PORTFOLIO PROJECT
   * ============================================================
   */

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

  /*
   * ============================================================
   * REMOVE PORTFOLIO PROJECT
   * ============================================================
   */

  const handleRemovePortfolioProject = (
    index: number
  ) => {
    setPortfolio((currentProjects) =>
      currentProjects.filter(
        (_, projectIndex) =>
          projectIndex !== index
      )
    );
  };

  /*
   * ============================================================
   * SAVE PROFILE
   * ============================================================
   */

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      alert("Name is required.");
      return;
    }

    try {
      setIsSaving(true);

      const response = await fetch(
        `${API_URL}/api/auth/profile`,
        {
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
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Failed to update your profile."
        );
        return;
      }

      const updatedProfile: UserProfile = data.user;

      setProfile(updatedProfile);

      setName(updatedProfile.name || "");
      setBio(updatedProfile.bio || "");
      setSkills(updatedProfile.skills || []);
      setProfilePhoto(
        updatedProfile.profilePhoto || ""
      );
      setPortfolio(updatedProfile.portfolio || []);

      setIsEditing(false);

      alert("Profile updated successfully.");
    } catch (error) {
      console.error(
        "Save profile error:",
        error
      );

      alert(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  /*
   * ============================================================
   * CANCEL EDITING
   * ============================================================
   */

  const handleCancelEditing = () => {
    if (!profile) {
      return;
    }

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

  /*
   * ============================================================
   * EDIT PROJECT
   * ============================================================
   */

  const handleEditPostedProject = (
    project: PostedProject
  ) => {
    navigate("/post-project", {
      state: {
        editMode: true,
        project,
      },
    });
  };

  /*
   * ============================================================
   * BACK
   * ============================================================
   */

  const handleBack = () => {
    navigate(-1);
  };

  /*
   * ============================================================
   * LOADING
   * ============================================================
   */

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f9ff]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-[#1684ff]" />

          <p className="mt-4 text-sm font-medium text-[#315f96]">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  /*
   * ============================================================
   * ERROR
   * ============================================================
   */

  if (errorMessage || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f9ff] px-5">
        <div className="w-full max-w-md rounded-2xl border border-blue-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
            <X size={25} />
          </div>

          <h2 className="mt-5 text-xl font-bold text-[#123d78]">
            Unable to load profile
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            {errorMessage ||
              "The requested profile could not be found."}
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

  const displayName =
    profile.name || "Student";

  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#f5f9ff] text-[#12355b]">
      {/* ======================================================
          TOP NAVBAR
      ====================================================== */}

      <header className="fixed left-0 right-0 top-0 z-50 h-[70px] bg-gradient-to-r from-[#073b88] to-[#0b4da5] text-white shadow-lg">
        <div className="flex h-full items-center justify-between px-5 md:px-7">
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
                Collab
                <span className="text-[#74b9ff]">
                  Nest
                </span>
              </div>

              <p className="hidden text-[9px] text-blue-100/80 sm:block">
                Student collaboration profile
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isOwnProfile && !isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex h-10 items-center gap-2 rounded-xl bg-white/10 px-4 text-[11px] font-semibold transition hover:bg-white/20"
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
                  className="flex h-10 items-center gap-2 rounded-xl bg-white/10 px-4 text-[11px] font-semibold transition hover:bg-white/20 disabled:opacity-50"
                >
                  <X size={15} />
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="flex h-10 items-center gap-2 rounded-xl bg-[#1684ff] px-4 text-[11px] font-bold text-white shadow-lg transition hover:bg-[#0874e8] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save size={15} />

                  {isSaving
                    ? "Saving..."
                    : "Save Profile"}
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ======================================================
          MAIN
      ====================================================== */}

      <main className="h-screen overflow-y-auto pt-[70px]">
        <div className="mx-auto max-w-[1250px] p-5 md:p-8">
          {/* ==================================================
              PROFILE HERO
          ================================================== */}

          <section className="relative overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-sm">
            {/* Background */}

            <div className="absolute inset-x-0 top-0 h-[170px] bg-gradient-to-r from-[#073b88] via-[#0b58b8] to-[#1684ff]" />

            <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/10" />

            <div className="absolute right-[25%] top-20 h-40 w-40 rounded-full bg-white/5" />

            {/* Hero content */}

            <div className="relative px-6 pb-7 pt-24 md:px-9">
              <div className="flex flex-col gap-6 md:flex-row md:items-end">
                {/* Profile photo */}

                <div className="relative mx-auto shrink-0 md:mx-0">
                  <div className="relative h-36 w-36 overflow-hidden rounded-full border-[6px] border-white bg-gradient-to-br from-[#70b9f5] to-[#277bc9] shadow-xl">
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

                    {/* ==================================================
                        PEN OVERLAY
                    ================================================== */}

                    {isOwnProfile && isEditing && (
                      <button
                        type="button"
                        onClick={
                          handleProfilePhotoClick
                        }
                        className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/45 text-white opacity-100 transition hover:bg-black/55"
                        aria-label="Change profile photo"
                      >
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                          <Pencil size={20} />
                        </div>
                      </button>
                    )}
                  </div>

                  {/* Hidden file input */}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={
                      handleProfilePhotoChange
                    }
                  />

                  {isOwnProfile && isEditing && (
                    <div className="mt-3 text-center">
                      <p className="text-[9px] font-medium text-gray-400">
                        Click the ✏️ button to change photo
                      </p>

                      <p className="mt-1 text-[8px] text-gray-400">
                        JPG, PNG or WebP · Max 3 MB
                      </p>
                    </div>
                  )}
                </div>

                {/* Profile information */}

                <div className="min-w-0 flex-1 text-center md:pb-2 md:text-left">
                  {isEditing && isOwnProfile ? (
                    <div className="max-w-[520px]">
                      <label className="text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                        Name
                      </label>

                      <input
                        value={name}
                        onChange={(event) =>
                          setName(event.target.value)
                        }
                        maxLength={60}
                        className="mt-1 h-12 w-full rounded-xl border border-blue-100 bg-white px-4 text-xl font-bold text-[#123d78] outline-none transition focus:border-[#1684ff] focus:ring-4 focus:ring-blue-50"
                      />
                    </div>
                  ) : (
                    <h1 className="text-3xl font-bold tracking-[-1px] text-[#123d78] md:text-[34px]">
                      {displayName}
                    </h1>
                  )}

                  {profile.email && (
                    <p className="mt-2 text-[12px] text-gray-400">
                      {profile.email}
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap justify-center gap-2 md:justify-start">
                    {skills.length > 0 ? (
                      skills.slice(0, 5).map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full bg-blue-50 px-3 py-1.5 text-[9px] font-bold text-[#1684ff]"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-gray-400">
                        No skills added yet
                      </span>
                    )}
                  </div>
                </div>

                {/* Profile stats */}

                <div className="flex shrink-0 justify-center gap-8 md:pb-3">
                  <div className="text-center">
                    <p className="text-xl font-bold text-[#123d78]">
                      {postedProjects.length}
                    </p>

                    <p className="mt-1 text-[9px] font-medium text-gray-400">
                      Projects
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="text-xl font-bold text-[#123d78]">
                      {skills.length}
                    </p>

                    <p className="mt-1 text-[9px] font-medium text-gray-400">
                      Skills
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="text-xl font-bold text-[#123d78]">
                      {portfolio.length}
                    </p>

                    <p className="mt-1 text-[9px] font-medium text-gray-400">
                      Portfolio
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ==================================================
              EDIT PROFILE SECTION
          ================================================== */}

          {isOwnProfile && isEditing && (
            <section className="mt-6 rounded-2xl border border-blue-100 bg-white p-6 shadow-sm md:p-7">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#1684ff]">
                  <Pencil size={19} />
                </div>

                <div>
                  <h2 className="text-[17px] font-bold text-[#123d78]">
                    Edit Profile
                  </h2>

                  <p className="mt-1 text-[10px] text-gray-400">
                    Update your information and skills.
                  </p>
                </div>
              </div>

              {/* Bio */}

              <div className="mt-7">
                <label className="text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  About You
                </label>

                <textarea
                  value={bio}
                  onChange={(event) =>
                    setBio(event.target.value)
                  }
                  maxLength={500}
                  rows={4}
                  placeholder="Tell other students about yourself, your interests and what you like building..."
                  className="mt-2 w-full resize-none rounded-xl border border-blue-100 bg-[#f9fcff] p-4 text-[12px] leading-5 text-[#315f96] outline-none transition focus:border-[#1684ff] focus:bg-white focus:ring-4 focus:ring-blue-50"
                />

                <div className="mt-1 flex justify-end">
                  <span className="text-[8px] text-gray-400">
                    {bio.length}/500
                  </span>
                </div>
              </div>

              {/* Skills */}

              <div className="mt-6">
                <label className="text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  Skills
                </label>

                <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                  <input
                    value={skillInput}
                    onChange={(event) =>
                      setSkillInput(event.target.value)
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        handleAddSkill();
                      }
                    }}
                    placeholder="Add a skill e.g. React"
                    className="h-11 flex-1 rounded-xl border border-blue-100 bg-[#f9fcff] px-4 text-[11px] text-[#315f96] outline-none transition focus:border-[#1684ff] focus:bg-white"
                  />

                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#1684ff] px-5 text-[11px] font-bold text-white transition hover:bg-[#0874e8]"
                  >
                    <Plus size={15} />
                    Add Skill
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-[9px] font-semibold text-[#1684ff]"
                    >
                      {skill}

                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveSkill(skill)
                        }
                        className="rounded-full text-blue-400 transition hover:text-red-500"
                        aria-label={`Remove ${skill}`}
                      >
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* ==================================================
                  PORTFOLIO MANAGEMENT
              ================================================== */}

              <div className="mt-8 border-t border-gray-100 pt-7">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <h3 className="text-[14px] font-bold text-[#123d78]">
                      Portfolio Projects
                    </h3>

                    <p className="mt-1 text-[9px] text-gray-400">
                      Add projects you want other students to see.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setShowPortfolioForm(
                        (current) => !current
                      )
                    }
                    className="flex h-9 items-center justify-center gap-2 rounded-lg border border-blue-200 px-4 text-[10px] font-bold text-[#1684ff] transition hover:bg-blue-50"
                  >
                    {showPortfolioForm ? (
                      <>
                        <X size={14} />
                        Close
                      </>
                    ) : (
                      <>
                        <Plus size={14} />
                        Add Project
                      </>
                    )}
                  </button>
                </div>

                {showPortfolioForm && (
                  <div className="mt-5 rounded-2xl border border-blue-100 bg-[#f8fbff] p-5">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="text-[9px] font-bold text-gray-400">
                          Project Title
                        </label>

                        <input
                          value={newProject.title}
                          onChange={(event) =>
                            setNewProject({
                              ...newProject,
                              title:
                                event.target.value,
                            })
                          }
                          placeholder="My project"
                          className="mt-2 h-10 w-full rounded-lg border border-blue-100 bg-white px-3 text-[10px] outline-none focus:border-[#1684ff]"
                        />
                      </div>

                      <div>
                        <label className="text-[9px] font-bold text-gray-400">
                          Project Link
                        </label>

                        <input
                          value={newProject.link}
                          onChange={(event) =>
                            setNewProject({
                              ...newProject,
                              link:
                                event.target.value,
                            })
                          }
                          placeholder="https://github.com/..."
                          className="mt-2 h-10 w-full rounded-lg border border-blue-100 bg-white px-3 text-[10px] outline-none focus:border-[#1684ff]"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="text-[9px] font-bold text-gray-400">
                        Description
                      </label>

                      <textarea
                        value={newProject.description}
                        onChange={(event) =>
                          setNewProject({
                            ...newProject,
                            description:
                              event.target.value,
                          })
                        }
                        rows={3}
                        placeholder="Briefly describe your project..."
                        className="mt-2 w-full resize-none rounded-lg border border-blue-100 bg-white p-3 text-[10px] outline-none focus:border-[#1684ff]"
                      />
                    </div>

                    <div className="mt-4">
                      <label className="text-[9px] font-bold text-gray-400">
                        Project Image URL
                      </label>

                      <input
                        value={newProject.image}
                        onChange={(event) =>
                          setNewProject({
                            ...newProject,
                            image:
                              event.target.value,
                          })
                        }
                        placeholder="https://..."
                        className="mt-2 h-10 w-full rounded-lg border border-blue-100 bg-white px-3 text-[10px] outline-none focus:border-[#1684ff]"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={
                        handleAddPortfolioProject
                      }
                      className="mt-4 flex h-10 items-center gap-2 rounded-lg bg-[#1684ff] px-5 text-[10px] font-bold text-white transition hover:bg-[#0874e8]"
                    >
                      <Plus size={14} />
                      Add Portfolio Project
                    </button>
                  </div>
                )}

                {portfolio.length > 0 && (
                  <div className="mt-5 space-y-3">
                    {portfolio.map(
                      (project, index) => (
                        <div
                          key={
                            project._id ||
                            `${project.title}-${index}`
                          }
                          className="flex items-start gap-4 rounded-xl border border-blue-50 bg-[#f9fcff] p-4"
                        >
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-blue-50">
                            {project.image ? (
                              <img
                                src={project.image}
                                alt={project.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <ImagePlus
                                size={19}
                                className="text-blue-300"
                              />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <h4 className="text-[11px] font-bold text-[#123d78]">
                              {project.title}
                            </h4>

                            {project.description && (
                              <p className="mt-1 line-clamp-2 text-[9px] leading-4 text-gray-400">
                                {project.description}
                              </p>
                            )}

                            {project.link && (
                              <p className="mt-2 truncate text-[9px] text-[#1684ff]">
                                {project.link}
                              </p>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              handleRemovePortfolioProject(
                                index
                              )
                            }
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                            aria-label="Remove portfolio project"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* ==================================================
              PROFILE CONTENT GRID
          ================================================== */}

          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            {/* =================================================
                LEFT COLUMN
            ================================================= */}

            <div className="space-y-6">
              {/* ABOUT */}

              {!isEditing && (
                <section className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm md:p-7">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#1684ff]">
                      <User size={19} />
                    </div>

                    <div>
                      <h2 className="text-[17px] font-bold text-[#123d78]">
                        About
                      </h2>

                      <p className="mt-1 text-[9px] text-gray-400">
                        A little about this student
                      </p>
                    </div>
                  </div>

                  <p className="mt-5 whitespace-pre-line text-[12px] leading-6 text-gray-500">
                    {profile.bio ||
                      "This student hasn't added a bio yet."}
                  </p>
                </section>
              )}

              {/* SKILLS */}

              {!isEditing && (
                <section className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm md:p-7">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                      <Code2 size={19} />
                    </div>

                    <div>
                      <h2 className="text-[17px] font-bold text-[#123d78]">
                        Skills
                      </h2>

                      <p className="mt-1 text-[9px] text-gray-400">
                        Technologies and areas of interest
                      </p>
                    </div>
                  </div>

                  {profile.skills.length > 0 ? (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {profile.skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full bg-blue-50 px-4 py-2 text-[10px] font-semibold text-[#1684ff]"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-5 text-[11px] text-gray-400">
                      No skills added yet.
                    </p>
                  )}
                </section>
              )}

              {/* =================================================
                  POSTED PROJECTS
              ================================================= */}

              <section className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm md:p-7">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <BriefcaseBusiness size={19} />
                    </div>

                    <div>
                      <h2 className="text-[17px] font-bold text-[#123d78]">
                        Posted Projects
                      </h2>

                      <p className="mt-1 text-[9px] text-gray-400">
                        Projects posted by {displayName}
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full bg-blue-50 px-3 py-1 text-[9px] font-bold text-[#1684ff]">
                    {postedProjects.length}
                  </span>
                </div>

                {projectsLoading ? (
                  <div className="mt-7 flex items-center justify-center py-10">
                    <div className="h-7 w-7 animate-spin rounded-full border-3 border-blue-100 border-t-[#1684ff]" />
                  </div>
                ) : postedProjects.length === 0 ? (
                  <div className="mt-6 rounded-xl border border-dashed border-blue-100 bg-[#f9fcff] px-5 py-10 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-400">
                      <BriefcaseBusiness size={20} />
                    </div>

                    <p className="mt-4 text-[11px] font-semibold text-[#315f96]">
                      No projects posted yet
                    </p>

                    {isOwnProfile && (
                      <button
                        type="button"
                        onClick={() =>
                          navigate("/post-project")
                        }
                        className="mt-4 rounded-lg bg-[#1684ff] px-4 py-2 text-[9px] font-bold text-white transition hover:bg-[#0874e8]"
                      >
                        Post Your First Project
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    {postedProjects.map(
                      (project) => (
                        <div
                          key={project._id}
                          className="group rounded-2xl border border-blue-100 bg-[#f9fcff] p-5 transition duration-200 hover:-translate-y-1 hover:bg-white hover:shadow-md"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-[#1684ff]">
                              <Code2 size={21} />
                            </div>

                            {isOwnProfile && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleEditPostedProject(
                                    project
                                  )
                                }
                                className="rounded-lg border border-blue-100 px-2.5 py-1.5 text-[8px] font-bold text-[#1684ff] opacity-0 transition group-hover:opacity-100 hover:bg-blue-50"
                              >
                                Edit
                              </button>
                            )}
                          </div>

                          <h3 className="mt-4 line-clamp-2 text-[13px] font-bold text-[#123d78]">
                            {project.title}
                          </h3>

                          <p className="mt-2 line-clamp-3 text-[10px] leading-5 text-gray-500">
                            {project.description}
                          </p>

                          <div className="mt-4 flex flex-wrap gap-1.5">
                            {project.skills
                              ?.slice(0, 4)
                              .map((skill) => (
                                <span
                                  key={skill}
                                  className="rounded-full bg-white px-2.5 py-1 text-[8px] font-semibold text-[#4d8dca]"
                                >
                                  {skill}
                                </span>
                              ))}
                          </div>

                          <div className="mt-4 flex items-center justify-between border-t border-blue-100 pt-3">
                            <span className="text-[8px] text-gray-400">
                              {project.category ||
                                "Project"}
                            </span>

                            <span className="text-[8px] font-semibold text-gray-400">
                              Team:{" "}
                              {project.teamSize ||
                                "Flexible"}
                            </span>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </section>

              {/* =================================================
                  PORTFOLIO
              ================================================= */}

              <section className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm md:p-7">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                    <Sparkles size={19} />
                  </div>

                  <div>
                    <h2 className="text-[17px] font-bold text-[#123d78]">
                      Portfolio
                    </h2>

                    <p className="mt-1 text-[9px] text-gray-400">
                      Projects and work shared by {displayName}
                    </p>
                  </div>
                </div>

                {portfolio.length === 0 ? (
                  <div className="mt-6 rounded-xl border border-dashed border-blue-100 bg-[#f9fcff] px-5 py-10 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-50 text-purple-400">
                      <ImagePlus size={20} />
                    </div>

                    <p className="mt-4 text-[11px] font-semibold text-[#315f96]">
                      No portfolio projects yet
                    </p>

                    {isOwnProfile && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(true);
                          setShowPortfolioForm(true);
                        }}
                        className="mt-4 rounded-lg bg-[#1684ff] px-4 py-2 text-[9px] font-bold text-white transition hover:bg-[#0874e8]"
                      >
                        Add Portfolio Project
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    {portfolio.map(
                      (project, index) => (
                        <div
                          key={
                            project._id ||
                            `${project.title}-${index}`
                          }
                          className="overflow-hidden rounded-2xl border border-blue-100 bg-[#f9fcff] transition duration-200 hover:-translate-y-1 hover:bg-white hover:shadow-md"
                        >
                          <div className="h-40 overflow-hidden bg-blue-50">
                            {project.image ? (
                              <img
                                src={project.image}
                                alt={project.title}
                                className="h-full w-full object-cover transition duration-300 hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <ImagePlus
                                  size={30}
                                  className="text-blue-200"
                                />
                              </div>
                            )}
                          </div>

                          <div className="p-5">
                            <h3 className="text-[13px] font-bold text-[#123d78]">
                              {project.title}
                            </h3>

                            {project.description && (
                              <p className="mt-2 line-clamp-3 text-[10px] leading-5 text-gray-500">
                                {project.description}
                              </p>
                            )}

                            {project.link && (
                              <a
                                href={project.link}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-4 flex items-center gap-2 text-[9px] font-bold text-[#1684ff] hover:underline"
                              >
                                <ExternalLink
                                  size={13}
                                />
                                View Project
                              </a>
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </section>
            </div>

            {/* =================================================
                RIGHT SIDEBAR
            ================================================= */}

            <aside className="space-y-6">
              {/* PROFILE SUMMARY */}

              <section className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#1684ff]">
                    <CheckCircle2 size={19} />
                  </div>

                  <div>
                    <h2 className="text-[16px] font-bold text-[#123d78]">
                      Profile Summary
                    </h2>

                    <p className="mt-1 text-[9px] text-gray-400">
                      Your CollabNest presence
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-400">
                      Projects
                    </span>

                    <span className="text-[11px] font-bold text-[#123d78]">
                      {postedProjects.length}
                    </span>
                  </div>

                  <div className="h-px bg-gray-100" />

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-400">
                      Skills
                    </span>

                    <span className="text-[11px] font-bold text-[#123d78]">
                      {skills.length}
                    </span>
                  </div>

                  <div className="h-px bg-gray-100" />

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-400">
                      Portfolio
                    </span>

                    <span className="text-[11px] font-bold text-[#123d78]">
                      {portfolio.length}
                    </span>
                  </div>
                </div>
              </section>

              {/* MEMBER SINCE */}

              <section className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <Globe size={18} />
                  </div>

                  <div>
                    <h2 className="text-[16px] font-bold text-[#123d78]">
                      CollabNest Member
                    </h2>

                    <p className="mt-1 text-[9px] text-gray-400">
                      Student community
                    </p>
                  </div>
                </div>

                <p className="mt-5 text-[10px] leading-5 text-gray-500">
                  {profile.createdAt
                    ? `Joined ${new Date(
                        profile.createdAt
                      ).toLocaleDateString(
                        "en-IN",
                        {
                          month: "long",
                          year: "numeric",
                        }
                      )}`
                    : "Member of the CollabNest community"}
                </p>
              </section>

              {/* COLLABORATION CTA */}

              {!isOwnProfile && (
                <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#073b88] to-[#1684ff] p-6 text-white shadow-lg">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                    <Link2 size={19} />
                  </div>

                  <h2 className="mt-5 text-[17px] font-bold">
                    Interested in collaborating?
                  </h2>

                  <p className="mt-2 text-[10px] leading-5 text-blue-100">
                    Connect with {displayName} and
                    start building something together.
                  </p>

                  <button
                    type="button"
                    className="mt-5 flex h-10 w-full items-center justify-center rounded-xl bg-white text-[10px] font-bold text-[#0878e8] transition hover:bg-blue-50"
                  >
                    Connect & Collaborate
                  </button>
                </section>
              )}

              {/* EDIT PROFILE CTA */}

              {isOwnProfile && !isEditing && (
                <section className="rounded-2xl border border-blue-100 bg-gradient-to-br from-[#eef7ff] to-[#dceeff] p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#1684ff] shadow-sm">
                    <Sparkles size={19} />
                  </div>

                  <h2 className="mt-4 text-[16px] font-bold text-[#123d78]">
                    Keep your profile updated
                  </h2>

                  <p className="mt-2 text-[10px] leading-5 text-gray-500">
                    Add your skills, bio and portfolio so
                    other students know what you can build.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      setIsEditing(true)
                    }
                    className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#1684ff] text-[10px] font-bold text-white transition hover:bg-[#0874e8]"
                  >
                    <Pencil size={14} />
                    Edit Profile
                  </button>
                </section>
              )}
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;