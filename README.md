# real-time-chat-application
A real-time chat application built with React.js, Node.js, Express.js, MongoDB, and Socket.IO featuring one-to-one messaging, group chats, notifications, and authentication.

# 💬 Real-Time Chat Application

A modern real-time chat application built using the MERN Stack and Socket.IO. The application enables users to communicate instantly through one-to-one messaging, group chats, notifications, and real-time updates.

---

## 🚀 Tech Stack

### Frontend
- React.js
- React Router DOM
- Axios
- Socket.IO Client

### Backend
- Node.js
- Express.js
- Socket.IO
- JWT Authentication
- bcryptjs

### Database
- MongoDB
- Mongoose

### Tools
- Git & GitHub
- VS Code
- Postman
- MongoDB Compass

---

## ✨ Features

### Authentication
- User Registration
- User Login
- JWT Authentication
- Password Encryption

### Real-Time Communication
- One-to-One Chat
- Real-Time Message Delivery
- Online/Offline Status
- Typing Indicator

### Chat Features
- Chat History
- Group Chats
- Read Receipts
- Message Search

### User Experience
- Responsive UI
- Notifications
- Emoji Reactions
- Dark Mode (Optional)

---

## 📁 Project Structure

```bash
real-time-chat-application/

├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── App.jsx
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── sockets/
│   ├── utils/
│   └── server.js
│
├── docs/
│
└── README.md
```

---

## 🗄️ Database Models

### User
```js
{
  name,
  email,
  password,
  avatar,
  isOnline,
  lastSeen
}
```

### Message
```js
{
  sender,
  receiver,
  content,
  read,
  createdAt
}
```

### Group
```js
{
  groupName,
  admin,
  members,
  groupAvatar,
  createdAt
}
```

---

## 👥 Team Members & Responsibilities

### 👑 Mohammad Farhan
**Team Leader, Backend Architect & Integration Lead**

Responsibilities:
- Project Planning
- Database Design
- API Design
- JWT Authentication Integration
- Socket.IO Backend Integration
- Code Review
- Final Testing
- Deployment
- Documentation & Presentation

### 👨‍💻 Member 2
**Authentication & User Management**
- Registration
- Login/Logout
- User Profiles

### 👨‍💻 Member 3
**Real-Time Messaging**
- One-to-One Chat
- Online Status
- Typing Indicator

### 👨‍💻 Member 4
**Chat Features**
- Group Chats
- Message History
- Message Search
- Read Receipts

### 👨‍💻 Member 5
**Frontend UI & Notifications**
- Chat Interface
- Responsive Design
- Notifications
- Emoji Reactions

---

## 🌱 Git Workflow

### Branches

```bash
main
dev
feature/auth
feature/chat
feature/groups
feature/ui
feature/notifications
```

### Rules

- Never push directly to `main`
- Create Pull Requests to `dev`
- Review code before merging
- Keep commit messages meaningful





## 📜 License

This project is developed for academic and learning purposes.
