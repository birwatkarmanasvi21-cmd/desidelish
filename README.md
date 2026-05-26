# desideslish
# 🍔 Food Ordering System

A full-stack food ordering web application built with **Next.js, React, Node.js, Express, Prisma ORM, and PostgreSQL**.

Users can browse restaurants, filter cuisines, detect their location automatically, manage carts, and place food orders through a responsive and modern interface.

---

## 🚀 Features

* JWT Authentication
* Restaurant & Menu Browsing
* Cuisine Filtering
* Cart Management
* Order Placement
* Order History
* Real-time Location Detection
* REST API Integration
* Responsive UI

---

## 🛠️ Tech Stack

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS

### Backend

* Node.js
* Express.js

### Database

* PostgreSQL

### ORM

* Prisma ORM

### Authentication

* JWT (JSON Web Tokens)

### External APIs

* OpenStreetMap Nominatim API

---

## 📂 Project Structure

```bash
├── app
├── components
├── hooks
├── prisma
├── public
├── utils
├── middleware
├── package.json
└── README.md
```

---

## ⚙️ Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/food-ordering-system.git
cd food-ordering-system
```

---

### 2. Install Dependencies

```bash
npm install
```

---

### 3. Setup Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/fooddb"
JWT_SECRET="your_jwt_secret"
```

---

### 4. Setup Prisma

Run database migrations:

```bash
npx prisma migrate dev
```

Generate Prisma client:

```bash
npx prisma generate
```

---

### 5. Run the Development Server

```bash
npm run dev
```

Visit:

```text
http://localhost:3000
```

---

## 📍 Location Detection

The application uses:

* Browser Geolocation API
* OpenStreetMap Nominatim Reverse Geocoding API

to automatically fetch and autofill user addresses during signup.

---

## 🔄 Application Architecture

```text
Frontend (Next.js / React)
        ↓
REST APIs
        ↓
Backend (Node.js / Express)
        ↓
Prisma ORM
        ↓
PostgreSQL
```

---

## 🔐 Authentication Flow

```text
User Login
    ↓
Backend Validation
    ↓
JWT Token Generation
    ↓
Protected API Access
```

---

## 📈 Future Enhancements

* Online Payment Integration
* Real-time Order Tracking
* Admin Dashboard
* Push Notifications
* Docker Deployment
* Redis Caching

---

## 📜 License

This project is built for educational and learning purposes.
