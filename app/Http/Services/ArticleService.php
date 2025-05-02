<?php

namespace App\Http\Services;

use App\Models\Article;
use App\Models\Comment;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Exception;
use Illuminate\Support\Str;

class ArticleService
{
    public function listAllArticles(
        array $sorts = [],
        ?int $authorId,
        ?Carbon $createdSinceDate,
        ?string $searchValue,
        ?string $status,
        ?array $tags = []
    ) {
        $query = Article::query()->with(['tags', 'author']);

        foreach ($sorts as $key => $direction) {
            $query = $query->orderBy($key, $direction);
        }

        if (!is_null($authorId)) {
            $query->where('author_id', $authorId);
        }

        if (!is_null($searchValue)) {
            $query->where('title', 'ilike', '%' . $searchValue . '%');
        }

        if (!is_null($createdSinceDate)) {
            $query->where('created_at', '>=', $createdSinceDate);
        }

        if (!is_null(($tags))) {
            $query->whereHas('tags', function (Builder $query) use ($tags) {
                $query->whereIn(DB::raw('LOWER(name)'), $tags);
            });
        }

        if (!is_null($status)) {
            $query->where('status', $status);
        }

        return $query;
    }

    public function store(
        string $title,
        string $content,
        string $status,
        User $author,
        $isPremium,
    ): Article {
        $article = new Article;

        $article->title = $title;
        $article->content = $content;
        $article->is_premium = boolval($isPremium);
        $article->status = $status;
        $article->author()->associate($author);

        $article->save();
        return $article;
    }

    public function findArticleById(int $articleId): ?Article
    {
        return Article::query()
            ->with('author')
            ->where('id', $articleId)
            ->with(['tags'])
            ->first();
    }

    public function findOrThrow(int $articleId): Article
    {
        $article = $this->findArticleById($articleId);

        if (is_null($article)) {
            abort(404, 'Article not found');
        }

        return $article;
    }

    public function getCommentsForArticle(Article $article, ?int $authorId, ?string $status, int $page, int $pageSize, array $sorts)
    {
        $query = $article->comments()->with('histories')->with('author');

        foreach ($sorts as $key => $direction) {
            $query = $query->orderBy($key, $direction);
        }

        if (!is_null($authorId)) {
            $query->where('author_id', $authorId);
        }

        if (!is_null($status)) {
            $query->where('status', $status);
        }

        return $query
            ->paginate(perPage: $pageSize, page: $page)
            ->withQueryString();
    }

    public function addComment(Article $article, string $status, string $commentContent, User $author)
    {
        $comment = new Comment;
        $comment->content = $commentContent;
        $comment->status = $status;

        $comment->author()->associate($author);

        $article->comments()->save($comment);

        return $comment;
    }

    public function filterArticlesByTagId(int $tagId, int $page, int $pageSize, array $sorts)
    {
        $query = Article::query()->whereHas('tags', function ($query) use ($tagId) {
            $query->where('tags.id', $tagId);
        })->with('tags');

        foreach ($sorts as $key => $direction) {
            $query = $query->orderBy($key, $direction);
        }

        return $query
            ->paginate(perPage: $pageSize, page: $page)
            ->withQueryString();
    }

    public function updateArticle(
        Article $article,
        ?string $title,
        ?string $content,
        ?bool $isPremium,
        ?string $status,
        mixed $cover
    ): bool {
        if (!is_null($title)) {
            $article->title = $title;
        }

        if (!is_null($content)) {
            $article->content = $content;
        }

        if (!is_null($isPremium)) {
            $article->is_premium = $isPremium;
        }

        if (!is_null($status)) {
            $article->status = $status;
        }

        if (!is_null($cover)) {
            $coverUrl = $this->updateCoverPhoto($article, $cover);
            $article->cover_url = $coverUrl;
        }

        return $article->save();
    }

    protected function updateCoverPhoto(Article $article, mixed $coverPhoto): ?string
    {
        try {
            if (!is_null($article->cover_url)) {
                $relativePath = str_replace('storage/', '', $article->cover_url);
                Storage::disk('public')->delete($relativePath);
            }

            $fileName = Str::uuid()->toString() .  $coverPhoto->getClientOriginalExtension();
            $fileUrl = Storage::disk('public')->putFileAs('covers', $coverPhoto, $fileName);

            return Storage::disk('public')->url($fileUrl);
        } catch (Exception $e) {
            throw $e;
        }

        return true;
    }
}
