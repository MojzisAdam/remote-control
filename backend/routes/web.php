<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('reset-password/{token}', function () {
    abort(404); // Pretend the route does not exist
})->name('password.reset');