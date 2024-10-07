import express, { json, raw } from "express";
import { WebSocketServer, WebSocket, RawData } from "ws";

const app = express();
const httpServer = app.listen(8080);

const wss = new WebSocketServer({ server: httpServer });

// Client connections object
const clients: {
  [key: string]: WebSocket;
} = {};

// Connectng function
wss.on("connection", (ws, req) => {
  let userId: number;
  userId = Math.floor(Math.random() * 10000); // User sends their ID on connection
  clients[userId] = ws; // Map WebSocket to this userId
  ws.send(`You are connected as user ${userId}`);

  // Handle incoming messages
  ws.on("message", (message: string) => {
    let parsedMessage;

    try {
      parsedMessage = JSON.parse(message);
    } catch (error) {
      ws.send("Invalid message format");
      return;
    }

    switch (parsedMessage.type) {
      case "private_message":
        sendMessageToUser(
          parsedMessage.from,
          parsedMessage.to,
          parsedMessage.content
        );
        break;

      default:
        ws.send("Unknown message type");
    }
  });

  // Handle user disconnection
  ws.on("close", () => {
    console.log(`User ${userId} disconnected`);
    delete clients[userId];
  });
});

// Function to send a message to a specific user

function sendMessageToUser(
  fromUserID: number,
  toUserId: number,
  messageContent: string
) {
  const recipientSocket = clients[toUserId];

  if (recipientSocket) {
    recipientSocket.send(
      JSON.stringify({
        from: fromUserID, // You can customize this field
        content: messageContent,
      })
    );
  } else {
    console.log(`User ${toUserId} is not connected.`);
  }
}

console.log("WebSocket server is running on ws://localhost:8080");
