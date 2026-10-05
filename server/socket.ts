import jwt from "jsonwebtoken";
import { Server, Socket } from "socket.io";
import Message from "./models/Message.js";
import CollaborationGroup from "./models/CollaborationGroup.js";

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

interface JoinGroupPayload {
  groupId: string;
}

interface SendMessagePayload {
  groupId: string;
  text: string;
}

interface DeleteMessagePayload {
  messageId: string;
}

const getTokenFromCookie = (
  cookieHeader?: string
): string | null => {
  if (!cookieHeader) {
    return null;
  }

  const tokenCookie = cookieHeader
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith("token="));

  if (!tokenCookie) {
    return null;
  }

  return tokenCookie.substring("token=".length);
};

const setupSocket = (io: Server) => {
  /*
   * ==========================================
   * SOCKET AUTHENTICATION
   * ==========================================
   */

  io.use((socket: AuthenticatedSocket, next) => {
    try {
      const cookieHeader =
        socket.handshake.headers.cookie;

      const token = getTokenFromCookie(cookieHeader);

      if (!token) {
        return next(
          new Error("Authentication required.")
        );
      }

      const secret = process.env.JWT_SECRET;

      if (!secret) {
        return next(
          new Error("JWT secret is not configured.")
        );
      }

      const decoded = jwt.verify(token, secret) as {
        userId: string;
      };

      socket.userId = decoded.userId;

      next();
    } catch (error) {
      console.error(
        "Socket authentication error:",
        error
      );

      next(
        new Error("Invalid or expired session.")
      );
    }
  });

  /*
   * ==========================================
   * CONNECTION
   * ==========================================
   */

  io.on(
    "connection",
    (socket: AuthenticatedSocket) => {
      console.log(
        `🔌 User connected to Socket.IO: ${socket.userId}`
      );

      /*
       * ========================================
       * JOIN COLLABORATION GROUP
       * ========================================
       */

      socket.on(
        "join_group",
        async ({
          groupId,
        }: JoinGroupPayload) => {
          try {
            const userId = socket.userId;

            if (!userId) {
              socket.emit("socket_error", {
                message:
                  "Authentication required.",
              });
              return;
            }

            if (!groupId) {
              socket.emit("socket_error", {
                message:
                  "Collaboration group ID is required.",
              });
              return;
            }

            const group =
              await CollaborationGroup.findOne({
                _id: groupId,
                members: userId,
              });

            if (!group) {
              socket.emit("socket_error", {
                message:
                  "You are not a member of this collaboration group.",
              });
              return;
            }

            socket.join(groupId);

            console.log(
              `👥 User ${userId} joined group ${groupId}`
            );

            socket.emit("group_joined", {
              groupId,
            });
          } catch (error) {
            console.error(
              "Join group socket error:",
              error
            );

            socket.emit("socket_error", {
              message:
                "Failed to join collaboration group.",
            });
          }
        }
      );

      /*
       * ========================================
       * SEND MESSAGE
       * ========================================
       */

      socket.on(
        "send_message",
        async ({
          groupId,
          text,
        }: SendMessagePayload) => {
          try {
            const userId = socket.userId;

            if (!userId) {
              socket.emit("socket_error", {
                message:
                  "Authentication required.",
              });
              return;
            }

            const trimmedText = text?.trim();

            if (!trimmedText) {
              return;
            }

            if (trimmedText.length > 2000) {
              socket.emit("socket_error", {
                message:
                  "Message cannot exceed 2000 characters.",
              });
              return;
            }

            /*
             * Verify group membership.
             */

            const group =
              await CollaborationGroup.findOne({
                _id: groupId,
                members: userId,
              });

            if (!group) {
              socket.emit("socket_error", {
                message:
                  "You are not a member of this collaboration group.",
              });
              return;
            }

            /*
             * Save message.
             */

            const newMessage =
              await Message.create({
                group: groupId,
                sender: userId,
                text: trimmedText,
              });

            /*
             * Populate sender information.
             */

            const populatedMessage =
              await Message.findById(
                newMessage._id
              ).populate(
                "sender",
                "name email profilePhoto"
              );

            /*
             * Send to everyone in group.
             */

            io.to(groupId).emit(
              "new_message",
              populatedMessage
            );
          } catch (error) {
            console.error(
              "Send message socket error:",
              error
            );

            socket.emit("socket_error", {
              message:
                "Failed to send message.",
            });
          }
        }
      );

      /*
       * ========================================
       * DELETE MESSAGE
       * ========================================
       */

      socket.on(
        "delete_message",
        async ({
          messageId,
        }: DeleteMessagePayload) => {
          try {
            const userId = socket.userId;

            if (!userId) {
              socket.emit("socket_error", {
                message:
                  "Authentication required.",
              });
              return;
            }

            if (!messageId) {
              socket.emit("socket_error", {
                message:
                  "Message ID is required.",
              });
              return;
            }

            /*
             * Find message.
             */

            const message =
              await Message.findById(messageId);

            if (!message) {
              socket.emit("socket_error", {
                message:
                  "Message not found.",
              });
              return;
            }

            /*
             * Only the sender can delete
             * their own message.
             */

            if (
              message.sender.toString() !==
              userId
            ) {
              socket.emit("socket_error", {
                message:
                  "You can only delete your own messages.",
              });
              return;
            }

            const groupId =
              message.group.toString();

            /*
             * Verify group membership.
             */

            const group =
              await CollaborationGroup.findOne({
                _id: groupId,
                members: userId,
              });

            if (!group) {
              socket.emit("socket_error", {
                message:
                  "You are not a member of this collaboration group.",
              });
              return;
            }

            /*
             * Delete message.
             */

            await Message.findByIdAndDelete(
              messageId
            );

            /*
             * Tell everyone in the group
             * to remove the message.
             */

            io.to(groupId).emit(
              "message_deleted",
              {
                messageId,
                groupId,
              }
            );
          } catch (error) {
            console.error(
              "Delete message socket error:",
              error
            );

            socket.emit("socket_error", {
              message:
                "Failed to delete message.",
            });
          }
        }
      );

      /*
       * ========================================
       * DISCONNECT
       * ========================================
       */

      socket.on(
        "disconnect",
        (reason) => {
          console.log(
            `🔌 User disconnected: ${socket.userId}`,
            reason
          );
        }
      );
    }
  );
};

export default setupSocket;