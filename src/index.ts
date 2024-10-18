import express from "express";
import { run } from "./db";
import { WebSocketServer, WebSocket } from "ws";
import { clients } from "./utils/globalClient";
import {
  sendMessageToGroupMembers,
  sendMessageToUser,
  CreateGroup,
} from "./helper";
import { GroupMembersMessagePayload, MessagePayload } from "./types/MessageInput";
import { Add_Members } from "./helper/chatService";

const app = express();
const httpServer = app.listen(8080, () => {
  console.log("WebSocket server is running on ws://localhost:8080");
});

run(); // Connecting to the database
const wss = new WebSocketServer({ server: httpServer });

// Connection function
wss.on("connection", (ws: WebSocket, req) => {
  const userId = Math.floor(Math.random() * 1000000); // Generate a userId for the client
  clients[userId] = ws; // Map WebSocket to this userId

  // Notify the client that they are connected
  ws.send(`You are connected as user ${userId}`);

  // Handle incoming messages
  ws.on("message", (data) => {
    const message = data.toString(); // Convert Buffer to string
    let parsedMessage;
    let parsedPayloadMessage;
    let parsedGroupPayload;

    try {
      parsedMessage = JSON.parse(message);

      // Validate and parse payloads based on message type
      if (parsedMessage.type === "private_message") {
        parsedPayloadMessage = MessagePayload.safeParse(parsedMessage);
        if (parsedPayloadMessage.success) {
          handlePrivateMessage(parsedPayloadMessage.data, ws);
        } else {
          ws.send("Invalid private message payload.");
        }
      } else if (
        parsedMessage.type === "create_group" ||
        parsedMessage.type === "add_members" ||
        parsedMessage.type === "group_message"
      ) {
        parsedGroupPayload = GroupMembersMessagePayload.safeParse(parsedMessage);
        if (parsedGroupPayload.success) {
          handleGroupMessage(parsedGroupPayload.data, ws);
        } else {
          ws.send("Invalid group message payload.");
        }
      } else {
        ws.send("Unknown message type.");
      }
    } catch (error: any) {
      ws.send("Invalid message format.");
      console.error("Message parsing error:", error);
    }
  });

  // Handle user disconnection
  ws.on("close", () => {
    console.log(`User ${userId} disconnected`);
    delete clients[userId];
  });
});

// Helper function to handle private messages
function handlePrivateMessage(parsedPayload: any, ws: WebSocket) {
  sendMessageToUser(
    parsedPayload.from,
    parsedPayload.to,
    parsedPayload.content
  );
}

// Helper function to handle group messages
function handleGroupMessage(parsedGroupPayload: any, ws: WebSocket) {
  switch (parsedGroupPayload.type) {
    case "create_group":
      handleCreateGroup(parsedGroupPayload, ws);
      break;

    case "add_members":
      handleAddMembers(parsedGroupPayload, ws);
      break;

    case "group_message":
      sendMessageToGroupMembers(
        parsedGroupPayload.from,
        parsedGroupPayload.to,
        parsedGroupPayload.content
      );
      break;

    default:
      ws.send("Unknown group message type");
  }
}

// Helper function to handle group creation
async function handleCreateGroup(parsedGroupPayload: any, ws: WebSocket) {
  try {
    const isCreated = await CreateGroup(
      parsedGroupPayload.CreatedByUserID,
      parsedGroupPayload.GroupName,
      parsedGroupPayload.member
    );

    if (isCreated) {
      ws.send(`Group Created by ${parsedGroupPayload.CreatedByUserID}`);
    } else {
      ws.send("Error Occurred while Creating Group");
    }
  } catch (error) {
    ws.send("Error during group creation process.");
    console.error("Create group error:", error);
  }
}

// Helper function to handle adding members to a group
async function handleAddMembers(parsedGroupPayload: any, ws: WebSocket) {
  try {
    const isAdded = await Add_Members(
      parsedGroupPayload.CreatedByUserID,
      parsedGroupPayload.GroupName,
      parsedGroupPayload.member
    );

    if (isAdded?.Added) {
      ws.send(`Members Added by ${isAdded.createdBy}`);
    } else {
      ws.send("Error Occurred while Adding Members");
    }
  } catch (error) {
    ws.send("Error during adding members process.");
    console.error("Add members error:", error);
  }
}
