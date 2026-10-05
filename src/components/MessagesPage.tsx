import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCheck,
  MessageCircle,
  MoreVertical,
  Send,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { io, Socket } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL;

/* ========================================================= */
/* TYPES */
/* ========================================================= */

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

interface MessageSender {
  _id: string;
  name: string;
  email?: string;
  profilePhoto?: string;
}

interface ChatMessage {
  _id: string;
  group: string;
  sender: MessageSender;
  text: string;
  createdAt: string;
}

interface CurrentUser {
  id: string;
  name: string;
  email?: string;
  profilePhoto?: string;
}

/* ========================================================= */
/* COMPONENT */
/* ========================================================= */

const MessagesPage = () => {
  const [groups, setGroups] = useState<
    CollaborationGroup[]
  >([]);

  const [selectedGroup, setSelectedGroup] =
    useState<CollaborationGroup | null>(null);

  const [messages, setMessages] = useState<
    ChatMessage[]
  >([]);

  const [currentUser, setCurrentUser] =
    useState<CurrentUser | null>(null);

  const [messageText, setMessageText] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [messagesLoading, setMessagesLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [showMembers, setShowMembers] =
    useState(false);

  const [socket, setSocket] =
    useState<Socket | null>(null);

  /*
   * socketRef keeps the latest Socket.IO
   * instance immediately available.
   *
   * React state updates are asynchronous,
   * so relying only on "socket" can cause
   * timing issues when opening a group quickly.
   */
  const socketRef =
    useRef<Socket | null>(null);

  /*
   * Keep the currently selected group
   * available to Socket.IO event handlers.
   */
  const selectedGroupRef =
    useRef<CollaborationGroup | null>(null);

  const messagesEndRef =
    useRef<HTMLDivElement | null>(null);

  /* ========================================================= */
  /* KEEP SELECTED GROUP REF UPDATED */
  /* ========================================================= */

  useEffect(() => {
    selectedGroupRef.current =
      selectedGroup;
  }, [selectedGroup]);

  /* ========================================================= */
  /* FETCH CURRENT USER */
  /* ========================================================= */

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/auth/me`,
          {
            credentials: "include",
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to fetch current user."
          );
        }

        setCurrentUser(data.user);
      } catch (error) {
        console.error(
          "Failed to fetch current user:",
          error
        );
      }
    };

    fetchCurrentUser();
  }, []);

  /* ========================================================= */
  /* FETCH GROUPS */
  /* ========================================================= */

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/collaborations/groups`,
          {
            credentials: "include",
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to load collaboration groups."
          );
        }

        setGroups(
          Array.isArray(data.groups)
            ? data.groups
            : []
        );
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

  /* ========================================================= */
  /* SOCKET CONNECTION */
  /* ========================================================= */

  useEffect(() => {
    const newSocket = io(API_URL, {
      withCredentials: true,
      transports: [
        "websocket",
        "polling",
      ],
    });

    /*
     * Store socket immediately in ref.
     */
    socketRef.current = newSocket;

    /* ======================================================= */
    /* SOCKET CONNECT */
    /* ======================================================= */

    newSocket.on("connect", () => {
      console.log(
        "🔌 Connected to Socket.IO:",
        newSocket.id
      );

      /*
       * If the user selected a group before
       * Socket.IO finished connecting, join
       * that group now.
       */
      const group =
        selectedGroupRef.current;

      if (group) {
        console.log(
          "👥 Joining selected group after socket connection:",
          group._id
        );

        newSocket.emit(
          "join_group",
          {
            groupId: group._id,
          }
        );
      }
    });

    /* ======================================================= */
    /* GROUP JOINED */
    /* ======================================================= */

    newSocket.on(
      "group_joined",
      ({
        groupId,
      }: {
        groupId: string;
      }) => {
        console.log(
          "👥 Joined collaboration group:",
          groupId
        );
      }
    );

    /* ======================================================= */
    /* SOCKET ERROR */
    /* ======================================================= */

    newSocket.on(
      "socket_error",
      ({
        message,
      }: {
        message: string;
      }) => {
        console.error(
          "Socket error:",
          message
        );
      }
    );

    /* ======================================================= */
    /* NEW MESSAGE */
    /* ======================================================= */

    newSocket.on(
      "new_message",
      (message: ChatMessage) => {
        const currentGroup =
          selectedGroupRef.current;

        /*
         * Ignore messages belonging to
         * another collaboration group.
         */
        if (
          !currentGroup ||
          message.group !==
            currentGroup._id
        ) {
          return;
        }

        setMessages((previous) => {
          /*
           * Prevent duplicate messages.
           */
          const exists =
            previous.some(
              (item) =>
                item._id ===
                message._id
            );

          if (exists) {
            return previous;
          }

          return [
            ...previous,
            message,
          ];
        });
      }
    );

    /* ======================================================= */
    /* MESSAGE DELETED */
    /* ======================================================= */

    newSocket.on(
      "message_deleted",
      ({
        messageId,
        groupId,
      }: {
        messageId: string;
        groupId: string;
      }) => {
        const currentGroup =
          selectedGroupRef.current;

        /*
         * Only modify messages if the
         * deleted message belongs to
         * the currently selected group.
         */
        if (
          !currentGroup ||
          groupId !==
            currentGroup._id
        ) {
          return;
        }

        setMessages((previous) =>
          previous.filter(
            (message) =>
              message._id !==
              messageId
          )
        );
      }
    );

    /* ======================================================= */
    /* DISCONNECT */
    /* ======================================================= */

    newSocket.on(
      "disconnect",
      (reason) => {
        console.log(
          "🔌 Disconnected from Socket.IO:",
          reason
        );
      }
    );

    /*
     * Keep state for existing UI logic.
     */
    setSocket(newSocket);

    /* ======================================================= */
    /* CLEANUP */
    /* ======================================================= */

    return () => {
      socketRef.current = null;
      newSocket.disconnect();
    };
  }, []);

  /* ========================================================= */
  /* AUTO SCROLL */
  /* ========================================================= */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  /* ========================================================= */
  /* FETCH MESSAGES FROM MONGODB */
  /* ========================================================= */

  const fetchMessages = async (
    groupId: string
  ) => {
    try {
      setMessagesLoading(true);
      setError("");

      console.log(
        "📥 Fetching messages for group:",
        groupId
      );

      const response = await fetch(
        `${API_URL}/api/collaborations/groups/${groupId}/messages`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            Accept:
              "application/json",
          },
        }
      );

      const data =
        await response.json();

      console.log(
        "📥 Message history response:",
        response.status,
        data
      );

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to fetch messages."
        );
      }

      const loadedMessages =
        Array.isArray(data.messages)
          ? data.messages
          : [];

      console.log(
        "📥 Messages loaded:",
        loadedMessages.length
      );

      setMessages(
        loadedMessages
      );
    } catch (error) {
      console.error(
        "Failed to fetch messages:",
        error
      );

      setMessages([]);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to fetch messages."
      );
    } finally {
      setMessagesLoading(false);
    }
  };

  /* ========================================================= */
  /* OPEN GROUP */
  /* ========================================================= */

  const openGroup = async (
    group: CollaborationGroup
  ) => {
    console.log(
      "💬 Opening collaboration group:",
      group._id
    );

    /*
     * Set selected group.
     */
    setSelectedGroup(group);

    /*
     * Update ref immediately.
     */
    selectedGroupRef.current =
      group;

    setShowMembers(false);

    /*
     * Clear only the current UI state
     * while loading permanent history.
     */
    setMessages([]);

    setError("");

    /*
     * =======================================================
     * FIRST:
     * Load permanent messages from MongoDB.
     * =======================================================
     */

    await fetchMessages(
      group._id
    );

    /*
     * =======================================================
     * SECOND:
     * Join Socket.IO room.
     * =======================================================
     */

    const currentSocket =
      socketRef.current;

    if (
      currentSocket?.connected
    ) {
      console.log(
        "👥 Joining Socket.IO group:",
        group._id
      );

      currentSocket.emit(
        "join_group",
        {
          groupId: group._id,
        }
      );
    } else {
      console.log(
        "⏳ Socket.IO is not connected yet. The connect handler will join the group."
      );
    }
  };

  /* ========================================================= */
  /* CLOSE CHAT */
  /* ========================================================= */

  const closeChat = () => {
    selectedGroupRef.current =
      null;

    setSelectedGroup(null);
    setMessages([]);
    setMessageText("");
    setShowMembers(false);
    setError("");
  };

  /* ========================================================= */
  /* SEND MESSAGE */
  /* ========================================================= */

  const handleSendMessage = () => {
    const currentSocket =
      socketRef.current;

    const currentGroup =
      selectedGroupRef.current;

    if (
      !currentSocket?.connected ||
      !currentGroup ||
      !messageText.trim()
    ) {
      return;
    }

    currentSocket.emit(
      "send_message",
      {
        groupId:
          currentGroup._id,
        text:
          messageText.trim(),
      }
    );

    setMessageText("");
  };

  /* ========================================================= */
  /* DELETE MESSAGE */
  /* ========================================================= */

  const handleDeleteMessage = (
    messageId: string
  ) => {
    const currentSocket =
      socketRef.current;

    if (
      !currentSocket?.connected
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        "Delete this message for everyone?"
      );

    if (!confirmed) {
      return;
    }

    currentSocket.emit(
      "delete_message",
      {
        messageId,
      }
    );
  };

  /* ========================================================= */
  /* ENTER TO SEND */
  /* ========================================================= */

  const handleInputKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      handleSendMessage();
    }
  };

  /* ========================================================= */
  /* MEMBER AVATAR */
  /* ========================================================= */

  const Avatar = ({
    name,
    photo,
    size = "normal",
  }: {
    name?: string;
    photo?: string;
    size?: "small" | "normal";
  }) => {
    const sizeClass =
      size === "small"
        ? "h-8 w-8 text-xs"
        : "h-10 w-10 text-sm";

    if (photo) {
      return (
        <img
          src={photo}
          alt={
            name || "User"
          }
          className={`${sizeClass} shrink-0 rounded-full object-cover`}
        />
      );
    }

    return (
      <div
        className={`${sizeClass} flex shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-600`}
      >
        {name
          ?.charAt(0)
          .toUpperCase() ||
          "U"}
      </div>
    );
  };

  /* ========================================================= */
  /* GROUP LIST */
  /* ========================================================= */

  if (!selectedGroup) {
    return (
      <div className="min-h-screen bg-[#f5f8fc] px-4 py-6 md:px-8 md:py-8">
        <div className="mx-auto max-w-5xl">

          {/* PAGE HEADER */}

          <div className="mb-7">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                <MessageCircle
                  size={24}
                />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-800">
                  Messages
                </h1>

                <p className="text-sm text-slate-500">
                  Your collaboration conversations
                </p>
              </div>
            </div>
          </div>

          {/* LOADING */}

          {loading && (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

              <p className="text-sm text-slate-500">
                Loading conversations...
              </p>
            </div>
          )}

          {/* ERROR */}

          {!loading &&
            error && (
              <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center">
                <p className="text-sm font-medium text-red-600">
                  {error}
                </p>
              </div>
            )}

          {/* EMPTY */}

          {!loading &&
            !error &&
            groups.length === 0 && (
              <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-500">
                  <MessageCircle
                    size={30}
                  />
                </div>

                <h2 className="text-lg font-bold text-slate-800">
                  No conversations yet
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Once you accept a collaboration
                  request, your project group will
                  appear here.
                </p>
              </div>
            )}

          {/* GROUP CARDS */}

          {!loading &&
            !error &&
            groups.length > 0 && (
              <div className="space-y-3">
                {groups.map(
                  (group) => (
                    <button
                      key={
                        group._id
                      }
                      type="button"
                      onClick={() =>
                        openGroup(
                          group
                        )
                      }
                      className="group flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition duration-200 hover:-translate-y-[1px] hover:border-blue-200 hover:shadow-md md:p-5"
                    >
                      {/* GROUP ICON */}

                      <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                        <Users
                          size={24}
                        />

                        <span className="absolute -bottom-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-blue-600 px-1 text-[9px] font-bold text-white">
                          {
                            group
                              .members
                              .length
                          }
                        </span>
                      </div>

                      {/* GROUP INFO */}

                      <div className="min-w-0 flex-1">
                        <h2 className="truncate text-[15px] font-bold text-slate-800">
                          {group.name ||
                            group.project
                              ?.title}
                        </h2>

                        <p className="mt-1 truncate text-sm text-slate-500">
                          {group.members
                            .map(
                              (
                                member
                              ) =>
                                member.name
                            )
                            .join(
                              ", "
                            )}
                        </p>
                      </div>

                      {/* ARROW */}

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg text-slate-300 transition group-hover:bg-blue-50 group-hover:text-blue-600">
                        →
                      </div>
                    </button>
                  )
                )}
              </div>
            )}
        </div>
      </div>
    );
  }

  /* ========================================================= */
  /* CHAT SCREEN */
  /* ========================================================= */

  return (
    <div className="h-screen bg-[#f5f8fc] p-0 md:p-5">
      <div className="mx-auto flex h-full max-w-7xl overflow-hidden bg-white shadow-sm md:h-[calc(100vh-40px)] md:rounded-3xl md:border md:border-slate-200">

        {/* CHAT AREA */}

        <div className="flex min-w-0 flex-1 flex-col">

          {/* CHAT HEADER */}

          <div className="flex h-[72px] shrink-0 items-center border-b border-slate-200 bg-white px-4 md:px-6">

            <button
              type="button"
              onClick={
                closeChat
              }
              className="mr-3 flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100"
            >
              <ArrowLeft
                size={20}
              />
            </button>

            <Avatar
              name={
                selectedGroup.name ||
                selectedGroup
                  .project
                  ?.title
              }
              size="normal"
            />

            <div className="ml-3 min-w-0 flex-1">
              <h1 className="truncate text-[15px] font-bold text-slate-800">
                {selectedGroup.name ||
                  selectedGroup
                    .project
                    ?.title}
              </h1>

              <button
                type="button"
                onClick={() =>
                  setShowMembers(
                    (previous) =>
                      !previous
                  )
                }
                className="text-xs text-slate-500 transition hover:text-blue-600"
              >
                {
                  selectedGroup
                    .members
                    .length
                }{" "}
                {selectedGroup
                  .members
                  .length === 1
                  ? "member"
                  : "members"}
              </button>
            </div>

            <button
              type="button"
              onClick={() =>
                setShowMembers(
                  (previous) =>
                    !previous
                )
              }
              className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100"
            >
              <Users
                size={20}
              />
            </button>

            <button
              type="button"
              className="ml-1 hidden h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 sm:flex"
            >
              <MoreVertical
                size={20}
              />
            </button>
          </div>

          {/* MESSAGES */}

          <div className="relative flex-1 overflow-y-auto bg-[#f4f7fb] px-3 py-5 md:px-8">

            {/* subtle background decoration */}

            <div className="pointer-events-none absolute inset-0 opacity-40">
              <div className="absolute left-10 top-10 h-24 w-24 rounded-full bg-blue-100 blur-3xl" />

              <div className="absolute bottom-20 right-10 h-32 w-32 rounded-full bg-indigo-100 blur-3xl" />
            </div>

            <div className="relative z-10">

              {/* DATE / START LABEL */}

              {!messagesLoading &&
                messages.length >
                  0 && (
                  <div className="mb-6 flex justify-center">
                    <span className="rounded-full bg-white px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400 shadow-sm">
                      Collaboration chat
                    </span>
                  </div>
                )}

              {/* LOADING */}

              {messagesLoading && (
                <div className="flex min-h-[400px] items-center justify-center">
                  <div className="text-center">

                    <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

                    <p className="text-sm text-slate-500">
                      Loading messages...
                    </p>

                  </div>
                </div>
              )}

              {/* EMPTY */}

              {!messagesLoading &&
                messages.length ===
                  0 && (
                  <div className="flex min-h-[400px] items-center justify-center">
                    <div className="max-w-sm text-center">

                      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-blue-500 shadow-sm">
                        <MessageCircle
                          size={30}
                        />
                      </div>

                      <h2 className="text-base font-bold text-slate-700">
                        Start the conversation
                      </h2>

                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        Discuss your project,
                        share ideas and build
                        something great together.
                      </p>

                    </div>
                  </div>
                )}

              {/* MESSAGE LIST */}

              <div className="space-y-4">

                {messages.map(
                  (message) => {
                    const isMine =
                      currentUser?.id ===
                      message
                        .sender?._id;

                    return (
                      <div
                        key={
                          message._id
                        }
                        className={`flex ${
                          isMine
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >

                        <div
                          className={`flex max-w-[88%] items-end gap-2 md:max-w-[65%] ${
                            isMine
                              ? "flex-row-reverse"
                              : ""
                          }`}
                        >

                          {/* AVATAR */}

                          <Avatar
                            name={
                              message
                                .sender
                                ?.name
                            }
                            photo={
                              message
                                .sender
                                ?.profilePhoto
                            }
                            size="small"
                          />

                          {/* MESSAGE BUBBLE */}

                          <div
                            className={`group relative rounded-2xl px-4 py-2.5 shadow-sm ${
                              isMine
                                ? "rounded-br-md bg-blue-600 text-white"
                                : "rounded-bl-md border border-slate-200 bg-white text-slate-800"
                            }`}
                          >

                            {/* NAME */}

                            <p
                              className={`mb-1 text-[11px] font-bold ${
                                isMine
                                  ? "text-blue-100"
                                  : "text-blue-600"
                              }`}
                            >
                              {isMine
                                ? "You"
                                : message
                                    .sender
                                    ?.name ||
                                  "Unknown user"}
                            </p>

                            {/* TEXT */}

                            <p className="whitespace-pre-wrap break-words text-[14px] leading-6">
                              {
                                message.text
                              }
                            </p>

                            {/* FOOTER */}

                            <div
                              className={`mt-1 flex items-center justify-end gap-1.5 text-[10px] ${
                                isMine
                                  ? "text-blue-100"
                                  : "text-slate-400"
                              }`}
                            >
                              <span>
                                {new Date(
                                  message.createdAt
                                ).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute:
                                      "2-digit",
                                  }
                                )}
                              </span>

                              {isMine && (
                                <CheckCheck
                                  size={
                                    13
                                  }
                                />
                              )}
                            </div>

                            {/* DELETE */}

                            {isMine && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteMessage(
                                    message._id
                                  )
                                }
                                title="Delete message"
                                className="absolute -top-3 -right-3 flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 opacity-0 shadow-sm transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                              >
                                <Trash2
                                  size={
                                    13
                                  }
                                />
                              </button>
                            )}

                          </div>
                        </div>
                      </div>
                    );
                  }
                )}

              </div>

              <div
                ref={
                  messagesEndRef
                }
              />

            </div>
          </div>

          {/* MESSAGE INPUT */}

          <div className="shrink-0 border-t border-slate-200 bg-white p-3 md:p-4">

            <div className="mx-auto flex max-w-5xl items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-1.5 transition focus-within:border-blue-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50">

              <input
                type="text"
                value={
                  messageText
                }
                onChange={(
                  event
                ) =>
                  setMessageText(
                    event.target.value
                  )
                }
                onKeyDown={
                  handleInputKeyDown
                }
                placeholder="Write a message..."
                maxLength={2000}
                className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400"
              />

              <button
                type="button"
                onClick={
                  handleSendMessage
                }
                disabled={
                  !messageText.trim() ||
                  !socket
                }
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm transition hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send
                  size={17}
                />
              </button>

            </div>

            <p className="mt-1.5 hidden text-center text-[10px] text-slate-400 sm:block">
              Press Enter to send
            </p>

          </div>
        </div>

                {/* =========================================================
    MEMBERS SIDEBAR
========================================================= */}
        {showMembers && (
          <aside className="absolute right-0 top-0 z-30 flex h-full w-[310px] flex-col border-l border-slate-200 bg-white shadow-xl md:relative md:shadow-none">

            {/* HEADER */}

            <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-slate-200 px-5">

              <div>
                <h2 className="text-sm font-bold text-slate-800">
                  Group members
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  {
                    selectedGroup
                      .members
                      .length
                  }{" "}
                  {
                    selectedGroup
                      .members
                      .length === 1
                      ? "member"
                      : "members"
                  }
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowMembers(
                    false
                  )
                }
                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
              >
                <X
                  size={18}
                />
              </button>

            </div>

            {/* MEMBERS */}

            <div className="flex-1 overflow-y-auto p-4">

              <div className="space-y-1">

                {selectedGroup.members.map(
                  (member) => {
                    const isCurrentUser =
                      currentUser?.id ===
                      member._id;

                    return (
                      <div
                        key={
                          member._id
                        }
                        className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-slate-50"
                      >

                        <div className="relative">

                          <Avatar
                            name={
                              member.name
                            }
                            photo={
                              member.profilePhoto
                            }
                            size="normal"
                          />

                          {/* ONLINE DOT */}

                          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />

                        </div>

                        <div className="min-w-0 flex-1">

                          <div className="flex items-center gap-2">

                            <p className="truncate text-sm font-semibold text-slate-800">
                              {
                                member.name
                              }
                            </p>

                            {isCurrentUser && (
                              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[9px] font-bold text-blue-600">
                                YOU
                              </span>
                            )}

                          </div>

                          <p className="mt-0.5 truncate text-xs text-slate-500">
                            {
                              member.email ||
                              "Collaborator"
                            }
                          </p>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>

            </div>
          </aside>
        )}

      </div>
    </div>
  );
};

export default MessagesPage;