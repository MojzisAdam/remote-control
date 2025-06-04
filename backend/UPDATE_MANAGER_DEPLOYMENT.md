# Update Manager Deployment Guide

This document provides step-by-step instructions for deploying the Update Manager feature to a production environment.

## Overview

The Update Manager is a Laravel-based system that allows administrators to manage software update branches (stable, beta, etc.), upload new versions, track version history, and serve update manifests and files to client applications.

## Prerequisites

-   A production server with PHP 8.2+ and Laravel 11.x
-   Composer installed on the server
-   MySQL/MariaDB or another Laravel-supported database
-   Web server (Nginx/Apache) configured to serve Laravel
-   Adequate storage space for update files

## Deployment Steps

### 1. Database Migration

Run the database migrations to create the required tables:

```bash
php artisan migrate
```

This will create the following tables:

-   `update_branches` - Stores information about different update branches (stable, beta, etc.)
-   `update_versions` - Stores information about individual versions
-   `update_artifacts` - Stores information about files associated with each version
-   `python_versions` - Stores information about available Python versions
-   `update_logs` - Stores audit logs for update management activities

### 2. Storage Configuration

#### 2.1. Directory Structure

Ensure the `storage/app/updates` directory exists and has proper write permissions:

```bash
mkdir -p storage/app/updates
chmod -R 775 storage/app/updates
```

#### 2.2. Symbolic Link

Create a symbolic link from `public/updates` to `storage/app/updates` to make update files accessible via the web:

```bash
php artisan storage:link-updates
```

If you face permission issues, run the command with appropriate privileges:

```bash
sudo php artisan storage:link-updates
```

### 3. Permissions Configuration

Ensure that the user roles and permissions are properly set up. The Update Manager requires the 'super-admin' role.

You can assign roles using the following Artisan command or through your user management interface:

```bash
php artisan tinker
$user = \App\Models\User::find(1); // Replace 1 with the actual admin user ID
$user->assignRole('super-admin');
```

### 4. Environment Configuration

Update your `.env` file with the following settings:

```
FILESYSTEM_DISK=local
APP_URL=https://your-production-domain.com
```

Ensure the `APP_URL` is correctly set as it is used to generate download URLs for update artifacts.

### 5. Web Server Configuration

#### 5.1. Nginx

If you're using Nginx, add the following to your server block:

```nginx
location /updates {
    alias /path/to/your/laravel/public/updates;
    try_files $uri $uri/ /index.php?$query_string;
}

# Increase max file upload size for large update packages
client_max_body_size 100M;
```

#### 5.2. Apache

If you're using Apache, add the following to your `.htaccess` file in the public directory:

```apache
# Increase max file upload size for large update packages
php_value upload_max_filesize 100M
php_value post_max_size 100M
```

### 6. Queue Configuration (Optional)

For better performance with large file uploads, consider configuring a queue:

```bash
php artisan queue:table
php artisan migrate
```

Update your `.env` file:

```
QUEUE_CONNECTION=database
```

Set up a process manager (like Supervisor) to run the queue worker:

```bash
php artisan queue:work
```

### 7. Scheduled Tasks

Add the cleanup command to your server's crontab to regularly clean up old update versions:

```bash
# Add this to your crontab
* * * * * cd /path/to/your/laravel && php artisan schedule:run >> /dev/null 2>&1
```

This will run all scheduled tasks including the `updates:cleanup` command that runs weekly.

You can manually run the cleanup with:

```bash
php artisan updates:cleanup --keep=5
```

### 8. Testing the Deployment

1. Navigate to your admin panel at `https://your-production-domain.com/admin/updates`
2. Create a new update branch (e.g., "stable")
3. Upload a version package
4. Verify that the manifest is generated correctly at `https://your-production-domain.com/updates/stable/update.json`
5. Verify that you can download the ZIP file from the URL in the manifest

### 9. Security Considerations

-   Ensure that the admin routes are properly protected by the authentication middleware
-   Consider implementing rate limiting for the public API endpoints
-   Regularly back up the uploads directory and database

### 10. Client Application Configuration

Update your client applications to use the new update API endpoints:

-   Manifest URL: `https://your-production-domain.com/updates/{branch}/update.json`
-   ZIP Download URL: `https://your-production-domain.com/updates/{branch}/{version}/app.zip`
-   Requirements URL: `https://your-production-domain.com/updates/{branch}/{version}/requirements.txt`
-   Python Download URL: `https://your-production-domain.com/updates/python/{version}/{filename}`

### Troubleshooting

#### File Upload Issues

If you encounter issues with uploading large files:

1. Check PHP's `upload_max_filesize` and `post_max_size` settings
2. Ensure the web server has write permissions to the storage directory
3. Check that the symbolic link is correctly set up

#### 404 Errors for Download URLs

If download URLs return 404 errors:

1. Verify the symbolic link exists between `public/updates` and `storage/app/updates`
2. Check that the file paths are correctly stored in the database
3. Ensure the disk configuration in `config/filesystems.php` is correct

#### Database Migration Issues

If migrations fail:

1. Check database connection settings
2. Ensure the database user has sufficient privileges
3. Try running with the `--force` flag if you're sure about the changes

```bash
php artisan migrate --force
```

#### Python Version Upload Issues

If you encounter issues with uploading Python installers:

1. Check that the file size is within limits (default is 500MB)
2. Ensure the Python version follows semantic versioning (e.g., "3.8.10")
3. Verify that the directory `storage/app/updates/python` exists and has proper permissions
4. Check PHP's `upload_max_filesize` and `post_max_size` settings:

```php
// php.ini - May need larger values for Python installers
upload_max_filesize = 500M
post_max_size = 500M
memory_limit = 512M
```

If the installation file is very large, consider implementing chunked uploads or increasing the timeout:

```nginx
# nginx.conf
client_max_body_size 500M;
client_body_timeout 300s;
```

### Contact Information

For additional support or questions, please contact the development team.

## Directory Structure

The update files are stored with the following structure:

```
storage/app/updates/
├── stable/
│   ├── update.json
│   ├── 1.0.0/
│   │   ├── app.zip
│   │   └── requirements.txt
│   └── 1.0.1/
│       ├── app.zip
│       └── requirements.txt
├── beta/
│   ├── update.json
│   └── 1.1.0-beta/
│       ├── app.zip
│       └── requirements.txt
└── python/
    ├── 3.8.10/
    │   └── python-3.8.10-amd64.exe
    ├── 3.9.7/
    │   └── python-3.9.7-amd64.exe
    └── 3.10.5/
        └── python-3.10.5-amd64.exe
```

Each branch has its own directory, containing an `update.json` manifest and subdirectories for each version. Python installers are stored in separate directories organized by version.
