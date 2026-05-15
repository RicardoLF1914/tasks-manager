# 📝 Tasks

A full-stack CRUD task management application built with vanilla JavaScript, Node.js, and a REST API — no frameworks, no external dependencies.

![HTML](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

---

## ✨ Features

- Create, inline-edit, complete, and delete tasks
- Optional task description with inline editing support
- Task detail modal showing full info fetched by ID
- Priority selector (High, Medium, Low) with visual indicators (colored border + badge)
- Status filters (All, Pending, Completed) with dynamic count
- Progress bar showing completion percentage
- SQLite persistence — tasks survive server restarts
- Error handling on both backend and frontend with user feedback
- Light and dark mode with preference saved in localStorage
- Responsive design

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | HTML, CSS, JavaScript (ES6+) |
| Backend | Node.js (native modules: `http`, `fs`, `path`) |
| Database | SQLite via `better-sqlite3` |
| Version control | Git + Conventional Commits |

---

## 🗂️ Project Structure

```
tasks-manager/
├── public/
│   ├── index.html        # Interface structure
│   ├── styles.css        # Styles and layout
│   └── app.js            # Frontend logic and API calls
├── server/
│   ├── server.js         # HTTP server and static file serving
│   ├── routes.js         # REST API routing
│   └── taskService.js    # CRUD operations and SQLite persistence
├── package.json
└── README.md
```

---

## 🚀 Getting Started

**Requirements:** [Node.js](https://nodejs.org) v18 or higher.

```bash
# 1. Clone the repository
git clone https://github.com/RicardoLF1914/tasks-manager.git

# 2. Enter the project folder
cd tasks-manager

# 3. Install dependencies
npm install

# 4. Start the server
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/tasks` | Returns all tasks |
| GET | `/tasks/:id` | Returns a specific task by ID |
| POST | `/tasks` | Creates a new task |
| PUT | `/tasks/:id` | Updates a task |
| DELETE | `/tasks/:id` | Removes a task |

---

## 👨‍💻 Author

**Ricardo Linhares**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/ricardo-linhares-0a914a287/)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/RicardoLF1914)

---

<p align="center">Made by Ricardo Linhares</p>