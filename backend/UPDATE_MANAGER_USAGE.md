# Update Manager Maintenance Guide

This document provides instructions for routine maintenance and operations of the Update Manager system.

## Routine Tasks

### Creating New Branches

1. Navigate to: Admin Panel → Update Manager → Branches → Create Branch
2. Fill in the required details:
    - **Name**: Use lowercase hyphenated format (e.g., `stable`, `beta`, `nightly`)
    - **Description**: Provide a meaningful description
    - **Status**: Active/Inactive
3. Click "Create Branch"

### Uploading New Versions

1. Navigate to: Admin Panel → Update Manager → Branches → [Branch Name] → Versions → Create Version
2. Fill in the required details: - **Version**: Use semantic versioning (e.g., `1.0.0`, `1.1.0-beta`)
    - **Release Notes**: Describe changes in this version
    - **ZIP File**: Upload the application package (required)
    - **Requirements File**: Upload requirements.txt (required)
3. Click "Upload Version"

### Managing Current Version

1. Navigate to: Admin Panel → Update Manager → Branches → [Branch Name] → Versions
2. Find the version you want to set as current
3. Click "Make Current"

This will:

-   Update the manifest file
-   Mark this version as the current one for the branch
-   Record the action in the update logs

### Viewing Update Logs

1. Navigate to: Admin Panel → Update Manager → Logs
2. Use the filters to narrow down results:
    - Branch
    - Action Type
    - Date Range

### Managing Python Versions

The system allows you to upload and manage Python installers that client applications might need:

#### Uploading Python Versions

1. Navigate to: Admin Panel → Update Manager → Python Versions → Add Python Version
2. Fill in the required details:
    - **Version**: Use semantic versioning (e.g., `3.8.10`, `3.9.7`)
    - **Display Name**: A user-friendly name (e.g., "Python 3.8.10 (64-bit)")
    - **Python Installer**: Upload the Python installer executable (e.g., `python-3.8.10-amd64.exe`)
    - **Notes**: Optional information about this version
3. Click "Upload Python Version"

#### Viewing Python Version Usage

1. Navigate to: Admin Panel → Update Manager → Python Versions
2. Click on a specific version to see which update versions are using it

#### Removing Python Versions

Python versions can only be deleted if they are not used by any update version:

1. Navigate to: Admin Panel → Update Manager → Python Versions
2. Find the version you want to delete
3. Click "Delete" (only available if the version isn't in use)

### Cleaning Up Old Versions

Old versions can be cleaned up manually or automatically:

#### Automatic Cleanup

The system runs a weekly cleanup job that retains the 5 most recent versions per branch.

#### Manual Cleanup

Run the following command:

```bash
php artisan updates:cleanup --keep=5
```

To perform a dry run (no actual deletion):

```bash
php artisan updates:cleanup --keep=5 --dry-run
```

## Client Update Process

Client applications can check for updates by:

1. Fetching the manifest: `GET /updates/{branch}/update.json`
2. Comparing the version with their current version
3. Downloading the update if needed: `GET /updates/{branch}/{version}/app.zip`
4. Installing requirements if needed: `GET /updates/{branch}/{version}/requirements.txt`
5. Downloading and installing the required Python version if specified: `GET /updates/python/{version}/{filename}`

## Storage Structure

Update files are stored with the following structure:

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

## Best Practices

1. **Version Naming**: Always use semantic versioning (MAJOR.MINOR.PATCH[-PRERELEASE])
2. **Testing**: Test updates on dev/beta branches before releasing to stable
3. **Backups**: Regularly back up the update files and database
4. **Monitoring**: Check update logs for failed operations
5. **Regular Updates**: Keep all branches updated, even if just for security fixes

## Specifying Python Version Requirements

When creating a new update version, you can specify a required Python version:

1. Upload the Python version through the Python Versions management section first
2. When creating a new application version, use the "Required Python Version" dropdown
3. Select the appropriate Python version that your application requires
4. The manifest file will include the Python version information:

```json
{
    "version": "1.2.0",
    "checksum": "sha256:a1b2c3...",
    "url": "https://your-domain.com/updates/stable/1.2.0/app.zip",
    "branch": "stable",
    "branch_active": true,
    "release_date": "2025-05-15T10:30:00+00:00",
    "python_version": {
        "version": "3.9.7",
        "display_name": "Python 3.9.7 (64-bit)",
        "url": "https://your-domain.com/updates/python/3.9.7/python-3.9.7-amd64.exe",
        "checksum": "sha256:d8e9f1..."
    }
}
```

5. Client applications can use this information to:
    - Check if the required Python version is installed
    - Download and install the specified Python version if needed
    - Proceed with the application update once Python is correctly installed

## Common Issues and Solutions

### Issue: Files Not Downloading

**Solution**: Check file permissions and symbolic links. Run:

```bash
php artisan storage:link-updates
```

### Issue: Cannot Upload Large Files

**Solution**: Adjust PHP and web server settings:

```php
// php.ini
upload_max_filesize = 100M
post_max_size = 100M
memory_limit = 256M
```

### Issue: Version Not Showing as Current

**Solution**: Manually regenerate the manifest:

```bash
php artisan tinker
$branch = \App\Models\UpdateBranch::where('name', 'stable')->first();
app(\App\Services\UpdateManagerService::class)->generateManifest($branch);
```

## Support and Resources

For additional support, please refer to:

-   [Update Manager Deployment Guide](./UPDATE_MANAGER_DEPLOYMENT.md)
-   [System Documentation](./docs)
-   Development Team Contact: [dev@example.com]
