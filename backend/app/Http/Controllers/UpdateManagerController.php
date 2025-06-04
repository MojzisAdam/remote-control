<?php

namespace App\Http\Controllers;

use App\Services\UpdateManagerService;
use App\Models\UpdateBranch;
use App\Models\UpdateVersion;
use App\Models\UpdateArtifact;
use App\Models\UpdateLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class UpdateManagerController extends Controller
{
    /**
     * The update manager service instance.
     */
    protected $updateManager;

    /**
     * Create a new controller instance.
     */
    public function __construct(UpdateManagerService $updateManager)
    {
        $this->updateManager = $updateManager;
    }

    /**
     * Display the update manager dashboard.
     */
    public function dashboard()
    {
        $branches = UpdateBranch::withCount('versions')->get();
        $recentVersions = UpdateVersion::with('branch')
            ->orderByDesc('created_at')
            ->limit(10)
            ->get();
        $recentLogs = UpdateLog::with(['user', 'branch', 'version'])
            ->orderByDesc('created_at')
            ->limit(20)
            ->get();

        return view('update_manager.dashboard', [
            'branches' => $branches,
            'recentVersions' => $recentVersions,
            'recentLogs' => $recentLogs
        ]);
    }

    /**
     * Show the branches list.
     */
    public function branchesList()
    {
        $branches = UpdateBranch::withCount('versions')->get();
        return view('update_manager.branches.list', compact('branches'));
    }

    /**
     * Show the form to create a new branch.
     */
    public function createBranchForm()
    {
        return view('update_manager.branches.create');
    }

    /**
     * Store a new branch.
     */
    public function storeBranch(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:50', 'regex:/^[a-z0-9-]+$/', 'unique:update_branches,name'],
            'description' => ['nullable', 'string', 'max:500'],
            'is_active' => ['boolean'],
        ]);

        $branch = $this->updateManager->createBranch($validated);

        return redirect()->route('update_manager.branches.list')
            ->with('success', "Branch '{$branch->name}' has been created.");
    }

    /**
     * Show the form to edit a branch.
     */
    public function editBranchForm(UpdateBranch $branch)
    {
        return view('update_manager.branches.edit', compact('branch'));
    }

    /**
     * Update a branch.
     */
    public function updateBranch(Request $request, UpdateBranch $branch)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:50', 'regex:/^[a-z0-9-]+$/', Rule::unique('update_branches')->ignore($branch->id)],
            'description' => ['nullable', 'string', 'max:500'],
            'is_active' => ['boolean'],
        ]);

        $branch = $this->updateManager->updateBranch($branch, $validated);

        return redirect()->route('update_manager.branches.list')
            ->with('success', "Branch '{$branch->name}' has been updated.");
    }

    /**
     * Delete a branch.
     */
    public function deleteBranch(UpdateBranch $branch)
    {
        if ($branch->versions()->count() > 0) {
            return redirect()->route('update_manager.branches.list')
                ->with('error', "Cannot delete branch '{$branch->name}' because it has versions. Delete all versions first.");
        }

        if ($this->updateManager->deleteBranch($branch)) {
            return redirect()->route('update_manager.branches.list')
                ->with('success', "Branch '{$branch->name}' has been deleted.");
        }

        return redirect()->route('update_manager.branches.list')
            ->with('error', "Failed to delete branch '{$branch->name}'.");
    }

    /**
     * Show the versions list for a branch.
     */
    public function versionsList(UpdateBranch $branch)
    {
        $versions = $branch->versions()->orderByDesc('release_date')->get();
        return view('update_manager.versions.list', [
            'branch' => $branch,
            'versions' => $versions
        ]);
    }    /**
         * Show the form to create a new version.
         */
    public function createVersionForm(UpdateBranch $branch)
    {
        $pythonVersions = \App\Models\PythonVersion::orderBy('version', 'desc')->get();
        return view('update_manager.versions.create', compact('branch', 'pythonVersions'));
    }

    /**
     * Store a new version.
     */
    public function storeVersion(Request $request, UpdateBranch $branch)
    {
        $validated = $request->validate([
            'version' => ['required', 'string', 'regex:/^\d+\.\d+\.\d+(?:-[a-zA-Z0-9]+)?$/'],
            'upload_type' => ['required', 'in:zip,files'],
            'zip_file' => ['required_if:upload_type,zip', 'file', 'mimes:zip', 'max:100000'], // 100MB max
            'files.*' => ['required_if:upload_type,files', 'file', 'max:10000'], // 10MB max per file
            'requirements_file' => ['required', 'file', 'mimes:txt', 'max:1000'], // 1MB max
            'python_version_id' => ['nullable', 'exists:python_versions,id'],
            'release_notes' => ['nullable', 'string', 'max:10000'],
        ]);
        try {
            $pythonVersionId = isset($validated['python_version_id']) && !empty($validated['python_version_id'])
                ? intval($validated['python_version_id'])
                : null;

            if ($request->upload_type === 'zip') {
                // Single ZIP file upload
                $version = $this->updateManager->createVersionFromZip(
                    $branch,
                    $validated['version'],
                    $request->file('zip_file'),
                    $request->file('requirements_file'),
                    $pythonVersionId,
                    $validated['release_notes'] ?? null
                );
            } else {
                // Multiple files upload                
                $version = $this->updateManager->createVersionFromRawFiles(
                    $branch,
                    $validated['version'],
                    $request->file('files'),
                    $request->file('requirements_file'),
                    $pythonVersionId,
                    $validated['release_notes'] ?? null
                );
            }

            return redirect()->route('update_manager.versions.list', $branch)
                ->with('success', "Version {$version->version} has been created.");
        } catch (\Exception $e) {
            return redirect()->back()->withInput()
                ->with('error', "Failed to create version: {$e->getMessage()}");
        }
    }

    /**
     * Show version details.
     */
    public function showVersion(UpdateBranch $branch, UpdateVersion $version)
    {
        $artifacts = $version->artifacts;
        $logs = $version->logs()->with('user')->orderByDesc('created_at')->get();

        return view('update_manager.versions.show', [
            'branch' => $branch,
            'version' => $version,
            'artifacts' => $artifacts,
            'logs' => $logs
        ]);
    }

    /**
     * Set a version as current.
     */
    public function setVersionAsCurrent(UpdateBranch $branch, UpdateVersion $version)
    {
        if ($this->updateManager->setVersionAsCurrent($version)) {
            return redirect()->route('update_manager.versions.list', $branch)
                ->with('success', "Version {$version->version} is now the current version for branch {$branch->name}.");
        }

        return redirect()->route('update_manager.versions.list', $branch)
            ->with('error', "Failed to set version {$version->version} as current.");
    }

    /**
     * Delete a version.
     */
    public function deleteVersion(UpdateBranch $branch, UpdateVersion $version)
    {
        if ($this->updateManager->deleteVersion($version)) {
            return redirect()->route('update_manager.versions.list', $branch)
                ->with('success', "Version {$version->version} has been deleted.");
        }

        return redirect()->route('update_manager.versions.list', $branch)
            ->with('error', "Failed to delete version {$version->version}.");
    }

    /**
     * Download a version artifact.
     */
    public function downloadArtifact(UpdateBranch $branch, UpdateVersion $version, UpdateArtifact $artifact)
    {
        if (!Storage::disk('local')->exists($artifact->storage_path)) {
            abort(404, 'File not found');
        }

        return response()->download(
            storage_path("app/local/{$artifact->storage_path}"),
            $artifact->original_filename
        );
    }

    /**
     * Display update logs.
     */
    public function logs(Request $request)
    {
        $query = UpdateLog::with(['user', 'branch', 'version']);

        // Apply filters
        if ($request->has('branch_id') && $request->branch_id) {
            $query->where('branch_id', $request->branch_id);
        }

        if ($request->has('action') && $request->action) {
            $query->where('action', $request->action);
        }

        if ($request->has('user_id') && $request->user_id) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->has('date_from') && $request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to') && $request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Get the logs paginated
        $logs = $query->orderByDesc('created_at')->paginate(50);

        // Get filters data
        $branches = UpdateBranch::all();
        $actions = UpdateLog::select('action')->distinct()->pluck('action');

        return view('update_manager.logs', [
            'logs' => $logs,
            'branches' => $branches,
            'actions' => $actions,
            'filters' => $request->all()
        ]);
    }
}