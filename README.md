# 🍽️ ShareMeal – Food Donation Platform

ShareMeal is a full-stack web application designed to reduce food waste by connecting food donors with NGOs. It enables users to donate surplus food and allows NGOs to efficiently collect and distribute it to people in need.

---

## 🚀 Live Demo

👉 https://sharemeal.online/

---

## 📂 GitHub Repository

👉 https://github.com/YuvrajS99/ShareMeal

---

## 📌 Features

* 🔐 Secure Authentication using JWT
* 👥 Role-based Access (Donor & NGO)
* 🍱 Food Donation System
* 📊 Donor Dashboard (Track donations & status)
* 🏢 NGO Dashboard (Manage requests & pickups)
* 📄 Donation History Tracking
* 📬 Contact Form with Email Integration
* 🏆 Leaderboard System
* 🌙 Dark Mode Support

---

## 🛠️ Tech Stack

### Frontend

* React.js (Vite)
* Tailwind CSS
* React Router

### Backend

* Node.js
* Express.js
* MongoDB Atlas
* Mongoose

### Other Tools

* JWT Authentication
* Nodemailer (Email Service)
* Render (Backend Deployment)
* Vercel (Frontend Deployment)

---

## 📂 Project Structure

```
ShareMeal/
│
├── backend/
│   ├── routes/
│   ├── models/
│   ├── controllers/
│   └── server.js
│
├── src/
│   ├── pages/
│   ├── components/
│   ├── services/
│   └── App.jsx
│
└── README.md
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository

```bash
git clone https://github.com/YuvrajS99/ShareMeal.git
cd ShareMeal
```

---

### 2️⃣ Setup Backend

```bash
cd backend
npm install
```

Create `.env` file:

```
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
EMAIL_USER=your_email
EMAIL_PASS=your_app_password
EMAIL_FROM=your_email
```

Run backend:

```bash
npm start
```

---

### 3️⃣ Setup Frontend

```bash
cd ..
npm install
npm run dev
```

---

## 🌐 Deployment

* Frontend: Vercel
* Backend: Render
* Database: MongoDB Atlas

---

## 🔐 Environment Variables

| Variable   | Description               |
| ---------- | ------------------------- |
| MONGO_URI  | MongoDB connection string |
| JWT_SECRET | Secret key for JWT        |
| EMAIL_USER | Email sender              |
| EMAIL_PASS | Email app password        |

---

## 📈 Future Enhancements

* 🤖 AI-based NGO Recommendation
* 📍 Location-based Matching
* 🔔 Real-time Notifications
* 📱 Mobile App Integration
* 💬 Chat Support

---

## 👨‍💻 Team Members

* Tushar Dhamane
* Rohit Rode
* Yuvraj Sanap
* Sanskar Shinde

---

## 🎯 Vision

To build a platform that minimizes food waste and helps distribute surplus food to those in need through technology.

---

## ⭐ Support

If you like this project, give it a ⭐ on GitHub!
