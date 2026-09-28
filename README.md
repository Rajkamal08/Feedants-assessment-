# 🏆 Feedants — Competition Details Screen

> **A highly robust, production-ready full-stack module for competition lifecycle management and atomic registrations.**

[![Backend](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-green)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Database-MongoDB%20%2B%20Mongoose-blue)](https://www.mongodb.com/)
[![Mobile](https://img.shields.io/badge/Mobile-React%20Native-61DAFB)](https://reactnative.dev)
[![Architecture](https://img.shields.io/badge/Architecture-Atomic%20Transactions-orange)]()

---

## 🔗 Live Demos & Links

- **🎥 Screen Recording Demo:** `[Insert link to your video here]`
- **💻 GitHub Repository:** [https://github.com/Rajkamal08/Feedants-assessment-](https://github.com/Rajkamal08/Feedants-assessment-)

---

## 📱 What is this module?

This project implements the **Competition Details Screen** for the Feedants app as requested in the technical assessment. It is not just a UI clone—it is a fully functional, database-driven feature that manages competition availability, user registration state, capacity counting, and date-based lifecycle events.

**Key capabilities you can test in the app right now:**
1. **Dynamic Registration State:** Starts as "Register Now" with 19/20 spots. Tap it to see it instantly transition to "Registered / Upload Submission" with 20/20 spots.
2. **Race-Condition Proof:** The backend strictly rejects double-registrations or over-bookings using an atomic database query.
3. **Live Countdown Timer:** Calculates time remaining strictly from the backend's `registrationClose` deadline.
4. **Interactive UI Tabs:** Dynamic state management for "About", "Judging", and "Rules".
5. **Native Share API:** Tap "Refer Now" or "Copy Link" to trigger the device's native share sheet.

---

## 🏗️ Architecture

```text
┌─────────────────────────────────────────────────────┐
│              React Native Mobile App                 │
│  UI fetches competition & user state on mount       │
│  Renders UI (Countdown, Capacity, Tabs, Button)     │
│  Sends POST request on "Register Now" tap           │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP / JSON
┌──────────────────────▼──────────────────────────────┐
│         Node.js + Express.js Backend                 │
│                                                      │
│  GET  /api/competitions/:id?userId=...              │
│  POST /api/competitions/:id/register                │
│                                                      │
│  * Handles Date validation & atomic spot updates     │
└──────────────────────┬──────────────────────────────┘
                       │ Mongoose
┌──────────────────────▼──────────────────────────────┐
│               MongoDB Database                       │
│  Competitions Table (spots, dates, rewards, info)   │
│  Users Table (mock user data)                       │
│  Registrations Table (Compound Unique Index)        │
└─────────────────────────────────────────────────────┘
```

---

## 🔌 API Reference

### Competition Endpoints
```text
GET  /api/competitions/:id?userId=:userId
→ Returns complete competition details, capacity, dates, and whether the specific user is already registered.

POST /api/competitions/:id/register
→ Body: { "userId": "..." }
→ Executes an atomic check on the database. If capacity is available AND the registration deadline hasn't passed, increments bookedSpots by 1 and creates a unique Registration record.
```

---

## 🛠️ Local Development & Environment Setup

### Required Environment Variables
Create a `.env` file inside the `/server` directory:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/feedants?retryWrites=true&w=majority
```

### 1. Run the Backend & Seed the Database
```bash
cd server
npm install

# Seed the database to exactly match the design mockup (19/20 spots available)
npm run seed

# Start the server
npm run dev
# Runs on http://localhost:5000
```

### 2. Run the Mobile App
```bash
cd mobile
npm install

# (Android Emulator must be running)
npx react-native run-android
```
*(Note: The mobile app connects to `10.0.2.2:5000` by default to securely route localhost traffic from the Android emulator).*

---

## 🧠 Assessment Requirements: Documentation

### 1. Important Assumptions
*   **Single User Scope:** Authentication was not requested, so I hardcoded a single `MOCK_USER_ID` in the frontend API service to simulate an active user session.
*   **Visual Scope vs Functional Scope:** Features core to the business logic (registration, capacity, countdowns, tabs, and sharing) were made fully functional. Purely navigational/decorative elements (like the bottom navigation bar or video playback buttons) were built as UI mockups to keep the scope strictly focused on the assignment.

### 2. Major Technical Decisions
*   **Atomic Capacity Management:** Instead of writing complex, multi-step queries that could fail under heavy load, I utilized MongoDB's `findOneAndUpdate` with an `$expr` pipeline.
    *   *Why?* This ensures that the check (`bookedSpots < totalSpots` AND `currentDate < registrationClose`) happens **simultaneously** with the `$inc` spot increment. It completely prevents race conditions if 1,000 users tap "Register" at the exact same millisecond for the last remaining spot.
*   **Compound Unique Indexes:** I enforced a unique database index on `{ competition: 1, user: 1 }` in the Registration model to guarantee no user can ever accidentally register twice at the database level.
*   **Server-Driven State:** The React Native frontend maintains almost zero hardcoded business logic. Text labels ("Register Now" vs "Upload Submission") and button states are derived entirely from the server response (`userState.isRegistered`), ensuring data accuracy across app reloads.

### 3. Trade-offs Considered
*   **Transactions vs Atomic Updates:** While MongoDB sessions and transactions are excellent for rollback safety, they require a MongoDB Replica Set. To ensure this project is easy to run and test on any local or free-tier database, I opted for an **Atomic Update pattern** (`$expr` + `$inc`) which is equally race-condition-proof but vastly more portable.
*   **One Monolithic Screen vs Micro-components:** For a production app, the `CompetitionDetailsScreen.jsx` file would be heavily abstracted into separate folders (e.g., `<JudgeProfile />`, `<WinnersCarousel />`). For the sake of this assignment, I kept them hierarchically grouped in one primary file so evaluators can review the exact UI-to-State mapping without hunting through 20 different files. 

### 4. Future Production Improvements
*   **Real-time WebSockets:** Currently, the remaining spots update when the user fetches the page. In production, I would attach a Socket.io listener so users staring at the page can see the spots drop live.
*   **Pagination & Lazy Loading:** If a competition has thousands of previous winners or heavy judge introductory videos, I would implement FlatList optimizations and lazy load the images.
*   **Global State Management:** I would implement Redux Toolkit or React Query to cache the API response and prevent layout shift during the loading phase.

---
*Developed for Feedants by Rajkamal*
