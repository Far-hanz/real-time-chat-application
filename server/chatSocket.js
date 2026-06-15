const Chat = require("../models/Chat");

const registerChatSocketEvents = (io, socket) => {
  const userId = socket.user._id; 

  socket.on("join_chat", (chatId) => {
    socket.join(chatId);
    console.log(`User ${userId} joined room: ${chatId}`);
  });

  socket.on("leave_chat", (chatId) => {
    socket.leave(chatId);
    console.log(`User ${userId} left room: ${chatId}`);
  });

 
  socket.on("send_message", async ({ chatId, content }) => {
    try {
      const chat = await Chat.findById(chatId);
      if (!chat) return;

      const isMember = chat.participants.some(
        (p) => p.toString() === userId.toString()
      );
      if (!isMember) return;

      const newMessage = {
        sender: userId,
        content: content.trim(),
        readBy: [{ user: userId }],
      };

      chat.messages.push(newMessage);
      await chat.save();

      await chat.populate("messages.sender", "name avatar");
      const savedMsg = chat.messages[chat.messages.length - 1];

      io.to(chatId).emit("new_message", {
        chatId,
        message: savedMsg,
      });
    } catch (err) {
      socket.emit("error", { message: "Failed to send message." });
    }
  });

  socket.on("mark_read", async ({ chatId }) => {
    try {
      const chat = await Chat.findById(chatId);
      if (!chat) return;

      let updated = false;
      chat.messages.forEach((msg) => {
        const alreadyRead = msg.readBy.some(
          (r) => r.user.toString() === userId.toString()
        );
        if (!alreadyRead && msg.sender.toString() !== userId.toString()) {
          msg.readBy.push({ user: userId, readAt: new Date() });
          updated = true;
        }
      });

      if (updated) {
        await chat.save();
        // Notify all members in the room that this user has seen the messages
        socket.to(chatId).emit("messages_read", {
          chatId,
          readBy: userId,
          readAt: new Date(),
        });
      }
    } catch (err) {
      console.error("mark_read error:", err.message);
    }
  });

  socket.on("member_added", ({ chatId, newMember }) => {
    io.to(chatId).emit("group_updated", {
      chatId,
      action: "member_added",
      user: newMember,
    });
  });

  socket.on("member_removed", ({ chatId, removedMember }) => {
    io.to(chatId).emit("group_updated", {
      chatId,
      action: "member_removed",
      user: removedMember,
    });
  });

  socket.on("group_renamed", ({ chatId, newName }) => {
    io.to(chatId).emit("group_updated", {
      chatId,
      action: "renamed",
      newName,
    });
  });
};

module.exports = { registerChatSocketEvents };



