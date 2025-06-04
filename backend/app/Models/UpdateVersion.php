<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class UpdateVersion extends Model
{
    use HasFactory;

    protected $fillable = [
        'branch_id',
        'python_version_id',
        'version',
        'release_date',
        'checksum',
        'zip_url',
        'requirements_url',
        'release_notes',
        'is_current',
    ];

    protected $casts = [
        'release_date' => 'datetime',
        'is_current' => 'boolean',
    ];    /**
         * Get the branch this version belongs to.
         */
    public function branch(): BelongsTo
    {
        return $this->belongsTo(UpdateBranch::class, 'branch_id');
    }

    /**
     * Get the Python version associated with this update version.
     */
    public function pythonVersion(): BelongsTo
    {
        return $this->belongsTo(PythonVersion::class, 'python_version_id');
    }

    /**
     * Get artifacts associated with this version.
     */
    public function artifacts(): HasMany
    {
        return $this->hasMany(UpdateArtifact::class, 'version_id');
    }

    /**
     * Get the ZIP artifact for this version.
     */
    public function zipArtifact()
    {
        return $this->artifacts()->where('file_type', 'zip')->first();
    }

    /**
     * Get the requirements artifact for this version.
     */
    public function requirementsArtifact()
    {
        return $this->artifacts()->where('file_type', 'txt')->first();
    }

    /**
     * Get update logs for this version.
     */
    public function logs(): HasMany
    {
        return $this->hasMany(UpdateLog::class, 'version_id');
    }
}
