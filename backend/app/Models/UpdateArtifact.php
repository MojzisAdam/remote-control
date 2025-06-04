<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UpdateArtifact extends Model
{
    use HasFactory;

    protected $fillable = [
        'version_id',
        'original_filename',
        'storage_path',
        'file_size',
        'file_type',
        'uploaded_by',
    ];

    /**
     * Get the version this artifact belongs to.
     */
    public function version(): BelongsTo
    {
        return $this->belongsTo(UpdateVersion::class, 'version_id');
    }

    /**
     * Get the user who uploaded this artifact.
     */
    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
