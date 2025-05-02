<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateTagRequest;
use App\Http\Requests\UpdateTagRequest;
use App\Http\Services\TagService;
use Illuminate\Http\Request;

class TagController
{
    private TagService $tagService;

    public function __construct(TagService $service)
    {
        $this->tagService = $service;
    }
    //
    public function index()
    {
        return $this->tagService->getAll();
    }

    public function show(int $tagId)
    {
        // get a tag by ID
        $tag = $this->tagService->findById($tagId);

        if (is_null($tag)) {
            abort(404, 'Tag not found');
        }

        return $tag;
    }

    public function create(CreateTagRequest $request)
    {
        $tagName = $request->validated('name');

        $tag = $this->tagService->create((object) ['name' => $tagName]);

        return response()->json($tag, 201);
    }

    public function update(int $tagId, UpdateTagRequest $request)
    {
        // edit a tag by ID
        $tagName = $request->validated('name');

        $updatedTag = $this->tagService->update($tagId, (object) ['name'  => $tagName]);

        return $updatedTag;
    }

    public function delete(int $tagId)
    {
        return $this->tagService->delete($tagId);
    }
}
