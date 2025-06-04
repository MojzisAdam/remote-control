@extends('layouts.app')

@section('content')
    <div class="py-12 bg-gray-100">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h1 class="text-2xl font-semibold text-gray-900">Edit Branch: {{ $branch->name }}</h1>
                    <p class="mt-1 text-sm text-gray-600">Modify branch settings and metadata.</p>
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

            <div class="bg-white shadow-sm rounded-lg">
                <div class="p-6 bg-white border-b border-gray-200">
                    <form action="{{ route('update_manager.branches.update', $branch) }}" method="POST">
                        @csrf
                        @method('PUT')
                        
                        <!-- Branch Name -->
                        <div class="mb-4">
                            <label for="name" class="block text-sm font-medium text-gray-700">Branch Name</label>
                            <input type="text" name="name" id="name" value="{{ old('name', $branch->name) }}" required
                                class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                placeholder="e.g. stable, beta" 
                                pattern="[a-z0-9\-]+" 
                                title="Only lowercase letters, numbers, and hyphens are allowed">
                            <small class="text-gray-500">Only lowercase letters, numbers, and hyphens are allowed. This will be part of your update URL.</small>
                            <small class="text-yellow-600 block mt-1">Warning: Changing the branch name will update all associated URLs.</small>
                        </div>
                        
                        <!-- Description -->
                        <div class="mb-4">
                            <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
                            <textarea name="description" id="description" rows="3" 
                                class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                placeholder="Optional description of this branch">{{ old('description', $branch->description) }}</textarea>
                        </div>
                        
                        <!-- Active Status -->
                        <div class="mb-4">
                            <div class="flex items-center">
                                <input type="checkbox" name="is_active" id="is_active" value="1" 
                                    {{ old('is_active', $branch->is_active) ? 'checked' : '' }}
                                    class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded">
                                <label for="is_active" class="ml-2 block text-sm text-gray-900">Active</label>
                            </div>
                            <small class="text-gray-500">When inactive, clients will not be able to access this branch's updates.</small>
                        </div>
                        
                        <!-- Manifest URL (read-only) -->
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700">Manifest URL</label>
                            <div class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-gray-50 rounded-md shadow-sm text-sm">
                                {{ $branch->manifest_url }}
                            </div>
                            <small class="text-gray-500">This is the URL clients will use to check for updates.</small>
                        </div>
                        
                        <!-- Actions -->
                        <div class="flex items-center justify-end mt-6">
                            <a href="{{ route('update_manager.branches.list') }}" class="inline-flex items-center px-4 py-2 bg-gray-200 border border-transparent rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest hover:bg-gray-300 active:bg-gray-400 focus:outline-none focus:border-gray-400 focus:ring ring-gray-300 disabled:opacity-25 transition ease-in-out duration-150 mr-3">
                                Cancel
                            </a>
                            
                            <button type="submit" class="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:border-indigo-900 focus:ring ring-indigo-300 disabled:opacity-25 transition ease-in-out duration-150">
                                Update Branch
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
@endsection
