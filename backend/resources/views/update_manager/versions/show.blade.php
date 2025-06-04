@extends('layouts.app')

@section('content')
    <div class="py-12 bg-gray-100">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h1 class="text-2xl font-semibold text-gray-900">Version Details: {{ $version->version }}</h1>
                    <p class="mt-1 text-sm text-gray-600">Branch: {{ $branch->name }}</p>
                </div>
                <div>
                    @if(!$version->is_current)
                        <form action="{{ route('update_manager.versions.set-current', [$branch, $version]) }}" method="POST"
                            class="inline-block">
                            @csrf
                            <button type="submit"
                                class="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-green-700 active:bg-green-900 focus:outline-none focus:border-green-900 focus:ring ring-green-300 disabled:opacity-25 transition ease-in-out duration-150">
                                Make Current Version
                            </button>
                        </form>
                    @endif
                </div>
            </div>

            <!-- Flash Messages -->
            @if(session('success'))
                <div class="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                    <span class="block sm:inline">{{ session('success') }}</span>
                </div>
            @endif

            @if(session('error'))
                <div class="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <span class="block sm:inline">{{ session('error') }}</span>
                </div>
            @endif

            <div class="bg-white shadow-sm rounded-lg mb-6">
                <div class="p-6 border-b border-gray-200">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Version Info -->
                        <div>
                            <h2 class="text-lg font-semibold mb-4">Version Information</h2>
                            <table class="min-w-full">
                                <tbody>
                                    <tr>
                                        <td class="py-2 text-sm font-medium text-gray-700">Version:</td>
                                        <td class="py-2 text-sm text-gray-900">{{ $version->version }}</td>
                                    </tr>
                                    <tr>
                                        <td class="py-2 text-sm font-medium text-gray-700">Status:</td>
                                        <td class="py-2">
                                            @if($version->is_current)
                                                <span
                                                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Current</span>
                                            @else
                                                <span
                                                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Archive</span>
                                            @endif
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="py-2 text-sm font-medium text-gray-700">Released:</td>
                                        <td class="py-2 text-sm text-gray-900">
                                            {{ $version->release_date->format('M d, Y H:i:s') }}</td>
                                    </tr>
                                    <tr>
                                        <td class="py-2 text-sm font-medium text-gray-700">Checksum:</td>
                                        <td class="py-2 text-sm text-gray-900 break-all">{{ $version->checksum }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <!-- Artifacts -->
                        <div>
                            <h2 class="text-lg font-semibold mb-4">File Artifacts</h2>
                            <table class="min-w-full">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th class="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase">File
                                        </th>
                                        <th class="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase">Size
                                        </th>
                                        <th class="py-2 px-4 text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @forelse($artifacts as $artifact)
                                        <tr>
                                            <td class="py-2 px-4 text-sm">{{ $artifact->original_filename }}</td>
                                            <td class="py-2 px-4 text-sm">{{ number_format($artifact->file_size / 1024, 2) }} KB
                                            </td>
                                            <td class="py-2 px-4 text-sm">
                                                <a href="{{ route('update_manager.artifacts.download', [$branch, $version, $artifact]) }}"
                                                    class="text-indigo-600 hover:text-indigo-900">Download</a>
                                            </td>
                                        </tr>
                                    @empty
                                        <tr>
                                            <td colspan="3" class="py-2 px-4 text-sm text-center text-gray-500">No artifacts
                                                found.</td>
                                        </tr>
                                    @endforelse
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- URLs Section -->
                    <div class="mt-6">
                        <h2 class="text-lg font-semibold mb-4">Distribution URLs</h2>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700">ZIP Package URL:</label>
                                <div class="mt-1 flex rounded-md shadow-sm">
                                    <input type="text" readonly value="{{ $version->zip_url }}"
                                        class="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                                    <button type="button" onclick="copyToClipboard('{{ $version->zip_url }}')"
                                        class="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 rounded-r-md text-sm font-medium text-gray-700 hover:bg-gray-100">
                                        Copy
                                    </button>
                                </div>
                            </div>

                            @if($version->requirements_url)
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">Requirements URL:</label>
                                    <div class="mt-1 flex rounded-md shadow-sm">
                                        <input type="text" readonly value="{{ $version->requirements_url }}"
                                            class="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                                        <button type="button" onclick="copyToClipboard('{{ $version->requirements_url }}')"
                                            class="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 rounded-r-md text-sm font-medium text-gray-700 hover:bg-gray-100">
                                            Copy
                                        </button>
                                    </div>
                                </div>
                            @endif
                        </div>
                    </div>

                    <!-- Release Notes -->
                    @if($version->release_notes)
                        <div class="mt-6">
                            <h2 class="text-lg font-semibold mb-4">Release Notes</h2>
                            <div class="bg-gray-50 rounded-md p-4">
                                <div class="whitespace-pre-wrap text-sm">{{ $version->release_notes }}</div>
                            </div>
                        </div>
                    @endif

                </div>
            </div>

            <!-- Version History Logs -->
            <div class="bg-white shadow-sm rounded-lg">
                <div class="p-6 border-b border-gray-200">
                    <h2 class="text-lg font-semibold mb-4">Version Audit Logs</h2>
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th
                                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Time</th>
                                    <th
                                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Action</th>
                                    <th
                                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        User</th>
                                    <th
                                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Details</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                @forelse($logs as $log)
                                    <tr>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {{ $log->created_at->format('M d, Y H:i:s') }}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm">
                                            <span
                                                class="font-medium text-gray-900">{{ ucwords(str_replace('_', ' ', $log->action)) }}</span>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {{ $log->user->name ?? $log->user->email ?? 'System' }}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            @if($log->details)
                                                <pre class="text-xs">{{ json_encode($log->details, JSON_PRETTY_PRINT) }}</pre>
                                            @else
                                                -
                                            @endif
                                        </td>
                                    </tr>
                                @empty
                                    <tr>
                                        <td colspan="4" class="px-6 py-4 text-center text-sm text-gray-500">No logs found.</td>
                                    </tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Actions -->
            <div class="mt-4 flex justify-between">
                <div>
                    <a href="{{ route('update_manager.versions.list', $branch) }}"
                        class="inline-flex items-center px-4 py-2 bg-gray-200 border border-transparent rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest hover:bg-gray-300 active:bg-gray-400 focus:outline-none focus:border-gray-400 focus:ring ring-gray-300 disabled:opacity-25 transition ease-in-out duration-150">
                        Back to Versions
                    </a>
                </div>

                <div>
                    <form action="{{ route('update_manager.versions.delete', [$branch, $version]) }}" method="POST"
                        class="inline-block"
                        onsubmit="return confirm('Are you sure you want to delete this version? This action cannot be undone.');">
                        @csrf
                        @method('DELETE')
                        <button type="submit"
                            class="inline-flex items-center px-4 py-2 bg-red-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-red-700 active:bg-red-900 focus:outline-none focus:border-red-900 focus:ring ring-red-300 disabled:opacity-25 transition ease-in-out duration-150">
                            Delete Version
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>

    @push('scripts')
        <script>
            function copyToClipboard(text) {
                const element = document.createElement('textarea');
                element.value = text;
                document.body.appendChild(element);
                element.select();
                document.execCommand('copy');
                document.body.removeChild(element);

                alert('Copied to clipboard!');
            }
        </script>
    @endpush
@endsection