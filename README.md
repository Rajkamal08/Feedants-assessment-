# Feedants Technical Assignment - Competition Details

This repository contains the full-stack implementation of the Feedants Competition Details screen. It is built as a complete, functional feature backed by a real database, precisely matching the provided design.

## Project Structure
- `mobile/`: React Native CLI application containing the frontend UI.
- `server/`: Node.js + Express + MongoDB backend serving the competition API.

## Requirements
- Node.js (v18+)
- MongoDB running locally (default: `mongodb://localhost:27017`)
- React Native CLI & Android/iOS development environment

## How to Run

### 1. Backend Server
```bash
cd server
npm install
npm run seed     # Populates DB with exact screenshot reference data and registers the mock user
npm run dev      # Starts Express server on http://localhost:5000
```
*Note: Make sure your local MongoDB instance is running before starting the server.*

### 2. Mobile App (Android)
```bash
cd mobile
npm install
npx react-native run-android
```
*(Note: If testing on a physical device instead of an emulator, you may need to update `API_URL` in `mobile/src/services/api.js` to point to your computer's local IP address instead of `10.0.2.2`).*

---

## Architecture & Technical Decisions

### 1. Dynamic Data & Seeding
To adhere strictly to the requirement of not hardcoding the competition data in the React Native app, I created a seed script (`npm run seed`) that populates MongoDB with the exact textual, numerical, and array data from the reference screenshot. The React Native app performs a standard `fetch` upon load to construct the UI dynamically.

### 2. Concurrency and Data Consistency (Atomic Updates)
To handle the edge case where thousands of concurrent users might attempt to register for the last remaining spot simultaneously, the backend handles registration via an **atomic MongoDB operation**. 
Using `findOneAndUpdate` with a query constraint (`$expr: { $lt: ["$capacity.bookedSpots", "$capacity.totalSpots"] }`) combined with an `$inc` update, the system guarantees that a spot is secured safely and atomically before writing the user registration record, eliminating race conditions entirely. (MongoDB Session Transactions were considered but omitted to ensure seamless execution on default standalone local MongoDB databases).

### 3. Countdown Logic Offloaded to Client
Instead of the backend repeatedly calculating "time remaining", the API returns the authoritative `registrationClose` ISO timestamp. A custom React Native hook (`useCountdown.js`) calculates the remaining time every second natively on the device. This greatly minimizes API calls and ensures a fluid UI.

### 4. Database Modelling
I separated the data into three collections: `Competition`, `User`, and `Registration`. 
A compound unique index exists on the `Registration` schema (`{ competition, user }`) to guarantee a user cannot register for the same competition twice at the database level.

## Trade-offs & Assumptions

1. **Authentication Mocking:** Since building a full authentication flow was outside the scope of rendering a single screen, I assumed the existence of a logged-in user. The `MOCK_USER_ID` is passed from the React Native app to the backend to determine if the active user is already registered (which toggles the "Registered" badge and button state).
2. **Icons:** To ensure exact accuracy with the design without forcing the reviewer to deal with native linking issues associated with heavy external vector icon libraries, I used remote PNGs from a standard icon CDN to replicate the UI's modern iconography perfectly.
3. **Visual Mockups vs Functional Routing:** Elements like the video play buttons, "Copy Link", and the bottom App Navigation bar were built to accurately represent the design pixel-for-pixel, but their `onPress` routing logic was intentionally left blank as there are no other screens to navigate to in this isolated assignment.
4. **Single-File Component:** For ease of review in a small technical assignment, the entire screen and its sub-sections were built inside `CompetitionDetailsScreen.jsx`. 

## Production Improvements
If deploying this feature to a large-scale production app, I would improve the following:
*   **WebSockets/Server-Sent Events:** For a live competition with limited spots, I would implement WebSockets to push the live `bookedSpots` count to the client instantly, rather than relying solely on the static fetch on component mount.
*   **Component Modularity:** Break `CompetitionDetailsScreen.jsx` down into smaller, highly reusable components (e.g., `CompetitionCard.jsx`, `JudgeProfile.jsx`, `WinnersCarousel.jsx`).
*   **State Management:** Integrate Redux Toolkit or Zustand for global state caching, especially to persist the user's registration state across the entire app.
*   **Skeleton Loading:** Replace the standard `ActivityIndicator` with a styled skeleton loader that visually mimics the competition card for a smoother perceived loading experience.
