# Heat Pump Remote Control System

A comprehensive web application for monitoring and controlling heat pumps remotely. This project consists of a Laravel backend API and a React TypeScript frontend.

## Features

-   **Remote Device Management**: Control heat pump parameters remotely
-   **Real-Time Data**: Monitor device status and performance metrics
-   **User Management**: Multiple users can be assigned to devices with different permission levels
-   **Graphing & Analytics**: Visualize historical data with custom graphs and data exports
-   **Error Monitoring**: Get notified about device errors through web and email notifications
-   **Responsive Design**: Access from desktop and mobile devices

## Project Structure

This project is split into two main components:

### Backend (Laravel)

The backend provides a RESTful API that handles:

-   Device data collection and storage
-   User authentication and authorization
-   Remote control functionality
-   Data history and notifications

Technologies used:

-   PHP 8.2
-   Laravel 11
-   Laravel Sanctum for API authentication
-   Laravel Fortify for authentication features
-   Spatie Permission for role management
-   MySQL database (configurable)

### Frontend (React + TypeScript)

The frontend provides a modern user interface for:

-   Device monitoring dashboards
-   Remote control panels
-   Data visualization with charts
-   User and device management

Technologies used:

-   TypeScript
-   React
-   Vite
-   Tailwind CSS for styling

## Getting Started

### Prerequisites

-   PHP 8.2+
-   Composer
-   Node.js 16+
-   npm or yarn

### Installation

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

# Start development server
npm run dev
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

## API Documentation

The backend provides a RESTful API with the following main endpoints:

-   `/api/devices` - Device management endpoints
-   `/api/remote-control` - Remote control functionality
-   `/api/device-history` - Historical data and graphs
-   `/api/users` - User management

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.
