# 🗨️ Sambad - Organization Chat App

**Sambad** is a secure and scalable real-time chat platform tailored for organizations. Users can create or join an organization, engage in private or group chats, and collaborate in a shared digital workspace. Built using the **MERN stack**, Sambad focuses on simplicity, role-based access, and real-time communication.

---

## 📚 Table of Contents

- [🚀 Tech Stack](#-tech-stack)  
- [📁 Folder Structure](#-folder-structure)  
- [🔧 Installation & Setup](#-installation--setup)  
- [🌀 Project Workflow](#-project-workflow)  
- [🧩 Version Roadmap](#-version-roadmap)  
- [🎯 Project Goal](#-project-goal)  
- [✍️ Author](#-author)

---

## 🚀 Tech Stack

### Backend
- Node.js  
- Express.js  
- MongoDB + Mongoose  
- Socket.IO  
- JWT (Authentication)  
- Bcrypt.js (Password Hashing)

### Frontend
- Next.js (React Framework)  
- Redux Toolkit (State Management)  
- Tailwind CSS (Styling)  
- Axios (API Calls)  
- Socket.IO Client (Real-Time Messaging)

---

## 📁 Folder Structure

```bash
sambad/
│
├── server/
│   └── src/   
│      ├── controllers/           # Controller logic for API endpoints
│      ├── models/                # Mongoose schemas
│      ├── routes/                # Express route definitions
│      ├── socket/                # Socket.IO event handlers
│      ├── middleware/            # Authentication and error handling middleware
│   ├── .env                   # Environment variables for backend
│   ├── package.json           # Server dependencies and scripts
│   └── index.js               # Main server entry point
├── frontend/
│   └── src/
│      ├── components/            # Reusable UI components
│      ├── pages/                 # Next.js pages (routes)
│      ├── redux/                 # Redux Toolkit slices and store config
│      ├── utils/                 # Utility functions and helpers
│   ├── tailwind.config.js     # Tailwind CSS configuration
│   ├── package.json           # Client dependencies and scripts
│
├── .gitignore                 # Git ignore rules
├── README.md                  # Project documentation
```

---

## 🔧 Installation & Setup

### Prerequisites
- Node.js ≥ 18  
- MongoDB (local or Atlas)  
- Git

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/Jagat05/Sambad.git
   cd Sambad
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Environment Variables**  
   Create a `.env` file in the `backend/` directory:
   ```env
   PORT=Your_backend_port
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   ```

---

## 🧩 Version Roadmap

### 🟢 Version 1: Basic Chat App MVP  
🎯 **Goal:** Core chat and organization functionality for a working minimum product.

#### 👤 User Authentication & Organization
- [x] User registration and login using JWT  
- [ ] Create or join organization using unique org code  
- [ ] Role assignment (Admin/Member)

#### 💬 Private Chat
- [ ] One-to-one private chat between users of same organization  
- [ ] Message history per user pair  
- [ ] Responsive chat UI with message timestamps  

---

### 🟡 Version 2: Enhanced Collaboration  
🎯 **Goal:** Improve user experience and enable group collaboration.

#### 🧑‍🤝‍🧑 Group Chat
- [ ] Admin can create group rooms  
- [ ] Add/remove members in groups  
- [ ] Group messages stored and rendered in real-time  

#### 📋 Dashboard & User Context
- [ ] List of contacts (all org members)  
- [ ] List of available rooms (private/group)  
- [ ] Role display (Admin/Member)  
- [ ] User profile preview  

#### 🎨 UX/UI Enhancements
- [ ] Show active/online users  
- [ ] Typing indicators (optional)  
- [ ] Notification badge for unread messages  

---

### 🔵 Version 3: Advanced & Scalable Version  
🎯 **Goal:** Add enterprise-ready, scalable, and intelligent features.

#### 🔐 Security & Roles
- [ ] Role-based access control to restrict room/message features  
- [ ] Organization-level management panel for Admins  

#### 🌟 Advanced Features
- [ ] File sharing (images, docs)  
- [ ] Message reactions (like 👍❤️)  
- [ ] Search functionality (users, messages)  

#### ⚙️ System Improvements
- [ ] Socket.IO reconnect logic  
- [ ] Rate limiting & spam protection  

---

## 🌀 Project Workflow

This section outlines the full journey of a user in the **Sambad** platform — from account creation to real-time chat.

---

### 👤 1. User Registration
- 🔹 A new user signs up via the registration form.  
- 🔹 They have two choices:
  - **Create a new organization** → Assigned role: `Admin`.  
  - **Join an existing organization** via unique code → Assigned role: `Member`.  
- 🔹 JWT is issued on successful registration.

---

### 🔐 2. User Login
- 🔹 Users log in using their email and password.  
- 🔹 Upon success:
  - JWT is issued and stored on the frontend (e.g., localStorage).  
  - User’s role and organization info are fetched.  
- 🔹 Authenticated users are redirected to the dashboard.

---

### 🏠 3. Dashboard
- 🔹 Displays:
  - All **contacts** (members of the same organization).  
  - All **rooms** (private & group).  
  - Current user info (username, role, profile).  
- 🔹 Admins get extra options like **Create Room**, **Manage Members**, etc.

---

### 📩 4. One-to-One Private Chat
- 🔹 User selects a contact to start chatting.  
- 🔹 A private room (or conversation ID) is created if it doesn't already exist.  
- 🔹 Messages are:
  - Stored in the database (with sender, receiver, timestamps).  
  - Emitted in real-time using Socket.IO.

---

### 👥 5. Group Chat (Admin Only)
- 🔹 Admin users can create group chat rooms.  
- 🔹 Members of the same organization are added.  
- 🔹 Messages sent in group chat:
  - Are visible to all group members.  
  - Support real-time updates using Socket.IO.

---

## 🎯 Project Goal

Build a lightweight, real-time organizational communication tool that is **fast**, **secure**, and **user-friendly**, with **role-based access** and **expandable features**.

---

## ✍️ Author

- Jagat Joshi  
- [GitHub](https://github.com/Jagat05)
