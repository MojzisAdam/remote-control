<?php

namespace App\Http\Controllers;

use App\Services\UpdateManagerService;
use App\Models\PythonVersion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class PythonVersionController extends Controller
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
     * Show the python versions list.
     */
    public function index()
    {
        $pythonVersions = PythonVersion::with('uploader')
            ->withCount('updateVersions')
            ->orderBy('version', 'desc')
            ->get();

        return view('update_manager.python.list', compact('pythonVersions'));
    }

    /**
     * Show the form to create a new Python version.
     */
    public function create()
    {
        return view('update_manager.python.create');
    }

    /**
     * Store a new Python version.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'version' => ['required', 'string', 'max:20', 'regex:/^\d+\.\d+\.\d+(?:-[a-zA-Z0-9]+)?$/', 'unique:python_versions,version'],
            'display_name' => ['required', 'string', 'max:100'],
            'python_file' => ['required', 'file', 'max:500000'], // 500MB max
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        try {
            $pythonVersion = $this->updateManager->createPythonVersion(
                $validated['version'],
                $validated['display_name'],
                $request->file('python_file'),
                $validated['notes'] ?? null
            );

            return redirect()->route('update_manager.python.index')
                ->with('success', "Python version {$pythonVersion->version} has been added.");
        } catch (\Exception $e) {
            return redirect()->back()->withInput()
                ->with('error', "Failed to add Python version: {$e->getMessage()}");
        }
    }

    /**
     * Show Python version details.
     */
    public function show(PythonVersion $pythonVersion)
    {
        $usedByVersions = $pythonVersion->updateVersions()
            ->with('branch')
            ->orderBy('release_date', 'desc')
            ->get();

        return view('update_manager.python.show', [
            'pythonVersion' => $pythonVersion,
            'usedByVersions' => $usedByVersions
        ]);
    }

    /**
     * Delete a Python version.
     */
    public function destroy(PythonVersion $pythonVersion)
    {
        if ($pythonVersion->updateVersions()->count() > 0) {
            return redirect()->route('update_manager.python.index')
                ->with('error', "Cannot delete Python version {$pythonVersion->version} because it's used by update versions.");
        }

        if ($this->updateManager->deletePythonVersion($pythonVersion)) {
            return redirect()->route('update_manager.python.index')
                ->with('success', "Python version {$pythonVersion->version} has been deleted.");
        }

        return redirect()->route('update_manager.python.index')
            ->with('error', "Failed to delete Python version {$pythonVersion->version}.");
    }
}
