# 🚀 Real-Time Kanban Board with MERN & Socket.io

A collaborative, real-time project management tool built for the 2026 Internship Selection Task. Features instant synchronization, drag-and-drop task management, and cloud-native file attachments.

---

## ✨ Key Features

### 🔄 Real-Time Collaboration

- **Instant Sync:** Updates (Drag & Drop, Edits, Deletes) are broadcast instantly to all connected clients using **Socket.io**.
- **Live Visuals:** Changes appear without refreshing the page.

### 📋 Task Management

- **Drag-and-Drop:** Intuitive interface using `@hello-pangea/dnd` to move tasks between _Todo_, _In Progress_, and _Done_.
- **Rich Media:** Image attachments are uploaded directly to **Cloudinary** for optimized, persistent storage.
- **Priority Handling:** Visual badges for High, Medium, and Low priority tasks.

### 🛠️ Technical Depth

- **Optimistic UI:** State updates immediately on the client for a "lag-free" feel, syncing with the backend in the background.
- **Robust Backend:** MongoDB Schema validation ensures data integrity.
- **Visualization:** Integrated charts to track task distribution.

---

## ⚙️ Tech Stack

| Domain        | Technology                                        |
| ------------- | ------------------------------------------------- |
| **Frontend**  | React.js, Vite, Tailwind/CSS, React Beautiful DnD |
| **Backend**   | Node.js, Express.js                               |
| **Real-Time** | Socket.io (Bi-directional communication)          |
| **Database**  | MongoDB Atlas (Mongoose ODM)                      |
| **Storage**   | Cloudinary (Image/File hosting)                   |
| **Testing**   | Vitest & React Testing Library                    |

---

## 🚀 Installation & Setup

### Prerequisites

- Node.js (v16+)
- MongoDB URI
- Cloudinary Account

### 1. Clone the Repository

```bash
git clone https://github.com/atif0911/websocket-kanban-vitest-playwright-2026.git
cd websocket-kanban-vitest-playwright-2026

### 2. Backend Setup
Navigate to the server folder and install dependencies.

cd backend
npm install

Create a .env file in /backend:
PORT=5000
MONGO_URI=your_mongodb_connection_string
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name

Start the server:
npm run dev
# Server running on port 5000


### 3. Frontend Setup
Open a new terminal, navigate to the client folder.
cd client
npm install

Start the React app:
npm run dev
# App running at http://localhost:3000

🧪 Testing
1. This project includes Unit Tests for UI components.
# Run tests
npm test
2. This project includes UI test
npx playwright test

👤 Author
Atif Ali Sardar
Role: Full Stack Developer
LinkedIn: https://www.linkedin.com/in/atif-ali-sardar-9131a424a
Github: https://github.com/atif0911/
College: Heritage Institute of Technology
Project: Internship Selection Task 2026
```
