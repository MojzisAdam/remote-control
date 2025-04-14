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
}