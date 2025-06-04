<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UpdateLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'action',
        'user_id',
        'branch_id',
        'version_id',
        'details',
    ];

    protected $casts = [
        'details' => 'array',
    ];

    /**
     * Get the user who performed this action.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the branch this log relates to.
     */
    public function branch(): BelongsTo
    {
        return $this->belongsTo(UpdateBranch::class, 'branch_id');
    }

    /**
     * Get the version this log relates to.
     */
    public function version(): BelongsTo
    {
        return $this->belongsTo(UpdateVersion::class, 'version_id');
    }
}
