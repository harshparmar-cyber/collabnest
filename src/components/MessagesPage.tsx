import { useEffect, useState } from "react";
import {
  ArrowLeft,
  MessageCircle,
  Send,
  Users,
} from "lucide-react";
import { io, Socket } from "socket.io-client";

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

interface Sender {
  _id: string;
  name: string;
  email?: string;
  profilePhoto?: string;
}

interface ChatMessage {
  _id: string;
  group: string;
  sender: Sender;
  text: string;
  createdAt: string;
  updatedAt: string;
}

interface CurrentUser {
  _id: string;
  name: string;
  email?: string;
  profilePhoto?: string;
}

const MessagesPage = () => {
  const [groups, setGroups] = useState<
    CollaborationGroup[]
  >([]);

  const [selectedGroup, setSelectedGroup] =
    useState<CollaborationGroup | null>(null);

  const [messages, setMessages] = useState<
    ChatMessage[]
  >([]);

  const [message, setMessage] = useState("");

  const [currentUser, setCurrentUser] =
    useState<CurrentUser | null>(null);

  const [loading, setLoading] = useState(true);

  const [loadingMessages, setLoadingMessages] =
    useState(false);

  const [error, setError] = useState("");

  const [socketError, setSocketError] =
    useState("");

  const [socket, setSocket] =
    useState<Socket | null>(null);

  /*
   * ==============================
   * FETCH CURRENT USER
   * ==============================
   */

  useEffect(() => {
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

        setCurrentUser(data.user || data);
      } catch (error) {
        console.error(
          "Failed to fetch current user:",
          error
        );
      }
    };

    fetchCurrentUser();
  }, []);

  /*
   * ==============================
   * FETCH COLLABORATION GROUPS
   * ==============================
   */

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
            data.message ||
              "Failed to load collaboration groups."
          );
        }

        setGroups(data.groups || []);
      } catch (error) {
        console.error(
          "Failed to fetch groups:",
          error
        );

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

  /*
   * ==============================
   * OPEN GROUP CHAT
   * ==============================
   */

  const openGroupChat = async (
    group: CollaborationGroup
  ) => {
    setSelectedGroup(group);
    setMessages([]);
    setSocketError("");
    setLoadingMessages(true);

    try {
      const response = await fetch(
        `${API_URL}/api/messages/groups/${group._id}/messages`,
        {
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load group messages."
        );
      }

      setMessages(data.messages || []);
    } catch (error) {
      console.error(
        "Failed to fetch group messages:",
        error
      );

      setSocketError(
        error instanceof Error
          ? error.message
          : "Failed to load messages."
      );
    } finally {
      setLoadingMessages(false);
    }
  };

  /*
   * ==============================
   * SOCKET.IO CONNECTION
   * ==============================
   */

  useEffect(() => {
    if (!selectedGroup) {
      return;
    }

    const newSocket = io(API_URL, {
      withCredentials: true,
    });

    setSocket(newSocket);

    /*
     * Socket connection
     */

    newSocket.on("connect", () => {
      console.log(
        "🔌 Connected to Socket.IO:",
        newSocket.id
      );

      newSocket.emit("join_group", {
        groupId: selectedGroup._id,
      });
    });

    /*
     * Successfully joined group
     */

    newSocket.on(
      "group_joined",
      ({ groupId }: { groupId: string }) => {
        console.log(
          "👥 Joined collaboration group:",
          groupId
        );
      }
    );

    /*
     * Receive new message
     */

    newSocket.on(
      "new_message",
      (newMessage: ChatMessage) => {
        setMessages((previousMessages) => {
          const alreadyExists =
            previousMessages.some(
              (existingMessage) =>
                existingMessage._id ===
                newMessage._id
            );

          if (alreadyExists) {
            return previousMessages;
          }

          return [
            ...previousMessages,
            newMessage,
          ];
        });
      }
    );

    /*
     * Socket errors
     */

    newSocket.on(
      "socket_error",
      ({ message }: { message: string }) => {
        console.error(
          "Socket error:",
          message
        );

        setSocketError(message);
      }
    );

    newSocket.on("connect_error", (error) => {
      console.error(
        "Socket connection error:",
        error.message
      );

      setSocketError(
        "Unable to connect to real-time chat."
      );
    });

    /*
     * Cleanup socket when leaving group
     */

    return () => {
      console.log(
        "🔌 Disconnecting Socket.IO..."
      );

      newSocket.disconnect();
      setSocket(null);
    };
  }, [selectedGroup]);

  /*
   * ==============================
   * SEND MESSAGE
   * ==============================
   */

  const handleSendMessage = () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      return;
    }

    if (!selectedGroup) {
      return;
    }

    if (!socket || !socket.connected) {
      setSocketError(
        "Chat connection is not available."
      );
      return;
    }

    socket.emit("send_message", {
      groupId: selectedGroup._id,
      text: trimmedMessage,
    });

    setMessage("");
  };

  /*
   * ==============================
   * FORMAT MESSAGE TIME
   * ==============================
   */

  const formatMessageTime = (
    createdAt: string
  ) => {
    return new Date(createdAt).toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
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
            <button
              type="button"
              onClick={() =>
                setSelectedGroup(null)
              }
              className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            >
              <ArrowLeft size={21} />
            </button>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <MessageCircle size={22} />
            </div>

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
            {/* Group starting message */}

            <div className="mx-auto rounded-full bg-blue-50 px-4 py-2 text-center text-xs text-blue-600">
              You are now collaborating on this
              project.
            </div>

            {/* Loading messages */}

            {loadingMessages && (
              <div className="py-10 text-center">
                <p className="text-sm text-slate-500">
                  Loading messages...
                </p>
              </div>
            )}

            {/* Socket error */}

            {!loadingMessages &&
              socketError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-600">
                  {socketError}
                </div>
              )}

            {/* No messages */}

            {!loadingMessages &&
              !socketError &&
              messages.length === 0 && (
                <div className="py-16 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-500">
                    <MessageCircle
                      size={25}
                    />
                  </div>

                  <p className="text-sm text-slate-500">
                    No messages yet.
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Start the conversation!
                  </p>
                </div>
              )}

            {/* Messages */}

            {!loadingMessages &&
              messages.map((chatMessage) => {
                const isMine =
                  currentUser?._id ===
                  chatMessage.sender?._id;

                return (
                  <div
                    key={chatMessage._id}
                    className={`flex ${
                      isMine
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`flex max-w-[75%] flex-col ${
                        isMine
                          ? "items-end"
                          : "items-start"
                      }`}
                    >
                      {/* Sender name */}

                      {!isMine && (
                        <span className="mb-1 ml-1 text-xs font-medium text-slate-500">
                          {chatMessage.sender?.name ||
                            "Student"}
                        </span>
                      )}

                      {/* Message */}

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
                        {formatMessageTime(
                          chatMessage.createdAt
                        )}
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
              disabled={
                !message.trim() ||
                !socket?.connected
              }
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
                Chat with students you're
                collaborating with.
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

        {!loading &&
          !error &&
          groups.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-500">
                <MessageCircle size={26} />
              </div>

              <h2 className="mb-2 text-lg font-semibold text-slate-800">
                No collaboration groups yet
              </h2>

              <p className="mx-auto max-w-md text-sm text-slate-500">
                Once a collaboration request is
                accepted, your project group will
                appear here.
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
                    openGroupChat(group)
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