<?php

namespace App\Http\Services;

use App\Models\Tag;

class TagService
{

  public function create(object $payload): Tag
  {
    $tag = new Tag;

    $tag->name = $payload->name;

    $tag->save();

    return $tag;
  }

  public function getAll()
  {
    return Tag::query()->get();
  }

  public function findById(int $tagId): ?Tag
  {
    return Tag::query()->where('id', $tagId)->first();
  }

  public function findOrThrow(int $tagId): Tag
  {
    $tag = $this->findById($tagId);

    if (is_null($tag)) {
      abort(404, 'Tag not found');
    }

    return $tag;
  }

  public function update(int $tagId, object $payload): Tag
  {
    $tag = $this->findOrThrow($tagId);

    $tag->name = $payload->name;

    $tag->save();

    return $tag;
  }

  public function delete(int $tagId): Tag
  {
    $tag = $this->findOrThrow($tagId);

    $tag->delete();

    return $tag;
  }
}
