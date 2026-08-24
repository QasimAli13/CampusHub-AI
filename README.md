# 🎓 CampusHub AI

### Smart University ERP & AI Academic Copilot

<p align="center">
  <strong>A modern full-stack University ERP platform enhanced with an intelligent AI Copilot for academic assistance, analytics, and campus management.</strong>
</p>

<p align="center">
  <a href="https://campus-hub-ai.vercel.app">
    <img src="https://img.shields.io/badge/🚀_Live_Demo-00D26A?style=for-the-badge" alt="Live Demo"/>
  </a>
  <a href="https://campushub-ai-i7y8.onrender.com">
    <img src="https://img.shields.io/badge/⚡_Backend-46E3B7?style=for-the-badge" alt="Backend"/>
  </a>
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React"/>
  <img src="https://img.shields.io/badge/Node.js-22-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/MERN-Stack-000000?style=flat-square" alt="MERN"/>
  <img src="https://img.shields.io/badge/Vite-Fast_Builds-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-UI-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind"/>
  <img src="https://img.shields.io/badge/AI-OpenRouter-FF6B6B?style=flat-square" alt="AI"/>
</p>

---

## 🌐 Live Application

| Service           | URL                                                     |
| ----------------- | ------------------------------------------------------- |
| 🚀 **Frontend**   | [CampusHub AI](https://campus-hub-ai.vercel.app)        |
| ⚡ **Backend API** | [CampusHub API](https://campushub-ai-i7y8.onrender.com) |

---

## 📌 Overview

**CampusHub AI** is a full-stack University Enterprise Resource Planning (ERP) platform built to bring essential academic and campus operations into a single centralized system.

The platform provides role-based dashboards, academic record management, attendance and grading workflows, analytics, secure authentication, and an integrated **AI Academic Copilot**.

The AI Copilot allows students to interact with an intelligent assistant for:

* 📚 Academic explanations
* 🧠 Study assistance
* 📝 Quiz generation
* 🗺️ Study roadmap generation
* 📊 Structured academic information
* 💬 Interactive AI conversations

The application is designed with a modular architecture so that ERP functionality and AI capabilities can evolve independently.

---

# ✨ Features

## 🏛️ University ERP

### 👥 Role-Based Access Control

Different users receive customized experiences based on their role.

* 👨‍💼 Administrator
* 👨‍🏫 Faculty
* 🎓 Student

Each role has access to its own protected workflows and dashboards.

---

### 📚 Academic Management

Centralized academic data management including:

* Course management
* Course registration
* Student records
* Attendance tracking
* Grade management
* Academic performance
* Course-related information

---

### 📊 Analytics & Visualization

Interactive dashboards provide visual insights into academic data.

Powered by **Recharts**, the system can display:

* Performance trends
* Attendance statistics
* Academic metrics
* Course-related analytics
* Student performance information

---

### 🔐 Secure Authentication

Authentication is implemented using:

* JWT-based authentication
* Protected backend routes
* Frontend route guards
* Axios interceptors
* Password hashing
* Environment-based secrets

This keeps protected resources accessible only to authenticated users.

---

# 🤖 AI Academic Copilot

One of the core features of CampusHub AI is its integrated **AI Academic Copilot**.

The Copilot communicates with the backend AI service and provides contextual academic assistance.

### 🧠 AI Capabilities

The assistant can help users with:

**Academic Explanations**

Explain difficult concepts in a structured and understandable way.

**Study Roadmaps**

Generate structured learning plans based on a topic or subject.

**Quiz Generation**

Create practice questions to help students prepare for assessments.

**Structured Responses**

AI responses can include:

* Markdown
* Headings
* Lists
* Tables
* Structured notes
* Step-by-step explanations

### ⚙️ AI Architecture

The AI request flow follows:

```text
User
  │
  ▼
React AI Interface
  │
  ▼
Backend API
  │
  ▼
Prompt Engine
  │
  ▼
OpenRouter
  │
  ▼
AI Model
  │
  ▼
Structured Response
  │
  ▼
React UI
```

The API key remains on the backend rather than being exposed to the frontend.

---

# 🛠️ Tech Stack

## Frontend

* **React 19**
* **Vite**
* **Tailwind CSS**
* **React Router v7**
* **Axios**
* **Recharts**
* **Lucide React**
* **React Hot Toast**

## Backend

* **Node.js**
* **Express.js**
* **JWT**
* **Mongoose**
* **Nodemailer**
* **Socket.io**

## Database

* **MongoDB Atlas**
* **Mongoose ODM**

## AI

* **OpenRouter API**
* **GPT-OSS-120B**
* Custom prompt engine
* Backend AI controller
* Retry / fallback handling

## Deployment

* **Vercel** — Frontend
* **Render** — Backend
* **MongoDB Atlas** — Database

---

# 🏗️ System Architecture

```text
                         ┌─────────────────────┐
                         │      User           │
                         │ Student / Faculty   │
                         │     / Admin         │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   React Frontend    │
                         │ React + Vite        │
                         │ Tailwind CSS        │
                         └──────────┬──────────┘
                                    │
                          REST API / Socket.io
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   Express Backend   │
                         │ Authentication      │
                         │ Business Logic      │
                         │ API Controllers     │
                         └───────┬─────┬───────┘
                                 │     │
                  ┌──────────────┘     └──────────────┐
                  ▼                                   ▼
        ┌──────────────────┐                 ┌──────────────────┐
        │  MongoDB Atlas   │                 │  AI Controller   │
        │  Application DB  │                 │  Prompt Engine   │
        └──────────────────┘                 └────────┬─────────┘
                                                       │
                                                       ▼
                                             ┌──────────────────┐
                                             │    OpenRouter    │
                                             │   AI Provider    │
                                             └──────────────────┘
```

---

# 📁 Project Structure

```text
campushub-ai/
│
├── backend/
│   │
│   ├── config/
│   │   └── database.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── courseController.js
│   │   ├── studentController.js
│   │   ├── analyticsController.js
│   │   └── aiController.js
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── errorMiddleware.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Course.js
│   │   ├── Student.js
│   │   └── ...
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── courseRoutes.js
│   │   ├── studentRoutes.js
│   │   ├── analyticsRoutes.js
│   │   └── aiRoutes.js
│   │
│   ├── utils/
│   │   └── ...
│   │
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── frontend/
│   │
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js
│   │   │
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── AICopilot.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Analytics.jsx
│   │   │   └── ...
│   │   │
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── public/
│   ├── vercel.json
│   └── package.json
│
├── .gitignore
└── README.md
```

---

# 🔒 Security

CampusHub AI follows several security practices to protect application resources.

### 🔑 Authentication

JWT tokens are used to authenticate users and protect private resources.

### 🛡️ Protected Routes

Backend middleware verifies authenticated requests before allowing access to protected APIs.

### 👥 Role Authorization

Different user roles are restricted to the operations they are authorized to perform.

### 🔐 Password Security

Passwords are securely hashed before being stored in the database.

### 🌍 CORS

Backend access is configured to allow requests only from authorized frontend origins.

### 🤫 Environment Variables

Sensitive credentials are stored using environment variables instead of being committed to source control.

### 🤖 AI Key Protection

The OpenRouter API key is stored exclusively on the backend and is never exposed to the client.

---

# 🚀 Getting Started

Follow the steps below to run CampusHub AI locally.

## 1. Clone Repository

```bash
git clone https://github.com/QasimAli13/CampusHub-AI.git
cd campushub-ai
```

---

## 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` directory:

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

OPENROUTER_API_KEY=your_openrouter_api_key

CLIENT_URL=http://localhost:5173

EMAIL_USER=your_email@gmail.com

EMAIL_PASS=your_gmail_app_password
```

Start the development server:

```bash
npm run dev
```

Backend will run on:

```text
http://localhost:5000
```

---

## 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on:

```text
http://localhost:5173
```

---

# 🌍 Deployment

CampusHub AI uses a separate deployment strategy for the frontend and backend.

### Frontend

Deployed using **Vercel**.

```text
React + Vite
      │
      ▼
   Vercel
      │
      ▼
Public Frontend
```

### Backend

Deployed using **Render**.

```text
Node.js + Express
        │
        ▼
      Render
        │
        ▼
    REST API
```

### Database

MongoDB Atlas provides the cloud-hosted database.

```text
Frontend
   │
   ▼
Backend API
   │
   ├──────────────► MongoDB Atlas
   │
   └──────────────► OpenRouter
```

---

# 🔄 Application Flow

### Authentication Flow

```text
Login
  │
  ▼
Credentials Validation
  │
  ▼
Backend Authentication
  │
  ▼
JWT Generated
  │
  ▼
Authenticated Session
  │
  ▼
Protected Dashboard
```

### AI Request Flow

```text
User asks question
        │
        ▼
AI Copilot UI
        │
        ▼
Backend API
        │
        ▼
Prompt Processing
        │
        ▼
OpenRouter API
        │
        ▼
AI Model
        │
        ▼
Formatted Response
        │
        ▼
User
```

---

# 📈 Engineering Highlights

This project was built with a focus on practical full-stack engineering rather than a simple CRUD implementation.

### ⚡ Modular Architecture

Frontend components, backend controllers, routes, models, and middleware are separated into reusable modules.

### 🔄 Centralized API Communication

Axios is configured to provide a centralized communication layer between the frontend and backend.

### 📊 Data Visualization

Recharts is used to transform academic data into interactive visual analytics.

### 🤖 AI Integration

The AI layer is separated from the core ERP logic, allowing AI functionality to evolve independently.

### 🔁 Failure Handling

Backend retry and fallback mechanisms help handle temporary AI/API failures gracefully.

### 🌐 Real-Time Communication

Socket.io provides infrastructure for real-time communication and future collaborative features.

### 📱 Responsive Interface

The frontend is designed to provide a consistent experience across different screen sizes.

---

# 🧪 Development

Run frontend:

```bash
cd frontend
npm run dev
```

Run backend:

```bash
cd backend
npm run dev
```

Build frontend for production:

```bash
cd frontend
npm run build
```

---

# 🔮 Future Improvements

Potential future improvements include:

* [ ] Advanced AI-powered student analytics
* [ ] AI-generated personalized study plans
* [ ] AI document summarization
* [ ] Automated academic recommendations
* [ ] Push notifications
* [ ] Expanded real-time collaboration
* [ ] Mobile application
* [ ] Advanced admin analytics
* [ ] Dockerized production environment
* [ ] CI/CD pipeline
* [ ] Automated testing
* [ ] Infrastructure monitoring

---

# 💡 Why CampusHub AI?

Traditional university systems often separate academic information across multiple platforms.

CampusHub AI aims to bring these workflows together into one intelligent platform:

```text
        UNIVERSITY
            │
   ┌────────┼────────┐
   ▼        ▼        ▼
Students  Faculty  Admin
   │        │        │
   └────────┼────────┘
            ▼
      CampusHub AI
            │
     ┌──────┴──────┐
     ▼             ▼
   ERP          AI Copilot
     │             │
     └──────┬──────┘
            ▼
     Smarter Campus
```

---


# 📊 Project Highlights

| Area              | Implementation            |
| ----------------- | ------------------------- |
| Architecture      | Full-Stack MERN           |
| Frontend          | React + Vite              |
| Backend           | Node.js + Express         |
| Database          | MongoDB Atlas             |
| Authentication    | JWT                       |
| Authorization     | Role-Based Access Control |
| AI                | OpenRouter + GPT-OSS-120B |
| API Communication | Axios                     |
| Charts            | Recharts                  |
| Real-Time         | Socket.io                 |
| Styling           | Tailwind CSS              |
| Deployment        | Vercel + Render           |

---

# 👨‍💻 Author

## Qasim Ali

**BS Software Engineering @ PUCIT**

Full-Stack Developer focused on building scalable applications and exploring **Cloud & DevOps Engineering**.

<p align="center">
  <strong>Built with ❤️, JavaScript & ☕</strong>
</p>

---

# ⭐ Support

If you found this project interesting, consider giving the repository a ⭐.

It helps support the project and motivates further development.

<p align="center">

### 🚀 CampusHub AI

**A smarter way to manage university operations.**

</p>
