<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\File;

class StoreArticleRequest extends FormRequest
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
            'title' => ['required', 'string'],
            'content' => ['required', 'string'],
            'cover' => ['sometimes', File::image()->max('10mb')],
            'tags' => ['sometimes', 'array'],
            'tags.*' => ['integer', 'exists:tags,id'],
            'is_premium' => ['sometimes', 'boolean'],
            'status' => ['sometimes', 'in:draft,published'],
        ];
    }
}
