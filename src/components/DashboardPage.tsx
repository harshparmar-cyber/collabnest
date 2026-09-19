import { useNavigate } from "react-router-dom";

const DashboardPage = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#f5f9ff]">
      {/* Navbar */}
      <nav className="flex h-[72px] items-center justify-between border-b border-blue-100 bg-white px-6 shadow-sm md:px-12">
        {/* Logo */}
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="text-2xl font-bold"
        >
          <span className="text-[#0759bd]">Collab</span>
          <span className="text-[#6ca9e8]">Nest</span>
        </button>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-full bg-[#0759bd] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#064c9f]"
        >
          Logout
        </button>
      </nav>

      {/* Main Content */}
      <main className="px-6 py-10 md:px-12">
        <div className="mx-auto max-w-7xl">

          {/* Welcome Section */}
          <div>
            <h1 className="text-3xl font-bold text-[#12355b] md:text-4xl">
              Welcome to CollabNest 👋
            </h1>

            <p className="mt-2 text-gray-500">
              Find students, share ideas, and build projects together.
            </p>
          </div>

          {/* Dashboard Cards */}
          <div className="mt-10 grid gap-6 md:grid-cols-3">

            {/* Project Ideas */}
            <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
              <div className="text-3xl">
                💡
              </div>

              <h2 className="mt-4 text-xl font-bold text-[#12355b]">
                Project Ideas
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Explore project ideas posted by students and find something
                interesting to work on.
              </p>

              <button
                type="button"
                className="mt-5 rounded-full bg-[#0759bd] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#064c9f]"
              >
                Explore Projects
              </button>
            </div>

            {/* Find Collaborators */}
            <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
              <div className="text-3xl">
                🤝
              </div>

              <h2 className="mt-4 text-xl font-bold text-[#12355b]">
                Find Collaborators
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Connect with students who have similar interests and build
                something together.
              </p>

              <button
                type="button"
                className="mt-5 rounded-full bg-[#0759bd] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#064c9f]"
              >
                Find Students
              </button>
            </div>

            {/* Collaborations */}
            <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
              <div className="text-3xl">
                💬
              </div>

              <h2 className="mt-4 text-xl font-bold text-[#12355b]">
                My Collaborations
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Manage your collaboration requests, conversations, and
                ongoing projects.
              </p>

              <button
                type="button"
                className="mt-5 rounded-full bg-[#0759bd] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#064c9f]"
              >
                View Collaborations
              </button>
            </div>
          </div>

          {/* Collaboration Space */}
          <div className="mt-8 rounded-2xl border border-dashed border-blue-200 bg-white p-8 text-center">
            <h2 className="text-xl font-bold text-[#12355b]">
              Your Collaboration Space 🚀
            </h2>

            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-gray-500">
              Soon you’ll be able to post projects, send collaboration
              requests, chat with students, start video calls, and work
              together — all inside CollabNest.
            </p>
          </div>

        </div>
      </main>
    </div>
  );
};

export default DashboardPage;