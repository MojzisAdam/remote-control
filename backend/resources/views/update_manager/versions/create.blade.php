@extends('layouts.app')

@section('content')
<div class="py-12 bg-gray-100">
    <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div class="flex justify-between items-center mb-6">
            <div>
                <h1 class="text-2xl font-semibold text-gray-900">Upload New Version for {{ $branch->name }}</h1>
                <p class="mt-1 text-sm text-gray-600">Create a new version by uploading a ZIP package or individual
                    files.</p>
            </div>
        </div>

        <!-- Validation Errors -->
        @if ($errors->any())
        <div class="mb-4">
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md">
                <strong class="font-bold">Whoops!</strong>
                <span class="block sm:inline">There were some problems with your input.</span>
                <ul class="mt-3 list-disc list-inside">
                    @foreach ($errors->all() as $error)
                    <li>{{ $error }}</li>
                    @endforeach
                </ul>
            </div>
        </div>
        @endif

        <!-- Flash Messages -->
        @if(session('error'))
        <div class="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span class="block sm:inline">{{ session('error') }}</span>
        </div>
        @endif

        <div class="bg-white shadow-sm rounded-lg">
            <div class="p-6 bg-white border-b border-gray-200">
                <form action="{{ route('update_manager.versions.store', $branch) }}" method="POST"
                    enctype="multipart/form-data">
                    @csrf

                    <!-- Version Number -->
                    <div class="mb-4">
                        <label for="version" class="block text-sm font-medium text-gray-700">Version Number</label>
                        <input type="text" name="version" id="version" value="{{ old('version') }}" required
                            class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            placeholder="e.g. 1.0.0" pattern="^\d+\.\d+\.\d+(?:-[a-zA-Z0-9]+)?$"
                            title="Must be in semantic versioning format (e.g. 1.0.0 or 1.0.0-beta)">
                        <small class="text-gray-500">Must follow semantic versioning (e.g. 1.0.0 or 1.0.0-beta).</small>
                    </div>

                    <!-- Upload Type Selection -->
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Upload Method</label>
                        <div class="flex flex-col space-y-2">
                            <div class="flex items-center">
                                <input type="radio" name="upload_type" id="upload_zip" value="zip"
                                    {{ old('upload_type', 'zip') == 'zip' ? 'checked' : '' }}
                                    class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300">
                                <label for="upload_zip" class="ml-2 block text-sm text-gray-900">
                                    Upload a pre-built ZIP file
                                </label>
                            </div>
                            <div class="flex items-center">
                                <input type="radio" name="upload_type" id="upload_files" value="files"
                                    {{ old('upload_type') == 'files' ? 'checked' : '' }}
                                    class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300">
                                <label for="upload_files" class="ml-2 block text-sm text-gray-900">
                                    Upload individual files (will be packaged into a ZIP)
                                </label>
                            </div>
                        </div>
                    </div>

                    <!-- ZIP File Upload (conditionally shown) -->
                    <div id="zip_upload_section" class="mb-4">
                        <label for="zip_file" class="block text-sm font-medium text-gray-700">ZIP File</label>
                        <input type="file" name="zip_file" id="zip_file"
                            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            accept=".zip">
                        <small class="text-gray-500">Maximum file size: 100MB</small>
                    </div>

                    <!-- Multiple Files Upload (conditionally shown) -->
                    <div id="files_upload_section" class="mb-4" style="display: none;">
                        <label for="files" class="block text-sm font-medium text-gray-700">Files</label>
                        <input type="file" name="files[]" id="files" multiple
                            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                        <small class="text-gray-500">Select all files to include in the package. Maximum file size: 10MB
                            per file</small>
                    </div>

                    <!-- Requirements.txt File -->
                    <div class="mb-4">
                        <label for="requirements_file" class="block text-sm font-medium text-gray-700">Requirements File
                            <span class="text-red-600">*</span></label>
                        <input type="file" name="requirements_file" id="requirements_file" required
                            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            accept=".txt">
                        <small class="text-gray-500">requirements.txt file for Python packages</small>
                    </div>
                    
                    <!-- Python Version Selection -->
                    <div class="mb-4">
                        <label for="python_version_id" class="block text-sm font-medium text-gray-700">Python Version (Optional)</label>
                        <select name="python_version_id" id="python_version_id"
                            class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                            <option value="">None</option>
                            @foreach($pythonVersions ?? [] as $pythonVersion)
                                <option value="{{ $pythonVersion->id }}" {{ old('python_version_id') == $pythonVersion->id ? 'selected' : '' }}>
                                    {{ $pythonVersion->display_name }} ({{ $pythonVersion->version }})
                                </option>
                            @endforeach
                        </select>
                        <small class="text-gray-500">Select a Python interpreter version to include with this update</small>
                        
                        @if(empty($pythonVersions) || $pythonVersions->isEmpty())
                            <div class="mt-2">
                                <a href="{{ route('update_manager.python.create') }}" class="text-sm text-indigo-600 hover:text-indigo-900">
                                    No Python versions found. Add one first.
                                </a>
                            </div>
                        @endif
                    </div>

                    <!-- Release Notes -->
                    <div class="mb-4">
                        <label for="release_notes" class="block text-sm font-medium text-gray-700">Release Notes
                            (Optional)</label>
                        <textarea name="release_notes" id="release_notes" rows="5"
                            class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            placeholder="Describe the changes in this version">{{ old('release_notes') }}</textarea>
                    </div>

                    <!-- Actions -->
                    <div class="flex items-center justify-end mt-6">
                        <a href="{{ route('update_manager.versions.list', $branch) }}"
                            class="inline-flex items-center px-4 py-2 bg-gray-200 border border-transparent rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest hover:bg-gray-300 active:bg-gray-400 focus:outline-none focus:border-gray-400 focus:ring ring-gray-300 disabled:opacity-25 transition ease-in-out duration-150 mr-3">
                            Cancel
                        </a>

                        <button type="submit"
                            class="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:border-indigo-900 focus:ring ring-indigo-300 disabled:opacity-25 transition ease-in-out duration-150">
                            Upload Version
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>

@push('scripts')
<script>
document.addEventListener('DOMContentLoaded', function() {
    const zipUploadSection = document.getElementById('zip_upload_section');
    const filesUploadSection = document.getElementById('files_upload_section');
    const uploadTypeZip = document.getElementById('upload_zip');
    const uploadTypeFiles = document.getElementById('upload_files');

    function toggleUploadSections() {
        if (uploadTypeZip.checked) {
            zipUploadSection.style.display = 'block';
            filesUploadSection.style.display = 'none';
        } else {
            zipUploadSection.style.display = 'none';
            filesUploadSection.style.display = 'block';
        }
    }

    // Initial toggle
    toggleUploadSections();

    // Toggle on radio change
    uploadTypeZip.addEventListener('change', toggleUploadSections);
    uploadTypeFiles.addEventListener('change', toggleUploadSections);
});
</script>
@endpush
@endsection