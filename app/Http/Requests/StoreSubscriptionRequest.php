<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Http\Controllers\SubscriptionController;

class StoreSubscriptionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $subscriptionController = app(SubscriptionController::class);
        $validPlans = collect($subscriptionController->subscriptionPlans)
            ->pluck('code')
            ->toArray();

        return [
            'user_id' => ['required', 'exists:users,id'],
            'plan' => ['required', 'array'],
            'plan.code' => ['required', 'string', 'in:' . implode(',', $validPlans)],
            'plan.title' => ['required', 'string'],
            'plan.duration' => ['required', 'integer', 'min:1'],
            'plan.price' => ['required', 'numeric', 'min:0'],
            'creditCard' => ['required', 'array'],
            'creditCard.card_number' => ['required', 'string', 'min:13', 'max:19'],
            'creditCard.cvv' => ['required', 'string', 'size:3'],
            'creditCard.expiry_date' => ['required', 'array'],
            'creditCard.expiry_date.month' => ['required', 'integer', 'between:1,12'],
            'creditCard.expiry_date.year' => ['required', 'integer', 'min:' . date('Y')],
            'creditCard.name' => ['required', 'string', 'max:255'],
            'creditCard.surname' => ['required', 'string', 'max:255'],
            'creditCard.address' => ['required', 'string', 'max:255'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array
     */
    public function messages()
    {
        return [
            'user_id.required' => 'A user ID is required.',
            'user_id.exists' => 'The specified user does not exist.',
            'plan.code.in' => 'The selected plan is invalid.',
            'plan.duration.min' => 'The plan duration must be at least 1 month.',
            'plan.price.min' => 'The plan price must be a positive number.',
            'creditCard.card_number.min' => 'The card number must be at least 13 digits.',
            'creditCard.card_number.max' => 'The card number must not exceed 19 digits.',
            'creditCard.cvv.size' => 'The CVV must be 3 digits.',
            'creditCard.expiry_date.month.between' => 'The expiry month must be between 1 and 12.',
            'creditCard.expiry_date.year.min' => 'The expiry year must not be in the past.',
        ];
    }
}
