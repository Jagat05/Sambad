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
## ✅ Sambad Version Progress Checklist

Track your progress across all versions of Sambad:

---

### 🟢 Version 1: Basic Chat App MVP  
🎯 **Goal:** Core chat and org functionality for a working minimum product.

#### 👤 User Authentication & Organization
- [ ] User registration and login using JWT  
- [ ] Create or join organization using unique org code  
- [ ] Role assignment (Admin/Member)  

#### 💬 Private Chat
- [ ] One-to-one private chat between users of same organization  
- [ ] Message history per user pair  
- [ ] Responsive chat UI with message timestamps  

---

### 🟡 Version 2: Enhanced Collaboration  
🎯 **Goal:** Improve user experience and enable group collaboration.

#### 🏘️ Group Chat
- [ ] Admin can create group rooms  
- [ ] Add/remove members in groups  
- [ ] Group messages stored and rendered in real-time  

#### 📋 Dashboard & User Context
- [ ] List of contacts (all org members)  
- [ ] List of available rooms (private/group)  
- [ ] Role display (Admin/Member)  
- [ ] User profile preview  

#### 🧹 UX/UI Enhancements
- [ ] Show active/online users  
- [ ] Typing indicators (optional)  
- [ ] Notification badge for unread messages  

---

### 🔵 Version 3: Advanced & Scalable Version  
🎯 **Goal:** Add enterprise-ready, scalable, and intelligent features.

#### 🔐 Security & Roles
- [ ] Role-based access control to restrict room/message features  
- [ ] Organization-level management panel for Admins  

#### 📊 Advanced Features
- [ ] File sharing (images, docs)  
- [ ] Message reactions (like 👍❤️)  
- [ ] Search functionality (users, messages)  

#### 🔧 System Improvements
- [ ] Socket.IO reconnect logic  
- [ ] Rate limiting & spam protection  
- [ ] Deployment setup (CI/CD)  

---

### 🧩 Summary Progress

- [ ] 🟢 Version 1: Basic Chat App MVP  
- [ ] 🟡 Version 2: Enhanced Collaboration  
- [ ] 🔵 Version 3: Advanced & Scalable Version


---

## 📌 Project Goal
To build a lightweight, fast, and real-time chat system for internal communication within organizations with secure, role-based access.

---

> Designed & Developed by Jagat Joshi
