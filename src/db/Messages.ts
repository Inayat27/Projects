import mongoose from "mongoose";

export interface MessageType {
  messageId: { type: mongoose.Schema.Types.ObjectId, default: mongoose.Types.ObjectId },
  sender: number;
  receiver: number;
  content: string;
  Attachments: string[];
}
export interface GroupMessageType {
  messageId: { type: mongoose.Schema.Types.ObjectId, default: mongoose.Types.ObjectId },
  sender: number;
  GroupId: { type: mongoose.Schema.Types.ObjectId},
  content: string;
  Attachments: string[];
}

export const MessageSchema = new mongoose.Schema<MessageType>(
  {
    messageId:{ type: mongoose.Schema.Types.ObjectId, default: mongoose.Types.ObjectId },
    sender: { type: Number, required: true },
    receiver: { type: Number, required: true },
    content:{type:String},
    Attachments: { type: [String] },
  },
  { timestamps: true }
);

export const GroupMessageSchema = new mongoose.Schema<GroupMessageType>(
  {
    messageId:{ type: mongoose.Schema.Types.ObjectId, default: mongoose.Types.ObjectId },
    sender: { type: Number, required: true },
    GroupId: { type: Number, required: true },
    content:{type:String},
    Attachments: { type: [String] },
  },
  { timestamps: true }
);
