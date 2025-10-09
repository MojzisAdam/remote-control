<?php

namespace App\Policies;

use Illuminate\Auth\Access\Response;
use App\Models\Automation;
use App\Models\User;

class AutomationPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // All authenticated users can view their own automations
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Automation $automation): bool
    {
        // Users can only view their own automations
        return $user->id === $automation->user_id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // All authenticated users can create automations
        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Automation $automation): bool
    {
        // Users can only update their own automations
        return $user->id === $automation->user_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Automation $automation): bool
    {
        // Users can only delete their own automations
        return $user->id === $automation->user_id;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Automation $automation): bool
    {
        // Users can only restore their own automations
        return $user->id === $automation->user_id;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Automation $automation): bool
    {
        // Users can only force delete their own automations (or super admins)
        return $user->id === $automation->user_id || $user->isSuperAdmin();
    }

    /**
     * Determine whether the user can toggle the automation enabled status.
     */
    public function toggle(User $user, Automation $automation): bool
    {
        // Users can only toggle their own automations
        return $user->id === $automation->user_id;
    }

    /**
     * Determine whether the user can view automation logs.
     */
    public function viewLogs(User $user, Automation $automation): bool
    {
        // Users can only view logs for their own automations
        return $user->id === $automation->user_id;
    }
}