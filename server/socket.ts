import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { randomUUID } from "node:crypto";
import { Server, Socket } from "socket.io";

import Message, {
  MessageType,
} from "./models/Message.js";

import CollaborationGroup from "./models/CollaborationGroup.js";

/* ============================================================
   AUTHENTICATED SOCKET
============================================================ */

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

/* ============================================================
   SOCKET PAYLOADS
============================================================ */

interface JoinGroupPayload {
  groupId: string;
}

interface SendMessagePayload {
  groupId: string;
  type?: MessageType;
  text?: string;
  mediaUrl?: string;
  duration?: number;
  clientMessageId?: string;
}

interface DeleteMessagePayload {
  messageId: string;
}

interface EditMessagePayload {
  messageId: string;
  text: string;
}

/* ============================================================
   MEETING PAYLOADS
============================================================ */

type MeetingType = "meeting";

interface MeetingInvitePayload {
  groupId: string;
}

interface MeetingResponsePayload {
  groupId: string;
  meetingId: string;
}

interface MeetingParticipantPayload {
  groupId: string;
  meetingId: string;
}

interface MeetingEndPayload {
  groupId: string;
  meetingId: string;
}

interface MeetingMediaStatePayload {
  groupId: string;
  meetingId: string;
  micEnabled: boolean;
  cameraEnabled: boolean;
}

interface WebRTCOfferPayload {
  meetingId: string;
  toUserId: string;
  offer: RTCSessionDescriptionInit;
}

interface WebRTCAnswerPayload {
  meetingId: string;
  toUserId: string;
  answer: RTCSessionDescriptionInit;
}

interface WebRTCIceCandidatePayload {
  meetingId: string;
  toUserId: string;
  candidate: RTCIceCandidateInit;
}

/* ============================================================
   ACTIVE MEETING
============================================================ */

interface ActiveMeeting {
  meetingId: string;
  groupId: string;
  hostId: string;
  type: MeetingType;
  participants: Set<string>;
  startedAt: number;
}

/* ============================================================
   SOCKET ACKNOWLEDGEMENTS
============================================================ */

interface SocketAck {
  success: boolean;
  message?: string;
  data?: unknown;

  /*
   * meetingId is included directly because the frontend
   * currently reads response.meetingId.
   */
  meetingId?: string;
}

type SocketAckCallback = (
  response: SocketAck
) => void;

/* ============================================================
   ACTIVE MEETING STORAGE
============================================================ */

const activeMeetings = new Map<
  string,
  ActiveMeeting
>();

const activeMeetingByGroup = new Map<
  string,
  string
>();

/* ============================================================
   ROOM HELPERS
============================================================ */

const getUserRoom = (
  userId: string
): string => {
  return `user:${userId}`;
};

const getMeetingRoom = (
  meetingId: string
): string => {
  return `meeting:${meetingId}`;
};

/* ============================================================
   COOKIE TOKEN HELPER
============================================================ */

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

/* ============================================================
   SOCKET ERROR HELPER
============================================================ */

const emitSocketError = (
  socket: AuthenticatedSocket,
  message: string,
  ack?: SocketAckCallback
) => {
  const response: SocketAck = {
    success: false,
    message,
  };

  socket.emit(
    "socket_error",
    response
  );

  ack?.(response);
};

/* ============================================================
   GROUP MEMBER NOTIFICATION
============================================================ */

const notifyGroupMembers = (
  io: Server,
  memberIds: mongoose.Types.ObjectId[],
  event: string,
  data: unknown,
  excludeUserId?: string
) => {
  for (const memberId of memberIds) {
    const memberUserId =
      memberId.toString();

    if (
      excludeUserId &&
      memberUserId === excludeUserId
    ) {
      continue;
    }

    io.to(
      getUserRoom(memberUserId)
    ).emit(event, data);
  }
};

/* ============================================================
   REMOVE ACTIVE MEETING
============================================================ */

const removeActiveMeeting = (
  meeting: ActiveMeeting
) => {
  activeMeetings.delete(
    meeting.meetingId
  );

  activeMeetingByGroup.delete(
    meeting.groupId
  );
};

/* ============================================================
   CHECK MEETING PARTICIPANT
============================================================ */

const getActiveMeetingParticipant = (
  meetingId: string,
  userId: string
): ActiveMeeting | null => {
  const meeting =
    activeMeetings.get(meetingId);

  if (!meeting) {
    return null;
  }

  if (
    !meeting.participants.has(userId)
  ) {
    return null;
  }

  return meeting;
};

/* ============================================================
   SOCKET SETUP
============================================================ */

const setupSocket = (
  io: Server
) => {
  /* ==========================================================
     SOCKET AUTHENTICATION
  ========================================================== */

  io.use(
    (
      socket: AuthenticatedSocket,
      next
    ) => {
      try {
        const cookieHeader =
          socket.handshake.headers.cookie;

        const token =
          getTokenFromCookie(
            cookieHeader
          );

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

        const decoded =
          jwt.verify(
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

  /* ==========================================================
     CONNECTION
  ========================================================== */

  io.on(
    "connection",
    (
      socket: AuthenticatedSocket
    ) => {
      const userId =
        socket.userId;

      console.log(
        `🔌 User connected to Socket.IO: ${userId}`
      );

      /* ========================================================
         PERSONAL USER ROOM
      ======================================================== */

      if (userId) {
        socket.join(
          getUserRoom(userId)
        );
      }

      /* ========================================================
         JOIN COLLABORATION GROUP
      ======================================================== */

      socket.on(
        "join_group",
        async (
          payload: JoinGroupPayload,
          ack?: SocketAckCallback
        ) => {
          try {
            const currentUserId =
              socket.userId;

            const groupId =
              payload?.groupId;

            if (!currentUserId) {
              emitSocketError(
                socket,
                "Authentication required.",
                ack
              );

              return;
            }

            if (!groupId) {
              emitSocketError(
                socket,
                "Collaboration group ID is required.",
                ack
              );

              return;
            }

            if (
              !mongoose.Types.ObjectId.isValid(
                groupId
              )
            ) {
              emitSocketError(
                socket,
                "Invalid collaboration group ID.",
                ack
              );

              return;
            }

            const group =
              await CollaborationGroup.findOne(
                {
                  _id: groupId,
                  members: currentUserId,
                }
              );

            if (!group) {
              emitSocketError(
                socket,
                "You are not a member of this collaboration group.",
                ack
              );

              return;
            }

            socket.join(groupId);

            console.log(
              `👥 User ${currentUserId} joined group ${groupId}`
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

            emitSocketError(
              socket,
              "Failed to join collaboration group.",
              ack
            );
          }
        }
      );

      /* ========================================================
         SEND MESSAGE
      ======================================================== */

      socket.on(
        "send_message",
        async (
          payload: SendMessagePayload,
          ack?: SocketAckCallback
        ) => {
          try {
            const currentUserId =
              socket.userId;

            if (!currentUserId) {
              emitSocketError(
                socket,
                "Authentication required.",
                ack
              );

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

            if (!groupId) {
              emitSocketError(
                socket,
                "Collaboration group ID is required.",
                ack
              );

              return;
            }

            if (
              !mongoose.Types.ObjectId.isValid(
                groupId
              )
            ) {
              emitSocketError(
                socket,
                "Invalid collaboration group ID.",
                ack
              );

              return;
            }

            const allowedTypes: MessageType[] = [
              "text",
              "image",
              "audio",
            ];

            if (
              !allowedTypes.includes(type)
            ) {
              emitSocketError(
                socket,
                "Invalid message type.",
                ack
              );

              return;
            }

            let trimmedText:
              | string
              | undefined;

            if (type === "text") {
              trimmedText =
                text?.trim();

              if (!trimmedText) {
                emitSocketError(
                  socket,
                  "Message cannot be empty.",
                  ack
                );

                return;
              }

              if (
                trimmedText.length > 2000
              ) {
                emitSocketError(
                  socket,
                  "Message cannot exceed 2000 characters.",
                  ack
                );

                return;
              }
            }

            if (
              type === "image" ||
              type === "audio"
            ) {
              if (!mediaUrl) {
                emitSocketError(
                  socket,
                  "Media URL is required.",
                  ack
                );

                return;
              }

              try {
                new URL(mediaUrl);
              } catch {
                emitSocketError(
                  socket,
                  "Invalid media URL.",
                  ack
                );

                return;
              }
            }

            if (type === "audio") {
              if (
                duration !==
                  undefined &&
                (
                  typeof duration !==
                    "number" ||
                  duration < 0
                )
              ) {
                emitSocketError(
                  socket,
                  "Invalid audio duration.",
                  ack
                );

                return;
              }
            }

            const group =
              await CollaborationGroup.findOne(
                {
                  _id: groupId,
                  members: currentUserId,
                }
              );

            if (!group) {
              emitSocketError(
                socket,
                "You are not a member of this collaboration group.",
                ack
              );

              return;
            }

            const messageData: {
              group: string;
              sender: string;
              type: MessageType;
              text?: string;
              mediaUrl?: string;
              duration?: number;
            } = {
              group: groupId,
              sender: currentUserId,
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

            const newMessage =
              await Message.create(
                messageData
              );

            const populatedMessage =
              await Message.findById(
                newMessage._id
              ).populate(
                "sender",
                "name email profilePhoto"
              );

            if (!populatedMessage) {
              const response: SocketAck = {
                success: false,
                message:
                  "Failed to create message.",
              };

              ack?.(response);

              return;
            }

            io.to(groupId).emit(
              "new_message",
              populatedMessage
            );

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

            emitSocketError(
              socket,
              "Failed to send message.",
              ack
            );
          }
        }
      );

      /* ========================================================
         EDIT MESSAGE
      ======================================================== */

      socket.on(
        "edit_message",
        async (
          payload: EditMessagePayload,
          ack?: SocketAckCallback
        ) => {
          try {
            const currentUserId =
              socket.userId;

            if (!currentUserId) {
              emitSocketError(
                socket,
                "Authentication required.",
                ack
              );

              return;
            }

            const messageId =
              payload?.messageId;

            const text =
              payload?.text?.trim();

            if (!messageId) {
              emitSocketError(
                socket,
                "Message ID is required.",
                ack
              );

              return;
            }

            if (
              !mongoose.Types.ObjectId.isValid(
                messageId
              )
            ) {
              emitSocketError(
                socket,
                "Invalid message ID.",
                ack
              );

              return;
            }

            if (!text) {
              emitSocketError(
                socket,
                "Message cannot be empty.",
                ack
              );

              return;
            }

            if (text.length > 2000) {
              emitSocketError(
                socket,
                "Message cannot exceed 2000 characters.",
                ack
              );

              return;
            }

            const message =
              await Message.findById(
                messageId
              );

            if (!message) {
              emitSocketError(
                socket,
                "Message not found.",
                ack
              );

              return;
            }

            if (message.type !== "text") {
              emitSocketError(
                socket,
                "Only text messages can be edited.",
                ack
              );

              return;
            }

            if (
              message.sender.toString() !==
              currentUserId
            ) {
              emitSocketError(
                socket,
                "You can only edit your own messages.",
                ack
              );

              return;
            }

            const groupId =
              message.group.toString();

            const group =
              await CollaborationGroup.findOne(
                {
                  _id: groupId,
                  members: currentUserId,
                }
              );

            if (!group) {
              emitSocketError(
                socket,
                "You are not a member of this collaboration group.",
                ack
              );

              return;
            }

            message.text = text;

            await message.save();

            const populatedMessage =
              await Message.findById(
                message._id
              ).populate(
                "sender",
                "name email profilePhoto"
              );

            if (!populatedMessage) {
              ack?.({
                success: false,
                message:
                  "Failed to update message.",
              });

              return;
            }

            io.to(groupId).emit(
              "message_edited",
              populatedMessage
            );

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

            emitSocketError(
              socket,
              "Failed to edit message.",
              ack
            );
          }
        }
      );

      /* ========================================================
         DELETE MESSAGE
      ======================================================== */

      socket.on(
        "delete_message",
        async (
          payload: DeleteMessagePayload,
          ack?: SocketAckCallback
        ) => {
          try {
            const currentUserId =
              socket.userId;

            const messageId =
              payload?.messageId;

            if (!currentUserId) {
              emitSocketError(
                socket,
                "Authentication required.",
                ack
              );

              return;
            }

            if (!messageId) {
              emitSocketError(
                socket,
                "Message ID is required.",
                ack
              );

              return;
            }

            if (
              !mongoose.Types.ObjectId.isValid(
                messageId
              )
            ) {
              emitSocketError(
                socket,
                "Invalid message ID.",
                ack
              );

              return;
            }

            const message =
              await Message.findById(
                messageId
              );

            if (!message) {
              emitSocketError(
                socket,
                "Message not found.",
                ack
              );

              return;
            }

            if (
              message.sender.toString() !==
              currentUserId
            ) {
              emitSocketError(
                socket,
                "You can only delete your own messages.",
                ack
              );

              return;
            }

            const groupId =
              message.group.toString();

            const group =
              await CollaborationGroup.findOne(
                {
                  _id: groupId,
                  members: currentUserId,
                }
              );

            if (!group) {
              emitSocketError(
                socket,
                "You are not a member of this collaboration group.",
                ack
              );

              return;
            }

            await Message.findByIdAndDelete(
              messageId
            );

            io.to(groupId).emit(
              "message_deleted",
              {
                messageId,
                groupId,
              }
            );

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

            emitSocketError(
              socket,
              "Failed to delete message.",
              ack
            );
          }
        }
      );

      /* ========================================================
         START MEETING
      ======================================================== */

      socket.on(
        "meeting_invite",
        async (
          payload: MeetingInvitePayload,
          ack?: SocketAckCallback
        ) => {
          try {
            const currentUserId =
              socket.userId;

            const groupId =
              payload?.groupId;

            if (!currentUserId) {
              emitSocketError(
                socket,
                "Authentication required.",
                ack
              );

              return;
            }

            if (!groupId) {
              emitSocketError(
                socket,
                "Collaboration group ID is required.",
                ack
              );

              return;
            }

            if (
              !mongoose.Types.ObjectId.isValid(
                groupId
              )
            ) {
              emitSocketError(
                socket,
                "Invalid collaboration group ID.",
                ack
              );

              return;
            }

            const group =
              await CollaborationGroup.findOne(
                {
                  _id: groupId,
                  members: currentUserId,
                }
              ).select(
                "name project owner members"
              );

            if (!group) {
              emitSocketError(
                socket,
                "You are not a member of this collaboration group.",
                ack
              );

              return;
            }

            const existingMeetingId =
              activeMeetingByGroup.get(
                groupId
              );

            if (existingMeetingId) {
              emitSocketError(
                socket,
                "A meeting is already active for this collaboration group.",
                ack
              );

              return;
            }

            const meetingId =
              randomUUID();

            const meeting: ActiveMeeting =
              {
                meetingId,
                groupId,
                hostId:
                  currentUserId,
                type: "meeting",
                participants:
                  new Set<string>([
                    currentUserId,
                  ]),
                startedAt:
                  Date.now(),
              };

            activeMeetings.set(
              meetingId,
              meeting
            );

            activeMeetingByGroup.set(
              groupId,
              meetingId
            );

            socket.join(
              getMeetingRoom(
                meetingId
              )
            );

            notifyGroupMembers(
              io,
              group.members,
              "incoming_meeting",
              {
                meetingId,
                groupId,
                hostId:
                  currentUserId,
                type: "meeting",
                groupName:
                  group.name,
              },
              currentUserId
            );

            socket.emit(
              "meeting_started",
              {
                meetingId,
                groupId,
                hostId:
                  currentUserId,
                type: "meeting",
              }
            );

            /*
             * IMPORTANT:
             * meetingId is returned directly because
             * MessagesPage reads response.meetingId.
             */
            ack?.({
              success: true,
              meetingId,
              data: {
                meetingId,
                groupId,
                hostId:
                  currentUserId,
                type: "meeting",
              },
            });

            console.log(
              `📞 Meeting started: ${meetingId} | group: ${groupId} | host: ${currentUserId}`
            );
          } catch (error) {
            console.error(
              "Meeting invite error:",
              error
            );

            emitSocketError(
              socket,
              "Failed to start meeting.",
              ack
            );
          }
        }
      );

      /* ========================================================
         ACCEPT / JOIN MEETING
      ======================================================== */

      socket.on(
        "meeting_accept",
        async (
          payload: MeetingResponsePayload,
          ack?: SocketAckCallback
        ) => {
          try {
            const currentUserId =
              socket.userId;

            const groupId =
              payload?.groupId;

            const meetingId =
              payload?.meetingId;

            if (!currentUserId) {
              emitSocketError(
                socket,
                "Authentication required.",
                ack
              );

              return;
            }

            if (
              !groupId ||
              !meetingId
            ) {
              emitSocketError(
                socket,
                "Group ID and meeting ID are required.",
                ack
              );

              return;
            }

            const meeting =
              activeMeetings.get(
                meetingId
              );

            if (
              !meeting ||
              meeting.groupId !==
                groupId
            ) {
              emitSocketError(
                socket,
                "This meeting is no longer active.",
                ack
              );

              return;
            }

            const group =
              await CollaborationGroup.findOne(
                {
                  _id: groupId,
                  members: currentUserId,
                }
              ).select("members");

            if (!group) {
              emitSocketError(
                socket,
                "You are not a member of this collaboration group.",
                ack
              );

              return;
            }

            /*
             * Prevent duplicate joins.
             */
            const alreadyJoined =
              meeting.participants.has(
                currentUserId
              );

            meeting.participants.add(
              currentUserId
            );

            socket.join(
              getMeetingRoom(
                meetingId
              )
            );

            /*
             * Notify existing participants only.
             *
             * This is important because the new participant
             * should receive meeting_joined separately.
             */
            if (!alreadyJoined) {
              socket.broadcast
                .to(
                  getMeetingRoom(
                    meetingId
                  )
                )
                .emit(
                  "meeting_participant_joined",
                  {
                    meetingId,
                    groupId,
                    userId:
                      currentUserId,
                    micEnabled:
                      true,
                    cameraEnabled:
                      true,
                  }
                );
            }

            /*
             * Tell the joining participant about
             * the meeting.
             */
            socket.emit(
              "meeting_joined",
              {
                meetingId,
                groupId,
                hostId:
                  meeting.hostId,
                type:
                  meeting.type,
                participants:
                  Array.from(
                    meeting.participants
                  ),
              }
            );

            ack?.({
              success: true,
              meetingId,
              data: {
                meetingId,
                groupId,
                hostId:
                  meeting.hostId,
                type:
                  meeting.type,
                participants:
                  Array.from(
                    meeting.participants
                  ),
              },
            });

            console.log(
              `📞 User ${currentUserId} joined meeting ${meetingId}`
            );
          } catch (error) {
            console.error(
              "Meeting accept error:",
              error
            );

            emitSocketError(
              socket,
              "Failed to join meeting.",
              ack
            );
          }
        }
      );

      /* ========================================================
         DECLINE MEETING
      ======================================================== */

      socket.on(
        "meeting_decline",
        async (
          payload: MeetingResponsePayload,
          ack?: SocketAckCallback
        ) => {
          try {
            const currentUserId =
              socket.userId;

            const groupId =
              payload?.groupId;

            const meetingId =
              payload?.meetingId;

            if (!currentUserId) {
              emitSocketError(
                socket,
                "Authentication required.",
                ack
              );

              return;
            }

            if (
              !groupId ||
              !meetingId
            ) {
              emitSocketError(
                socket,
                "Group ID and meeting ID are required.",
                ack
              );

              return;
            }

            const meeting =
              activeMeetings.get(
                meetingId
              );

            if (
              !meeting ||
              meeting.groupId !==
                groupId
            ) {
              emitSocketError(
                socket,
                "This meeting is no longer active.",
                ack
              );

              return;
            }

            const group =
              await CollaborationGroup.findOne(
                {
                  _id: groupId,
                  members: currentUserId,
                }
              ).select("members");

            if (!group) {
              emitSocketError(
                socket,
                "You are not a member of this collaboration group.",
                ack
              );

              return;
            }

            io.to(
              getUserRoom(
                meeting.hostId
              )
            ).emit(
              "meeting_declined",
              {
                meetingId,
                groupId,
                userId:
                  currentUserId,
              }
            );

            io.to(
              getMeetingRoom(
                meetingId
              )
            ).emit(
              "meeting_declined",
              {
                meetingId,
                groupId,
                userId:
                  currentUserId,
              }
            );

            ack?.({
              success: true,
            });
          } catch (error) {
            console.error(
              "Meeting decline error:",
              error
            );

            emitSocketError(
              socket,
              "Failed to decline meeting.",
              ack
            );
          }
        }
      );

      /* ========================================================
         CANCEL MEETING
      ======================================================== */

      socket.on(
        "meeting_cancel",
        async (
          payload: MeetingEndPayload,
          ack?: SocketAckCallback
        ) => {
          try {
            const currentUserId =
              socket.userId;

            const groupId =
              payload?.groupId;

            const meetingId =
              payload?.meetingId;

            if (!currentUserId) {
              emitSocketError(
                socket,
                "Authentication required.",
                ack
              );

              return;
            }

            if (
              !groupId ||
              !meetingId
            ) {
              emitSocketError(
                socket,
                "Group ID and meeting ID are required.",
                ack
              );

              return;
            }

            const meeting =
              activeMeetings.get(
                meetingId
              );

            if (
              !meeting ||
              meeting.groupId !==
                groupId
            ) {
              emitSocketError(
                socket,
                "This meeting is no longer active.",
                ack
              );

              return;
            }

            if (
              meeting.hostId !==
              currentUserId
            ) {
              emitSocketError(
                socket,
                "Only the meeting host can cancel the meeting.",
                ack
              );

              return;
            }

            const group =
              await CollaborationGroup.findOne(
                {
                  _id: groupId,
                  members: currentUserId,
                }
              ).select("members");

            if (!group) {
              emitSocketError(
                socket,
                "You are not a member of this collaboration group.",
                ack
              );

              return;
            }

            notifyGroupMembers(
              io,
              group.members,
              "meeting_cancelled",
              {
                meetingId,
                groupId,
                hostId:
                  currentUserId,
              }
            );

            io.to(
              getMeetingRoom(
                meetingId
              )
            ).emit(
              "meeting_cancelled",
              {
                meetingId,
                groupId,
                hostId:
                  currentUserId,
              }
            );

            removeActiveMeeting(
              meeting
            );

            ack?.({
              success: true,
            });

            console.log(
              `📞 Meeting cancelled: ${meetingId}`
            );
          } catch (error) {
            console.error(
              "Meeting cancel error:",
              error
            );

            emitSocketError(
              socket,
              "Failed to cancel meeting.",
              ack
            );
          }
        }
      );

      /* ========================================================
         MEETING MEDIA STATE
      ======================================================== */

      socket.on(
        "meeting_media_state",
        async (
          payload: MeetingMediaStatePayload,
          ack?: SocketAckCallback
        ) => {
          try {
            const currentUserId =
              socket.userId;

            const {
              groupId,
              meetingId,
              micEnabled,
              cameraEnabled,
            } = payload || {};

            if (!currentUserId) {
              emitSocketError(
                socket,
                "Authentication required.",
                ack
              );

              return;
            }

            if (
              !groupId ||
              !meetingId
            ) {
              emitSocketError(
                socket,
                "Group ID and meeting ID are required.",
                ack
              );

              return;
            }

            if (
              typeof micEnabled !==
                "boolean" ||
              typeof cameraEnabled !==
                "boolean"
            ) {
              emitSocketError(
                socket,
                "Invalid microphone or camera state.",
                ack
              );

              return;
            }

            const meeting =
              getActiveMeetingParticipant(
                meetingId,
                currentUserId
              );

            if (
              !meeting ||
              meeting.groupId !==
                groupId
            ) {
              emitSocketError(
                socket,
                "You are not participating in this meeting.",
                ack
              );

              return;
            }

            /*
             * Send the state to everybody else in the meeting.
             */
            socket.broadcast
              .to(
                getMeetingRoom(
                  meetingId
                )
              )
              .emit(
                "meeting_media_state",
                {
                  meetingId,
                  groupId,
                  userId:
                    currentUserId,
                  micEnabled,
                  cameraEnabled,
                }
              );

            ack?.({
              success: true,
            });
          } catch (error) {
            console.error(
              "Meeting media state error:",
              error
            );

            emitSocketError(
              socket,
              "Failed to update meeting media state.",
              ack
            );
          }
        }
      );

      /* ========================================================
         WEBRTC OFFER RELAY
      ======================================================== */

      socket.on(
        "webrtc_offer",
        async (
          payload: WebRTCOfferPayload,
          ack?: SocketAckCallback
        ) => {
          try {
            const currentUserId =
              socket.userId;

            const {
              meetingId,
              toUserId,
              offer,
            } = payload || {};

            if (!currentUserId) {
              emitSocketError(
                socket,
                "Authentication required.",
                ack
              );

              return;
            }

            if (
              !meetingId ||
              !toUserId ||
              !offer
            ) {
              emitSocketError(
                socket,
                "Meeting ID, target user and offer are required.",
                ack
              );

              return;
            }

            const meeting =
              getActiveMeetingParticipant(
                meetingId,
                currentUserId
              );

            if (!meeting) {
              emitSocketError(
                socket,
                "You are not participating in this meeting.",
                ack
              );

              return;
            }

            if (
              !meeting.participants.has(
                toUserId
              )
            ) {
              emitSocketError(
                socket,
                "Target user is not participating in this meeting.",
                ack
              );

              return;
            }

            /*
             * Relay the offer only to the intended user.
             */
            io.to(
              getUserRoom(
                toUserId
              )
            ).emit(
              "webrtc_offer",
              {
                meetingId,
                fromUserId:
                  currentUserId,
                toUserId,
                offer,
              }
            );

            ack?.({
              success: true,
            });
          } catch (error) {
            console.error(
              "WebRTC offer relay error:",
              error
            );

            emitSocketError(
              socket,
              "Failed to send WebRTC offer.",
              ack
            );
          }
        }
      );

      /* ========================================================
         WEBRTC ANSWER RELAY
      ======================================================== */

      socket.on(
        "webrtc_answer",
        async (
          payload: WebRTCAnswerPayload,
          ack?: SocketAckCallback
        ) => {
          try {
            const currentUserId =
              socket.userId;

            const {
              meetingId,
              toUserId,
              answer,
            } = payload || {};

            if (!currentUserId) {
              emitSocketError(
                socket,
                "Authentication required.",
                ack
              );

              return;
            }

            if (
              !meetingId ||
              !toUserId ||
              !answer
            ) {
              emitSocketError(
                socket,
                "Meeting ID, target user and answer are required.",
                ack
              );

              return;
            }

            const meeting =
              getActiveMeetingParticipant(
                meetingId,
                currentUserId
              );

            if (!meeting) {
              emitSocketError(
                socket,
                "You are not participating in this meeting.",
                ack
              );

              return;
            }

            if (
              !meeting.participants.has(
                toUserId
              )
            ) {
              emitSocketError(
                socket,
                "Target user is not participating in this meeting.",
                ack
              );

              return;
            }

            io.to(
              getUserRoom(
                toUserId
              )
            ).emit(
              "webrtc_answer",
              {
                meetingId,
                fromUserId:
                  currentUserId,
                toUserId,
                answer,
              }
            );

            ack?.({
              success: true,
            });
          } catch (error) {
            console.error(
              "WebRTC answer relay error:",
              error
            );

            emitSocketError(
              socket,
              "Failed to send WebRTC answer.",
              ack
            );
          }
        }
      );

      /* ========================================================
         WEBRTC ICE CANDIDATE RELAY
      ======================================================== */

      socket.on(
        "webrtc_ice_candidate",
        async (
          payload: WebRTCIceCandidatePayload,
          ack?: SocketAckCallback
        ) => {
          try {
            const currentUserId =
              socket.userId;

            const {
              meetingId,
              toUserId,
              candidate,
            } = payload || {};

            if (!currentUserId) {
              emitSocketError(
                socket,
                "Authentication required.",
                ack
              );

              return;
            }

            if (
              !meetingId ||
              !toUserId ||
              !candidate
            ) {
              emitSocketError(
                socket,
                "Meeting ID, target user and ICE candidate are required.",
                ack
              );

              return;
            }

            const meeting =
              getActiveMeetingParticipant(
                meetingId,
                currentUserId
              );

            if (!meeting) {
              emitSocketError(
                socket,
                "You are not participating in this meeting.",
                ack
              );

              return;
            }

            if (
              !meeting.participants.has(
                toUserId
              )
            ) {
              emitSocketError(
                socket,
                "Target user is not participating in this meeting.",
                ack
              );

              return;
            }

            io.to(
              getUserRoom(
                toUserId
              )
            ).emit(
              "webrtc_ice_candidate",
              {
                meetingId,
                fromUserId:
                  currentUserId,
                toUserId,
                candidate,
              }
            );

            ack?.({
              success: true,
            });
          } catch (error) {
            console.error(
              "WebRTC ICE relay error:",
              error
            );

            emitSocketError(
              socket,
              "Failed to send WebRTC ICE candidate.",
              ack
            );
          }
        }
      );

      /* ========================================================
         LEAVE MEETING
      ======================================================== */

      socket.on(
        "meeting_leave",
        async (
          payload: MeetingParticipantPayload,
          ack?: SocketAckCallback
        ) => {
          try {
            const currentUserId =
              socket.userId;

            const groupId =
              payload?.groupId;

            const meetingId =
              payload?.meetingId;

            if (!currentUserId) {
              emitSocketError(
                socket,
                "Authentication required.",
                ack
              );

              return;
            }

            if (
              !groupId ||
              !meetingId
            ) {
              emitSocketError(
                socket,
                "Group ID and meeting ID are required.",
                ack
              );

              return;
            }

            const meeting =
              activeMeetings.get(
                meetingId
              );

            if (
              !meeting ||
              meeting.groupId !==
                groupId
            ) {
              emitSocketError(
                socket,
                "This meeting is no longer active.",
                ack
              );

              return;
            }

            /*
             * HOST LEAVES
             *
             * Leaving as host ends the meeting.
             */
            if (
              meeting.hostId ===
              currentUserId
            ) {
              const group =
                await CollaborationGroup.findOne(
                  {
                    _id: groupId,
                    members: currentUserId,
                  }
                ).select("members");

              if (group) {
                notifyGroupMembers(
                  io,
                  group.members,
                  "meeting_ended",
                  {
                    meetingId,
                    groupId,
                    hostId:
                      currentUserId,
                    reason:
                      "host_left",
                  },
                  currentUserId
                );
              }

              io.to(
                getMeetingRoom(
                  meetingId
                )
              ).emit(
                "meeting_ended",
                {
                  meetingId,
                  groupId,
                  hostId:
                    currentUserId,
                  reason:
                    "host_left",
                }
              );

              removeActiveMeeting(
                meeting
              );

              socket.leave(
                getMeetingRoom(
                  meetingId
                )
              );

              ack?.({
                success: true,
              });

              console.log(
                `📞 Meeting ended because host left: ${meetingId}`
              );

              return;
            }

            /*
             * NORMAL PARTICIPANT LEAVES
             */
            meeting.participants.delete(
              currentUserId
            );

            socket.leave(
              getMeetingRoom(
                meetingId
              )
            );

            socket.broadcast
              .to(
                getMeetingRoom(
                  meetingId
                )
              )
              .emit(
                "meeting_participant_left",
                {
                  meetingId,
                  groupId,
                  userId:
                    currentUserId,
                }
              );

            if (
              meeting.participants.size ===
              0
            ) {
              removeActiveMeeting(
                meeting
              );
            }

            ack?.({
              success: true,
            });

            console.log(
              `📞 User ${currentUserId} left meeting ${meetingId}`
            );
          } catch (error) {
            console.error(
              "Meeting leave error:",
              error
            );

            emitSocketError(
              socket,
              "Failed to leave meeting.",
              ack
            );
          }
        }
      );

      /* ========================================================
         END MEETING FOR EVERYONE
      ======================================================== */

      socket.on(
        "meeting_end",
        async (
          payload: MeetingEndPayload,
          ack?: SocketAckCallback
        ) => {
          try {
            const currentUserId =
              socket.userId;

            const groupId =
              payload?.groupId;

            const meetingId =
              payload?.meetingId;

            if (!currentUserId) {
              emitSocketError(
                socket,
                "Authentication required.",
                ack
              );

              return;
            }

            if (
              !groupId ||
              !meetingId
            ) {
              emitSocketError(
                socket,
                "Group ID and meeting ID are required.",
                ack
              );

              return;
            }

            const meeting =
              activeMeetings.get(
                meetingId
              );

            if (
              !meeting ||
              meeting.groupId !==
                groupId
            ) {
              emitSocketError(
                socket,
                "This meeting is no longer active.",
                ack
              );

              return;
            }

            if (
              meeting.hostId !==
              currentUserId
            ) {
              emitSocketError(
                socket,
                "Only the meeting host can end the meeting.",
                ack
              );

              return;
            }

            const group =
              await CollaborationGroup.findOne(
                {
                  _id: groupId,
                  members: currentUserId,
                }
              ).select("members");

            if (!group) {
              emitSocketError(
                socket,
                "You are not a member of this collaboration group.",
                ack
              );

              return;
            }

            notifyGroupMembers(
              io,
              group.members,
              "meeting_ended",
              {
                meetingId,
                groupId,
                hostId:
                  currentUserId,
                reason:
                  "host_ended",
              },
              currentUserId
            );

            io.to(
              getMeetingRoom(
                meetingId
              )
            ).emit(
              "meeting_ended",
              {
                meetingId,
                groupId,
                hostId:
                  currentUserId,
                reason:
                  "host_ended",
              }
            );

            removeActiveMeeting(
              meeting
            );

            ack?.({
              success: true,
            });

            console.log(
              `📞 Meeting ended by host: ${meetingId}`
            );
          } catch (error) {
            console.error(
              "Meeting end error:",
              error
            );

            emitSocketError(
              socket,
              "Failed to end the meeting.",
              ack
            );
          }
        }
      );

      /* ========================================================
         DISCONNECT
      ======================================================== */

      socket.on(
        "disconnect",
        (reason) => {
          const disconnectedUserId =
            socket.userId;

          console.log(
            `🔌 User disconnected: ${disconnectedUserId}`,
            reason
          );

          if (!disconnectedUserId) {
            return;
          }

          /*
           * Check all active meetings.
           */
          for (const meeting of Array.from(
            activeMeetings.values()
          )) {
            if (
              !meeting.participants.has(
                disconnectedUserId
              )
            ) {
              continue;
            }

            /* ==================================================
               HOST DISCONNECTED
            ================================================== */

            if (
              meeting.hostId ===
              disconnectedUserId
            ) {
              io.to(
                getMeetingRoom(
                  meeting.meetingId
                )
              ).emit(
                "meeting_ended",
                {
                  meetingId:
                    meeting.meetingId,
                  groupId:
                    meeting.groupId,
                  hostId:
                    disconnectedUserId,
                  reason:
                    "host_disconnected",
                }
              );

              removeActiveMeeting(
                meeting
              );

              console.log(
                `📞 Meeting ended because host disconnected: ${meeting.meetingId}`
              );

              continue;
            }

            /* ==================================================
               NORMAL PARTICIPANT DISCONNECTED
            ================================================== */

            meeting.participants.delete(
              disconnectedUserId
            );

            io.to(
              getMeetingRoom(
                meeting.meetingId
              )
            ).emit(
              "meeting_participant_left",
              {
                meetingId:
                  meeting.meetingId,
                groupId:
                  meeting.groupId,
                userId:
                  disconnectedUserId,
              }
            );

            if (
              meeting.participants.size ===
              0
            ) {
              removeActiveMeeting(
                meeting
              );
            }
          }
        }
      );
    }
  );
};

export default setupSocket;