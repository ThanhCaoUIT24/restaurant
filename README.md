# Restaurant Management System (RMS) 🍽️

A comprehensive, full-stack web application designed to streamline restaurant operations. This system handles everything from Point of Sale (POS) and Kitchen Display Systems (KDS) to inventory management, employee scheduling, and detailed business reporting.

## 🚀 Features

-   **Point of Sale (POS)**: Intuitive interface for taking orders, managing tables, and processing payments.
-   **Kitchen Display System (KDS)**: Real-time order updates for the kitchen staff, improving efficiency and reducing communication errors.
-   **Inventory Management**: Track ingredient stock levels, manage suppliers, and automate purchase orders (PO).
-   **Employee Management**: Shift scheduling, attendance tracking (Check-in/Check-out), and role-based access control (RBAC).
-   **Dashboard & Reporting**: Sales analytics, best-selling items, and revenue trends to help make informed business decisions.
-   **Table Management**: Visual layout of restaurant tables with real-time status updates (Vacant, Occupied, Reserved).

## 🛠️ Tech Stack

### Frontend
-   **Framework**: React (Vite)
-   **UI Library**: Material UI (MUI), Tailwind CSS
-   **State Management**: React Query, Context API
-   **Real-time**: Polling/WebSockets (conceptually supported)

### Backend
-   **Runtime**: Node.js
-   **Framework**: Express.js
-   **Database**: PostgreSQL
-   **ORM**: Prisma
-   **Authentication**: JWT (JSON Web Tokens)

## 📦 Prerequisites

Before you begin, ensure you have the following installed:
-   **Node.js** (v18 or higher recommended)
-   **PostgreSQL** (Active server running locally or remotely)
-   **Git**

## 📥 Installation

1.  **Clone the Repository**
    ```bash
    git clone <repository-url>
    cd restaurant-management-system-main3
    ```

2.  **Backend Setup**
    ```bash
    cd backend
    npm install
    
    # Create .env file from .env.example (or manually)
    # Ensure DATABASE_URL is set correctly in .env
    # Example: DATABASE_URL="postgresql://user:password@localhost:5432/rms_db?schema=public"
    
    # Run Database Migrations & Seed Data
    npx prisma migrate dev --name init
    npx prisma db seed
    
    cd ..
    ```

3.  **Frontend Setup**
    ```bash
    cd frontend
    npm install
    cd ..
    ```

## 🚀 Running the Application

### Option 1: Using the Startup Script (Recommended)
This script will start both the backend and frontend servers concurrently.

```bash
./run.sh
```
*Note: You might need to make the script executable first: `chmod +x run.sh`*

### Option 2: Manual Start

**Backend (Port 4000)**
```bash
cd backend
npm run dev
```

**Frontend (Port 5173)**
```bash
cd frontend
npm run dev
```

## 🔑 Default Credentials

The seed data provides the following default users for testing:

| Role | Username | Password |
| :--- | :--- | :--- |
| **Admin** | `admin` | `admin123` |
| **Manager** | `quanly` | `quanly123` |
| **Cashier** | `thungan` | `thungan123` |
| **Kitchen** | `bep` | `bep123` |

## 📂 Project Structure

```
.
├── backend/            # Express.js Server & Business Logic
│   ├── prisma/         # Database Schema & Seeds
│   ├── src/
│   │   ├── controllers/# Request Handlers
│   │   ├── services/   # Business Logic Layer
│   │   ├── routes/     # API Endpoints
│   │   └── middleware/ # Auth & Validation
│   └── package.json
│
├── frontend/           # React Client Application
│   ├── src/
│   │   ├── components/ # Reusable UI Components
│   │   ├── pages/      # View Components (POS, Dashboard, etc.)
│   │   ├── layouts/    # App Layouts (Main, Auth)
│   │   ├── api/        # API Integration
│   │   └── hooks/      # Custom React Hooks
│   └── package.json
│
└── run.sh              # Unified startup script
```

## 📜 License

Private Project. All rights reserved.
