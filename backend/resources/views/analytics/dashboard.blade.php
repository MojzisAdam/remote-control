@extends('layouts.app')

@section('content')
    <div class="py-12 bg-gray-100">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="flex justify-between items-center mb-6">
                <h1 class="text-2xl font-semibold text-gray-900">Traffic Analytics Dashboard</h1>

                <div class="flex items-center">
                    <label for="period-selector" class="mr-2">Period:</label>
                    <select id="period-selector"
                        class="rounded-md shadow-sm border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                        @foreach ($periods as $p)
                            <option value="{{ $p }}" {{ $period === $p ? 'selected' : '' }}>
                                {{ ucfirst($p) }}
                            </option>
                        @endforeach
                    </select>
                </div>
            </div>

            <!-- Log Statistics and Cleanup Section -->
            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 mb-6">
                <h2 class="text-lg font-semibold mb-4">Log Storage Statistics</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div class="bg-blue-50 p-4 rounded-lg">
                        <div class="text-sm font-medium text-blue-600">Total Logs</div>
                        <div id="total-logs" class="text-2xl font-bold text-blue-900">-</div>
                    </div>
                    <div class="bg-green-50 p-4 rounded-lg">
                        <div class="text-sm font-medium text-green-600">Last Month</div>
                        <div id="logs-month" class="text-2xl font-bold text-green-900">-</div>
                    </div>
                    <div class="bg-yellow-50 p-4 rounded-lg">
                        <div class="text-sm font-medium text-yellow-600">Last 3 Months</div>
                        <div id="logs-3months" class="text-2xl font-bold text-yellow-900">-</div>
                    </div>
                    <div class="bg-purple-50 p-4 rounded-lg">
                        <div class="text-sm font-medium text-purple-600">Last Year</div>
                        <div id="logs-year" class="text-2xl font-bold text-purple-900">-</div>
                    </div>
                </div>

                <div class="text-sm text-gray-600 mb-4">
                    <span>Oldest log: <span id="oldest-log" class="font-mono">-</span></span> |
                    <span>Newest log: <span id="newest-log" class="font-mono">-</span></span>
                </div>

                <div class="flex flex-wrap gap-2">
                    <button onclick="showCleanupModal('week')"
                        class="px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm">
                        Delete logs older than 1 week (<span id="cleanup-week">-</span> logs)
                    </button>
                    <button onclick="showCleanupModal('month')"
                        class="px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm">
                        Delete logs older than 1 month (<span id="cleanup-month">-</span> logs)
                    </button>
                    <button onclick="showCleanupModal('3months')"
                        class="px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm">
                        Delete logs older than 3 months (<span id="cleanup-3months">-</span> logs)
                    </button>
                    <button onclick="showCleanupModal('6months')"
                        class="px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm">
                        Delete logs older than 6 months (<span id="cleanup-6months">-</span> logs)
                    </button>
                    <button onclick="showCleanupModal('year')"
                        class="px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm">
                        Delete logs older than 1 year (<span id="cleanup-year">-</span> logs)
                    </button>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Traffic Over Time Chart -->
                <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                    <h2 class="text-lg font-semibold mb-4">Traffic Volume Over Time</h2>
                    <div class="h-80">
                        <canvas id="trafficChart"></canvas>
                    </div>
                </div>

                <!-- Top Routes Table -->
                <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                    <h2 class="text-lg font-semibold mb-4">Most Visited Routes</h2>
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th
                                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Route</th>
                                    <th
                                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Method</th>
                                    <th
                                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Hits</th>
                                </tr>
                            </thead>
                            <tbody id="routes-table-body" class="bg-white divide-y divide-gray-200">
                                <!-- Routes data will be loaded here -->
                                <tr>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500" colspan="3">Loading...
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Response Times -->
                <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                    <h2 class="text-lg font-semibold mb-4">Slowest Routes (Average Response Time)</h2>
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th
                                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Route</th>
                                    <th
                                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Method</th>
                                    <th
                                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Avg Time (ms)</th>
                                </tr>
                            </thead>
                            <tbody id="response-times-table-body" class="bg-white divide-y divide-gray-200">
                                <!-- Response time data will be loaded here -->
                                <tr>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500" colspan="3">Loading...
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- IP Addresses -->
                <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                    <h2 class="text-lg font-semibold mb-4">Top IP Addresses</h2>
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th
                                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        IP Address</th>
                                    <th
                                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Request Count</th>
                                </tr>
                            </thead>
                            <tbody id="ip-table-body" class="bg-white divide-y divide-gray-200">
                                <!-- IP data will be loaded here -->
                                <tr>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500" colspan="2">Loading...
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Cleanup Confirmation Modal -->
    <div id="cleanup-modal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full hidden">
        <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div class="mt-3 text-center">
                <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                    <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z">
                        </path>
                    </svg>
                </div>
                <h3 class="text-lg leading-6 font-medium text-gray-900 mt-2">Delete Old Logs</h3>
                <div class="mt-2 px-7 py-3">
                    <p class="text-sm text-gray-500" id="cleanup-modal-text">
                        Are you sure you want to delete logs older than the specified period? This action cannot be undone.
                    </p>
                    <p class="text-sm font-medium text-red-600 mt-2" id="cleanup-count-text"></p>
                </div>
                <div class="items-center px-4 py-3">
                    <button id="confirm-cleanup"
                        class="px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300">
                        Delete Logs
                    </button>
                    <button onclick="hideCleanupModal()"
                        class="mt-3 px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Success/Error Message Toast -->
    <div id="message-toast" class="fixed top-4 right-4 p-4 rounded-md shadow-lg hidden z-50">
        <div class="flex items-center">
            <div id="toast-icon" class="mr-3"></div>
            <div id="toast-message" class="text-sm font-medium"></div>
            <button onclick="hideToast()" class="ml-4 text-gray-400 hover:text-gray-600">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </div>
    </div>
@endsection

@push('scripts')
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', function () {
            let trafficChart = null;
            let currentCleanupPeriod = null;
            const periodSelector = document.getElementById('period-selector');

            // Load data based on selected period
            function loadDashboardData(period) {
                // Load traffic trend chart
                fetch(`/admin/api/traffic/trend?period=${period}`)
                    .then(response => response.json())
                    .then(data => {
                        renderTrafficChart(data);
                    })
                    .catch(error => console.error('Error loading traffic trend:', error));

                // Load top routes
                fetch(`/admin/api/traffic/routes?period=${period}`)
                    .then(response => response.json())
                    .then(data => {
                        renderRoutesTable(data);
                    })
                    .catch(error => console.error('Error loading routes:', error));

                // Load response times
                fetch(`/admin/api/traffic/response-times?period=${period}`)
                    .then(response => response.json())
                    .then(data => {
                        renderResponseTimesTable(data);
                    })
                    .catch(error => console.error('Error loading response times:', error));

                // Load IP addresses
                fetch(`/admin/api/traffic/ips?period=${period}`)
                    .then(response => response.json())
                    .then(data => {
                        renderIpTable(data);
                    })
                    .catch(error => console.error('Error loading IP data:', error));
            }

            // Load log statistics
            function loadLogStats() {
                fetch('/admin/api/traffic/stats')
                    .then(response => response.json())
                    .then(data => {
                        document.getElementById('total-logs').textContent = data.total_logs.toLocaleString();
                        document.getElementById('logs-month').textContent = data.logs_last_month.toLocaleString();
                        document.getElementById('logs-3months').textContent = data.logs_last_3_months.toLocaleString();
                        document.getElementById('logs-year').textContent = data.logs_last_year.toLocaleString();

                        document.getElementById('oldest-log').textContent = data.oldest_log_date || 'N/A';
                        document.getElementById('newest-log').textContent = data.newest_log_date || 'N/A';

                        document.getElementById('cleanup-week').textContent = data.logs_older_than_week.toLocaleString();
                        document.getElementById('cleanup-month').textContent = data.logs_older_than_month.toLocaleString();
                        document.getElementById('cleanup-3months').textContent = data.logs_older_than_3_months.toLocaleString();
                        document.getElementById('cleanup-6months').textContent = data.logs_older_than_6_months.toLocaleString();
                        document.getElementById('cleanup-year').textContent = data.logs_older_than_year.toLocaleString();
                    })
                    .catch(error => console.error('Error loading log stats:', error));
            }

            // Show cleanup modal
            window.showCleanupModal = function (period) {
                currentCleanupPeriod = period;
                const modal = document.getElementById('cleanup-modal');
                const countElement = document.getElementById(`cleanup-${period}`);
                const count = countElement.textContent;

                const periodText = {
                    'week': '1 week',
                    'month': '1 month',
                    '3months': '3 months',
                    '6months': '6 months',
                    'year': '1 year'
                };

                document.getElementById('cleanup-modal-text').textContent =
                    `Are you sure you want to delete all logs older than ${periodText[period]}? This action cannot be undone.`;
                document.getElementById('cleanup-count-text').textContent =
                    `This will delete ${count} log entries.`;

                modal.classList.remove('hidden');
            };

            // Hide cleanup modal
            window.hideCleanupModal = function () {
                document.getElementById('cleanup-modal').classList.add('hidden');
                currentCleanupPeriod = null;
            };

            // Show toast message
            function showToast(message, type = 'success') {
                const toast = document.getElementById('message-toast');
                const icon = document.getElementById('toast-icon');
                const messageEl = document.getElementById('toast-message');

                messageEl.textContent = message;

                if (type === 'success') {
                    toast.className = 'fixed top-4 right-4 p-4 rounded-md shadow-lg bg-green-100 border border-green-400 text-green-700 z-50';
                    icon.innerHTML = '<svg class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>';
                } else {
                    toast.className = 'fixed top-4 right-4 p-4 rounded-md shadow-lg bg-red-100 border border-red-400 text-red-700 z-50';
                    icon.innerHTML = '<svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg>';
                }

                toast.classList.remove('hidden');

                // Auto hide after 5 seconds
                setTimeout(() => {
                    hideToast();
                }, 5000);
            }

            // Hide toast message
            window.hideToast = function () {
                document.getElementById('message-toast').classList.add('hidden');
            };

            // Confirm cleanup
            document.getElementById('confirm-cleanup').addEventListener('click', function () {
                if (!currentCleanupPeriod) return;

                this.disabled = true;
                this.textContent = 'Deleting...';

                fetch('/admin/api/traffic/cleanup', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                    },
                    body: JSON.stringify({
                        period: currentCleanupPeriod
                    })
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            showToast(data.message, 'success');
                            loadLogStats(); // Refresh stats
                            loadDashboardData(periodSelector.value); // Refresh dashboard data
                        } else {
                            showToast('Error deleting logs: ' + (data.message || 'Unknown error'), 'error');
                        }
                    })
                    .catch(error => {
                        console.error('Error during cleanup:', error);
                        showToast('Error deleting logs. Please try again.', 'error');
                    })
                    .finally(() => {
                        this.disabled = false;
                        this.textContent = 'Delete Logs';
                        hideCleanupModal();
                    });
            });

            // Render traffic chart
            function renderTrafficChart(data) {
                const ctx = document.getElementById('trafficChart').getContext('2d');

                // If chart already exists, destroy it
                if (trafficChart) {
                    trafficChart.destroy();
                }

                // Prepare data
                const labels = data.data.map(item => item.time_interval);
                const hits = data.data.map(item => item.hits);

                // Create chart
                trafficChart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Request Count',
                            data: hits,
                            backgroundColor: 'rgba(79, 70, 229, 0.2)',
                            borderColor: 'rgba(79, 70, 229, 1)',
                            borderWidth: 2,
                            tension: 0.1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                });
            }

            // Render routes table
            function renderRoutesTable(data) {
                const tableBody = document.getElementById('routes-table-body');
                let html = '';

                if (data.data.length === 0) {
                    html = '<tr><td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500" colspan="3">No data available</td></tr>';
                } else {
                    data.data.forEach(route => {
                        html += `
                                <tr>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${route.route}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${route.method}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${route.hits}</td>
                                </tr>
                            `;
                    });
                }

                tableBody.innerHTML = html;
            }

            // Render response times table
            function renderResponseTimesTable(data) {
                const tableBody = document.getElementById('response-times-table-body');
                let html = '';

                if (data.data.length === 0) {
                    html = '<tr><td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500" colspan="3">No data available</td></tr>';
                } else {
                    data.data.forEach(route => {
                        html += `
                                <tr>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${route.route}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${route.method}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${(route.avg_time * 1000).toFixed(2)}</td>
                                </tr>
                            `;
                    });
                }

                tableBody.innerHTML = html;
            }

            // Render IP table
            function renderIpTable(data) {
                const tableBody = document.getElementById('ip-table-body');
                let html = '';

                if (data.data.length === 0) {
                    html = '<tr><td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500" colspan="2">No data available</td></tr>';
                } else {
                    data.data.forEach(ip => {
                        html += `
                                <tr>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${ip.ip_address}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${ip.request_count}</td>
                                </tr>
                            `;
                    });
                }

                tableBody.innerHTML = html;
            }

            // Period selection change handler
            periodSelector.addEventListener('change', function () {
                const period = this.value;

                // Update URL without reloading page
                const url = new URL(window.location);
                url.searchParams.set('period', period);
                window.history.pushState({}, '', url);

                // Load data for new period
                loadDashboardData(period);
            });

            // Initial data load
            loadDashboardData(periodSelector.value);
            loadLogStats();
        });
    </script>
@endpush