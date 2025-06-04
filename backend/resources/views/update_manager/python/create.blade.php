@extends('layouts.app')

@section('content')
    <div class="py-12 bg-gray-100">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h1 class="text-2xl font-semibold text-gray-900">Add New Python Version</h1>
                    <p class="mt-1 text-sm text-gray-600">Upload a new Python interpreter version for updates</p>
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
                    <form action="{{ route('update_manager.python.store') }}" method="POST" enctype="multipart/form-data">
                        @csrf

                        <!-- Version Number -->
                        <div class="mb-4">
                            <label for="version" class="block text-sm font-medium text-gray-700">Version Number</label>
                            <input type="text" name="version" id="version" value="{{ old('version') }}" required
                                class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                placeholder="e.g. 3.10.4" pattern="^\d+\.\d+\.\d+(?:-[a-zA-Z0-9]+)?$"
                                title="Must be in semantic versioning format (e.g. 3.10.4 or 3.10.4-raspi)">
                            <small class="text-gray-500">Must follow semantic versioning (e.g. 3.10.4 or
                                3.10.4-raspi)</small>
                        </div>

                        <!-- Display Name -->
                        <div class="mb-4">
                            <label for="display_name" class="block text-sm font-medium text-gray-700">Display Name</label>
                            <input type="text" name="display_name" id="display_name" value="{{ old('display_name') }}"
                                required
                                class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                placeholder="e.g. Python 3.10.4 for Raspberry Pi">
                            <small class="text-gray-500">A human-readable name for this Python version</small>
                        </div>

                        <!-- Python File Upload -->
                        <div class="mb-4">
                            <label for="python_file" class="block text-sm font-medium text-gray-700">Python File</label>
                            <input type="file" name="python_file" id="python_file" required
                                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                accept=".tar.gz,.zip">
                            <small class="text-gray-500">Upload a portable Python package (.tar.gz or .zip). Maximum file
                                size: 500MB</small>
                        </div>

                        <!-- Notes -->
                        <div class="mb-4">
                            <label for="notes" class="block text-sm font-medium text-gray-700">Notes (Optional)</label>
                            <textarea name="notes" id="notes" rows="3"
                                class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                placeholder="Additional notes about this Python version">{{ old('notes') }}</textarea>
                        </div>

                        <!-- Actions -->
                        <div class="flex items-center justify-end mt-6">
                            <a href="{{ route('update_manager.python.index') }}"
                                class="inline-flex items-center px-4 py-2 bg-gray-200 border border-transparent rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest hover:bg-gray-300 active:bg-gray-400 focus:outline-none focus:border-gray-400 focus:ring ring-gray-300 disabled:opacity-25 transition ease-in-out duration-150 mr-3">
                                Cancel
                            </a>

                            <button type="submit"
                                class="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:border-indigo-900 focus:ring ring-indigo-300 disabled:opacity-25 transition ease-in-out duration-150">
                                Upload Python Version
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
@endsection