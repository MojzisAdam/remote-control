<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PythonVersion extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'version',
        'display_name',
        'file_path',
        'url',
        'checksum',
        'file_size',
        'uploaded_by',
        'notes',
    ];

    /**
     * Get the user who uploaded this Python version
     */
    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    /**
     * Get all update versions that use this Python version
     */
    public function updateVersions(): HasMany
    {
        return $this->hasMany(UpdateVersion::class);
    }
}
