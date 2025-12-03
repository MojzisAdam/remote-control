# Heat Pump Remote Control System

Heat Pump Remote Control is a modern web application for remote monitoring and management of heat pumps. It provides a robust Laravel 11 backend and a responsive React 19 frontend, enabling users to monitor device performance, adjust settings in real-time, and automate heat pump operations from anywhere.

## Project Overview

This system consists of two main components: a Laravel 11 backend (PHP 8.4) and a React 19 single-page frontend. The backend exposes a RESTful API for connected devices, managing data storage, authentication, and business logic. The frontend is a rich TypeScript application built with React and Vite, providing dashboards, control panels, and data visualizations for heat pump devices. The application supports multi-user access with role-based permissions, historical data logging with interactive charts, and a workflow engine for automating device behavior. Internationalization is built-in, allowing the interface to be used in multiple languages (e.g. English and Czech). In summary, Heat Pump Remote Control offers a comprehensive solution for IoT-based heat pump management, combining real-time control, analytics, and automation.

## Features

-   **Remote Device Management**: Control heat pump parameters (temperature, modes, etc.) remotely through the web UI. The system supports multiple device types, each with appropriate controls.
-   **Real-Time Data**: Live status updates and sensor readings via MQTT for supported devices (instant feedback on online/offline status, temperatures, error codes). Devices publish and receive messages over MQTT topics for immediate control actions, with a fallback to REST API for devices that don’t support MQTT. This ensures that even without real-time connectivity, devices can be polled and controlled through standard HTTP endpoints.
-   **Historical Data & Analytics**: All device telemetry is stored for analysis. Users can visualize historical performance data with interactive charts.
-   **User Management & RBAC**: e platform supports multiple users with granular permissions. Laravel Sanctum secures API access, and Laravel Fortify provides user authentication features (registration, two-factor, etc.). Spatie Permission is used to define roles and capabilities (e.g. admin, standard user).
-   **Notifications & Alerts**: Users receive notifications for important events, such as device errors or status changes. The system can send email alerts (powered by Laravel’s notification system and Symfony Mailer) as well as in-app (web) notifications for configured events. This helps in proactive maintenance – for example, notifying owners or technicians immediately when a fault or outage occurs in a heat pump.
-   **Automation Workflows**: Advanced automation allows users to create custom rules for their devices. Through a visual drag-and-drop workflow builder (built with React Flow), users can define triggers (time schedules, sensor thresholds, device state changes, etc.), conditions, and actions (e.g. adjust a setting, send a notification). These automations are validated in real-time on the frontend and stored via the API with all their components. An external script then fetches these automations via the RESTful API and manages their execution on connected devices.
-   **Internationalization**: The application supports multiple languages in its user interface. The frontend uses i18next (with react-i18next) for managing translations, while the Laravel backend uses standard PHP-based localization files (e.g., mail.php returning associative arrays of translation strings). By default, English and Czech are available (with Czech as the primary locale), and additional languages can be added easily. All dates and numbers are formatted according to the active locale, leveraging libraries such as date-fns for date localization.
-   **Responsive Modern UI**: Built as a single-page application with React 19 and Tailwind CSS, the frontend provides a responsive and snappy user interface. Users can access the system from desktops, tablets, or smartphones with a consistent experience. The UI includes dashboards for at-a-glance status, detailed device control panels and real-time charts. It also supports dark mode and theme customization (via Tailwind and utility libraries).
-   **Reliability & Security**: The application is built on a modern stack (Laravel 11 and React), providing a robust and secure foundation. The backend leverages Laravel’s built-in security mechanisms, including protection against SQL injection, XSS, and CSRF. Authentication is managed through Laravel Sanctum, using strong password hashing algorithms and optional 2FA support. All API interactions require either an authenticated session or an access token, ensuring strict access control and maintaining the integrity of all client–server communication.

## Tech Stack

This project is split into two main components:

### Backend (Laravel)

Laravel 11 (PHP 8.4) application, using Laravel Sanctum for API authentication and Laravel Fortify for user auth flows. Role-based access control is implemented via Spatie Laravel Permission. The backend uses a MySQL database by default (Laravel’s database agnosticism allows swapping to others if needed). The backend organizes its API following REST principles (controllers for devices, users, etc.) and includes migration files for database schema and seeders for initial data (like default roles or an admin user).

### Frontend (React + TypeScript)

React 19 with TypeScript, built using the Vite toolchain. The UI is styled with Tailwind CSS and uses React Router (v7) for client-side routing between views. For charts and graphs, it incorporates Chart.js (with a date-fns adapter for time axes) and Recharts for complex visualizations. Real-time device updates are handled via the mqtt.js library on the frontend, which subscribes to topics for live data. The automation editor uses React Flow (v12) under the hood, enabling a node-based diagramming interface for workflows. Internationalization is supported by react-i18next, loading translation JSON files for different locales. The frontend code is written in modern React style (functional components with hooks) and is organized into features (e.g., device management, history charts, automation builder). Build and development tooling is provided by Vite for fast hot-module reloading and optimized production builds.

### Communication

Devices primarily communicate via MQTT for real-time telemetry and control. Each device publishes and subscribes to specific MQTT topics based on its ID and type. An external integration service, running on a VPS, is subscribed to these topics and acts as a bridge between the MQTT broker and the backend. It relays device data and executes commands through the backend’s RESTful API, ensuring a clean separation between the application logic and the messaging layer.

The backend itself does not connect directly to the MQTT broker — it interacts with devices only through the REST API, typically in response to user actions from the frontend. For devices that cannot maintain a persistent MQTT connection, direct HTTP communication with the REST API is available as a fallback. This hybrid approach provides flexibility and reliable communication across various deployment environments.

## Getting Started

### Prerequisites

-   PHP 8.4+
-   Composer
-   Node.js 22+
-   npm
-   MySQL database

### Installation

Clone the repository and set up each part:

#### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install PHP dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Run migrations
php artisan migrate

# Seed the database
php artisan db:seed
```

#### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Copy environment file
cp .env.example .env

```

### Running the Application

#### Development Mode

1. Start the backend server:

```bash
cd backend
php artisan serve
```

2. Start the frontend development server:

```bash
cd frontend
npm run dev
```

#### Default Development User

When the backend is running **without `APP_ENV=production`** (for example with `APP_ENV=local`), the application creates a default administrator account when executing `php artisan db:seed`:

-   **Email:** `admin@example.com`
-   **Password:** `password`
-   **Role:** Full administrative privileges

This user is created **only in non-production environments** and must **never be enabled or used in production**.

## Deployment

Deployment is fully automated via a GitHub Actions CI/CD pipeline. It supports:

-   Safe version-based releases (`v*` tags or manual trigger)
-   Laravel backend staging with rollback
-   React frontend static build upload
-   Secure SSH-based deployment using secrets

> Your production server must have PHP 8.2+, MySQL, Composer, and allow SSH access on a specified port.

### How It Works

1. **Trigger**:

    - Push a Git tag like `v1.2.3`, or
    - Manually via GitHub Actions **workflow_dispatch** with version input

2. **Version Check**:

    - Compares the incoming version with the current deployed version on the server
    - Skips deployment if not newer

3. **Backend Deployment**:

    - Code is uploaded to a **staging** directory on the server
    - `.env` is securely injected from GitHub Secrets
    - Commands run on the server:
        - `composer install --no-dev --optimize-autoloader`
        - `php artisan migrate --force`
        - `php artisan db:seed-if-empty` (on first deploy)
        - `php artisan config:cache && route:cache`
    - The previous release is backed up
    - Staging directory is promoted to production

4. **Frontend Deployment**:
    - Build is done in GitHub Actions (`npm run build`)
    - `dist/` is uploaded to the server’s frontend path using `rsync`

### Environment Configuration

Add the following secrets to your GitHub repository:

| Secret Name            | Description                            |
| ---------------------- | -------------------------------------- |
| `SSH_HOST`             | IP/domain of your server               |
| `SSH_PORT`             | SSH port (e.g. `2222`)                 |
| `SSH_USER`             | SSH username                           |
| `SSH_KEY`              | Private SSH key (no passphrase)        |
| `BACKEND_PATH`         | Path to the live backend directory     |
| `STAGING_BACKEND_PATH` | Staging path for backend deployment    |
| `BACKEND_PREVIOUS`     | Backup path for last backend version   |
| `FRONTEND_PATH`        | Path to the live frontend build        |
| `ENV_BACKEND`          | Entire `.env` file content for backend |
| `ENV_FRONTEND`         | `.env` used during frontend build      |

### GitHub Actions Files

-   **`.github/workflows/ci.yml`**  
    Runs on every push to `main` or `develop`. Performs linting, testing, and builds for both backend and frontend.

-   **`.github/workflows/deploy.yml`**  
    Triggers on version tag (`v*`) or manually via workflow dispatch, but only from the `main` branch.  
    Handles deployment, staging, rollback, and version verification logic.

---

> After setup, no manual steps are needed. Tag a release and your application will be deployed safely and automatically.

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details. contributions to this project will be under the same license, and by contributing you agree to license your work under Apache 2.0.
