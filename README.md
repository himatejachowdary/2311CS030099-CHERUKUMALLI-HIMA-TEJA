# Campus Notification System

A React-based notification dashboard developed as part of the Afford Medical Frontend Evaluation.

The application fetches notifications from the provided API, prioritizes them based on their type, and provides an intuitive interface for users to browse, filter, and manage notifications.

---

## Features

- Fetch notifications from the provided REST API
- Display notifications using Material UI components
- Priority-based notification section
- Filter notifications by type
- Pagination support
- Mark notifications as viewed
- Responsive design for desktop and mobile
- Loading and error states
- Clean and reusable component structure

---

## Tech Stack

- React 18
- JavaScript (ES6+)
- Material UI
- Axios
- React Hooks
- Context API

---

## Project Structure

```
src/
│
├── api/
│   └── notificationService.js
│
├── components/
│   ├── Header.jsx
│   ├── NotificationCard.jsx
│   ├── NotificationList.jsx
│   ├── PriorityNotifications.jsx
│   ├── FilterBar.jsx
│   ├── PaginationBar.jsx
│   └── Loading.jsx
│
├── context/
│   └── NotificationContext.jsx
│
├── hooks/
│   └── useNotifications.js
│
├── utils/
│   ├── priority.js
│   └── dateFormatter.js
│
├── App.jsx
└── index.js
```

---

## Installation

Clone the repository

```bash
git clone <repository-url>
```

Move into the project directory

```bash
cd notification-app
```

Install dependencies

```bash
npm install
```

Start the development server

```bash
npm start
```

The application will be available at

```
http://localhost:3000
```

---

## API

The application consumes the notification API provided in the evaluation.

```
GET /evaluation-service/notifications
```

Authentication is handled using the Bearer token provided by the evaluation API.

---

## Priority Rules

Notifications are displayed based on the following priority:

1. Placement
2. Result
3. Event

Within each category, the latest notifications are displayed first.

---

## Functionality

- Load notifications from the API
- Filter by notification type
- Display top priority notifications
- Paginate notification list
- Mark notifications as viewed
- Highlight unread notifications
- Handle loading and API errors gracefully

---

## Design Approach

The project follows a modular component-based architecture. Business logic is separated from UI components to improve maintainability and readability. Reusable hooks and utility functions are used wherever appropriate to avoid code duplication.

---

## Future Improvements

- Search notifications
- Dark mode
- Persistent viewed status using local storage
- Notification sorting options
- Unit testing with Jest and React Testing Library

---

## Author

**Hima Teja Cherukumalli**

B.Tech – Data Science  
Malla Reddy University

GitHub: https://github.com/himatejachowdary
