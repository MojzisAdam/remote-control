<?php

namespace App\Http\Controllers;

use App\Models\UpdateBranch;
use App\Models\UpdateVersion;
use App\Models\PythonVersion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class UpdateApiController extends Controller
{
    /**
     * Get the update manifest for a branch
     */
    public function getManifest(string $branchName)
    {
        // Find the branch
        $branch = UpdateBranch::where('name', $branchName)->first();

        if (!$branch) {
            return response()->json(['error' => 'Branch not found'], 404);
        }

        if (!$branch->is_active) {
            return response()->json(['error' => 'Branch is inactive'], 404);
        }        // Check if manifest file exists
        $manifestPath = "{$branchName}/update.json";

        if (!Storage::disk('updates')->exists($manifestPath)) {
            return response()->json(['error' => 'Manifest not found'], 404);
        }

        // Return the manifest file as JSON
        $manifest = json_decode(Storage::disk('updates')->get($manifestPath), true);
        return response()->json($manifest);
    }

    /**
     * Download a version's ZIP file
     */
    public function downloadZip(string $branchName, string $version)
    {
        // Find the branch
        $branch = UpdateBranch::where('name', $branchName)->first();

        if (!$branch) {
            return response()->json(['error' => 'Branch not found'], 404);
        }

        if (!$branch->is_active) {
            return response()->json(['error' => 'Branch is inactive'], 404);
        }

        // Find the version
        $versionModel = $branch->versions()->where('version', $version)->first();

        if (!$versionModel) {
            return response()->json(['error' => 'Version not found'], 404);
        }
        // Get the ZIP artifact
        $artifact = $versionModel->artifacts()->where('file_type', 'zip')->first();

        if (!$artifact || !Storage::disk('updates')->exists($artifact->storage_path)) {
            return response()->json(['error' => 'ZIP file not found'], 404);
        }

        // Return the file as a download
        return Storage::disk('updates')->download(
            $artifact->storage_path,
            "app-{$branchName}-{$version}.zip"
        );
    }

    /**
     * Download a version's requirements file
     */
    public function downloadRequirements(string $branchName, string $version)
    {
        // Find the branch
        $branch = UpdateBranch::where('name', $branchName)->first();

        if (!$branch) {
            return response()->json(['error' => 'Branch not found'], 404);
        }

        if (!$branch->is_active) {
            return response()->json(['error' => 'Branch is inactive'], 404);
        }

        // Find the version
        $versionModel = $branch->versions()->where('version', $version)->first();

        if (!$versionModel) {
            return response()->json(['error' => 'Version not found'], 404);
        }
        // Get the requirements artifact
        $artifact = $versionModel->artifacts()->where('file_type', 'txt')->first();

        if (!$artifact || !Storage::disk('updates')->exists($artifact->storage_path)) {
            return response()->json(['error' => 'Requirements file not found'], 404);
        }

        // Return the file as a download
        return Storage::disk('updates')->download(
            $artifact->storage_path,
            "requirements-{$branchName}-{$version}.txt"
        );
    }

    /**
     * Download a Python version file
     */
    public function downloadPython(string $pythonVersion, string $filename)
    {
        // Find the Python version
        $pythonVersionModel = PythonVersion::where('version', $pythonVersion)->first();

        if (!$pythonVersionModel) {
            return response()->json(['error' => 'Python version not found'], 404);
        }

        // Check if the file path matches
        $expectedPath = "python/{$pythonVersion}/{$filename}";

        if ($pythonVersionModel->file_path !== $expectedPath) {
            return response()->json(['error' => 'File not found'], 404);
        }

        if (!Storage::disk('updates')->exists($pythonVersionModel->file_path)) {
            return response()->json(['error' => 'File not found'], 404);
        }

        // Return the file as a download
        return Storage::disk('updates')->download(
            $pythonVersionModel->file_path,
            $filename
        );
    }
}