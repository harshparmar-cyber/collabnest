import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";

import {
  ArrowLeft,
  Check,
  CheckCheck,
  Edit3,
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

type ChatMessageType =
  | "text"
  | "image"
  | "audio";

type MessageStatus =
  | "sending"
  | "sent"
  | "failed";

interface ChatMessage {
  _id: string;
  group: string;
  sender: MessageSender;

  type?: ChatMessageType;

  text?: string;

  mediaUrl?: string;

  duration?: number;

  createdAt: string;

  updatedAt?: string;

  status?: MessageStatus;

  /*
   * Used only by the frontend for
   * optimistic messages.
   */
  optimistic?: boolean;
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
  /* ======================================================= */
  /* BASIC STATE */
  /* ======================================================= */

  const [groups, setGroups] =
    useState<CollaborationGroup[]>([]);

  const [selectedGroup, setSelectedGroup] =
    useState<CollaborationGroup | null>(
      null
    );

  const [messages, setMessages] =
    useState<ChatMessage[]>([]);

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

  /* ======================================================= */
  /* IMAGE STATE */
  /* ======================================================= */

  const [selectedImage, setSelectedImage] =
    useState<File | null>(null);

  const [imagePreview, setImagePreview] =
    useState<string | null>(null);

  const [uploadingMedia, setUploadingMedia] =
    useState(false);

  /* ======================================================= */
  /* VOICE RECORDING */
  /* ======================================================= */

  const [isRecording, setIsRecording] =
    useState(false);

  const [recordingSeconds, setRecordingSeconds] =
    useState(0);

  /* ======================================================= */
  /* MESSAGE ACTIONS */
  /* ======================================================= */

  const [messageMenuId, setMessageMenuId] =
    useState<string | null>(null);

  const [deleteTargetId, setDeleteTargetId] =
    useState<string | null>(null);

  const [editingMessageId, setEditingMessageId] =
    useState<string | null>(null);

  /* ======================================================= */
  /* NEW MESSAGE INDICATOR */
  /* ======================================================= */

  const [newMessagesCount, setNewMessagesCount] =
    useState(0);

  /* ======================================================= */
  /* REFS */
  /* ======================================================= */

  const socketRef =
    useRef<Socket | null>(null);

  const selectedGroupRef =
    useRef<CollaborationGroup | null>(
      null
    );

  const messagesEndRef =
    useRef<HTMLDivElement | null>(null);

  const messagesContainerRef =
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
    useRef<ReturnType<
      typeof setInterval
    > | null>(null);

  /*
   * Used for long press.
   */
  const longPressTimerRef =
    useRef<ReturnType<
      typeof setTimeout
    > | null>(null);

  /*
   * Used to determine whether the
   * user is currently near the bottom.
   */
  const isNearBottomRef =
    useRef(true);

  /*
   * Temporary optimistic messages.
   */
  const optimisticMessagesRef =
    useRef<
      Map<string, string>
    >(new Map());

  /*
   * Automatically scroll after a new
   * message if appropriate.
   */
  const shouldAutoScrollRef =
    useRef(false);

  /* ======================================================= */
  /* SELECTED GROUP REF */
  /* ======================================================= */

  useEffect(() => {
    selectedGroupRef.current =
      selectedGroup;
  }, [selectedGroup]);

  /* ======================================================= */
  /* FETCH CURRENT USER */
  /* ======================================================= */

  useEffect(() => {
    const fetchCurrentUser =
      async () => {
        try {
          const response =
            await fetch(
              `${API_URL}/api/auth/me`,
              {
                credentials:
                  "include",
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

          setCurrentUser(
            data.user
          );
        } catch (error) {
          console.error(
            "Failed to fetch current user:",
            error
          );
        }
      };

    fetchCurrentUser();
  }, []);

  /* ======================================================= */
  /* FETCH GROUPS */
  /* ======================================================= */

  useEffect(() => {
    const fetchGroups =
      async () => {
        try {
          setLoading(true);

          const response =
            await fetch(
              `${API_URL}/api/collaborations/groups`,
              {
                credentials:
                  "include",
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
            Array.isArray(
              data.groups
            )
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

  /* ======================================================= */
  /* SOCKET CONNECTION */
  /* ======================================================= */

  useEffect(() => {
    const newSocket =
      io(API_URL, {
        withCredentials: true,

        transports: [
          "websocket",
          "polling",
        ],
      });

    socketRef.current =
      newSocket;

    /* ===================================================== */
    /* CONNECT */
    /* ===================================================== */

    newSocket.on(
      "connect",
      () => {
        console.log(
          "🔌 Connected to Socket.IO:",
          newSocket.id
        );

        const group =
          selectedGroupRef.current;

        if (group) {
          newSocket.emit(
            "join_group",
            {
              groupId:
                group._id,
            }
          );
        }
      }
    );

    /* ===================================================== */
    /* GROUP JOINED */
    /* ===================================================== */

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

    /* ===================================================== */
    /* SOCKET ERROR */
    /* ===================================================== */

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

        setError(message);
      }
    );

    /* ===================================================== */
    /* NEW MESSAGE */
    /* ===================================================== */

    newSocket.on(
      "new_message",
      (
        message: ChatMessage
      ) => {
        const currentGroup =
          selectedGroupRef.current;

        if (
          !currentGroup ||
          message.group !==
            currentGroup._id
        ) {
          return;
        }

        setMessages(
          (previous) => {
            /*
             * Already exists as a real
             * server message.
             */
            if (
              previous.some(
                (item) =>
                  item._id ===
                  message._id
              )
            ) {
              return previous;
            }

            /*
             * If this is our own message,
             * try to replace an optimistic
             * version of it.
             */
            const optimisticIndex =
              previous.findIndex(
                (item) => {
                  if (
                    !item.optimistic ||
                    item.sender._id !==
                      currentUser?.id
                  ) {
                    return false;
                  }

                  const sameType =
                    (item.type ||
                      "text") ===
                    (message.type ||
                      "text");

                  const sameText =
                    (item.text ||
                      "") ===
                    (message.text ||
                      "");

                  const sameMedia =
                    (item.mediaUrl ||
                      "") ===
                    (message.mediaUrl ||
                      "");

                  return (
                    sameType &&
                    sameText &&
                    sameMedia
                  );
                }
              );

            if (
              optimisticIndex !==
              -1
            ) {
              const updated =
                [...previous];

              updated[
                optimisticIndex
              ] = {
                ...message,
                status:
                  "sent",
                optimistic:
                  false,
              };

              return updated;
            }

            return [
              ...previous,
              message,
            ];
          }
        );

        /*
         * Scroll only if the user is
         * already close to the bottom.
         */
        if (
          isNearBottomRef.current
        ) {
          shouldAutoScrollRef.current =
            true;
        } else {
          setNewMessagesCount(
            (count) =>
              count + 1
          );
        }
      }
    );

    /* ===================================================== */
    /* MESSAGE SENT */
    /* ===================================================== */

    newSocket.on(
      "message_sent",
      ({
        message,
        clientMessageId,
      }: {
        message: ChatMessage;
        clientMessageId?: string | null;
      }) => {
        if (
          !message ||
          !clientMessageId
        ) {
          return;
        }

        setMessages(
          (previous) => {
            const optimisticId =
              optimisticMessagesRef.current.get(
                clientMessageId
              );

            if (!optimisticId) {
              return previous;
            }

            const index =
              previous.findIndex(
                (item) =>
                  item._id ===
                  optimisticId
              );

            if (index === -1) {
              return previous;
            }

            const updated =
              [...previous];

            updated[index] = {
              ...message,
              status:
                "sent",
              optimistic:
                false,
            };

            return updated;
          }
        );

        optimisticMessagesRef.current.delete(
          clientMessageId
        );
      }
    );

    /* ===================================================== */
    /* MESSAGE EDITED */
    /* ===================================================== */

    newSocket.on(
      "message_edited",
      (
        updatedMessage: ChatMessage
      ) => {
        const currentGroup =
          selectedGroupRef.current;

        if (
          !currentGroup ||
          updatedMessage.group !==
            currentGroup._id
        ) {
          return;
        }

        setMessages(
          (previous) =>
            previous.map(
              (message) =>
                message._id ===
                updatedMessage._id
                  ? {
                      ...updatedMessage,
                      status:
                        "sent",
                      optimistic:
                        false,
                    }
                  : message
            )
        );

        setEditingMessageId(
          (current) =>
            current ===
            updatedMessage._id
              ? null
              : current
        );

      }
    );

    /* ===================================================== */
    /* MESSAGE DELETED */
    /* ===================================================== */

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
          groupId !==
            currentGroup._id
        ) {
          return;
        }

        setMessages(
          (previous) =>
            previous.filter(
              (message) =>
                message._id !==
                messageId
            )
        );

        setMessageMenuId(null);
        setDeleteTargetId(
          (current) =>
            current ===
            messageId
              ? null
              : current
        );
      }
    );

    /* ===================================================== */
    /* DISCONNECT */
    /* ===================================================== */

    newSocket.on(
      "disconnect",
      (reason) => {
        console.log(
          "🔌 Disconnected from Socket.IO:",
          reason
        );
      }
    );

    setSocket(
      newSocket
    );

    /* ===================================================== */
    /* CLEANUP */
    /* ===================================================== */

    return () => {
      socketRef.current =
        null;

      newSocket.disconnect();
    };
  }, [currentUser?.id]);

  /* ======================================================= */
  /* SCROLL HANDLER */
  /* ======================================================= */

  const updateScrollPosition =
    () => {
      const container =
        messagesContainerRef.current;

      if (!container) {
        return;
      }

      const distanceFromBottom =
        container.scrollHeight -
        container.scrollTop -
        container.clientHeight;

      const nearBottom =
        distanceFromBottom <
        120;

      isNearBottomRef.current =
        nearBottom;

      if (nearBottom) {
        setNewMessagesCount(0);
      }
    };

  /* ======================================================= */
  /* SCROLL TO BOTTOM */
  /* ======================================================= */

  const scrollToBottom = (
    behavior:
      | "smooth"
      | "auto" = "smooth"
  ) => {
    messagesEndRef.current?.scrollIntoView(
      {
        behavior,
        block: "end",
      }
    );

    setNewMessagesCount(0);
  };

  /* ======================================================= */
  /* AUTO SCROLL */
  /* ======================================================= */

  useEffect(() => {
    if (
      shouldAutoScrollRef.current
    ) {
      shouldAutoScrollRef.current =
        false;

      requestAnimationFrame(
        () => {
          scrollToBottom(
            "smooth"
          );
        }
      );
    }
  }, [messages]);

  /* ======================================================= */
  /* FETCH MESSAGES */
  /* ======================================================= */

  const fetchMessages =
    async (
      groupId: string
    ) => {
      try {
        setMessagesLoading(
          true
        );

        setError("");

        const response =
          await fetch(
            `${API_URL}/api/collaborations/groups/${groupId}/messages`,
            {
              method: "GET",
              credentials:
                "include",
              headers: {
                Accept:
                  "application/json",
              },
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to fetch messages."
          );
        }

        const loadedMessages =
          Array.isArray(
            data.messages
          )
            ? data.messages
            : [];

        setMessages(
          loadedMessages
        );

        /*
         * Always go to the bottom
         * when opening a conversation.
         */
        shouldAutoScrollRef.current =
          true;

        isNearBottomRef.current =
          true;
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
        setMessagesLoading(
          false
        );
      }
    };

  /* ======================================================= */
  /* OPEN GROUP */
  /* ======================================================= */

  const openGroup =
    async (
      group: CollaborationGroup
    ) => {
      setSelectedGroup(
        group
      );

      selectedGroupRef.current =
        group;

      setShowMembers(
        false
      );

      setMessages([]);

      setMessageText("");

      setError("");

      setMessageMenuId(
        null
      );

      setDeleteTargetId(
        null
      );

      cancelEditing();

      clearSelectedImage();

      setNewMessagesCount(
        0
      );

      await fetchMessages(
        group._id
      );

      const currentSocket =
        socketRef.current;

      if (
        currentSocket?.connected
      ) {
        currentSocket.emit(
          "join_group",
          {
            groupId:
              group._id,
          }
        );
      }
    };

  /* ======================================================= */
  /* CLOSE CHAT */
  /* ======================================================= */

  const closeChat = () => {
    selectedGroupRef.current =
      null;

    setSelectedGroup(
      null
    );

    setMessages([]);

    setMessageText("");

    setShowMembers(
      false
    );

    setError("");

    setMessageMenuId(
      null
    );

    setDeleteTargetId(
      null
    );

    cancelEditing();

    clearSelectedImage();

    setNewMessagesCount(
      0
    );
  };

  /* ======================================================= */
  /* CREATE OPTIMISTIC MESSAGE */
  /* ======================================================= */

  const createOptimisticMessage =
    ({
      clientMessageId,
      type,
      text,
      mediaUrl,
      duration,
    }: {
      clientMessageId: string;
      type: ChatMessageType;
      text?: string;
      mediaUrl?: string;
      duration?: number;
    }): ChatMessage => {
      return {
        _id: `optimistic-${clientMessageId}`,

        group:
          selectedGroupRef
            .current?._id || "",

        sender: {
          _id:
            currentUser?.id ||
            "current-user",

          name:
            currentUser?.name ||
            "You",

          email:
            currentUser?.email,

          profilePhoto:
            currentUser?.profilePhoto,
        },

        type,

        text,

        mediaUrl,

        duration,

        createdAt:
          new Date().toISOString(),

        updatedAt:
          new Date().toISOString(),

        status:
          "sending",

        optimistic:
          true,
      };
    };

  /* ======================================================= */
  /* SEND TEXT / IMAGE */
  /* ======================================================= */

  const handleSendMessage =
    async () => {
      const currentSocket =
        socketRef.current;

      const currentGroup =
        selectedGroupRef.current;

      if (
        !currentSocket?.connected ||
        !currentGroup ||
        uploadingMedia
      ) {
        return;
      }

      /*
       * -----------------------------------------------------
       * IMAGE MESSAGE
       * -----------------------------------------------------
       */

      if (selectedImage) {
        const file =
          selectedImage;

        const localPreview =
          imagePreview;

        const caption =
          messageText.trim();

        const clientMessageId =
          `client-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2)}`;

        /*
         * Show the image immediately
         * in the conversation.
         */
        const optimistic =
          createOptimisticMessage(
            {
              clientMessageId,
              type: "image",
              text:
                caption ||
                undefined,

              mediaUrl:
                localPreview ||
                undefined,
            }
          );

        optimisticMessagesRef.current.set(
          clientMessageId,
          optimistic._id
        );

        setMessages(
          (previous) => [
            ...previous,
            optimistic,
          ]
        );

        setMessageText("");

        /*
         * Clear composer immediately
         * so the UI feels responsive.
         */
        clearSelectedImage();

        shouldAutoScrollRef.current =
          true;

        try {
          setUploadingMedia(
            true
          );

          setError("");

          /*
           * Upload to Cloudinary.
           */
          const upload =
            await uploadToCloudinary(
              file
            );

          /*
           * If user changed groups while
           * upload was happening, stop.
           */
          if (
            selectedGroupRef.current
              ?._id !==
            currentGroup._id
          ) {
            return;
          }

          /*
           * Send the actual Cloudinary
           * URL to Socket.IO.
           */
          currentSocket.emit(
            "send_message",
            {
              groupId:
                currentGroup._id,

              type: "image",

              mediaUrl:
                upload.secure_url,

              text:
                caption ||
                undefined,

              clientMessageId,
            },
            (
              response: {
                success: boolean;
                message?: string;
              }
            ) => {
              if (
                !response?.success
              ) {
                setMessages(
                  (previous) =>
                    previous.filter(
                      (message) =>
                        message._id !==
                        optimistic._id
                    )
                );

                optimisticMessagesRef.current.delete(
                  clientMessageId
                );

                setError(
                  response?.message ||
                    "Failed to send image."
                );
              }
            }
          );
        } catch (error) {
          console.error(
            "Image upload failed:",
            error
          );

          setMessages(
            (previous) =>
              previous.filter(
                (message) =>
                  message._id !==
                  optimistic._id
              )
          );

          optimisticMessagesRef.current.delete(
            clientMessageId
          );

          setError(
            error instanceof Error
              ? error.message
              : "Failed to upload image."
          );
        } finally {
          setUploadingMedia(
            false
          );
        }

        return;
      }

      /*
       * -----------------------------------------------------
       * TEXT MESSAGE
       * -----------------------------------------------------
       */

      const text =
        messageText.trim();

      if (!text) {
        return;
      }

      /*
       * EDIT MODE
       */

      if (editingMessageId) {
        handleSaveEdit();

        return;
      }

      const clientMessageId =
        `client-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}`;

      const optimistic =
        createOptimisticMessage(
          {
            clientMessageId,
            type: "text",
            text,
          }
        );

      optimisticMessagesRef.current.set(
        clientMessageId,
        optimistic._id
      );

      /*
       * Immediately show the message.
       */
      setMessages(
        (previous) => [
          ...previous,
          optimistic,
        ]
      );

      setMessageText("");

      shouldAutoScrollRef.current =
        true;

      /*
       * Send to server.
       */
      currentSocket.emit(
        "send_message",
        {
          groupId:
            currentGroup._id,

          type: "text",

          text,

          clientMessageId,
        },
        (
          response: {
            success: boolean;
            message?: string;
          }
        ) => {
          if (
            !response?.success
          ) {
            setMessages(
              (previous) =>
                previous.filter(
                  (message) =>
                    message._id !==
                    optimistic._id
                )
            );

            optimisticMessagesRef.current.delete(
              clientMessageId
            );

            setError(
              response?.message ||
                "Failed to send message."
            );
          }
        }
      );
    };

  /* ======================================================= */
  /* EDIT MESSAGE */
  /* ======================================================= */

  const startEditing = (
    message: ChatMessage
  ) => {
    if (
      (message.type ||
        "text") !== "text"
    ) {
      return;
    }

    setMessageMenuId(
      null
    );

    setDeleteTargetId(
      null
    );

    setEditingMessageId(
      message._id
    );

    setMessageText(
      message.text || ""
    );

    requestAnimationFrame(
      () => {
        document
          .getElementById(
            "chat-message-input"
          )
          ?.focus();
      }
    );
  };

  /* ======================================================= */
  /* CANCEL EDITING */
  /* ======================================================= */

  const cancelEditing =
    () => {
      setEditingMessageId(
        null
      );

      setMessageText("");
    };

  /* ======================================================= */
  /* SAVE EDIT */
  /* ======================================================= */

  const handleSaveEdit =
    () => {
      const currentSocket =
        socketRef.current;

      if (
        !currentSocket?.connected ||
        !editingMessageId
      ) {
        return;
      }

      const trimmedText =
        messageText.trim();

      if (!trimmedText) {
        return;
      }

      if (
        trimmedText.length >
        2000
      ) {
        setError(
          "Message cannot exceed 2000 characters."
        );

        return;
      }

      currentSocket.emit(
        "edit_message",
        {
          messageId:
            editingMessageId,

          text:
            trimmedText,
        },
        (
          response: {
            success: boolean;
            message?: string;
          }
        ) => {
          if (
            !response?.success
          ) {
            setError(
              response?.message ||
                "Failed to edit message."
            );

            return;
          }

          /*
           * Server will emit
           * message_edited to everyone.
           */
        }
      );
    };

  /* ======================================================= */
  /* DELETE MESSAGE */
  /* ======================================================= */

  const requestDeleteMessage =
    (
      messageId: string
    ) => {
      setMessageMenuId(
        null
      );

      setDeleteTargetId(
        messageId
      );
    };

  const handleConfirmDelete =
    () => {
      const currentSocket =
        socketRef.current;

      if (
        !currentSocket?.connected ||
        !deleteTargetId
      ) {
        return;
      }

      const messageId =
        deleteTargetId;

      setDeleteTargetId(
        null
      );

      /*
       * Optimistically remove it.
       */
      setMessages(
        (previous) =>
          previous.filter(
            (message) =>
              message._id !==
              messageId
          )
      );

      currentSocket.emit(
        "delete_message",
        {
          messageId,
        },
        (
          response: {
            success: boolean;
            message?: string;
          }
        ) => {
          if (
            !response?.success
          ) {
            setError(
              response?.message ||
                "Failed to delete message."
            );

            /*
             * Refresh history if
             * optimistic deletion failed.
             */
            const group =
              selectedGroupRef.current;

            if (group) {
              fetchMessages(
                group._id
              );
            }
          }
        }
      );
    };

  /* ======================================================= */
  /* INPUT KEYBOARD */
  /* ======================================================= */

  const handleInputKeyDown =
    (
      event: KeyboardEvent<HTMLInputElement>
    ) => {
      /*
       * Escape cancels edit mode.
       */
      if (
        event.key === "Escape" &&
        editingMessageId
      ) {
        event.preventDefault();

        cancelEditing();

        return;
      }

      /*
       * Enter sends / saves.
       */
      if (
        event.key === "Enter" &&
        !event.shiftKey
      ) {
        event.preventDefault();

        handleSendMessage();
      }
    };

  /* ======================================================= */
  /* IMAGE CLEAR */
  /* ======================================================= */

  const clearSelectedImage =
    () => {
      setSelectedImage(
        null
      );

      setImagePreview(
        (previous) => {
          if (previous) {
            URL.revokeObjectURL(
              previous
            );
          }

          return null;
        }
      );

      if (
        imageInputRef.current
      ) {
        imageInputRef.current.value =
          "";
      }
    };

  /* ======================================================= */
  /* IMAGE SELECT */
  /* ======================================================= */

  const handleImageSelected =
    (
      event: ChangeEvent<HTMLInputElement>
    ) => {
      const file =
        event.target.files?.[0];

      if (!file) {
        return;
      }

      if (
        !file.type.startsWith(
          "image/"
        )
      ) {
        setError(
          "Please select a valid image file."
        );

        return;
      }

      if (
        file.size >
        10 * 1024 * 1024
      ) {
        setError(
          "Image size must be 10 MB or less."
        );

        return;
      }

      if (editingMessageId) {
        cancelEditing();
      }

      setError("");

      setSelectedImage(
        file
      );

      setImagePreview(
        (previous) => {
          if (previous) {
            URL.revokeObjectURL(
              previous
            );
          }

          return URL.createObjectURL(
            file
          );
        }
      );

      /*
       * Focus caption input.
       */
      requestAnimationFrame(
        () => {
          document
            .getElementById(
              "chat-message-input"
            )
            ?.focus();
        }
      );
    };

  /* ======================================================= */
  /* RECORDING TIMER */
  /* ======================================================= */

  const stopRecordingTimer =
    () => {
      if (
        recordingTimerRef.current
      ) {
        clearInterval(
          recordingTimerRef.current
        );

        recordingTimerRef.current =
          null;
      }
    };

  /* ======================================================= */
  /* UPLOAD VOICE NOTE */
  /* ======================================================= */

  const uploadVoiceNote =
    async (
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

      const localUrl =
        URL.createObjectURL(
          blob
        );

      const clientMessageId =
        `client-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}`;

      const optimistic =
        createOptimisticMessage(
          {
            clientMessageId,
            type: "audio",
            mediaUrl:
              localUrl,
            duration,
          }
        );

      optimisticMessagesRef.current.set(
        clientMessageId,
        optimistic._id
      );

      /*
       * Immediately show voice note.
       */
      setMessages(
        (previous) => [
          ...previous,
          optimistic,
        ]
      );

      shouldAutoScrollRef.current =
        true;

      try {
        setUploadingMedia(
          true
        );

        setError("");

        const extension =
          blob.type.includes(
            "mp4"
          )
            ? "m4a"
            : "webm";

        const audioFile =
          new File(
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
            groupId:
              currentGroup._id,

            type: "audio",

            mediaUrl:
              upload.secure_url,

            duration,

            clientMessageId,
          },
          (
            response: {
              success: boolean;
              message?: string;
            }
          ) => {
            if (
              !response?.success
            ) {
              setMessages(
                (previous) =>
                  previous.filter(
                    (message) =>
                      message._id !==
                      optimistic._id
                  )
              );

              optimisticMessagesRef.current.delete(
                clientMessageId
              );

              setError(
                response?.message ||
                  "Failed to send voice note."
              );
            }
          }
        );
      } catch (error) {
        console.error(
          "Voice note upload failed:",
          error
        );

        setMessages(
          (previous) =>
            previous.filter(
              (message) =>
                message._id !==
                optimistic._id
            )
        );

        optimisticMessagesRef.current.delete(
          clientMessageId
        );

        setError(
          error instanceof Error
            ? error.message
            : "Failed to upload voice note."
        );
      } finally {
        URL.revokeObjectURL(
          localUrl
        );

        setUploadingMedia(
          false
        );
      }
    };

  /* ======================================================= */
  /* START RECORDING */
  /* ======================================================= */

  const startRecording =
    async () => {
      if (
        isRecording ||
        uploadingMedia ||
        !selectedGroup ||
        editingMessageId
      ) {
        return;
      }

      try {
        setError("");

        if (
          !navigator
            .mediaDevices
            ?.getUserMedia
        ) {
          throw new Error(
            "Voice recording is not supported in this browser."
          );
        }

        const stream =
          await navigator.mediaDevices.getUserMedia(
            {
              audio: true,
            }
          );

        const mimeTypes = [
          "audio/webm;codecs=opus",
          "audio/webm",
          "audio/mp4",
        ];

        const supportedMimeType =
          mimeTypes.find(
            (type) =>
              MediaRecorder.isTypeSupported(
                type
              )
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

        audioChunksRef.current =
          [];

        recordingStartRef.current =
          Date.now();

        recorder.ondataavailable =
          (event) => {
            if (
              event.data
                .size > 0
            ) {
              audioChunksRef.current.push(
                event.data
              );
            }
          };

        recorder.onstop =
          async () => {
            stopRecordingTimer();

            stream
              .getTracks()
              .forEach(
                (track) =>
                  track.stop()
              );

            const duration =
              Math.max(
                1,
                Math.round(
                  (Date.now() -
                    (recordingStartRef.current ||
                      Date.now())) /
                    1000
                )
              );

            const blob =
              new Blob(
                audioChunksRef.current,
                {
                  type:
                    recorder.mimeType ||
                    "audio/webm",
                }
              );

            audioChunksRef.current =
              [];

            recordingStartRef.current =
              null;

            setIsRecording(
              false
            );

            setRecordingSeconds(
              0
            );

            if (
              blob.size > 0
            ) {
              await uploadVoiceNote(
                blob,
                duration
              );
            }
          };

        mediaRecorderRef.current =
          recorder;

        recorder.start();

        setIsRecording(
          true
        );

        setRecordingSeconds(
          0
        );

        recordingTimerRef.current =
          setInterval(
            () => {
              setRecordingSeconds(
                Math.floor(
                  (Date.now() -
                    (recordingStartRef.current ||
                      Date.now())) /
                    1000
                )
              );
            },
            1000
          );
      } catch (error) {
        console.error(
          "Unable to start recording:",
          error
        );

        setIsRecording(
          false
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to access your microphone."
        );
      }
    };

  /* ======================================================= */
  /* STOP RECORDING */
  /* ======================================================= */

  const stopRecording =
    () => {
      const recorder =
        mediaRecorderRef.current;

      if (
        !recorder ||
        recorder.state ===
          "inactive"
      ) {
        return;
      }

      recorder.stop();

      mediaRecorderRef.current =
        null;
    };

  /* ======================================================= */
  /* LONG PRESS */
  /* ======================================================= */

  const startLongPress =
    (
      message: ChatMessage
    ) => {
      if (
        message.sender?._id !==
        currentUser?.id
      ) {
        return;
      }

      clearLongPress();

      longPressTimerRef.current =
        setTimeout(() => {
          setMessageMenuId(
            message._id
          );

          if (
            typeof navigator !==
              "undefined" &&
            navigator.vibrate
          ) {
            navigator.vibrate(
              20
            );
          }
        }, 500);
    };

  const clearLongPress =
    () => {
      if (
        longPressTimerRef.current
      ) {
        clearTimeout(
          longPressTimerRef.current
        );

        longPressTimerRef.current =
          null;
      }
    };

  /* ======================================================= */
  /* CONTEXT MENU */
  /* ======================================================= */

  const handleMessageContextMenu =
    (
      event: React.MouseEvent,
      message: ChatMessage
    ) => {
      if (
        message.sender?._id !==
        currentUser?.id
      ) {
        return;
      }

      event.preventDefault();

      clearLongPress();

      setMessageMenuId(
        message._id
      );
    };

  /* ======================================================= */
  /* CLOSE MENU WHEN CLICKING OUTSIDE */
  /* ======================================================= */

  useEffect(() => {
    const handleDocumentClick =
      () => {
        setMessageMenuId(
          null
        );
      };

    if (
      messageMenuId
    ) {
      document.addEventListener(
        "click",
        handleDocumentClick
      );
    }

    return () => {
      document.removeEventListener(
        "click",
        handleDocumentClick
      );
    };
  }, [messageMenuId]);

  /* ======================================================= */
  /* AVATAR */
  /* ======================================================= */

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
            name ||
            "User"
          }
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
          .toUpperCase() ||
          "U"}
      </div>
    );
  };

  /* ======================================================= */
  /* FORMAT DURATION */
  /* ======================================================= */

  const formatDuration =
    (
      seconds = 0
    ) => {
      const safeSeconds =
        Math.max(
          0,
          Math.round(
            seconds
          )
        );

      const minutes =
        Math.floor(
          safeSeconds /
            60
        );

      const remaining =
        safeSeconds % 60;

      return `${minutes}:${remaining
        .toString()
        .padStart(2, "0")}`;
    };

  /* ======================================================= */
  /* FORMAT TIME */
  /* ======================================================= */

  const formatMessageTime =
    (
      createdAt: string
    ) =>
      new Date(
        createdAt
      ).toLocaleTimeString(
        [],
        {
          hour: "2-digit",
          minute:
            "2-digit",
        }
      );

  /* ======================================================= */
  /* EDITED CHECK */
  /* ======================================================= */

  const isMessageEdited =
    (
      message: ChatMessage
    ) => {
      if (
        !message.updatedAt ||
        !message.createdAt
      ) {
        return false;
      }

      return (
        new Date(
          message.updatedAt
        ).getTime() >
        new Date(
          message.createdAt
        ).getTime() +
          1000
      );
    };

  /* ======================================================= */
  /* CLEANUP */
  /* ======================================================= */

  useEffect(() => {
    return () => {
      clearLongPress();

      stopRecordingTimer();

      if (
        imagePreview
      ) {
        URL.revokeObjectURL(
          imagePreview
        );
      }

      const recorder =
        mediaRecorderRef.current;

      if (
        recorder &&
        recorder.state !==
          "inactive"
      ) {
        recorder.stop();
      }
    };
  }, []);

  /* ======================================================= */
  /* CONVERSATION LIST */
  /* ======================================================= */

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

            {groups.length >
              0 && (
              <div className="hidden rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-500 shadow-sm sm:block">
                {groups.length}{" "}
                {groups.length ===
                1
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

          {!loading &&
            error && (
              <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center">
                <p className="text-sm font-medium text-red-600">
                  {error}
                </p>
              </div>
            )}

          {!loading &&
            !error &&
            groups.length ===
              0 && (
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
            groups.length >
              0 && (
              <div className="grid gap-3 md:grid-cols-2">
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
                      className="group flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md active:scale-[0.99] md:p-5"
                    >
                      <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-600">
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

                      <div className="min-w-0 flex-1">
                        <h2 className="truncate text-[15px] font-bold text-slate-800">
                          {group.name ||
                            group
                              .project
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

                        <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-blue-500">
                          Open conversation
                        </p>
                      </div>

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

  /* ======================================================= */
  /* CHAT SCREEN */
  /* ======================================================= */

  return (
    <div className="h-[100dvh] overflow-hidden bg-[#f5f8fc] p-0 md:p-5">
      <div className="relative mx-auto flex h-full max-w-7xl overflow-hidden bg-white shadow-sm md:h-[calc(100dvh-40px)] md:rounded-3xl md:border md:border-slate-200">

        {/* ================================================= */}
        {/* CHAT AREA */}
        {/* ================================================= */}

        <div className="flex min-w-0 flex-1 flex-col">

          {/* ================================================= */}
          {/* HEADER */}
          {/* ================================================= */}

          <div className="flex min-h-[68px] shrink-0 items-center border-b border-slate-200 bg-white px-3 sm:px-4 md:px-6">

            <button
              type="button"
              onClick={
                closeChat
              }
              className="mr-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 active:scale-95"
              aria-label="Back to conversations"
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
                    (
                      previous
                    ) =>
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
                  .length ===
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
                  (
                    previous
                  ) =>
                    !previous
                )
              }
              className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 active:scale-95"
              aria-label="Show members"
            >
              <Users
                size={20}
              />
            </button>

            <button
              type="button"
              className="ml-1 hidden h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 sm:flex"
              aria-label="More options"
            >
              <MoreVertical
                size={20}
              />
            </button>
          </div>

          {/* ================================================= */}
          {/* ERROR */}
          {/* ================================================= */}

          {error && (
            <div className="z-20 flex shrink-0 items-center justify-between border-b border-red-100 bg-red-50 px-4 py-2">
              <p className="min-w-0 truncate text-xs font-medium text-red-600">
                {error}
              </p>

              <button
                type="button"
                onClick={() =>
                  setError("")
                }
                className="ml-3 shrink-0 rounded-full p-1 text-red-400 hover:bg-red-100 hover:text-red-600"
              >
                <X
                  size={14}
                />
              </button>
            </div>
          )}

          {/* ================================================= */}
          {/* MESSAGE AREA */}
          {/* ================================================= */}

          <div
            ref={
              messagesContainerRef
            }
            onScroll={
              updateScrollPosition
            }
            className="relative flex-1 overflow-y-auto bg-[#f4f7fb] px-3 py-5 sm:px-5 md:px-8"
          >

            <div className="pointer-events-none absolute inset-0 opacity-40">
              <div className="absolute left-10 top-10 h-24 w-24 rounded-full bg-blue-100 blur-3xl" />

              <div className="absolute bottom-20 right-10 h-32 w-32 rounded-full bg-indigo-100 blur-3xl" />
            </div>

            {/* NEW MESSAGE BUTTON */}

            {newMessagesCount >
              0 && (
              <button
                type="button"
                onClick={() =>
                  scrollToBottom(
                    "smooth"
                  )
                }
                className="sticky top-2 z-30 mx-auto flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-lg transition hover:bg-blue-700 active:scale-95"
              >
                <span>
                  ↓
                </span>

                {newMessagesCount}{" "}
                {newMessagesCount ===
                1
                  ? "new message"
                  : "new messages"}
              </button>
            )}

            <div className="relative z-10 mx-auto max-w-4xl">

              {!messagesLoading &&
                messages.length >
                  0 && (
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
                        share ideas, send images
                        and use voice notes to
                        build together.
                      </p>
                    </div>
                  </div>
                )}

              {/* ================================================= */}
              {/* MESSAGE LIST */}
              {/* ================================================= */}

              <div className="space-y-3">

                {messages.map(
                  (message) => {
                    const isMine =
                      currentUser?.id ===
                      message.sender?._id;

                    const messageType =
                      message.type ||
                      "text";

                    const isMenuOpen =
                      messageMenuId ===
                      message._id;

                    return (
                      <div
                        key={
                          message._id
                        }
                        className={`flex animate-[messageIn_180ms_ease-out] ${
                          isMine
                            ? "justify-end"
                            : "justify-start"
                        }`}
                        style={{
                          animation:
                            "messageIn 180ms ease-out",
                        }}
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

                          <div className="relative min-w-0">

                            {/* ================================================= */}
                            {/* ACTION MENU */}
                            {/* ================================================= */}

                            {isMenuOpen &&
                              isMine && (
                                <div
                                  onClick={(
                                    event
                                  ) =>
                                    event.stopPropagation()
                                  }
                                  className={`absolute bottom-full z-50 mb-2 w-36 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl ${
                                    isMine
                                      ? "right-0"
                                      : "left-0"
                                  }`}
                                >

                                  {messageType ===
                                    "text" && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        startEditing(
                                          message
                                        )
                                      }
                                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-blue-600"
                                    >
                                      <Edit3
                                        size={
                                          15
                                        }
                                      />

                                      Edit
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() =>
                                      requestDeleteMessage(
                                        message._id
                                      )
                                    }
                                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-red-600 transition hover:bg-red-50"
                                  >
                                    <Trash2
                                      size={
                                        15
                                      }
                                    />

                                    Delete
                                  </button>
                                </div>
                              )}

                            {/* ================================================= */}
                            {/* MESSAGE BUBBLE */}
                            {/* ================================================= */}

                            <div
                              onTouchStart={() =>
                                startLongPress(
                                  message
                                )
                              }
                              onTouchEnd={
                                clearLongPress
                              }
                              onTouchMove={
                                clearLongPress
                              }
                              onMouseDown={() =>
                                startLongPress(
                                  message
                                )
                              }
                              onMouseUp={
                                clearLongPress
                              }
                              onMouseLeave={
                                clearLongPress
                              }
                              onContextMenu={(
                                event
                              ) =>
                                handleMessageContextMenu(
                                  event,
                                  message
                                )
                              }
                              className={`group relative min-w-0 rounded-2xl shadow-sm transition duration-150 ${
                                isMine
                                  ? "rounded-br-md bg-blue-600 text-white"
                                  : "rounded-bl-md border border-slate-200 bg-white text-slate-800"
                              } ${
                                messageType ===
                                "image"
                                  ? "p-1.5"
                                  : "px-4 py-2.5"
                              } ${
                                message.optimistic
                                  ? "opacity-80"
                                  : ""
                              }`}
                            >

                              {/* ================================================= */}
                              {/* SENDER NAME */}
                              {/* ================================================= */}

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
                                    : message
                                        .sender
                                        ?.name ||
                                      "Unknown user"}
                                </p>
                              )}

                              {/* ================================================= */}
                              {/* TEXT */}
                              {/* ================================================= */}

                              {messageType ===
                                "text" && (
                                <p className="whitespace-pre-wrap break-words text-[14px] leading-6">
                                  {
                                    message.text
                                  }
                                </p>
                              )}

                              {/* ================================================= */}
                              {/* IMAGE */}
                              {/* ================================================= */}

                              {messageType ===
                                "image" &&
                                message.mediaUrl && (
                                  <a
                                    href={
                                      message.optimistic
                                        ? undefined
                                        : message.mediaUrl
                                    }
                                    target={
                                      message.optimistic
                                        ? undefined
                                        : "_blank"
                                    }
                                    rel="noreferrer"
                                    onClick={(
                                      event
                                    ) => {
                                      if (
                                        message.optimistic
                                      ) {
                                        event.preventDefault();
                                      }
                                    }}
                                    className="relative block overflow-hidden rounded-xl"
                                  >
                                    <img
                                      src={
                                        message.mediaUrl
                                      }
                                      alt="Shared image"
                                      loading="lazy"
                                      className="max-h-[360px] w-auto max-w-full rounded-xl object-contain transition duration-200 hover:opacity-95"
                                    />

                                    {message.optimistic && (
                                      <div className="absolute inset-0 flex items-center justify-center bg-slate-900/25 backdrop-blur-[1px]">
                                        <div className="flex items-center gap-2 rounded-full bg-white/95 px-3 py-2 text-xs font-semibold text-slate-700 shadow-lg">
                                          <Loader2
                                            size={
                                              14
                                            }
                                            className="animate-spin text-blue-600"
                                          />

                                          Sending...
                                        </div>
                                      </div>
                                    )}
                                  </a>
                                )}

                              {/* ================================================= */}
                              {/* IMAGE CAPTION */}
                              {/* ================================================= */}

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
                                    {
                                      message.text
                                    }
                                  </p>
                                )}

                              {/* ================================================= */}
                              {/* AUDIO */}
                              {/* ================================================= */}

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
                                        size={
                                          17
                                        }
                                      />
                                    </div>

                                    <audio
                                      controls
                                      preload="metadata"
                                      src={
                                        message.mediaUrl
                                      }
                                      className="h-9 min-w-0 flex-1"
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

                                    {message.optimistic && (
                                      <Loader2
                                        size={
                                          13
                                        }
                                        className="shrink-0 animate-spin text-white/80"
                                      />
                                    )}
                                  </div>
                                )}

                              {/* ================================================= */}
                              {/* FOOTER */}
                              {/* ================================================= */}

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
                                {isMessageEdited(
                                  message
                                ) && (
                                  <span className="italic opacity-80">
                                    edited
                                  </span>
                                )}

                                <span>
                                  {formatMessageTime(
                                    message.createdAt
                                  )}
                                </span>

                                {isMine && (
                                  <>
                                    {message.status ===
                                    "sending" ? (
                                      <Loader2
                                        size={
                                          12
                                        }
                                        className="animate-spin"
                                      />
                                    ) : message.status ===
                                      "failed" ? (
                                      <span className="font-semibold text-red-200">
                                        Failed
                                      </span>
                                    ) : (
                                      <CheckCheck
                                        size={
                                          13
                                        }
                                      />
                                    )}
                                  </>
                                )}
                              </div>

                              {/* ================================================= */}
                              {/* DESKTOP HINT */}
                              {/* ================================================= */}

                              {isMine &&
                                !message.optimistic && (
                                  <div className="pointer-events-none absolute -top-6 right-0 hidden rounded-full bg-slate-800 px-2 py-1 text-[9px] font-medium text-white opacity-0 transition group-hover:opacity-100 sm:block">
                                    Long press / right click
                                  </div>
                                )}
                            </div>
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
                className="h-2"
              />
            </div>
          </div>

          {/* ================================================= */}
          {/* COMPOSER */}
          {/* ================================================= */}

          <div className="shrink-0 border-t border-slate-200 bg-white p-2.5 sm:p-3 md:p-4">

            <div className="mx-auto max-w-5xl">

              {/* ================================================= */}
              {/* EDITING BAR */}
              {/* ================================================= */}

              {editingMessageId && (
                <div className="mb-2 flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-3 py-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <Edit3
                      size={15}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-blue-700">
                      Editing message
                    </p>

                    <p className="truncate text-[10px] text-blue-500">
                      Make your changes and press Enter
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={
                      cancelEditing
                    }
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-blue-500 transition hover:bg-blue-100"
                    aria-label="Cancel editing"
                  >
                    <X
                      size={15}
                    />
                  </button>
                </div>
              )}

              {/* ================================================= */}
              {/* COMPOSER */}
              {/* ================================================= */}

              <div
                className={`rounded-2xl border bg-slate-50 p-1.5 transition ${
                  editingMessageId
                    ? "border-blue-300 bg-white ring-4 ring-blue-50"
                    : "border-slate-200 focus-within:border-blue-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50"
                }`}
              >

                <input
                  ref={
                    imageInputRef
                  }
                  type="file"
                  accept="image/*"
                  onChange={
                    handleImageSelected
                  }
                  className="hidden"
                />

                {/* ================================================= */}
                {/* IMAGE PREVIEW INSIDE WHITE COMPOSER */}
                {/* ================================================= */}

                {selectedImage &&
                  imagePreview &&
                  !editingMessageId && (
                    <div className="mb-1.5 flex items-center gap-2 rounded-xl bg-white p-2 shadow-sm">

                      <div className="relative shrink-0">
                        <img
                          src={
                            imagePreview
                          }
                          alt="Selected image"
                          className="h-16 w-16 rounded-xl object-cover"
                        />

                        <button
                          type="button"
                          onClick={
                            clearSelectedImage
                          }
                          disabled={
                            uploadingMedia
                          }
                          className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-md transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                          aria-label="Remove selected image"
                        >
                          <X
                            size={
                              13
                            }
                          />
                        </button>
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-slate-700">
                          {
                            selectedImage.name
                          }
                        </p>

                        <p className="mt-0.5 text-[10px] text-slate-400">
                          Add a caption below or send the image
                        </p>
                      </div>
                    </div>
                  )}

                {/* ================================================= */}
                {/* RECORDING */}
                {/* ================================================= */}

                {isRecording ? (
                  <div className="flex min-h-[52px] items-center gap-3 px-2">

                    <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                      <span className="absolute h-9 w-9 animate-ping rounded-full bg-red-200 opacity-50" />

                      <Mic
                        size={17}
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
                      onClick={
                        stopRecording
                      }
                      className="flex h-10 shrink-0 items-center gap-1.5 rounded-xl bg-red-500 px-3 text-xs font-semibold text-white shadow-sm transition hover:bg-red-600 active:scale-95"
                    >
                      <Square
                        size={
                          13
                        }
                        fill="currentColor"
                      />

                      Stop
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">

                    {/* IMAGE BUTTON */}

                    <button
                      type="button"
                      onClick={() =>
                        imageInputRef.current?.click()
                      }
                      disabled={
                        uploadingMedia ||
                        isRecording ||
                        !!editingMessageId
                      }
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-blue-50 hover:text-blue-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
                      aria-label="Attach image"
                      title="Send image"
                    >
                      <ImagePlus
                        size={19}
                      />
                    </button>

                    {/* MESSAGE INPUT */}

                    <input
                      id="chat-message-input"
                      type="text"
                      value={
                        messageText
                      }
                      onChange={(
                        event
                      ) =>
                        setMessageText(
                          event
                            .target
                            .value
                        )
                      }
                      onKeyDown={
                        handleInputKeyDown
                      }
                      placeholder={
                        editingMessageId
                          ? "Edit your message..."
                          : selectedImage
                            ? "Add a caption (optional)..."
                            : "Write a message..."
                      }
                      maxLength={
                        2000
                      }
                      disabled={
                        uploadingMedia
                      }
                      className="min-w-0 flex-1 bg-transparent px-2 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 disabled:opacity-50 sm:px-3"
                    />

                    {/* VOICE BUTTON */}

                    {!editingMessageId && (
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
                        <Mic
                          size={
                            19
                          }
                        />
                      </button>
                    )}

                    {/* SEND / SAVE */}

                    <button
                      type="button"
                      onClick={
                        handleSendMessage
                      }
                      disabled={
                        uploadingMedia ||
                        (!messageText.trim() &&
                          !selectedImage) ||
                        !socket?.connected
                      }
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${
                        editingMessageId
                          ? "bg-emerald-600 hover:bg-emerald-700"
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
                      aria-label={
                        editingMessageId
                          ? "Save edited message"
                          : "Send message"
                      }
                    >
                      {uploadingMedia ? (
                        <Loader2
                          size={
                            17
                          }
                          className="animate-spin"
                        />
                      ) : editingMessageId ? (
                        <Check
                          size={
                            18
                          }
                        />
                      ) : (
                        <Send
                          size={
                            17
                          }
                        />
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* ================================================= */}
              {/* COMPOSER HELP */}
              {/* ================================================= */}

              <div className="mt-1.5 hidden items-center justify-between px-2 sm:flex">

                <p className="text-[10px] text-slate-400">
                  {editingMessageId
                    ? "Enter to save • Esc to cancel"
                    : "Enter to send • Long press a message for actions"}
                </p>

                <p className="flex items-center gap-1 text-[10px] text-slate-400">
                  <Paperclip
                    size={11}
                  />

                  Images & voice notes supported
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================== */}
        {/* MEMBERS SIDEBAR */}
        {/* =================================================== */}

        {showMembers && (
          <>
            <button
              type="button"
              aria-label="Close members"
              onClick={() =>
                setShowMembers(
                  false
                )
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
                    {
                      selectedGroup
                        .members
                        .length
                    }{" "}
                    {selectedGroup
                      .members
                      .length ===
                    1
                      ? "member"
                      : "members"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowMembers(
                      false
                    )
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100"
                  aria-label="Close members"
                >
                  <X
                    size={18}
                  />
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
          </>
        )}

        {/* =================================================== */}
        {/* DELETE CONFIRMATION */}
        {/* =================================================== */}

        {deleteTargetId && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center bg-slate-900/30 px-4 backdrop-blur-[2px]">

            <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">

              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                <Trash2
                  size={22}
                />
              </div>

              <h2 className="text-center text-base font-bold text-slate-800">
                Delete message?
              </h2>

              <p className="mt-2 text-center text-sm leading-6 text-slate-500">
                This message will be
                removed for everyone in
                this collaboration chat.
              </p>

              <div className="mt-6 flex gap-2">

                <button
                  type="button"
                  onClick={() =>
                    setDeleteTargetId(
                      null
                    )
                  }
                  className="flex h-11 flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={
                    handleConfirmDelete
                  }
                  className="flex h-11 flex-1 items-center justify-center rounded-xl bg-red-500 text-sm font-semibold text-white shadow-sm transition hover:bg-red-600 active:scale-[0.98]"
                >
                  Delete
                </button>

              </div>
            </div>
          </div>
        )}
      </div>

      {/* ===================================================== */}
      {/* MESSAGE ANIMATION */}
      {/* ===================================================== */}

      <style>
        {`
          @keyframes messageIn {
            from {
              opacity: 0;
              transform: translateY(5px);
            }

            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
};

export default MessagesPage;