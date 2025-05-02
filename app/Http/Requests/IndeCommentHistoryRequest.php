<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndeCommentHistoryRequest extends FormRequest
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
            'sort.updated_at' => ['sometimes', 'required', 'string', Rule::in(['asc', 'desc'])],
            'filter' => ['sometimes', 'required', 'array'],
            'filter.authorId' => ['sometimes', 'required', 'numeric', 'exists:users,id'],
            'filter.createdSinceDate' => ['sometimes', 'required', 'date'],
            'filter.status' => ['sometimes', 'required', 'string', Rule::in(['draft', 'published'])],
            'search' => ['sometimes', 'nullable', 'string'],
        ];
    }
}
