import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCheck,
  ImagePlus,
  Loader2,
  MessageCircle,
  Mic,
  MoreVertical,
  Paperclip,
  Send,
  Square,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { io, Socket } from "socket.io-client";
import { uploadToCloudinary } from "../utils/cloudinary";

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

interface MessageSender {
  _id: string;
  name: string;
  email?: string;
  profilePhoto?: string;
}

type ChatMessageType = "text" | "image" | "audio";

interface ChatMessage {
  _id: string;
  group: string;
  sender: MessageSender;
  type?: ChatMessageType;
  text?: string;
  mediaUrl?: string;
  duration?: number;
  createdAt: string;
}

interface CurrentUser {
  id: string;
  name: string;
  email?: string;
  profilePhoto?: string;
}

const MessagesPage = () => {
  const [groups, setGroups] = useState<CollaborationGroup[]>([]);
  const [selectedGroup, setSelectedGroup] =
    useState<CollaborationGroup | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentUser, setCurrentUser] =
    useState<CurrentUser | null>(null);

  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [error, setError] = useState("");
  const [showMembers, setShowMembers] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  const [selectedImage, setSelectedImage] =
    useState<File | null>(null);
  const [imagePreview, setImagePreview] =
    useState<string | null>(null);
  const [uploadingMedia, setUploadingMedia] =
    useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const socketRef = useRef<Socket | null>(null);
  const selectedGroupRef =
    useRef<CollaborationGroup | null>(null);
  const messagesEndRef =
    useRef<HTMLDivElement | null>(null);

  const imageInputRef =
    useRef<HTMLInputElement | null>(null);
  const mediaRecorderRef =
    useRef<MediaRecorder | null>(null);
  const audioChunksRef =
    useRef<Blob[]>([]);
  const recordingStartRef =
    useRef<number | null>(null);
  const recordingTimerRef =
    useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    selectedGroupRef.current = selectedGroup;
  }, [selectedGroup]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/auth/me`,
          { credentials: "include" }
        );

        const data = await response.json();

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

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `${API_URL}/api/collaborations/groups`,
          { credentials: "include" }
        );

        const data = await response.json();

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

  useEffect(() => {
    const newSocket = io(API_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    socketRef.current = newSocket;

    newSocket.on("connect", () => {
      console.log(
        "🔌 Connected to Socket.IO:",
        newSocket.id
      );

      const group = selectedGroupRef.current;

      if (group) {
        newSocket.emit("join_group", {
          groupId: group._id,
        });
      }
    });

    newSocket.on(
      "group_joined",
      ({ groupId }: { groupId: string }) => {
        console.log(
          "👥 Joined collaboration group:",
          groupId
        );
      }
    );

    newSocket.on(
      "socket_error",
      ({ message }: { message: string }) => {
        console.error("Socket error:", message);
        setError(message);
      }
    );

    newSocket.on(
      "new_message",
      (message: ChatMessage) => {
        const currentGroup =
          selectedGroupRef.current;

        if (
          !currentGroup ||
          message.group !== currentGroup._id
        ) {
          return;
        }

        setMessages((previous) => {
          if (
            previous.some(
              (item) =>
                item._id === message._id
            )
          ) {
            return previous;
          }

          return [...previous, message];
        });
      }
    );

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

        if (
          !currentGroup ||
          groupId !== currentGroup._id
        ) {
          return;
        }

        setMessages((previous) =>
          previous.filter(
            (message) =>
              message._id !== messageId
          )
        );
      }
    );

    newSocket.on("disconnect", (reason) => {
      console.log(
        "🔌 Disconnected from Socket.IO:",
        reason
      );
    });

    setSocket(newSocket);

    return () => {
      socketRef.current = null;
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }

      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, [imagePreview]);

  const fetchMessages = async (
    groupId: string
  ) => {
    try {
      setMessagesLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/collaborations/groups/${groupId}/messages`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to fetch messages."
        );
      }

      setMessages(
        Array.isArray(data.messages)
          ? data.messages
          : []
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

  const openGroup = async (
    group: CollaborationGroup
  ) => {
    setSelectedGroup(group);
    selectedGroupRef.current = group;
    setShowMembers(false);
    setMessages([]);
    setMessageText("");
    setError("");
    clearSelectedImage();

    await fetchMessages(group._id);

    const currentSocket =
      socketRef.current;

    if (currentSocket?.connected) {
      currentSocket.emit("join_group", {
        groupId: group._id,
      });
    }
  };

  const closeChat = () => {
    selectedGroupRef.current = null;
    setSelectedGroup(null);
    setMessages([]);
    setMessageText("");
    setShowMembers(false);
    setError("");
    clearSelectedImage();
  };

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

    currentSocket.emit("send_message", {
      groupId: currentGroup._id,
      type: "text",
      text: messageText.trim(),
    });

    setMessageText("");
  };

  const handleDeleteMessage = (
    messageId: string
  ) => {
    const currentSocket =
      socketRef.current;

    if (!currentSocket?.connected) {
      return;
    }

    const confirmed = window.confirm(
      "Delete this message for everyone?"
    );

    if (!confirmed) {
      return;
    }

    currentSocket.emit("delete_message", {
      messageId,
    });
  };

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

  const clearSelectedImage = () => {
    setSelectedImage(null);

    setImagePreview((previous) => {
      if (previous) {
        URL.revokeObjectURL(previous);
      }
      return null;
    });

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const handleImageSelected = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError(
        "Please select a valid image file."
      );
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError(
        "Image size must be 10 MB or less."
      );
      return;
    }

    setError("");
    setSelectedImage(file);

    setImagePreview((previous) => {
      if (previous) {
        URL.revokeObjectURL(previous);
      }

      return URL.createObjectURL(file);
    });
  };

  const handleSendImage = async () => {
    const currentSocket =
      socketRef.current;
    const currentGroup =
      selectedGroupRef.current;

    if (
      !currentSocket?.connected ||
      !currentGroup ||
      !selectedImage ||
      uploadingMedia
    ) {
      return;
    }

    try {
      setUploadingMedia(true);
      setError("");

      const upload =
        await uploadToCloudinary(
          selectedImage
        );

      currentSocket.emit(
        "send_message",
        {
          groupId: currentGroup._id,
          type: "image",
          mediaUrl: upload.secure_url,
          text: messageText.trim() || undefined,
        }
      );

      setMessageText("");
      clearSelectedImage();
    } catch (error) {
      console.error(
        "Image upload failed:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to upload image."
      );
    } finally {
      setUploadingMedia(false);
    }
  };

  const stopRecordingTimer = () => {
    if (recordingTimerRef.current) {
      clearInterval(
        recordingTimerRef.current
      );
      recordingTimerRef.current = null;
    }
  };

  const uploadVoiceNote = async (
    blob: Blob,
    duration: number
  ) => {
    const currentSocket =
      socketRef.current;
    const currentGroup =
      selectedGroupRef.current;

    if (
      !currentSocket?.connected ||
      !currentGroup
    ) {
      return;
    }

    try {
      setUploadingMedia(true);
      setError("");

      const extension =
        blob.type.includes("mp4")
          ? "m4a"
          : "webm";

      const audioFile = new File(
        [blob],
        `voice-note-${Date.now()}.${extension}`,
        {
          type:
            blob.type ||
            "audio/webm",
        }
      );

      const upload =
        await uploadToCloudinary(
          audioFile
        );

      currentSocket.emit(
        "send_message",
        {
          groupId: currentGroup._id,
          type: "audio",
          mediaUrl: upload.secure_url,
          duration,
        }
      );
    } catch (error) {
      console.error(
        "Voice note upload failed:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to upload voice note."
      );
    } finally {
      setUploadingMedia(false);
    }
  };

  const startRecording = async () => {
    if (
      isRecording ||
      uploadingMedia ||
      !selectedGroup
    ) {
      return;
    }

    try {
      setError("");

      if (
        !navigator.mediaDevices?.getUserMedia
      ) {
        throw new Error(
          "Voice recording is not supported in this browser."
        );
      }

      const stream =
        await navigator.mediaDevices.getUserMedia(
          { audio: true }
        );

      const mimeTypes = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4",
      ];

      const supportedMimeType =
        mimeTypes.find((type) =>
          MediaRecorder.isTypeSupported(type)
        );

      const recorder =
        supportedMimeType
          ? new MediaRecorder(
              stream,
              {
                mimeType:
                  supportedMimeType,
              }
            )
          : new MediaRecorder(
              stream
            );

      audioChunksRef.current = [];
      recordingStartRef.current =
        Date.now();

      recorder.ondataavailable = (
        event
      ) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(
            event.data
          );
        }
      };

      recorder.onstop = async () => {
        stopRecordingTimer();

        stream
          .getTracks()
          .forEach((track) =>
            track.stop()
          );

        const duration = Math.max(
          1,
          Math.round(
            (Date.now() -
              (recordingStartRef.current ||
                Date.now())) /
              1000
          )
        );

        const blob = new Blob(
          audioChunksRef.current,
          {
            type:
              recorder.mimeType ||
              "audio/webm",
          }
        );

        audioChunksRef.current = [];
        recordingStartRef.current =
          null;

        setIsRecording(false);
        setRecordingSeconds(0);

        if (blob.size > 0) {
          await uploadVoiceNote(
            blob,
            duration
          );
        }
      };

      mediaRecorderRef.current =
        recorder;

      recorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      recordingTimerRef.current =
        setInterval(() => {
          setRecordingSeconds(
            Math.floor(
              (Date.now() -
                (recordingStartRef.current ||
                  Date.now())) /
                1000
            )
          );
        }, 1000);
    } catch (error) {
      console.error(
        "Unable to start recording:",
        error
      );

      setIsRecording(false);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to access your microphone."
      );
    }
  };

  const stopRecording = () => {
    const recorder =
      mediaRecorderRef.current;

    if (
      !recorder ||
      recorder.state === "inactive"
    ) {
      return;
    }

    recorder.stop();
    mediaRecorderRef.current = null;
  };

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
          alt={name || "User"}
          className={`${sizeClass} shrink-0 rounded-full object-cover ring-2 ring-white`}
        />
      );
    }

    return (
      <div
        className={`${sizeClass} flex shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-600 ring-2 ring-white`}
      >
        {name
          ?.charAt(0)
          .toUpperCase() || "U"}
      </div>
    );
  };

  const formatDuration = (
    seconds = 0
  ) => {
    const safeSeconds = Math.max(
      0,
      Math.round(seconds)
    );

    const minutes = Math.floor(
      safeSeconds / 60
    );
    const remaining =
      safeSeconds % 60;

    return `${minutes}:${remaining
      .toString()
      .padStart(2, "0")}`;
  };

  const formatMessageTime = (
    createdAt: string
  ) =>
    new Date(
      createdAt
    ).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  if (!selectedGroup) {
    return (
      <div className="min-h-screen bg-[#f5f8fc] px-4 py-5 sm:px-6 md:px-8 md:py-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 shadow-sm">
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

            {groups.length > 0 && (
              <div className="hidden rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-500 shadow-sm sm:block">
                {groups.length}{" "}
                {groups.length === 1
                  ? "conversation"
                  : "conversations"}
              </div>
            )}
          </div>

          {loading && (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <Loader2
                size={30}
                className="mx-auto mb-4 animate-spin text-blue-600"
              />
              <p className="text-sm text-slate-500">
                Loading conversations...
              </p>
            </div>
          )}

          {!loading && error && (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center">
              <p className="text-sm font-medium text-red-600">
                {error}
              </p>
            </div>
          )}

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
                  Once you accept a
                  collaboration request,
                  your project group will
                  appear here.
                </p>
              </div>
            )}

          {!loading &&
            !error &&
            groups.length > 0 && (
              <div className="grid gap-3 md:grid-cols-2">
                {groups.map((group) => (
                  <button
                    key={group._id}
                    type="button"
                    onClick={() =>
                      openGroup(group)
                    }
                    className="group flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md active:scale-[0.99] md:p-5"
                  >
                    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-600">
                      <Users size={24} />

                      <span className="absolute -bottom-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-blue-600 px-1 text-[9px] font-bold text-white">
                        {group.members.length}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-[15px] font-bold text-slate-800">
                        {group.name ||
                          group.project?.title}
                      </h2>

                      <p className="mt-1 truncate text-sm text-slate-500">
                        {group.members
                          .map(
                            (member) =>
                              member.name
                          )
                          .join(", ")}
                      </p>

                      <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-blue-500">
                        Open conversation
                      </p>
                    </div>

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg text-slate-300 transition group-hover:bg-blue-50 group-hover:text-blue-600">
                      →
                    </div>
                  </button>
                ))}
              </div>
            )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] overflow-hidden bg-[#f5f8fc] p-0 md:p-5">
      <div className="relative mx-auto flex h-full max-w-7xl overflow-hidden bg-white shadow-sm md:h-[calc(100dvh-40px)] md:rounded-3xl md:border md:border-slate-200">
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex min-h-[68px] shrink-0 items-center border-b border-slate-200 bg-white px-3 sm:px-4 md:px-6">
            <button
              type="button"
              onClick={closeChat}
              className="mr-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 active:scale-95"
              aria-label="Back to conversations"
            >
              <ArrowLeft size={20} />
            </button>

            <Avatar
              name={
                selectedGroup.name ||
                selectedGroup.project?.title
              }
              size="normal"
            />

            <div className="ml-3 min-w-0 flex-1">
              <h1 className="truncate text-[15px] font-bold text-slate-800">
                {selectedGroup.name ||
                  selectedGroup.project?.title}
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
                {selectedGroup.members.length}{" "}
                {selectedGroup.members.length ===
                1
                  ? "member"
                  : "members"}
              </button>
            </div>

            <div
              className={`mr-1 hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold sm:flex ${
                socket?.connected
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-amber-50 text-amber-600"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  socket?.connected
                    ? "bg-emerald-500"
                    : "bg-amber-500"
                }`}
              />
              {socket?.connected
                ? "Connected"
                : "Connecting"}
            </div>

            <button
              type="button"
              onClick={() =>
                setShowMembers(
                  (previous) =>
                    !previous
                )
              }
              className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 active:scale-95"
              aria-label="Show members"
            >
              <Users size={20} />
            </button>

            <button
              type="button"
              className="ml-1 hidden h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 sm:flex"
              aria-label="More options"
            >
              <MoreVertical size={20} />
            </button>
          </div>

          {error && (
            <div className="z-20 flex shrink-0 items-center justify-between border-b border-red-100 bg-red-50 px-4 py-2">
              <p className="min-w-0 truncate text-xs font-medium text-red-600">
                {error}
              </p>

              <button
                type="button"
                onClick={() => setError("")}
                className="ml-3 shrink-0 rounded-full p-1 text-red-400 hover:bg-red-100 hover:text-red-600"
              >
                <X size={14} />
              </button>
            </div>
          )}

          <div className="relative flex-1 overflow-y-auto bg-[#f4f7fb] px-3 py-5 sm:px-5 md:px-8">
            <div className="pointer-events-none absolute inset-0 opacity-40">
              <div className="absolute left-10 top-10 h-24 w-24 rounded-full bg-blue-100 blur-3xl" />
              <div className="absolute bottom-20 right-10 h-32 w-32 rounded-full bg-indigo-100 blur-3xl" />
            </div>

            <div className="relative z-10 mx-auto max-w-4xl">
              {!messagesLoading &&
                messages.length > 0 && (
                  <div className="mb-6 flex justify-center">
                    <span className="rounded-full border border-slate-200 bg-white/90 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400 shadow-sm backdrop-blur">
                      Collaboration chat
                    </span>
                  </div>
                )}

              {messagesLoading && (
                <div className="flex min-h-[400px] items-center justify-center">
                  <div className="text-center">
                    <Loader2
                      size={30}
                      className="mx-auto mb-4 animate-spin text-blue-600"
                    />
                    <p className="text-sm text-slate-500">
                      Loading messages...
                    </p>
                  </div>
                </div>
              )}

              {!messagesLoading &&
                messages.length === 0 && (
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
                        share ideas, send images
                        and use voice notes to
                        build together.
                      </p>
                    </div>
                  </div>
                )}

              <div className="space-y-4">
                {messages.map(
                  (message) => {
                    const isMine =
                      currentUser?.id ===
                      message.sender?._id;

                    const messageType =
                      message.type ||
                      "text";

                    return (
                      <div
                        key={message._id}
                        className={`flex ${
                          isMine
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`flex max-w-[94%] items-end gap-2 sm:max-w-[85%] md:max-w-[68%] ${
                            isMine
                              ? "flex-row-reverse"
                              : ""
                          }`}
                        >
                          <Avatar
                            name={
                              message.sender
                                ?.name
                            }
                            photo={
                              message.sender
                                ?.profilePhoto
                            }
                            size="small"
                          />

                          <div
                            className={`group relative min-w-0 rounded-2xl shadow-sm ${
                              isMine
                                ? "rounded-br-md bg-blue-600 text-white"
                                : "rounded-bl-md border border-slate-200 bg-white text-slate-800"
                            } ${
                              messageType ===
                              "image"
                                ? "p-1.5"
                                : "px-4 py-2.5"
                            }`}
                          >
                            {messageType !==
                              "image" && (
                              <p
                                className={`mb-1 text-[11px] font-bold ${
                                  isMine
                                    ? "text-blue-100"
                                    : "text-blue-600"
                                }`}
                              >
                                {isMine
                                  ? "You"
                                  : message.sender
                                      ?.name ||
                                    "Unknown user"}
                              </p>
                            )}

                            {messageType ===
                              "text" && (
                              <p className="whitespace-pre-wrap break-words text-[14px] leading-6">
                                {message.text}
                              </p>
                            )}

                            {messageType ===
                              "image" &&
                              message.mediaUrl && (
                                <a
                                  href={
                                    message.mediaUrl
                                  }
                                  target="_blank"
                                  rel="noreferrer"
                                  className="block overflow-hidden rounded-xl"
                                >
                                  <img
                                    src={
                                      message.mediaUrl
                                    }
                                    alt="Shared image"
                                    loading="lazy"
                                    className="max-h-[360px] w-auto max-w-full rounded-xl object-contain transition hover:opacity-95"
                                  />
                                </a>
                              )}

                            {messageType ===
                              "image" &&
                              message.text && (
                                <p
                                  className={`px-1.5 pt-2 text-[14px] leading-5 ${
                                    isMine
                                      ? "text-white"
                                      : "text-slate-700"
                                  }`}
                                >
                                  {message.text}
                                </p>
                              )}

                            {messageType ===
                              "audio" &&
                              message.mediaUrl && (
                                <div
                                  className={`flex min-w-[230px] max-w-[290px] items-center gap-3 rounded-xl px-2 py-1 ${
                                    isMine
                                      ? "bg-blue-500"
                                      : "bg-slate-50"
                                  }`}
                                >
                                  <div
                                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                                      isMine
                                        ? "bg-white/15 text-white"
                                        : "bg-blue-100 text-blue-600"
                                    }`}
                                  >
                                    <Mic
                                      size={17}
                                    />
                                  </div>

                                  <audio
                                    controls
                                    preload="metadata"
                                    src={
                                      message.mediaUrl
                                    }
                                    className={`h-9 min-w-0 flex-1 ${
                                      isMine
                                        ? "accent-white"
                                        : ""
                                    }`}
                                  />

                                  {message.duration !==
                                    undefined && (
                                    <span
                                      className={`shrink-0 text-[10px] font-semibold ${
                                        isMine
                                          ? "text-blue-100"
                                          : "text-slate-400"
                                      }`}
                                    >
                                      {formatDuration(
                                        message.duration
                                      )}
                                    </span>
                                  )}
                                </div>
                              )}

                            <div
                              className={`mt-1 flex items-center justify-end gap-1.5 text-[10px] ${
                                isMine
                                  ? "text-blue-100"
                                  : "text-slate-400"
                              } ${
                                messageType ===
                                "image"
                                  ? "px-1.5 pb-0.5"
                                  : ""
                              }`}
                            >
                              <span>
                                {formatMessageTime(
                                  message.createdAt
                                )}
                              </span>

                              {isMine && (
                                <CheckCheck
                                  size={13}
                                />
                              )}
                            </div>

                            {isMine && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteMessage(
                                    message._id
                                  )
                                }
                                title="Delete message"
                                className="absolute -right-3 -top-3 flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 opacity-100 shadow-sm transition hover:bg-red-50 hover:text-red-500 sm:opacity-0 sm:group-hover:opacity-100"
                              >
                                <Trash2
                                  size={13}
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

              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="shrink-0 border-t border-slate-200 bg-white p-2.5 sm:p-3 md:p-4">
            {selectedImage && imagePreview && (
              <div className="mx-auto mb-2 flex max-w-5xl items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-2.5">
                <img
                  src={imagePreview}
                  alt="Selected image preview"
                  className="h-14 w-14 rounded-xl object-cover"
                />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-slate-700">
                    {selectedImage.name}
                  </p>
                  <p className="mt-0.5 text-[10px] text-slate-500">
                    Ready to send
                  </p>
                </div>

                <button
                  type="button"
                  onClick={clearSelectedImage}
                  disabled={uploadingMedia}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                  aria-label="Remove image"
                >
                  <X size={15} />
                </button>

                <button
                  type="button"
                  onClick={handleSendImage}
                  disabled={uploadingMedia}
                  className="flex h-9 shrink-0 items-center gap-1.5 rounded-xl bg-blue-600 px-3 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {uploadingMedia ? (
                    <Loader2
                      size={14}
                      className="animate-spin"
                    />
                  ) : (
                    <Send size={14} />
                  )}
                  Send
                </button>
              </div>
            )}

            <div className="mx-auto max-w-5xl">
              <div className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 p-1.5 transition focus-within:border-blue-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50">
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={
                    handleImageSelected
                  }
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() =>
                    imageInputRef.current?.click()
                  }
                  disabled={
                    uploadingMedia ||
                    isRecording
                  }
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-blue-50 hover:text-blue-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Attach image"
                  title="Send image"
                >
                  <ImagePlus size={19} />
                </button>

                {isRecording ? (
                  <div className="flex min-w-0 flex-1 items-center gap-3 px-2">
                    <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                      <span className="absolute h-8 w-8 animate-ping rounded-full bg-red-200 opacity-60" />
                      <Mic
                        size={16}
                        className="relative"
                      />
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-red-600">
                        Recording voice note
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {formatDuration(
                          recordingSeconds
                        )}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={stopRecording}
                      className="flex h-10 shrink-0 items-center gap-1.5 rounded-xl bg-red-500 px-3 text-xs font-semibold text-white shadow-sm transition hover:bg-red-600 active:scale-95"
                    >
                      <Square
                        size={13}
                        fill="currentColor"
                      />
                      Stop
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      type="text"
                      value={messageText}
                      onChange={(event) =>
                        setMessageText(
                          event.target.value
                        )
                      }
                      onKeyDown={
                        handleInputKeyDown
                      }
                      placeholder={
                        selectedImage
                          ? "Add a caption (optional)..."
                          : "Write a message..."
                      }
                      maxLength={2000}
                      disabled={
                        uploadingMedia
                      }
                      className="min-w-0 flex-1 bg-transparent px-2 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 disabled:opacity-50 sm:px-3"
                    />

                    <button
                      type="button"
                      onClick={
                        startRecording
                      }
                      disabled={
                        uploadingMedia ||
                        !!messageText.trim() ||
                        !!selectedImage
                      }
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-blue-50 hover:text-blue-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
                      aria-label="Record voice note"
                      title="Record voice note"
                    >
                      <Mic size={19} />
                    </button>

                    <button
                      type="button"
                      onClick={
                        handleSendMessage
                      }
                      disabled={
                        !messageText.trim() ||
                        uploadingMedia ||
                        !socket?.connected ||
                        !!selectedImage
                      }
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm transition hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Send message"
                    >
                      {uploadingMedia ? (
                        <Loader2
                          size={17}
                          className="animate-spin"
                        />
                      ) : (
                        <Send size={17} />
                      )}
                    </button>
                  </>
                )}
              </div>

              <div className="mt-1.5 hidden items-center justify-between px-2 sm:flex">
                <p className="text-[10px] text-slate-400">
                  Enter to send • Images up to 10 MB
                </p>

                <p className="flex items-center gap-1 text-[10px] text-slate-400">
                  <Paperclip size={11} />
                  Images & voice notes supported
                </p>
              </div>
            </div>
          </div>
        </div>

        {showMembers && (
          <>
            <button
              type="button"
              aria-label="Close members"
              onClick={() =>
                setShowMembers(false)
              }
              className="absolute inset-0 z-20 bg-slate-900/20 backdrop-blur-[1px] md:hidden"
            />

            <aside className="absolute right-0 top-0 z-30 flex h-full w-[min(320px,88vw)] flex-col border-l border-slate-200 bg-white shadow-2xl md:relative md:z-20 md:w-[310px] md:shadow-none">
              <div className="flex h-[68px] shrink-0 items-center justify-between border-b border-slate-200 px-4 sm:px-5">
                <div>
                  <h2 className="text-sm font-bold text-slate-800">
                    Group members
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-500">
                    {selectedGroup.members.length}{" "}
                    {selectedGroup.members.length ===
                    1
                      ? "member"
                      : "members"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowMembers(false)
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100"
                  aria-label="Close members"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 sm:p-4">
                <div className="space-y-1">
                  {selectedGroup.members.map(
                    (member) => {
                      const isCurrentUser =
                        currentUser?.id ===
                        member._id;

                      return (
                        <div
                          key={member._id}
                          className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-slate-50"
                        >
                          <div className="relative">
                            <Avatar
                              name={member.name}
                              photo={
                                member.profilePhoto
                              }
                              size="normal"
                            />

                            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="truncate text-sm font-semibold text-slate-800">
                                {member.name}
                              </p>

                              {isCurrentUser && (
                                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[9px] font-bold text-blue-600">
                                  YOU
                                </span>
                              )}
                            </div>

                            <p className="mt-0.5 truncate text-xs text-slate-500">
                              {member.email ||
                                "Collaborator"}
                            </p>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            </aside>
          </>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
