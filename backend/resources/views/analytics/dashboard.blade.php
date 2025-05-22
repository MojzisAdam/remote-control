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
@endsection

@push('scripts')
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', function () {
            let trafficChart = null;
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
        });
    </script>
@endpush