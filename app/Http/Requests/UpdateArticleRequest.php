<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\File;

class UpdateArticleRequest extends FormRequest
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
        // Convert 'true'/'false' strings to boolean values for 'is_premium'
        if ($this->has('is_premium')) {
            $this->merge([
                'is_premium' => filter_var($this->is_premium, FILTER_VALIDATE_BOOLEAN)
            ]);
        }
        return [
            'title' => ['nullable', 'string'],
            'content' => ['nullable', 'string'],
            'cover' => ['sometimes', File::image()->max('10mb')],
            'status' => ['sometimes', 'in:draft,published'],
            'is_premium' => ['sometimes', 'boolean'],
            'added_tags' => ['sometimes', 'array'],
            'removed_tags' => ['sometimes', 'array'],
            'added_tags.*' => ['integer', 'exists:tags,id'],
            'removed_tags.*' => ['integer', 'exists:tags,id']
        ];
    }
}
