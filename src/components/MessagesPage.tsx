import { useEffect, useState } from "react";
import { MessageCircle, Users } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

interface Member {
  _id: string;
  name: string;
  email?: string;
  profilePhoto?: string;
}

interface Project {
  _id: string;
  title: string;
}

interface CollaborationGroup {
  _id: string;
  name: string;
  project: Project;
  members: Member[];
}

const MessagesPage = () => {
  const [groups, setGroups] = useState<CollaborationGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/collaborations/groups`,
          {
            credentials: "include",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load collaboration groups."
          );
        }

        setGroups(data.groups || []);
      } catch (error) {
        console.error("Failed to fetch groups:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load collaboration groups."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  return (
    <div className="min-h-screen bg-[#f5f8fc] px-6 py-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <MessageCircle size={23} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Messages
              </h1>

              <p className="text-sm text-slate-500">
                Chat with students you're collaborating with.
              </p>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <p className="text-sm text-slate-500">
              Loading your collaborations...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && groups.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-500">
              <MessageCircle size={26} />
            </div>

            <h2 className="mb-2 text-lg font-semibold text-slate-800">
              No collaboration groups yet
            </h2>

            <p className="mx-auto max-w-md text-sm text-slate-500">
              Once a collaboration request is accepted, your project
              group will appear here.
            </p>
          </div>
        )}

        {/* Groups */}
        {!loading && !error && groups.length > 0 && (
          <div className="grid gap-4">
            {groups.map((group) => (
              <button
                key={group._id}
                type="button"
                className="w-full rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-blue-200 hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  {/* Group icon */}
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <MessageCircle size={23} />
                  </div>

                  {/* Group information */}
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-base font-semibold text-slate-800">
                      {group.name || group.project?.title}
                    </h2>

                    <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                      <Users size={15} />

                      <span>
                        {group.members.length}{" "}
                        {group.members.length === 1
                          ? "member"
                          : "members"}
                      </span>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="text-slate-400">
                    →
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;