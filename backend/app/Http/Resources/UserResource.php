<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;


class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'email' => $this->email,
            'email_verified_at' => $this->email_verified_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'roles' => $this->roles->pluck('name'),
            'permissions' => $this->getAllPermissions()->pluck('name'),
            'has2FA' => $this->two_factor_confirmed_at ? true : false,
            'displayLastVisitedDevice' => $this->displayLastVisitedDevice,
            'lastVisitedDeviceId' => $this->lastVisitedDeviceId,
            'preferred_language' => $this->preferred_language
        ];
    }
}