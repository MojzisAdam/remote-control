# Update Manager Developer Guide

This document provides technical information for developers working with the Update Manager codebase.

## Architecture Overview

The Update Manager follows a service-based architecture pattern:

1. **Controllers**: Handle HTTP requests and responses

    - `UpdateManagerController`: Admin interface endpoints
    - `UpdateApiController`: Client-facing API endpoints
    - `PythonVersionController`: Python version management endpoints

2. **Service Layer**: Contains business logic

    - `UpdateManagerService`: Handles all update management operations

3. **Models**: Database entities

    - `UpdateBranch`: Represents update branches (stable, beta, etc.)
    - `UpdateVersion`: Represents specific versions within branches
    - `UpdateArtifact`: Represents files associated with versions
    - `PythonVersion`: Represents Python versions available for installation
    - `UpdateLog`: Audit log entries

4. **Views**: Admin interface templates
    - Dashboard, branches, versions, and logs views

## Key Components

### Storage Configuration

The system uses a dedicated filesystem disk for updates:

```php
// config/filesystems.php
'disks' => [
    // ...
    'updates' => [
        'driver' => 'local',
        'root' => storage_path('app/updates'),
        'url' => env('APP_URL').'/updates',
        'visibility' => 'public',
        'throw' => false,
    ],
],

'links' => [
    // ...
    public_path('updates') => storage_path('app/updates'),
],
```

### Python Version Management

The `PythonVersion` model provides fields for managing Python installers:

-   `version`: The semantic version number (e.g. "3.8.10")
-   `display_name`: A user-friendly version name (e.g. "Python 3.8.10 (64-bit)")
-   `file_path`: The path where the installer is stored
-   `url`: The download URL for the installer
-   `checksum`: SHA-256 hash of the installer file
-   `file_size`: Size of the installer in bytes
-   `uploaded_by`: ID of the user who uploaded the installer
-   `notes`: Optional release notes or description

Python versions are stored in the `storage/app/updates/python/{version}/` directory with the original filename preserved.

### Service Methods

`UpdateManagerService` provides the following key methods:

-   `createBranch()`: Create a new update branch
-   `updateBranch()`: Update branch properties
-   `deleteBranch()`: Delete a branch if it has no versions
-   `createVersionFromZip()`: Create a version from an uploaded ZIP
-   `createVersionFromRawFiles()`: Create a version from individual files
-   `deleteVersion()`: Delete a version and its files
-   `setVersionAsCurrent()`: Mark a version as current for a branch
-   `generateManifest()`: Create/update the update.json file for a branch
-   `createPythonVersion()`: Upload and register a new Python installer
-   `deletePythonVersion()`: Delete a Python installer if not in use
-   `getAllPythonVersions()`: Get all available Python versions

### API Endpoints

Client applications interact with these endpoints:

-   `GET /updates/{branch}/update.json`: Get the update manifest
-   `GET /updates/{branch}/{version}/app.zip`: Download the update package
-   `GET /updates/{branch}/{version}/requirements.txt`: Download requirements file
-   `GET /updates/python/{version}/{filename}`: Download Python installer

### Scheduled Tasks

The update manager includes a scheduled cleanup task:

```php
// app/Console/Kernel.php
protected function schedule(Schedule $schedule): void
{
    // ...
    $schedule->command('updates:cleanup')->weekly();
}
```

### Authentication & Authorization

Access is controlled via the `notfound.unauthorized` middleware, which checks if the user has the `super-admin` role.

## Extending the System

### Adding New File Types

To support additional file types beyond ZIP and requirements:

1. Modify `UpdateArtifact` model to include the new file type
2. Update the `createVersionFromZip()` or `createVersionFromRawFiles()` methods in `UpdateManagerService`
3. Add new endpoints in `UpdateApiController` if needed

### Custom Validation

To add custom validation for uploaded files:

1. Modify the controller validation rules:

```php
$request->validate([
    'version' => ['required', 'string', 'regex:/^\d+\.\d+\.\d+(?:-[a-zA-Z0-9]+)?$/'],
    'zip_file' => ['required', 'file', 'max:100000', 'mimes:zip'],
    'requirements_file' => ['required', 'file', 'max:1000', 'mimes:txt'],
    // Add your custom validation rules here
]);
```

### Python Version Validation

Python versions use similar validation rules:

```php
$validated = $request->validate([
    'version' => [
        'required',
        'string',
        'max:20',
        'regex:/^\d+\.\d+\.\d+(?:-[a-zA-Z0-9]+)?$/',
        'unique:python_versions,version'
    ],
    'display_name' => ['required', 'string', 'max:100'],
    'python_file' => ['required', 'file', 'max:500000'], // 500MB max
    'notes' => ['nullable', 'string', 'max:1000'],
]);
```

When validating Python installers, consider:

1. File size limits for Python installers are typically much larger than app updates
2. Unique version constraint prevents duplicate versions
3. The Python file type isn't restricted to specific mime types to allow various installer formats

### Adding Version Metadata

To store additional metadata with versions:

1. Add columns to the `update_versions` table via migration
2. Update the `UpdateVersion` model's `$fillable` property
3. Modify the version creation methods in `UpdateManagerService`
4. Update the manifest generation to include the new metadata

### Python Version Relationships

The `UpdateVersion` model has a relationship to `PythonVersion`:

```php
// In UpdateVersion.php
public function pythonVersion()
{
    return $this->belongsTo(PythonVersion::class);
}
```

This allows each update version to specify a required Python version that client applications need to install.

When creating or updating a version, you can specify a required Python version:

```php
$updateVersion = UpdateVersion::create([
    'branch_id' => $branch->id,
    'version' => $version,
    'release_notes' => $releaseNotes,
    'checksum' => $checksum,
    'is_current' => false,
    'release_date' => now(),
    'created_by' => Auth::id(),
    'python_version_id' => $pythonVersionId,  // Associated Python version
]);
```

The update manifest will include the Python version requirement if specified:

```php
$manifest = [
    'version' => $currentVersion->version,
    'checksum' => $currentVersion->checksum,
    'url' => $currentVersion->zip_url,
    'branch' => $branch->name,
    'branch_active' => $branch->is_active,
    'release_date' => $currentVersion->release_date->toIso8601String(),
    // Python version information if available
    'python_version' => $currentVersion->pythonVersion ? [
        'version' => $currentVersion->pythonVersion->version,
        'display_name' => $currentVersion->pythonVersion->display_name,
        'url' => $currentVersion->pythonVersion->url,
        'checksum' => $currentVersion->pythonVersion->checksum,
    ] : null,
];
```

### Customizing Manifests

To modify the structure of update manifests:

1. Edit the `generateManifest()` method in `UpdateManagerService`:

```php
$manifest = [
    'version' => $currentVersion->version,
    'checksum' => $currentVersion->checksum,
    'url' => $currentVersion->zip_url,
    'branch' => $branch->name,
    'branch_active' => $branch->is_active,
    'release_date' => $currentVersion->release_date->toIso8601String(),
    // Add your custom fields here
];
```

## Testing

The system includes unit tests for the core functionality:

-   `UpdateManagerTest`: Tests branch and version management

To run the tests:

```bash
php artisan test --filter=UpdateManagerTest
```

## File Structure

```
app/
├── Http/
│   └── Controllers/
│       ├── UpdateManagerController.php
│       ├── UpdateApiController.php
│       └── PythonVersionController.php
├── Models/
│   ├── UpdateBranch.php
│   ├── UpdateVersion.php
│   ├── UpdateArtifact.php
│   ├── PythonVersion.php
│   └── UpdateLog.php
├── Services/
│   └── UpdateManagerService.php
└── Console/
    └── Commands/
        ├── CleanupOldUpdateVersions.php
        └── CreateUpdatesLink.php

resources/
└── views/
    └── update_manager/
        ├── dashboard.blade.php
        ├── logs.blade.php
        ├── branches/
        │   ├── list.blade.php
        │   ├── create.blade.php
        │   └── edit.blade.php
        └── versions/
            ├── list.blade.php
            ├── create.blade.php
            └── show.blade.php
```

## Troubleshooting for Developers

### Debug Tips

1. **Inspect Storage Paths**: Use this to debug file path issues:

```php
Storage::disk('updates')->exists($path);  // Check if file exists
Storage::disk('updates')->path($path);    // Get absolute path
```

2. **Debug URL Generation**: Check URLs being generated:

```php
dd(url("updates/{$branch->name}/{$version}/app.zip"));
```

3. **Logging**: Add custom logging for debugging:

```php
\Log::debug('Debug info', ['path' => $path, 'exists' => Storage::disk('updates')->exists($path)]);
```

### Common Development Issues

1. **Path Structure**: Ensure you're working with the correct path structure (no double 'updates' in paths)
2. **Permission Issues**: Check directory permissions when running in different environments
3. **URL Generation**: Make sure APP_URL is correctly set in all environments
