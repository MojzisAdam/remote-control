@extends('layouts.app')

@section('content')
    <div class="py-12 bg-gray-100">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h1 class="text-2xl font-semibold text-gray-900">Python {{ $pythonVersion->version }}</h1>
                    <p class="mt-1 text-sm text-gray-600">{{ $pythonVersion->display_name }}</p>
                </div>
                <a href="{{ route('update_manager.python.index') }}" 
                   class="inline-flex items-center px-4 py-2 bg-gray-200 border border-transparent rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest hover:bg-gray-300 active:bg-gray-400 focus:outline-none focus:border-gray-400 focus:ring ring-gray-300 disabled:opacity-25 transition ease-in-out duration-150">
                    Back to List
                </a>
            </div>

            <!-- Python Version Details -->
            <div class="bg-white shadow-sm rounded-lg mb-6">
                <div class="p-6 border-b border-gray-200">
                    <h2 class="text-lg font-medium text-gray-900 mb-4">Version Details</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <p class="text-sm font-medium text-gray-500">Version</p>
                            <p class="mt-1">
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-blue-100 text-blue-800">
                                    {{ $pythonVersion->version }}
                                </span>
                            </p>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-500">Display Name</p>
                            <p class="mt-1">{{ $pythonVersion->display_name }}</p>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-500">File Size</p>
                            <p class="mt-1">{{ number_format($pythonVersion->file_size / 1024 / 1024, 2) }} MB</p>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-500">Uploaded By</p>
                            <p class="mt-1">{{ $pythonVersion->uploader->name ?? 'Unknown' }}</p>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-500">Upload Date</p>
                            <p class="mt-1">{{ $pythonVersion->created_at->format('Y-m-d H:i:s') }}</p>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-500">Used By</p>
                            <p class="mt-1">{{ $usedByVersions->count() }} update versions</p>
                        </div>
                        <div class="md:col-span-2">
                            <p class="text-sm font-medium text-gray-500">Checksum</p>
                            <p class="mt-1 font-mono text-sm break-all">{{ $pythonVersion->checksum }}</p>
                        </div>
                        <div class="md:col-span-2">
                            <p class="text-sm font-medium text-gray-500">Download URL</p>
                            <p class="mt-1 font-mono text-sm break-all">{{ $pythonVersion->url }}</p>
                        </div>
                        @if($pythonVersion->notes)
                            <div class="md:col-span-2">
                                <p class="text-sm font-medium text-gray-500">Notes</p>
                                <p class="mt-1">{{ $pythonVersion->notes }}</p>
                            </div>
                        @endif
                    </div>
                </div>
            </div>

            <!-- Used By Versions -->
            <div class="bg-white shadow-sm rounded-lg">
                <div class="p-6">
                    <h2 class="text-lg font-medium text-gray-900 mb-4">Used By Update Versions</h2>
                    
                    @if($usedByVersions->isEmpty())
                        <div class="text-center text-gray-500 py-4">
                            This Python version is not used by any update versions yet.
                        </div>
                    @else
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
                                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Version</th>
                                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Release Date</th>
                                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                @foreach($usedByVersions as $version)
                                    <tr>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            {{ $version->branch->name }}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-green-100 text-green-800">
                                                {{ $version->version }}
                                            </span>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {{ $version->release_date->format('Y-m-d') }}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            @if($version->is_current)
                                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-blue-100 text-blue-800">
                                                    Current
                                                </span>
                                            @else
                                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800">
                                                    Previous
                                                </span>
                                            @endif
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <a href="{{ route('update_manager.versions.show', [$version->branch, $version]) }}" class="text-indigo-600 hover:text-indigo-900">
                                                View Details
                                            </a>
                                        </td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    @endif
                </div>
            </div>
            
            @if($usedByVersions->isEmpty())
                <div class="mt-6 flex justify-end">
                    <form method="POST" action="{{ route('update_manager.python.destroy', $pythonVersion) }}" class="inline-block">
                        @csrf
                        @method('DELETE')
                        <button type="submit" 
                            class="inline-flex items-center px-4 py-2 bg-red-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-red-700 active:bg-red-900 focus:outline-none focus:border-red-900 focus:ring ring-red-300 disabled:opacity-25 transition ease-in-out duration-150"
                            onclick="return confirm('Are you sure you want to delete this Python version?')">
                            Delete This Python Version
                        </button>
                    </form>
                </div>
            @endif
        </div>
    </div>
@endsection
