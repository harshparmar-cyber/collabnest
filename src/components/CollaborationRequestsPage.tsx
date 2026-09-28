import {
  Check,
  Clock3,
  FolderKanban,
  Loader2,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

interface RequestUser {
  _id: string;
  name: string;
  email: string;
  profilePhoto?: string;
}

interface RequestProject {
  _id: string;
  title: string;
  description?: string;
  category?: string;
}

interface CollaborationRequest {
  _id: string;
  requester: RequestUser;
  project: RequestProject;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}

const CollaborationRequestsPage = () => {
  const [requests, setRequests] = useState<
    CollaborationRequest[]
  >([]);

  const [isLoading, setIsLoading] = useState(true);

  const [processingId, setProcessingId] =
    useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(
        `${API_URL}/api/collaborations/requests`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to fetch collaboration requests."
        );
      }

      setRequests(data.requests || []);
    } catch (error) {
      console.error(
        "Fetch collaboration requests error:",
        error
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleRequest = async (
    requestId: string,
    action: "accept" | "reject"
  ) => {
    try {
      setProcessingId(requestId);

      const response = await fetch(
        `${API_URL}/api/collaborations/requests/${requestId}/${action}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            `Failed to ${action} collaboration request.`
        );

        return;
      }

      if (action === "accept") {
        alert(
          "Request accepted. The student has been added to the group."
        );
      } else {
        alert("Collaboration request rejected.");
      }

      setRequests((currentRequests) =>
        currentRequests.filter(
          (request) => request._id !== requestId
        )
      );
    } catch (error) {
      console.error(
        `${action} collaboration request error:`,
        error
      );

      alert(
        "Something went wrong. Please try again."
      );
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f9ff]">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100">
              <FolderKanban
                size={22}
                className="text-blue-600"
              />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Collaboration Requests
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Review students who want to join your projects.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-5xl px-6 py-8">
        {isLoading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <Loader2
              size={30}
              className="animate-spin text-blue-600"
            />
          </div>
        ) : requests.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <Clock3
                size={28}
                className="text-slate-400"
              />
            </div>

            <h2 className="mt-5 text-lg font-bold text-slate-900">
              No pending requests
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              When students request to collaborate on your
              projects, their requests will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {requests.map((request) => {
              const requester = request.requester;
              const project = request.project;

              const isProcessing =
                processingId === request._id;

              return (
                <div
                  key={request._id}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  {/* Requester */}
                  <div className="flex items-start justify-between gap-5">
                    <div className="flex items-center gap-4">
                      {requester.profilePhoto ? (
                        <img
                          src={requester.profilePhoto}
                          alt={requester.name}
                          className="h-14 w-14 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700">
                          {requester.name
                            ?.charAt(0)
                            .toUpperCase() || (
                            <UserRound size={22} />
                          )}
                        </div>
                      )}

                      <div>
                        <h2 className="text-base font-bold text-slate-900">
                          {requester.name}
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                          wants to collaborate with you
                        </p>
                      </div>
                    </div>

                    <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                      Pending
                    </span>
                  </div>

                  {/* Project */}
                  <div className="mt-6 rounded-2xl bg-slate-50 p-5">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-blue-600">
                      <FolderKanban size={15} />
                      Project
                    </div>

                    <h3 className="mt-2 text-lg font-bold text-slate-900">
                      {project.title}
                    </h3>

                    {project.description && (
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                        {project.description}
                      </p>
                    )}

                    {project.category && (
                      <span className="mt-4 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                        {project.category}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-5 flex gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        handleRequest(
                          request._id,
                          "reject"
                        )
                      }
                      disabled={isProcessing}
                      className="
                        flex-1
                        rounded-xl
                        border
                        border-slate-200
                        bg-white
                        py-3
                        text-sm
                        font-semibold
                        text-slate-700
                        transition
                        hover:bg-slate-50
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                      "
                    >
                      {isProcessing ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2
                            size={16}
                            className="animate-spin"
                          />
                          Processing...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <X size={17} />
                          Reject
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleRequest(
                          request._id,
                          "accept"
                        )
                      }
                      disabled={isProcessing}
                      className="
                        flex-1
                        rounded-xl
                        bg-gradient-to-r
                        from-[#1684ff]
                        to-[#0759bd]
                        py-3
                        text-sm
                        font-semibold
                        text-white
                        shadow-lg
                        shadow-blue-100
                        transition
                        hover:-translate-y-[1px]
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                      "
                    >
                      {isProcessing ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2
                            size={16}
                            className="animate-spin"
                          />
                          Processing...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <Check size={17} />
                          Accept
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default CollaborationRequestsPage;