<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\PreventRequestForgery;

/**
 * Alias of PreventRequestForgery for consistency.
 */
class ValidateCsrfToken extends PreventRequestForgery
{
    //
    protected $except = [
        'api/261dfg59_4',
        'api/261dfg59_4.php',
    ];
}