<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function user(Request $request)
    {
        return new UserResource($request->user());
    }

    public function updateLanguage(Request $request)
    {
        $request->validate([
            'preferred_language' => 'required|string|in:cs,en',
        ]);

        $user = Auth::user();

        $user->update(['preferred_language' => $request->preferred_language]);

        return response()->json(['message' => $request->preferred_language]);
    }

    public function checkForcePasswordChange(Request $request)
    {
        $user = Auth::user();
        return response()->json([
            'force_password_change' => $user->force_password_change
        ]);
    }
    public function updateUserPassword(Request $request)
    {
        $request->validate([
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = Auth::user();

        if (!$user->force_password_change) {
            return response()->json([
                'status' => 'error',
                'message' => 'Password change is not required for this account.',
            ], 403);
        }

        $user->forceFill([
            'password' => Hash::make($request->password),
            'force_password_change' => false,
        ])->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Password updated successfully.',
        ]);
    }
}