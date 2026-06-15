const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware"); 
const {
  createGroupChat,
  getUserChats,
  getMessageHistory,
  sendMessage,
  searchMessages,
  markMessagesAsRead,
  addMemberToGroup,
  removeMemberFromGroup,
  renameGroupChat,
} = require("../controllers/chatController");

router.use(protect);

router.get("/", getUserChats);                          
router.post("/group", createGroupChat);                 

router.get("/:chatId/messages", getMessageHistory);         
router.post("/:chatId/messages", sendMessage);                
router.get("/:chatId/messages/search", searchMessages);      
router.patch("/:chatId/messages/read", markMessagesAsRead);  

router.patch("/:chatId/rename", renameGroupChat);      
router.patch("/:chatId/add", addMemberToGroup);        
router.patch("/:chatId/remove", removeMemberFromGroup); 

module.exports = router;
