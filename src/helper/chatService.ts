import { clients, Groups } from "../utils/globalClient";
import { GroupMessagesModel, GroupsModel, MessagesModel } from "../models";
import mongoose from "mongoose";
import { response } from "express";

// Function to send a message to a specific user
export async function sendMessageToUser(
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

    await MessagesModel.create({
      messageId: new mongoose.Types.ObjectId(),
      sender: fromUserID,
      receiver: toUserId,
      content: messageContent,
    })
      .then(() => {
        console.log("Message Added Successfully");
      })
      .catch((e) => {
        console.log("Error Occured while saving Messaged", e.message);
      });
  } else {
    console.log(`User ${toUserId} is not connected.`);
  }
}

export async function sendMessageToGroupMembers(
  ExistingMemberUserId: number,
  toGroupId: mongoose.Schema.Types.ObjectId,
  messageContent: string
) {
  try {
    const GroupDetails = await GroupsModel.findById(toGroupId)
      .select("members")
      .lean();

    if (
      !GroupDetails ||
      !GroupDetails.Members ||
      GroupDetails.Members.length === 0
    ) {
      throw new Error("Group not found or has no members.");
    }

    for (const memberId of GroupDetails.Members) {
      if (memberId === ExistingMemberUserId) continue;

      const memberSocket = clients[memberId];

      if (memberSocket && memberSocket.readyState === WebSocket.OPEN) {
        memberSocket.send(
          JSON.stringify({
            from: ExistingMemberUserId,
            toGroup: toGroupId,
            content: messageContent,
          })
        );

        console.log(`Message sent to member: ${memberId}`);
      }
    }

    await MessagesModel.create({
      messageId: new mongoose.Types.ObjectId(),
      sender: ExistingMemberUserId,
      receiverGroup: toGroupId,
      content: messageContent,
    });

    console.log("Message successfully sent to group and saved to database.");
  } catch (error) {
    console.error("Error sending message to group members:", error);
  }
}

// Creating Group
export async function CreateGroup(
  CreatedByUserID: number,
  GroupName: string,
  member: number[] | undefined
) {
  //  Creating group
  try {
    const isCreated = await GroupsModel.create({
      GroupId: new mongoose.Types.ObjectId(),
      CreatedByUserID,
      GroupName,
    });

    if (isCreated) {
      return {
        Group: GroupName,
        status: 200,
        message: "Operation successful",
      };
    }
  } catch (error: any) {
    console.log("Error Occured :- ", error.message);
  }
}

// Adding memeber in groups
export async function Add_Members(
  CreatedByUserID: number,
  GroupName: string,
  member: number[]
) {
  //find the group
  const isGroupPresent = await GroupsModel.findOne({
    GroupName: GroupName,
  });

  if (isGroupPresent) {
    let Added: boolean = true;
    let New_members: number[] = member;
    New_members.forEach(async (m) => {
      try {
        isGroupPresent.Members.push(m);
        await isGroupPresent.save();
      } catch (error) {
        console.log("Error Occured while adding the member");
        Added = false;
        return;
      }
    });
    return {
      Added,
      createdBy: CreatedByUserID,
    };
  }
}
