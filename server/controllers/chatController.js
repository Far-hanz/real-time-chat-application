const Chat=require("../models/Chat");
const User=require("../models/User");
const createGroupChat=async (req, res)=>{
  try{
    const{name, participants }=req.body;
    if (!participants || participants.length < 2) {
      return res
        .status(400)
        .json({ message: "A group chat requires at least 3 members." });
    }

    if (!name || name.trim() === "") {
      return res
        .status(400)
        .json({ message: "Group name is required." });
    }
    const allParticipants = [
      ...new Set([...participants, req.user._id.toString()]),
    ];

    const groupChat = await Chat.create({
      chatName: name.trim(),
      isGroupChat: true,
      participants: allParticipants,
      groupAdmin: req.user._id,
      messages: [],
    });
    const populatedChat = await Chat.findById(groupChat._id)
      .populate("participants", "-password")
      .populate("groupAdmin", "-password");

    res.status(201).json(populatedChat);
  } catch (error) {
    console.error("createGroupChat error:", error.message);
    res.status(500).json({ message: "Server error creating group chat." });
  }
};


const getUserChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: { $elemMatch: { $eq: req.user._id } },
    })
      .populate("participants", "-password")
      .populate("groupAdmin", "-password")
      .sort({ updatedAt: -1 }); 

    res.status(200).json(chats);
  } catch (error) {
    console.error("getUserChats error:", error.message);
    res.status(500).json({ message: "Server error fetching chats." });
  }
};
const getMessageHistory = async (req, res) => {
  try {
    const { chatId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;

    const chat = await Chat.findById(chatId).populate(
      "messages.sender",
      "name email avatar"
    );

    if (!chat) {
      return res.status(404).json({ message: "Chat not found." });
    }


    const isMember = chat.participants.some(
      (p) => p.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({ message: "Access denied." });
    }


    const totalMessages = chat.messages.length;
    const startIndex = Math.max(0, totalMessages - page * limit);
    const endIndex = totalMessages - (page - 1) * limit;
    const paginatedMessages = chat.messages.slice(startIndex, endIndex);

    res.status(200).json({
      messages: paginatedMessages,
      currentPage: page,
      totalPages: Math.ceil(totalMessages / limit),
      totalMessages,
    });
  } catch (error) {
    console.error("getMessageHistory error:", error.message);
    res.status(500).json({ message: "Server error fetching messages." });
  }
};


const sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content } = req.body;

    if (!content || content.trim() === "") {
      return res.status(400).json({ message: "Message cannot be empty." });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found." });
    }


    const isMember = chat.participants.some(
      (p) => p.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({ message: "Access denied." });
    }

    const newMessage = {
      sender: req.user._id,
      content: content.trim(),
      readBy: [{ user: req.user._id }], // Sender has already "read" their own message
    };

    chat.messages.push(newMessage);
    await chat.save();


    const savedMessage = chat.messages[chat.messages.length - 1];
    await chat.populate("messages.sender", "name avatar");

    res.status(201).json(chat.messages[chat.messages.length - 1]);
  } catch (error) {
    console.error("sendMessage error:", error.message);
    res.status(500).json({ message: "Server error sending message." });
  }
};

const searchMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { q } = req.query;

    if (!q || q.trim() === "") {
      return res.status(400).json({ message: "Search query is required." });
    }

    const chat = await Chat.findById(chatId).populate(
      "messages.sender",
      "name avatar"
    );

    if (!chat) {
      return res.status(404).json({ message: "Chat not found." });
    }


    const isMember = chat.participants.some(
      (p) => p.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({ message: "Access denied." });
    }


    const keyword = q.trim().toLowerCase();
    const results = chat.messages.filter(
      (msg) =>
        !msg.isDeleted &&
        msg.content.toLowerCase().includes(keyword)
    );

    res.status(200).json({
      results,
      total: results.length,
      query: q,
    });
  } catch (error) {
    console.error("searchMessages error:", error.message);
    res.status(500).json({ message: "Server error during search." });
  }
};

const markMessagesAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found." });
    }

    const isMember = chat.participants.some(
      (p) => p.toString() === userId.toString()
    );
    if (!isMember) {
      return res.status(403).json({ message: "Access denied." });
    }

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
    }

    res.status(200).json({ message: "Messages marked as read." });
  } catch (error) {
    console.error("markMessagesAsRead error:", error.message);
    res.status(500).json({ message: "Server error marking messages as read." });
  }
};

const addMemberToGroup = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { userId } = req.body;

    const chat = await Chat.findById(chatId);
    if (!chat || !chat.isGroupChat) {
      return res.status(404).json({ message: "Group chat not found." });
    }

    if (chat.groupAdmin.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Only the group admin can add members." });
    }

    if (chat.participants.includes(userId)) {
      return res
        .status(400)
        .json({ message: "User is already in this group." });
    }

    chat.participants.push(userId);
    await chat.save();

    const updated = await Chat.findById(chatId)
      .populate("participants", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(updated);
  } catch (error) {
    console.error("addMemberToGroup error:", error.message);
    res.status(500).json({ message: "Server error adding member." });
  }
};


const removeMemberFromGroup = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { userId } = req.body;

    const chat = await Chat.findById(chatId);
    if (!chat || !chat.isGroupChat) {
      return res.status(404).json({ message: "Group chat not found." });
    }

    const isAdmin = chat.groupAdmin.toString() === req.user._id.toString();
    const isSelf = userId === req.user._id.toString();

    if (!isAdmin && !isSelf) {
      return res.status(403).json({ message: "Permission denied." });
    }

    chat.participants = chat.participants.filter(
      (p) => p.toString() !== userId
    );
    await chat.save();

    const updated = await Chat.findById(chatId)
      .populate("participants", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(updated);
  } catch (error) {
    console.error("removeMemberFromGroup error:", error.message);
    res.status(500).json({ message: "Server error removing member." });
  }
};

const renameGroupChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { name } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Group name cannot be empty." });
    }

    const chat = await Chat.findById(chatId);
    if (!chat || !chat.isGroupChat) {
      return res.status(404).json({ message: "Group chat not found." });
    }

    if (chat.groupAdmin.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Only the group admin can rename the group." });
    }

    chat.chatName = name.trim();
    await chat.save();

    res.status(200).json(chat);
  } catch (error) {
    console.error("renameGroupChat error:", error.message);
    res.status(500).json({ message: "Server error renaming group." });
  }
};

module.exports = {
  createGroupChat,
  getUserChats,
  getMessageHistory,
  sendMessage,
  searchMessages,
  markMessagesAsRead,
  addMemberToGroup,
  removeMemberFromGroup,
  renameGroupChat,
};
