import z  from 'zod';



export const MessagePayload = z.object({
    type :z.string(),
    from:z.number(),
    to:z.number(),
    content :z.string()

});

export const GroupmessagePayload =z.object({
    type :z.string(),
    CreatedByUserID:z.number(),
    GroupName :z.string(),
    member :z.array(z.number()).optional()
});



export const GroupMembersMessagePayload = z.object({
    type :z.string(),
    CreatedByUserID:z.number(),
    toGroupId:z.string(),
    messageContent :z.string()
})