<div class="bg-indigo-800 text-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-12">
            <div class="flex items-center">
                <div class="text-white font-semibold">
                    Admin Area
                </div>
                <div class="hidden md:block ml-10">
                    <div class="flex items-baseline space-x-4">
                        <a href="{{ route('update_manager.dashboard') }}"
                            class="{{ request()->routeIs('update_manager.*') ? 'bg-indigo-900 text-white' : 'text-indigo-300 hover:bg-indigo-700 hover:text-white' }} px-3 py-2 rounded-md text-sm font-medium">
                            Update Manager
                        </a>
                        <a href="{{ route('traffic.dashboard') }}"
                            class="{{ request()->routeIs('traffic.*') ? 'bg-indigo-900 text-white' : 'text-indigo-300 hover:bg-indigo-700 hover:text-white' }} px-3 py-2 rounded-md text-sm font-medium">
                            Traffic Analytics
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>

    @if(request()->routeIs('update_manager.*'))
        <div class="bg-indigo-700">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex items-center h-10">
                    <div class="flex space-x-4">
                        <a href="{{ route('update_manager.dashboard') }}"
                            class="{{ request()->routeIs('update_manager.dashboard') ? 'bg-indigo-800 text-white' : 'text-indigo-100 hover:bg-indigo-600 hover:text-white' }} px-3 py-1 rounded-md text-sm">
                            Dashboard
                        </a>
                        <a href="{{ route('update_manager.branches.list') }}"
                            class="{{ request()->routeIs('update_manager.branches.*') ? 'bg-indigo-800 text-white' : 'text-indigo-100 hover:bg-indigo-600 hover:text-white' }} px-3 py-1 rounded-md text-sm">
                            Branches
                        </a>
                        <a href="{{ route('update_manager.python.index') }}"
                            class="{{ request()->routeIs('update_manager.python.*') ? 'bg-indigo-800 text-white' : 'text-indigo-100 hover:bg-indigo-600 hover:text-white' }} px-3 py-1 rounded-md text-sm">
                            Python Versions
                        </a>
                        <a href="{{ route('update_manager.logs') }}"
                            class="{{ request()->routeIs('update_manager.logs') ? 'bg-indigo-800 text-white' : 'text-indigo-100 hover:bg-indigo-600 hover:text-white' }} px-3 py-1 rounded-md text-sm">
                            Logs
                        </a>
                    </div>
                </div>
            </div>
        </div>
    @endif

    <!-- Mobile menu -->
    <div class="md:hidden" id="mobile-admin-menu">
        <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <a href="{{ route('update_manager.dashboard') }}"
                class="{{ request()->routeIs('update_manager.*') ? 'bg-indigo-900 text-white' : 'text-indigo-300 hover:bg-indigo-700 hover:text-white' }} block px-3 py-2 rounded-md text-base font-medium">
                Update Manager
            </a>
            <a href="{{ route('traffic.dashboard') }}"
                class="{{ request()->routeIs('traffic.*') ? 'bg-indigo-900 text-white' : 'text-indigo-300 hover:bg-indigo-700 hover:text-white' }} block px-3 py-2 rounded-md text-base font-medium">
                Traffic Analytics
            </a>
        </div>
    </div>
</div>