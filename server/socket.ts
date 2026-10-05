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

  io.on("connection", (socket: AuthenticatedSocket) => {
    console.log(
      `🔌 User connected to Socket.IO: ${socket.userId}`
    );

    /*
     * ==============================
     * JOIN COLLABORATION GROUP
     * ==============================
     */

    socket.on(
      "join_group",
      async ({ groupId }: JoinGroupPayload) => {
        try {
          const userId = socket.userId;

          if (!userId) {
            socket.emit("socket_error", {
              message: "Authentication required.",
            });
            return;
          }

          if (!groupId) {
            socket.emit("socket_error", {
              message: "Collaboration group ID is required.",
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
            message: "Failed to join collaboration group.",
          });
        }
      }
    );

    /*
     * ==============================
     * SEND MESSAGE
     * ==============================
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
              message: "Authentication required.",
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
           * Make sure the user actually belongs
           * to this collaboration group.
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
           * Save message to MongoDB.
           */

          const newMessage = await Message.create({
            group: groupId,
            sender: userId,
            text: trimmedText,
          });

          /*
           * Get sender information so the frontend
           * can immediately display their name/photo.
           */

          const populatedMessage =
            await Message.findById(newMessage._id)
              .populate(
                "sender",
                "name email profilePhoto"
              );

          /*
           * Send the new message to EVERYONE
           * currently inside this group room.
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
            message: "Failed to send message.",
          });
        }
      }
    );

    /*
     * ==============================
     * DISCONNECT
     * ==============================
     */

    socket.on("disconnect", (reason) => {
      console.log(
        `🔌 User disconnected: ${socket.userId}`,
        reason
      );
    });
  });
};

export default setupSocket;