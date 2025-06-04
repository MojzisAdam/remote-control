<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class UpdateBranch extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'manifest_url',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get all versions associated with this branch.
     */
    public function versions(): HasMany
    {
        return $this->hasMany(UpdateVersion::class, 'branch_id');
    }

    /**
     * Get the current (latest) version for this branch.
     */
    public function currentVersion()
    {
        return $this->versions()->where('is_current', true)->first();
    }

    /**
     * Get update logs for this branch.
     */
    public function logs(): HasMany
    {
        return $this->hasMany(UpdateLog::class, 'branch_id');
    }
}
