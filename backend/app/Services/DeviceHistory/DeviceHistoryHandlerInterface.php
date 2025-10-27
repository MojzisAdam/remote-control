<?php

namespace App\Services\DeviceHistory;

use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Builder;

interface DeviceHistoryHandlerInterface
{
    /**
     * Get the query builder for device history
     */
    public function getQuery(string $deviceId): Builder;

    /**
     * Apply date range filters to the query
     */
    public function applyDateRange(Builder $query, Request $request): Builder;

    /**
     * Apply error filtering to the query
     */
    public function applyErrorFilter(Builder $query, bool $errorOnly): Builder;

    /**
     * Get the appropriate resource class for data transformation
     */
    public function getDataTransformationResource(): string;

    /**
     * Get the appropriate resource class for dynamic data transformation
     */
    public function getDynamicDataTransformationResource(): string;

    /**
     * Get the appropriate resource class for history table
     */
    public function getHistoryTableResource(): string;

    /**
     * Get validation rules for inserting history
     */
    public function getInsertValidationRules(): array;

    /**
     * Insert history data
     */
    public function insertHistory(array $validated): void;

    /**
     * Get the error column name for this device display type
     */
    public function getErrorColumn(): string;

    /**
     * Get available columns for this device display type
     */
    public function getAvailableColumns(): array;

    /**
     * Get temperature columns for this device display type (used for monthly averages)
     */
    public function getTemperatureColumns(): array;
}