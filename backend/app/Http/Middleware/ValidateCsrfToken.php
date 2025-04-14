<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
/**
 * Alias of VerifyCsrfToken for consistency.
 */
class ValidateCsrfToken extends VerifyCsrfToken
{
    //
    protected $except = [
        'api/261dfg59_4',
        'api/261dfg59_4.php',
    ];
}