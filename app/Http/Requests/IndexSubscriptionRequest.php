<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexSubscriptionRequest extends FormRequest
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
        return [
            'page' => ['sometimes', 'required', 'numeric'],
            'perPage' => ['sometimes', 'required', 'numeric'],
            'sort' => ['sometimes', 'required', 'array'],
            'sort.created_at' => ['sometimes', 'required', 'string', Rule::in(['asc', 'desc'])],
            'sort.plan' => ['sometimes', 'required', 'string', Rule::in(['asc', 'desc'])],
            'sort.starts_at' => ['sometimes', 'required', 'string', Rule::in(['asc', 'desc'])],
            'sort.ends_at' => ['sometimes', 'required', 'string', Rule::in(['asc', 'desc'])],
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
            'sort.*.in' => 'The sort direction must be either "asc" or "desc".',
        ];
    }
}
