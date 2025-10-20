<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class MySqlTinyInteger implements ValidationRule
{
    /**
     * Run the validation rule.
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        // Check if value is numeric
        if (!is_numeric($value)) {
            $fail('The :attribute must be a number.');
            return;
        }

        // Check if value is an integer
        if (!is_int($value) && !ctype_digit((string) $value) && !preg_match('/^-?\d+$/', (string) $value)) {
            $fail('The :attribute must be an integer.');
            return;
        }

        $intValue = (int) $value;

        // MySQL TINYINT range: -128 to 127
        if ($intValue < -128 || $intValue > 127) {
            $fail('The :attribute must be between -128 and 127 (MySQL TINYINT range).');
        }
    }
}