<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAutomationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization is handled by policies
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'string|max:255',
            'description' => 'nullable|string|max:1000',
            'enabled' => 'boolean',
            'is_draft' => 'boolean',

            // Flow metadata validation
            'flow_metadata' => 'nullable|array',
            'flow_metadata.nodes' => 'array',
            'flow_metadata.nodes.*.id' => 'required|string',
            'flow_metadata.nodes.*.position' => 'required|array',
            'flow_metadata.nodes.*.position.x' => 'required|numeric',
            'flow_metadata.nodes.*.position.y' => 'required|numeric',
            'flow_metadata.nodes.*.type' => 'required|string',
            'flow_metadata.edges' => 'array',
            'flow_metadata.edges.*.id' => 'required|string',
            'flow_metadata.edges.*.source' => 'required|string',
            'flow_metadata.edges.*.target' => 'required|string',

            // Triggers validation (optional for updates)
            'triggers' => 'array|max:10',
            'triggers.*.id' => 'nullable|integer|exists:automation_triggers,id',
            'triggers.*.type' => ['required', Rule::in(['time', 'interval', 'mqtt', 'state_change'])],

            // Time trigger fields
            'triggers.*.time_at' => 'nullable|date_format:H:i|required_if:triggers.*.type,time',
            'triggers.*.days_of_week' => 'nullable|array|required_if:triggers.*.type,time',
            'triggers.*.days_of_week.*' => Rule::in(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']),

            // Interval trigger fields
            'triggers.*.interval_seconds' => 'nullable|integer|min:1|required_if:triggers.*.type,interval',

            // MQTT trigger fields
            'triggers.*.mqtt_topic' => 'nullable|string|max:255|required_if:triggers.*.type,mqtt',
            'triggers.*.mqtt_payload' => 'nullable|array',

            // State change trigger fields
            'triggers.*.device_id' => 'nullable|string|exists:devices,id|required_if:triggers.*.type,state_change',
            'triggers.*.field' => 'nullable|string|max:255|required_if:triggers.*.type,state_change',
            // Note: state_change triggers don't need operator and value - they trigger on any change
            'triggers.*.operator' => [
                'nullable',
                'string',
                Rule::in(['<', '<=', '=', '>=', '>', '!='])
            ],
            'triggers.*.value' => 'nullable',

            // Conditions validation (optional)
            'conditions' => 'array|max:20',
            'conditions.*.id' => 'nullable|integer|exists:automation_conditions,id',
            'conditions.*.type' => ['required', Rule::in(['simple', 'time', 'day_of_week'])],

            // Simple condition fields (conditional)
            'conditions.*.device_id' => 'nullable|string|exists:devices,id',
            'conditions.*.field' => 'nullable|string|max:255',
            'conditions.*.operator' => ['nullable', Rule::in(['<', '<=', '=', '>=', '>', '!='])],
            'conditions.*.value' => 'nullable', // Allow any type (string, number, boolean)

            // Time condition fields (conditional)
            'conditions.*.time_at' => 'nullable|date_format:H:i',

            // Day of week condition fields (conditional)
            'conditions.*.days_of_week' => 'nullable|array',
            'conditions.*.days_of_week.*' => Rule::in(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),

            // Actions validation (optional for updates)
            'actions' => 'array|max:20',
            'actions.*.id' => 'nullable|integer|exists:automation_actions,id',
            'actions.*.type' => ['required', Rule::in(['mqtt_publish', 'notify', 'log', 'device_control'])],

            // MQTT publish action fields
            'actions.*.mqtt_topic' => 'nullable|string|max:255|required_if:actions.*.type,mqtt_publish',
            'actions.*.mqtt_payload' => 'nullable|array|required_if:actions.*.type,mqtt_publish',

            // Device control action fields
            'actions.*.device_id' => 'nullable|string|exists:devices,id|required_if:actions.*.type,device_control',
            'actions.*.field' => 'nullable|string|max:255|required_if:actions.*.type,device_control',
            'actions.*.control_type' => 'nullable|string|max:255',
            'actions.*.value' => 'nullable|required_if:actions.*.type,log|required_if:actions.*.type,device_control', // Required for log and device_control actions

            // Notification action fields
            'actions.*.notification_title' => 'nullable|string|max:255|required_if:actions.*.type,notify',
            'actions.*.notification_message' => 'nullable|string|max:1000|required_if:actions.*.type,notify',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'triggers.*.type.required' => 'Trigger type is required.',
            'triggers.*.type.in' => 'Invalid trigger type. Must be time, mqtt, or state_change.',
            'actions.*.type.required' => 'Action type is required.',
            'actions.*.type.in' => 'Invalid action type.',
            'conditions.*.device_id.exists' => 'Selected device does not exist.',
            'actions.*.device_id.exists' => 'Selected device does not exist.',
            'triggers.*.device_id.exists' => 'Selected device does not exist.',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $isDraft = $this->input('is_draft', false);

            // Only require triggers and actions for non-draft automations
            if (!$isDraft) {
                $triggers = $this->input('triggers', []);
                $actions = $this->input('actions', []);

                if (empty($triggers)) {
                    $validator->errors()->add('triggers', 'At least one trigger is required for non-draft automations.');
                }

                if (empty($actions)) {
                    $validator->errors()->add('actions', 'At least one action is required for non-draft automations.');
                }
            }

            $conditions = $this->input('conditions', []);

            foreach ($conditions as $index => $condition) {
                $conditionType = $condition['type'] ?? null;

                if ($conditionType === 'simple') {
                    // Simple conditions require device_id, field, operator, and value
                    if (empty($condition['device_id'])) {
                        $validator->errors()->add("conditions.$index.device_id", 'Device ID is required for simple conditions.');
                    }
                    if (empty($condition['field'])) {
                        $validator->errors()->add("conditions.$index.field", 'Field is required for simple conditions.');
                    }
                    if (empty($condition['operator'])) {
                        $validator->errors()->add("conditions.$index.operator", 'Operator is required for simple conditions.');
                    }
                    if (!isset($condition['value']) || $condition['value'] === '') {
                        $validator->errors()->add("conditions.$index.value", 'Value is required for simple conditions.');
                    }
                } elseif ($conditionType === 'time') {
                    // Time conditions require time_at
                    if (empty($condition['time_at'])) {
                        $validator->errors()->add("conditions.$index.time_at", 'Time is required for time conditions.');
                    }
                } elseif ($conditionType === 'day_of_week') {
                    // Day of week conditions require days_of_week array
                    if (empty($condition['days_of_week']) || !is_array($condition['days_of_week'])) {
                        $validator->errors()->add("conditions.$index.days_of_week", 'Days of week are required for day_of_week conditions.');
                    }
                }
            }
        });
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Ensure enabled is a boolean
        if ($this->has('enabled')) {
            $this->merge([
                'enabled' => filter_var($this->enabled, FILTER_VALIDATE_BOOLEAN),
            ]);
        }

        // Ensure arrays are properly formatted
        if ($this->has('triggers') && is_string($this->triggers)) {
            $this->merge([
                'triggers' => json_decode($this->triggers, true) ?: [],
            ]);
        }

        if ($this->has('conditions') && is_string($this->conditions)) {
            $this->merge([
                'conditions' => json_decode($this->conditions, true) ?: [],
            ]);
        }

        if ($this->has('actions') && is_string($this->actions)) {
            $this->merge([
                'actions' => json_decode($this->actions, true) ?: [],
            ]);
        }
    }
}