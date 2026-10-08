import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { Server, Socket } from "socket.io";

import Message, {
  MessageType,
} from "./models/Message.js";

import CollaborationGroup from "./models/CollaborationGroup.js";

/*
 * ============================================================
 * AUTHENTICATED SOCKET
 * ============================================================
 */

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

/*
 * ============================================================
 * SOCKET PAYLOADS
 * ============================================================
 */

interface JoinGroupPayload {
  groupId: string;
}

interface SendMessagePayload {
  groupId: string;
  type?: MessageType;
  text?: string;
  mediaUrl?: string;
  duration?: number;

  /*
   * Temporary client-side ID.
   *
   * This is NOT stored in MongoDB.
   * It allows the frontend to match an optimistic
   * message with the real server message later.
   */
  clientMessageId?: string;
}

interface DeleteMessagePayload {
  messageId: string;
}

interface EditMessagePayload {
  messageId: string;
  text: string;
}

/*
 * ============================================================
 * SOCKET ACKNOWLEDGEMENTS
 * ============================================================
 */

interface SocketAck {
  success: boolean;
  message?: string;
  data?: unknown;
}

type SocketAckCallback = (
  response: SocketAck
) => void;

/*
 * ============================================================
 * COOKIE TOKEN HELPER
 * ============================================================
 */

const getTokenFromCookie = (
  cookieHeader?: string
): string | null => {
  if (!cookieHeader) {
    return null;
  }

  const tokenCookie = cookieHeader
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) =>
      cookie.startsWith("token=")
    );

  if (!tokenCookie) {
    return null;
  }

  return tokenCookie.substring(
    "token=".length
  );
};

/*
 * ============================================================
 * SOCKET SETUP
 * ============================================================
 */

const setupSocket = (io: Server) => {
  /*
   * ==========================================================
   * SOCKET AUTHENTICATION
   * ==========================================================
   */

  io.use(
    (
      socket: AuthenticatedSocket,
      next
    ) => {
      try {
        const cookieHeader =
          socket.handshake.headers.cookie;

        const token =
          getTokenFromCookie(cookieHeader);

        if (!token) {
          return next(
            new Error(
              "Authentication required."
            )
          );
        }

        const secret =
          process.env.JWT_SECRET;

        if (!secret) {
          return next(
            new Error(
              "JWT secret is not configured."
            )
          );
        }

        const decoded = jwt.verify(
          token,
          secret
        ) as {
          userId: string;
        };

        socket.userId =
          decoded.userId;

        next();
      } catch (error) {
        console.error(
          "Socket authentication error:",
          error
        );

        next(
          new Error(
            "Invalid or expired session."
          )
        );
      }
    }
  );

  /*
   * ==========================================================
   * CONNECTION
   * ==========================================================
   */

  io.on(
    "connection",
    (
      socket: AuthenticatedSocket
    ) => {
      console.log(
        `🔌 User connected to Socket.IO: ${socket.userId}`
      );

      /*
       * ========================================================
       * JOIN COLLABORATION GROUP
       * ========================================================
       */

      socket.on(
        "join_group",
        async (
          payload: JoinGroupPayload,
          ack?: SocketAckCallback
        ) => {
          try {
            const userId =
              socket.userId;

            const groupId =
              payload?.groupId;

            if (!userId) {
              const response = {
                success: false,
                message:
                  "Authentication required.",
              };

              socket.emit(
                "socket_error",
                response
              );

              ack?.(response);

              return;
            }

            if (!groupId) {
              const response = {
                success: false,
                message:
                  "Collaboration group ID is required.",
              };

              socket.emit(
                "socket_error",
                response
              );

              ack?.(response);

              return;
            }

            if (
              !mongoose.Types.ObjectId.isValid(
                groupId
              )
            ) {
              const response = {
                success: false,
                message:
                  "Invalid collaboration group ID.",
              };

              socket.emit(
                "socket_error",
                response
              );

              ack?.(response);

              return;
            }

            const group =
              await CollaborationGroup.findOne(
                {
                  _id: groupId,
                  members: userId,
                }
              );

            if (!group) {
              const response = {
                success: false,
                message:
                  "You are not a member of this collaboration group.",
              };

              socket.emit(
                "socket_error",
                response
              );

              ack?.(response);

              return;
            }

            socket.join(groupId);

            console.log(
              `👥 User ${userId} joined group ${groupId}`
            );

            socket.emit(
              "group_joined",
              {
                groupId,
              }
            );

            ack?.({
              success: true,
              data: {
                groupId,
              },
            });
          } catch (error) {
            console.error(
              "Join group socket error:",
              error
            );

            const response = {
              success: false,
              message:
                "Failed to join collaboration group.",
            };

            socket.emit(
              "socket_error",
              response
            );

            ack?.(response);
          }
        }
      );

      /*
       * ========================================================
       * SEND MESSAGE
       * ========================================================
       *
       * Supports:
       *
       * text
       * image
       * audio
       *
       * Also supports an optional acknowledgement so the
       * frontend can implement optimistic messaging.
       * ========================================================
       */

      socket.on(
        "send_message",
        async (
          payload: SendMessagePayload,
          ack?: SocketAckCallback
        ) => {
          try {
            const userId =
              socket.userId;

            if (!userId) {
              const response = {
                success: false,
                message:
                  "Authentication required.",
              };

              socket.emit(
                "socket_error",
                response
              );

              ack?.(response);

              return;
            }

            const {
              groupId,
              type = "text",
              text,
              mediaUrl,
              duration,
              clientMessageId,
            } = payload || {};

            /*
             * --------------------------------------------------
             * GROUP ID VALIDATION
             * --------------------------------------------------
             */

            if (!groupId) {
              const response = {
                success: false,
                message:
                  "Collaboration group ID is required.",
              };

              socket.emit(
                "socket_error",
                response
              );

              ack?.(response);

              return;
            }

            if (
              !mongoose.Types.ObjectId.isValid(
                groupId
              )
            ) {
              const response = {
                success: false,
                message:
                  "Invalid collaboration group ID.",
              };

              socket.emit(
                "socket_error",
                response
              );

              ack?.(response);

              return;
            }

            /*
             * --------------------------------------------------
             * MESSAGE TYPE VALIDATION
             * --------------------------------------------------
             */

            const allowedTypes: MessageType[] =
              [
                "text",
                "image",
                "audio",
              ];

            if (
              !allowedTypes.includes(type)
            ) {
              const response = {
                success: false,
                message:
                  "Invalid message type.",
              };

              socket.emit(
                "socket_error",
                response
              );

              ack?.(response);

              return;
            }

            /*
             * --------------------------------------------------
             * TEXT VALIDATION
             * --------------------------------------------------
             */

            let trimmedText:
              | string
              | undefined;

            if (type === "text") {
              trimmedText =
                text?.trim();

              if (!trimmedText) {
                const response = {
                  success: false,
                  message:
                    "Message cannot be empty.",
                };

                ack?.(response);

                return;
              }

              if (
                trimmedText.length >
                2000
              ) {
                const response = {
                  success: false,
                  message:
                    "Message cannot exceed 2000 characters.",
                };

                socket.emit(
                  "socket_error",
                  response
                );

                ack?.(response);

                return;
              }
            }

            /*
             * --------------------------------------------------
             * IMAGE / AUDIO MEDIA URL VALIDATION
             * --------------------------------------------------
             */

            if (
              type === "image" ||
              type === "audio"
            ) {
              if (!mediaUrl) {
                const response = {
                  success: false,
                  message:
                    "Media URL is required.",
                };

                socket.emit(
                  "socket_error",
                  response
                );

                ack?.(response);

                return;
              }

              try {
                new URL(mediaUrl);
              } catch {
                const response = {
                  success: false,
                  message:
                    "Invalid media URL.",
                };

                socket.emit(
                  "socket_error",
                  response
                );

                ack?.(response);

                return;
              }
            }

            /*
             * --------------------------------------------------
             * AUDIO DURATION VALIDATION
             * --------------------------------------------------
             */

            if (type === "audio") {
              if (
                duration !== undefined &&
                (
                  typeof duration !==
                    "number" ||
                  duration < 0
                )
              ) {
                const response = {
                  success: false,
                  message:
                    "Invalid audio duration.",
                };

                socket.emit(
                  "socket_error",
                  response
                );

                ack?.(response);

                return;
              }
            }

            /*
             * --------------------------------------------------
             * VERIFY GROUP MEMBERSHIP
             * --------------------------------------------------
             */

            const group =
              await CollaborationGroup.findOne(
                {
                  _id: groupId,
                  members: userId,
                }
              );

            if (!group) {
              const response = {
                success: false,
                message:
                  "You are not a member of this collaboration group.",
              };

              socket.emit(
                "socket_error",
                response
              );

              ack?.(response);

              return;
            }

            /*
             * --------------------------------------------------
             * PREPARE MESSAGE DATA
             * --------------------------------------------------
             */

            const messageData: {
              group: string;
              sender: string;
              type: MessageType;
              text?: string;
              mediaUrl?: string;
              duration?: number;
            } = {
              group: groupId,
              sender: userId,
              type,
            };

            if (type === "text") {
              messageData.text =
                trimmedText;
            }

            if (
              type === "image" ||
              type === "audio"
            ) {
              messageData.mediaUrl =
                mediaUrl;
            }

            if (
              type === "audio" &&
              duration !== undefined
            ) {
              messageData.duration =
                duration;
            }

            /*
             * --------------------------------------------------
             * SAVE MESSAGE
             * --------------------------------------------------
             */

            const newMessage =
              await Message.create(
                messageData
              );

            /*
             * --------------------------------------------------
             * POPULATE SENDER
             * --------------------------------------------------
             */

            const populatedMessage =
              await Message.findById(
                newMessage._id
              ).populate(
                "sender",
                "name email profilePhoto"
              );

            if (!populatedMessage) {
              const response = {
                success: false,
                message:
                  "Failed to create message.",
              };

              ack?.(response);

              return;
            }

            /*
             * --------------------------------------------------
             * SEND TO EVERYONE IN GROUP
             * --------------------------------------------------
             *
             * Existing frontend compatibility is preserved.
             */

            io.to(groupId).emit(
              "new_message",
              populatedMessage
            );

            /*
             * --------------------------------------------------
             * SEND SUCCESS ACK TO SENDER
             * --------------------------------------------------
             *
             * clientMessageId allows the frontend to match
             * an optimistic message with this real message.
             */

            ack?.({
              success: true,
              data: {
                message:
                  populatedMessage,
                clientMessageId:
                  clientMessageId ??
                  null,
              },
            });

            /*
             * Separate event can also be used by the
             * future frontend implementation.
             */

            socket.emit(
              "message_sent",
              {
                message:
                  populatedMessage,
                clientMessageId:
                  clientMessageId ??
                  null,
              }
            );
          } catch (error) {
            console.error(
              "Send message socket error:",
              error
            );

            const response = {
              success: false,
              message:
                "Failed to send message.",
            };

            socket.emit(
              "socket_error",
              response
            );

            ack?.(response);
          }
        }
      );

      /*
       * ========================================================
       * EDIT MESSAGE
       * ========================================================
       *
       * Only text messages can be edited.
       *
       * Only the original sender can edit their own message.
       *
       * The message's updatedAt timestamp changes automatically
       * because the Message model uses timestamps.
       * ========================================================
       */

      socket.on(
        "edit_message",
        async (
          payload: EditMessagePayload,
          ack?: SocketAckCallback
        ) => {
          try {
            const userId =
              socket.userId;

            if (!userId) {
              const response = {
                success: false,
                message:
                  "Authentication required.",
              };

              socket.emit(
                "socket_error",
                response
              );

              ack?.(response);

              return;
            }

            const messageId =
              payload?.messageId;

            const text =
              payload?.text?.trim();

            /*
             * --------------------------------------------------
             * MESSAGE ID VALIDATION
             * --------------------------------------------------
             */

            if (!messageId) {
              const response = {
                success: false,
                message:
                  "Message ID is required.",
              };

              socket.emit(
                "socket_error",
                response
              );

              ack?.(response);

              return;
            }

            if (
              !mongoose.Types.ObjectId.isValid(
                messageId
              )
            ) {
              const response = {
                success: false,
                message:
                  "Invalid message ID.",
              };

              socket.emit(
                "socket_error",
                response
              );

              ack?.(response);

              return;
            }

            /*
             * --------------------------------------------------
             * TEXT VALIDATION
             * --------------------------------------------------
             */

            if (!text) {
              const response = {
                success: false,
                message:
                  "Message cannot be empty.",
              };

              ack?.(response);

              return;
            }

            if (text.length > 2000) {
              const response = {
                success: false,
                message:
                  "Message cannot exceed 2000 characters.",
              };

              socket.emit(
                "socket_error",
                response
              );

              ack?.(response);

              return;
            }

            /*
             * --------------------------------------------------
             * FIND MESSAGE
             * --------------------------------------------------
             */

            const message =
              await Message.findById(
                messageId
              );

            if (!message) {
              const response = {
                success: false,
                message:
                  "Message not found.",
              };

              socket.emit(
                "socket_error",
                response
              );

              ack?.(response);

              return;
            }

            /*
             * --------------------------------------------------
             * ONLY TEXT MESSAGES CAN BE EDITED
             * --------------------------------------------------
             */

            if (message.type !== "text") {
              const response = {
                success: false,
                message:
                  "Only text messages can be edited.",
              };

              socket.emit(
                "socket_error",
                response
              );

              ack?.(response);

              return;
            }

            /*
             * --------------------------------------------------
             * ONLY MESSAGE OWNER CAN EDIT
             * --------------------------------------------------
             */

            if (
              message.sender.toString() !==
              userId
            ) {
              const response = {
                success: false,
                message:
                  "You can only edit your own messages.",
              };

              socket.emit(
                "socket_error",
                response
              );

              ack?.(response);

              return;
            }

            /*
             * --------------------------------------------------
             * VERIFY GROUP MEMBERSHIP
             * --------------------------------------------------
             */

            const groupId =
              message.group.toString();

            const group =
              await CollaborationGroup.findOne(
                {
                  _id: groupId,
                  members: userId,
                }
              );

            if (!group) {
              const response = {
                success: false,
                message:
                  "You are not a member of this collaboration group.",
              };

              socket.emit(
                "socket_error",
                response
              );

              ack?.(response);

              return;
            }

            /*
             * --------------------------------------------------
             * UPDATE MESSAGE
             * --------------------------------------------------
             */

            message.text = text;

            /*
             * Because the Message schema uses timestamps,
             * updatedAt will automatically be refreshed.
             */

            await message.save();

            /*
             * --------------------------------------------------
             * POPULATE SENDER
             * --------------------------------------------------
             */

            const populatedMessage =
              await Message.findById(
                message._id
              ).populate(
                "sender",
                "name email profilePhoto"
              );

            if (!populatedMessage) {
              const response = {
                success: false,
                message:
                  "Failed to update message.",
              };

              ack?.(response);

              return;
            }

            /*
             * --------------------------------------------------
             * NOTIFY EVERYONE
             * --------------------------------------------------
             */

            io.to(groupId).emit(
              "message_edited",
              populatedMessage
            );

            /*
             * --------------------------------------------------
             * ACKNOWLEDGEMENT
             * --------------------------------------------------
             */

            ack?.({
              success: true,
              data: {
                message:
                  populatedMessage,
              },
            });
          } catch (error) {
            console.error(
              "Edit message socket error:",
              error
            );

            const response = {
              success: false,
              message:
                "Failed to edit message.",
            };

            socket.emit(
              "socket_error",
              response
            );

            ack?.(response);
          }
        }
      );

      /*
       * ========================================================
       * DELETE MESSAGE
       * ========================================================
       *
       * Only the original sender can delete their own message.
       * ========================================================
       */

      socket.on(
        "delete_message",
        async (
          payload: DeleteMessagePayload,
          ack?: SocketAckCallback
        ) => {
          try {
            const userId =
              socket.userId;

            const messageId =
              payload?.messageId;

            if (!userId) {
              const response = {
                success: false,
                message:
                  "Authentication required.",
              };

              socket.emit(
                "socket_error",
                response
              );

              ack?.(response);

              return;
            }

            /*
             * --------------------------------------------------
             * MESSAGE ID VALIDATION
             * --------------------------------------------------
             */

            if (!messageId) {
              const response = {
                success: false,
                message:
                  "Message ID is required.",
              };

              socket.emit(
                "socket_error",
                response
              );

              ack?.(response);

              return;
            }

            if (
              !mongoose.Types.ObjectId.isValid(
                messageId
              )
            ) {
              const response = {
                success: false,
                message:
                  "Invalid message ID.",
              };

              socket.emit(
                "socket_error",
                response
              );

              ack?.(response);

              return;
            }

            /*
             * --------------------------------------------------
             * FIND MESSAGE
             * --------------------------------------------------
             */

            const message =
              await Message.findById(
                messageId
              );

            if (!message) {
              const response = {
                success: false,
                message:
                  "Message not found.",
              };

              socket.emit(
                "socket_error",
                response
              );

              ack?.(response);

              return;
            }

            /*
             * --------------------------------------------------
             * ONLY SENDER CAN DELETE
             * --------------------------------------------------
             */

            if (
              message.sender.toString() !==
              userId
            ) {
              const response = {
                success: false,
                message:
                  "You can only delete your own messages.",
              };

              socket.emit(
                "socket_error",
                response
              );

              ack?.(response);

              return;
            }

            const groupId =
              message.group.toString();

            /*
             * --------------------------------------------------
             * VERIFY GROUP MEMBERSHIP
             * --------------------------------------------------
             */

            const group =
              await CollaborationGroup.findOne(
                {
                  _id: groupId,
                  members: userId,
                }
              );

            if (!group) {
              const response = {
                success: false,
                message:
                  "You are not a member of this collaboration group.",
              };

              socket.emit(
                "socket_error",
                response
              );

              ack?.(response);

              return;
            }

            /*
             * --------------------------------------------------
             * DELETE MESSAGE
             * --------------------------------------------------
             */

            await Message.findByIdAndDelete(
              messageId
            );

            /*
             * --------------------------------------------------
             * NOTIFY EVERYONE
             * --------------------------------------------------
             */

            io.to(groupId).emit(
              "message_deleted",
              {
                messageId,
                groupId,
              }
            );

            /*
             * --------------------------------------------------
             * ACKNOWLEDGEMENT
             * --------------------------------------------------
             */

            ack?.({
              success: true,
              data: {
                messageId,
                groupId,
              },
            });
          } catch (error) {
            console.error(
              "Delete message socket error:",
              error
            );

            const response = {
              success: false,
              message:
                "Failed to delete message.",
            };

            socket.emit(
              "socket_error",
              response
            );

            ack?.(response);
          }
        }
      );

      /*
       * ========================================================
       * DISCONNECT
       * ========================================================
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