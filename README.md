# Sambad
# 🗨️ Sambad - Organization Chat App

**Sambad** is a secure and scalable real-time chat platform tailored for organizations. Users can create or join an organization, engage in one-to-one or group chats, and collaborate within a shared digital workspace. Built using the **MERN stack**, Sambad emphasizes simplicity, role-based access, and fast communication.

---

## 🚀 Technology Stack

### 🛠️ Backend
- **Node.js**
- **Express.js**
- **MongoDB + Mongoose**
- **Socket.IO** (for real-time communication)
- **JWT** (for authentication)
- **Bcrypt.js** (for password hashing)

### 💻 Frontend
- **Next.js** (React framework)
- **Tailwind CSS** (styling)
- **Axios** (API communication)
- **Zustand / Context API** (state management)
- **Socket.IO Client** (real-time frontend sync)

---

## ✨ Features

- 🔐 Secure Login & Signup with JWT Authentication  
- 🏢 Organization Creation or Join via Unique Code  
- 👥 Role-based Access (Admin / Member)  
- 💬 One-to-One Private Chat within Organization  
- 🏘️ Group Chat Rooms (created by Admin)  
- ⚡ Real-time Messaging using Socket.IO  
- 🔎 Dashboard with Contacts & Rooms  
- 📱 Fully responsive modern UI  

---

## 🔄 Full User Workflow

### 👤 1. User Registration
- ➕ **Create Organization:** Becomes `Admin`
- 🔑 **Join via Org Code:** Becomes `Member`

### 🔐 2. Login
- ✅ JWT issued on successful login
- 🔒 Access protected resources using token

### 🏠 3. Dashboard
- 👥 View Contacts (other users in same organization)
- 🏘️ View Rooms (Group or Private)

### 📩 4. One-to-One Chat
- Select contact from dashboard
- Private room is created (if not exists)
- Real-time messages sent and received

### 👥 5. Group Chat (Admin only)
- Admin creates group room
- Adds members from organization
- Group chat is accessible in dashboard

### ⚡ 6. Real-Time Chat
- Socket.IO manages:
  - Room joining
  - Message broadcasting
  - Typing indicators (optional)

---

## 🧱 5 Development Phases ✅

Use the checklist below to track your progress:

### ✅ Phase 1: User Authentication & Organization System
- [ ] Create Organization model and join code system
- [ ] Register user with new org (Admin)
- [ ] Register user with existing org code (Member)
- [ ] JWT authentication setup

### ✅ Phase 2: Dashboard & Contact Management
- [ ] Fetch all users in same org (except self)
- [ ] Display contacts dynamically
- [ ] Role detection (Admin/Member)

### ✅ Phase 3: Chat Room System
- [ ] Create one-to-one chat rooms (if not exist)
- [ ] Create group rooms (Admin only)
- [ ] Fetch user-specific rooms

### ✅ Phase 4: Messaging System
- [ ] Send & store messages (private/group)
- [ ] Display messages in chat UI
- [ ] Show sender info and timestamps

### ✅ Phase 5: Real-Time Integration (Socket.IO)
- [ ] Setup socket connection on both ends
- [ ] Join rooms dynamically
- [ ] Broadcast & receive new messages in real-time

---

## 📌 Project Goal
To build a lightweight, fast, and real-time chat system for internal communication within organizations with secure, role-based access.

---

> Designed & Developed by Jagat Joshi
