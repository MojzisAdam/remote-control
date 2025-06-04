<?php

namespace App\Services;

use App\Models\UpdateBranch;
use App\Models\UpdateVersion;
use App\Models\UpdateArtifact;
use App\Models\UpdateLog;
use App\Models\PythonVersion;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\File;
use ZipArchive;
use Symfony\Component\Process\Process;
use Symfony\Component\Process\Exception\ProcessFailedException;

class UpdateManagerService
{    /**
     * Storage disk for update files
     */
    protected $disk = 'updates';

    /**
     * Base storage path for updates
     */
    protected $basePath = '';

    /**
     * Create a new branch
     */
    public function createBranch(array $data): UpdateBranch
    {
        // Generate manifest URL based on branch name
        $manifestUrl = url("updates/{$data['name']}/update.json");

        $branch = UpdateBranch::create([
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'manifest_url' => $manifestUrl,
            'is_active' => $data['is_active'] ?? true,
        ]);

        // Create the directory for this branch
        $branchPath = $this->getBranchPath($branch->name);
        Storage::disk($this->disk)->makeDirectory($branchPath);

        // Log the action
        $this->logAction('branch_create', $branch->id, null);

        return $branch;
    }

    /**
     * Update a branch
     */
    public function updateBranch(UpdateBranch $branch, array $data): UpdateBranch
    {
        $oldName = $branch->name;
        $newName = $data['name'] ?? $branch->name;

        // Update the branch
        $branch->update([
            'name' => $newName,
            'description' => $data['description'] ?? $branch->description,
            'is_active' => $data['is_active'] ?? $branch->is_active,
            'manifest_url' => url("updates/{$newName}/update.json"),
        ]);

        // If the name changed, move the directory
        if ($oldName !== $newName) {
            $oldPath = $this->getBranchPath($oldName);
            $newPath = $this->getBranchPath($newName);

            if (Storage::disk($this->disk)->exists($oldPath)) {
                // Create new directory
                Storage::disk($this->disk)->makeDirectory($newPath);

                // Copy all files from old directory to new
                foreach (Storage::disk($this->disk)->allFiles($oldPath) as $file) {
                    $newFile = str_replace($oldPath, $newPath, $file);
                    Storage::disk($this->disk)->copy($file, $newFile);
                }

                // Delete old directory
                Storage::disk($this->disk)->deleteDirectory($oldPath);

                // Update all version URLs with the new path
                foreach ($branch->versions as $version) {
                    $version->zip_url = str_replace($oldName, $newName, $version->zip_url);
                    $version->requirements_url = str_replace($oldName, $newName, $version->requirements_url);
                    $version->save();
                }
            }
        }

        // Log the action
        $this->logAction('branch_update', $branch->id, null, [
            'old_name' => $oldName,
            'new_name' => $newName,
            'is_active' => $branch->is_active,
        ]);

        return $branch;
    }

    /**
     * Delete a branch (only if it has no versions)
     */
    public function deleteBranch(UpdateBranch $branch): bool
    {
        if ($branch->versions()->count() > 0) {
            return false;
        }

        // Delete the branch directory
        $branchPath = $this->getBranchPath($branch->name);
        Storage::disk($this->disk)->deleteDirectory($branchPath);

        // Log before deleting
        $this->logAction('branch_delete', $branch->id, null, [
            'name' => $branch->name
        ]);

        // Delete the branch
        $branch->delete();

        return true;
    }    /**
         * Create a new version from an uploaded ZIP file
         */
    public function createVersionFromZip(
        UpdateBranch $branch,
        string $version,
        UploadedFile $zipFile,
        UploadedFile $requirementsFile,
        ?int $pythonVersionId = null,
        ?string $releaseNotes = null
    ): UpdateVersion {
        // Validate version string format (semver)
        if (!preg_match('/^\d+\.\d+\.\d+(?:-[a-zA-Z0-9]+)?$/', $version)) {
            throw new \InvalidArgumentException('Invalid version format. Must be semantic versioning (e.g., 1.0.0 or 1.0.0-beta).');
        }

        // Check if version already exists for this branch
        if ($branch->versions()->where('version', $version)->exists()) {
            throw new \InvalidArgumentException("Version {$version} already exists for branch {$branch->name}.");
        }

        // Define storage paths
        $versionPath = $this->getVersionPath($branch->name, $version);
        $zipPath = "{$versionPath}/app.zip";
        $requirementsPath = "{$versionPath}/requirements.txt";

        // Create version directory
        Storage::disk($this->disk)->makeDirectory($versionPath);

        // Store the ZIP file
        Storage::disk($this->disk)->put($zipPath, file_get_contents($zipFile->getRealPath()));        // Calculate the SHA-256 checksum of the ZIP
        $zipContents = Storage::disk($this->disk)->get($zipPath);
        $checksum = "sha256:" . hash('sha256', $zipContents);

        // Store the requirements file (now required)
        Storage::disk($this->disk)->put($requirementsPath, file_get_contents($requirementsFile->getRealPath()));
        $requirementsUrl = url("updates/{$branch->name}/{$version}/requirements.txt");

        // Mark other versions as not current
        $branch->versions()->update(['is_current' => false]);        // Create the version record
        $version = UpdateVersion::create([
            'branch_id' => $branch->id,
            'python_version_id' => $pythonVersionId,
            'version' => $version,
            'release_date' => now(),
            'checksum' => $checksum,
            'zip_url' => url("updates/{$branch->name}/{$version}/app.zip"),
            'requirements_url' => $requirementsUrl,
            'release_notes' => $releaseNotes,
            'is_current' => true,
        ]);// Create artifacts
        $this->createArtifact($version->id, $zipFile, $zipPath, 'zip');
        $this->createArtifact($version->id, $requirementsFile, $requirementsPath, 'txt');

        // Generate the manifest
        $this->generateManifest($branch);

        // Log the action
        $this->logAction('version_create', $branch->id, $version->id);

        return $version;
    }    /**
         * Create a new version by packaging raw files
         */
    public function createVersionFromRawFiles(
        UpdateBranch $branch,
        string $version,
        array $files,
        UploadedFile $requirementsFile,
        ?int $pythonVersionId = null,
        ?string $releaseNotes = null
    ): UpdateVersion {
        // Validate version string format (semver)
        if (!preg_match('/^\d+\.\d+\.\d+(?:-[a-zA-Z0-9]+)?$/', $version)) {
            throw new \InvalidArgumentException('Invalid version format. Must be semantic versioning (e.g., 1.0.0 or 1.0.0-beta).');
        }

        // Check if version already exists for this branch
        if ($branch->versions()->where('version', $version)->exists()) {
            throw new \InvalidArgumentException("Version {$version} already exists for branch {$branch->name}.");
        }

        // Define storage paths
        $versionPath = $this->getVersionPath($branch->name, $version);
        $tempPath = storage_path("app/temp/{$branch->name}/{$version}");
        $zipPath = "{$versionPath}/app.zip";
        $requirementsPath = "{$versionPath}/requirements.txt";

        // Create directories
        Storage::disk($this->disk)->makeDirectory($versionPath);
        if (!File::exists($tempPath)) {
            File::makeDirectory($tempPath, 0755, true);
        }

        // Copy uploaded files to temp directory
        foreach ($files as $file) {
            $relativePath = $file->getClientOriginalName();
            $file->move($tempPath, $relativePath);
        }

        // Create the ZIP file
        $zip = new ZipArchive();
        $zipFilePath = storage_path("app/{$this->disk}/{$zipPath}");

        if (!File::exists(dirname($zipFilePath))) {
            File::makeDirectory(dirname($zipFilePath), 0755, true);
        }

        if ($zip->open($zipFilePath, ZipArchive::CREATE | ZipArchive::OVERWRITE) === true) {
            $files = new \RecursiveIteratorIterator(
                new \RecursiveDirectoryIterator($tempPath),
                \RecursiveIteratorIterator::LEAVES_ONLY
            );

            foreach ($files as $file) {
                if (!$file->isDir()) {
                    $filePath = $file->getRealPath();
                    $relativePath = substr($filePath, strlen($tempPath) + 1);

                    $zip->addFile($filePath, $relativePath);
                }
            }

            $zip->close();
        } else {
            throw new \RuntimeException('Failed to create ZIP file');
        }

        // Calculate the SHA-256 checksum
        $checksum = "sha256:" . hash_file('sha256', $zipFilePath);

        // Store the requirements file (now required)
        Storage::disk($this->disk)->put($requirementsPath, file_get_contents($requirementsFile->getRealPath()));
        $requirementsUrl = url("updates/{$branch->name}/{$version}/requirements.txt");

        // Mark other versions as not current
        $branch->versions()->update(['is_current' => false]);        // Create the version record
        $versionModel = UpdateVersion::create([
            'branch_id' => $branch->id,
            'python_version_id' => $pythonVersionId,
            'version' => $version,
            'release_date' => now(),
            'checksum' => $checksum,
            'zip_url' => url("updates/{$branch->name}/{$version}/app.zip"),
            'requirements_url' => $requirementsUrl,
            'release_notes' => $releaseNotes,
            'is_current' => true,
        ]);

        // Create artifact for the ZIP
        $zipFileObj = new UploadedFile(
            $zipFilePath,
            "app.zip",
            'application/zip',
            null,
            true
        );
        $this->createArtifact($versionModel->id, $zipFileObj, $zipPath, 'zip');

        // Create artifact for requirements file
        $this->createArtifact($versionModel->id, $requirementsFile, $requirementsPath, 'txt');

        // Generate the manifest
        $this->generateManifest($branch);

        // Clean up temp directory
        File::deleteDirectory($tempPath);

        // Log the action
        $this->logAction('version_create', $branch->id, $versionModel->id);

        return $versionModel;
    }

    /**
     * Delete a version
     */
    public function deleteVersion(UpdateVersion $version): bool
    {
        $branch = $version->branch;

        // If this is the current version, we need to choose another version as current
        if ($version->is_current) {
            // Get the latest version that's not this one
            $newCurrent = $branch->versions()
                ->where('id', '!=', $version->id)
                ->orderByDesc('release_date')
                ->first();

            if ($newCurrent) {
                $newCurrent->update(['is_current' => true]);
            }
        }

        // Delete all artifacts
        foreach ($version->artifacts as $artifact) {
            Storage::disk($this->disk)->delete($artifact->storage_path);
            $artifact->delete();
        }

        // Delete the version directory
        $versionPath = $this->getVersionPath($branch->name, $version->version);
        Storage::disk($this->disk)->deleteDirectory($versionPath);

        // Log before deleting
        $this->logAction('version_delete', $branch->id, $version->id, [
            'version' => $version->version,
            'branch' => $branch->name
        ]);

        // Delete the version
        $version->delete();

        // Regenerate the manifest
        $this->generateManifest($branch);

        return true;
    }

    /**
     * Set a specific version as the current one for its branch
     */
    public function setVersionAsCurrent(UpdateVersion $version): bool
    {
        $branch = $version->branch;

        // Mark all versions as not current
        $branch->versions()->update(['is_current' => false]);

        // Set this version as current
        $version->update(['is_current' => true]);

        // Regenerate the manifest
        $this->generateManifest($branch);

        // Log the action
        $this->logAction('version_set_current', $branch->id, $version->id);

        return true;
    }

    /**
     * Generate the manifest file (update.json) for a branch
     */
    public function generateManifest(UpdateBranch $branch): bool
    {
        $currentVersion = $branch->currentVersion();

        if (!$currentVersion) {
            // If no current version, create an empty manifest
            $manifest = [
                'branch' => $branch->name,
                'branch_active' => $branch->is_active,
                'message' => 'No versions available for this branch',
            ];
        } else {            // Create the manifest with the current version info
            $manifest = [
                'version' => $currentVersion->version,
                'checksum' => $currentVersion->checksum,
                'url' => $currentVersion->zip_url,
                'branch' => $branch->name,
                'branch_active' => $branch->is_active,
                'release_date' => $currentVersion->release_date->toIso8601String(),
            ];
            // Always include requirements_url as it's now mandatory
            $manifest['requirements_url'] = $currentVersion->requirements_url;

            // Include Python version details if available
            if ($currentVersion->pythonVersion) {
                $pythonVersion = $currentVersion->pythonVersion;
                $manifest['python_version'] = $pythonVersion->version;
                $manifest['python_url'] = $pythonVersion->url;
                $manifest['python_checksum'] = $pythonVersion->checksum;
            }

            if ($currentVersion->release_notes) {
                $manifest['release_notes'] = $currentVersion->release_notes;
            }
        }

        // Save the manifest to storage
        $manifestPath = "{$this->getBranchPath($branch->name)}/update.json";
        Storage::disk($this->disk)->put($manifestPath, json_encode($manifest, JSON_PRETTY_PRINT));

        // Log the action
        $this->logAction('manifest_generate', $branch->id, $currentVersion ? $currentVersion->id : null);

        return true;
    }

    /**
     * Create an artifact record
     */
    protected function createArtifact(int $versionId, UploadedFile $file, string $storagePath, string $fileType): UpdateArtifact
    {
        return UpdateArtifact::create([
            'version_id' => $versionId,
            'original_filename' => $file->getClientOriginalName(),
            'storage_path' => $storagePath,
            'file_size' => $file->getSize(),
            'file_type' => $fileType,
            'uploaded_by' => Auth::id(),
        ]);
    }

    /**
     * Get the storage path for a branch
     */
    protected function getBranchPath(string $branchName): string
    {
        return "{$this->basePath}/{$branchName}";
    }

    /**
     * Get the storage path for a version
     */
    protected function getVersionPath(string $branchName, string $version): string
    {
        return "{$this->getBranchPath($branchName)}/{$version}";
    }

    /**
     * Log an update manager action
     */
    protected function logAction(string $action, ?int $branchId, ?int $versionId, array $details = null): UpdateLog
    {
        return UpdateLog::create([
            'action' => $action,
            'user_id' => Auth::id(),
            'branch_id' => $branchId,
            'version_id' => $versionId,
            'details' => $details,
        ]);
    }

    /**
     * Create a new Python version
     */
    public function createPythonVersion(
        string $version,
        string $displayName,
        UploadedFile $file,
        ?string $notes = null
    ): PythonVersion {
        // Check if version already exists
        if (PythonVersion::where('version', $version)->exists()) {
            throw new \InvalidArgumentException("Python version {$version} already exists.");
        }

        // Define storage paths
        $pythonPath = "python/{$version}";
        $fileName = basename($file->getClientOriginalName());
        $filePath = "{$pythonPath}/{$fileName}";

        // Create directory
        Storage::disk($this->disk)->makeDirectory($pythonPath);

        // Store the file
        Storage::disk($this->disk)->put($filePath, file_get_contents($file->getRealPath()));

        // Calculate the SHA-256 checksum
        $fileContents = Storage::disk($this->disk)->get($filePath);
        $checksum = "sha256:" . hash('sha256', $fileContents);

        // Generate URL
        $url = url("updates/{$filePath}");

        // Create the Python version record
        $pythonVersion = PythonVersion::create([
            'version' => $version,
            'display_name' => $displayName,
            'file_path' => $filePath,
            'url' => $url,
            'checksum' => $checksum,
            'file_size' => $file->getSize(),
            'uploaded_by' => Auth::id(),
            'notes' => $notes
        ]);

        // Log the action
        $this->logAction('python_version_create', null, null, [
            'python_version_id' => $pythonVersion->id,
            'version' => $version
        ]);

        return $pythonVersion;
    }

    /**
     * Delete a Python version (only if it's not used by any update version)
     */
    public function deletePythonVersion(PythonVersion $pythonVersion): bool
    {
        // Check if this Python version is used by any update versions
        if ($pythonVersion->updateVersions()->count() > 0) {
            return false;
        }

        // Delete the file
        Storage::disk($this->disk)->delete($pythonVersion->file_path);

        // Log before deleting
        $this->logAction('python_version_delete', null, null, [
            'version' => $pythonVersion->version,
            'display_name' => $pythonVersion->display_name
        ]);

        // Delete the record
        $pythonVersion->delete();

        return true;
    }

    /**
     * Get all Python versions
     */
    public function getAllPythonVersions()
    {
        return PythonVersion::orderBy('version', 'desc')->get();
    }
}