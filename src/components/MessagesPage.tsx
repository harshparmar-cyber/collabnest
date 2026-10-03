import { useEffect, useState } from "react";
import {
  ArrowLeft,
  MessageCircle,
  Send,
  Users,
} from "lucide-react";

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

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  time: string;
}

const MessagesPage = () => {
  const [groups, setGroups] = useState<CollaborationGroup[]>([]);
  const [selectedGroup, setSelectedGroup] =
    useState<CollaborationGroup | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Temporary messages for UI preview.
  // We will replace these with MongoDB messages later.
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      senderId: "other",
      senderName: "Rahul",
      text: "Hey everyone! Let's discuss the project.",
      time: "10:32 AM",
    },
    {
      id: "2",
      senderId: "other",
      senderName: "Priya",
      text: "Sure! I have a few ideas we can work on.",
      time: "10:34 AM",
    },
    {
      id: "3",
      senderId: "me",
      senderName: "You",
      text: "Great. I'll share my ideas too.",
      time: "10:36 AM",
    },
  ]);

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

  const handleSendMessage = () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      return;
    }

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: "me",
      senderName: "You",
      text: trimmedMessage,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((previousMessages) => [
      ...previousMessages,
      newMessage,
    ]);

    setMessage("");
  };

  /*
   * ==============================
   * CHAT SCREEN
   * ==============================
   */

  if (selectedGroup) {
    return (
      <div className="flex h-screen flex-col bg-[#f5f8fc]">
        {/* Chat Header */}
        <div className="border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
          <div className="mx-auto flex max-w-6xl items-center gap-4">
            {/* Back button */}
            <button
              type="button"
              onClick={() => setSelectedGroup(null)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            >
              <ArrowLeft size={21} />
            </button>

            {/* Group icon */}
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <MessageCircle size={22} />
            </div>

            {/* Group information */}
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-base font-semibold text-slate-800">
                {selectedGroup.name ||
                  selectedGroup.project?.title}
              </h1>

              <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                <Users size={13} />

                <span>
                  {selectedGroup.members.length}{" "}
                  {selectedGroup.members.length === 1
                    ? "member"
                    : "members"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="mx-auto flex max-w-4xl flex-col gap-4">
            {/* Chat starting message */}
            <div className="mx-auto rounded-full bg-blue-50 px-4 py-2 text-xs text-blue-600">
              You are now collaborating on this project.
            </div>

            {messages.map((chatMessage) => {
              const isMine =
                chatMessage.senderId === "me";

              return (
                <div
                  key={chatMessage.id}
                  className={`flex ${
                    isMine
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[75%] ${
                      isMine
                        ? "items-end"
                        : "items-start"
                    } flex flex-col`}
                  >
                    {/* Sender name */}
                    {!isMine && (
                      <span className="mb-1 ml-1 text-xs font-medium text-slate-500">
                        {chatMessage.senderName}
                      </span>
                    )}

                    {/* Message bubble */}
                    <div
                      className={`rounded-2xl px-4 py-3 text-sm shadow-sm ${
                        isMine
                          ? "rounded-br-md bg-blue-600 text-white"
                          : "rounded-bl-md border border-slate-200 bg-white text-slate-700"
                      }`}
                    >
                      {chatMessage.text}
                    </div>

                    {/* Time */}
                    <span
                      className={`mt-1 text-[10px] text-slate-400 ${
                        isMine
                          ? "mr-1"
                          : "ml-1"
                      }`}
                    >
                      {chatMessage.time}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Message Input */}
        <div className="border-t border-slate-200 bg-white px-4 py-4">
          <div className="mx-auto flex max-w-4xl items-center gap-3">
            <input
              type="text"
              value={message}
              onChange={(event) =>
                setMessage(event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleSendMessage();
                }
              }}
              placeholder="Type a message..."
              className="h-12 flex-1 rounded-full border border-slate-200 bg-slate-50 px-5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />

            <button
              type="button"
              onClick={handleSendMessage}
              disabled={!message.trim()}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              <Send size={19} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  /*
   * ==============================
   * GROUP LIST SCREEN
   * ==============================
   */

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
            <p className="text-sm text-red-600">
              {error}
            </p>
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
              Once a collaboration request is accepted,
              your project group will appear here.
            </p>
          </div>
        )}

        {/* Groups */}
        {!loading &&
          !error &&
          groups.length > 0 && (
            <div className="grid gap-4">
              {groups.map((group) => (
                <button
                  key={group._id}
                  type="button"
                  onClick={() =>
                    setSelectedGroup(group)
                  }
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
                        {group.name ||
                          group.project?.title}
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