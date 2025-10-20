<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class MySqlFloat implements ValidationRule
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

        $floatValue = (float) $value;

        // MySQL FLOAT range: approximately -3.402823466E+38 to 3.402823466E+38
        // Using a slightly more conservative range to avoid edge cases
        if ($floatValue < -3.4E+38 || $floatValue > 3.4E+38) {
            $fail('The :attribute must be within MySQL FLOAT range (-3.4E+38 to 3.4E+38).');
        }

        // Check for special float values
        if (is_infinite($floatValue)) {
            $fail('The :attribute cannot be infinite.');
        }

        if (is_nan($floatValue)) {
            $fail('The :attribute must be a valid number.');
        }
    }
}