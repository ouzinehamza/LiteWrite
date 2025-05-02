<?php

namespace App\Http\Controllers;

use App\Http\Requests\FilterArticlesByTagRequest;
use App\Http\Requests\GetCommentsRequest;
use App\Http\Requests\IndexArticleRequest;
use App\Http\Requests\IndexDraftHistoriesRequest;
use App\Http\Requests\StoreArticleRequest;
use App\Http\Requests\StoreCommentRequest;
use App\Http\Requests\UpdateArticleRequest;
use App\Http\Services\ArticleHistoryService;
use App\Models\Article;
use App\Http\Services\ArticleService;
use App\Http\Services\TagService;
use App\Models\Comment;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ArticleController
{
    public function __construct(
        private ArticleService $articleService,
        private TagService $tagService,
        private ArticleHistoryService $articleHistoryService,
    ) {}

    public function index(IndexArticleRequest $request)
    {
        $page = (int) ($request->validated('page') ?? 1);
        $pageSize = (int) ($request->validated('perPage') ?? 5);
        $sorts = $request->validated('sort') ?? [];
        $authorId = $request->validated('filter.authorId');
        $searchValue = $request->validated('search');
        $tags = $request->validated('filter.tags'); // comma-separated tag names
        $status = $request->validated('filter.status');
        $createdSinceDate = $request->validated('filter.createdSinceDate')
            ? Carbon::parse($request->validated('filter.createdSinceDate'))
            : null;

        if (!is_null($tags)) {
            $tags = array_map(function ($tag) {
                return strtolower(trim($tag));
            }, explode(',', $tags));
        }

        $query = $this->articleService->listAllArticles(
            $sorts,
            $authorId,
            $createdSinceDate,
            $searchValue,
            $status,
            $tags
        );

        return $query
            ->paginate(perPage: $pageSize, page: $page)
            ->withQueryString();
    }

    public function show(int $articleId)
    {
        $article = $this->articleService->findArticleById($articleId);
        if (is_null($article)) {
            throw new HttpException(404, 'Article not found');
        }

        $authUser = Auth::user();

        if (
            ($article->status == 'draft' && !$authUser) ||
            ($article->status == 'draft' && $article->author_id !== $authUser->id)
        ) {
            throw new HttpException(404, 'Article not found');
        }

        if ($article->is_premium && (!$authUser || !$authUser->has_active_subscription)) {
            $article->content = Str::limit($article->content, strlen($article->content) / 2);
        }

        return $article;
    }

    public function comments(int $articleId, GetCommentsRequest $request)
    {
        $page = (int) ($request->validated('page') ?? 1);
        $pageSize = (int) ($request->validated('perPage') ?? 5);
        $sorts = $request->validated('sort') ?? [];
        $status = $request->validated('filter.status');
        $authorId = $request->validated('filter.authorId');

        $article = $this->articleService->findArticleById($articleId);

        if (is_null($article)) {
            abort(404, 'Article not found');
        }
        $comments = $this->articleService->getCommentsForArticle($article, $authorId, $status, $page, $pageSize, $sorts);

        return $comments;
    }

    public function store(StoreArticleRequest $request)
    {
        $title = $request->validated('title');
        $content = $request->validated('content');
        $coverPhoto = $request->file('cover');
        $tags = $request->validated('tags');
        $isPremium = $request->validated('is_premium');
        $status = $request->validated('status', Article::STATUS_DRAFT);
        $author = Auth::user();


        if (!$author->has_active_subscription && boolval($isPremium)) {
            throw new HttpException(403, 'Only premium subscribers can create premium articles');
        }

        $article = $this->articleService->store($title, $content, $status, $author, $isPremium);

        if (!is_null($coverPhoto)) {
            $coverUrl = Storage::disk('public')->putFileAs('covers', $coverPhoto, $article->id . str($article->updated_at) . '.' . $coverPhoto->getClientOriginalExtension());
            $relativeUrl = Storage::disk('public')->url($coverUrl);
            $article->cover_url = $relativeUrl;
        }

        if (!is_null($tags)) {
            foreach ($tags as $tag) {
                $article->tags()->attach($tag);
            }
        }

        $article->save();

        $article->load('tags');

        return response($article, 201);
    }

    public function removeCoverPhoto(Article $article)
    {
        $coverPhotoUrl = $article->cover_url;
        $article->cover_url = null;

        $article->save();

        Storage::delete($coverPhotoUrl);

        return response($article, 200);
    }

    public function update(Article $article, UpdateArticleRequest $request)
    {
        $title = $request->validated('title');
        $content = $request->validated('content');
        $addedTags = $request->validated('added_tags');
        $removedTags = $request->validated('removed_tags');
        $isPremium = $request->validated('is_premium');
        $status = $request->validated('status');
        $cover = $request->file('cover');
        $user = Auth::user();

        if ($article->author_id !== $user->id) {
            abort(403, 'You are not allowed to update articles belonging to other people');
        }

        if (!$user->has_active_subscription && boolval($isPremium)) {
            throw new HttpException(403, 'Only premium subscribers can create premium articles');
        }

        $prevArticleData = [
            'title' => $article->title,
            'content' => $article->content,
        ];

        DB::beginTransaction();

        $this->articleService->updateArticle(
            $article,
            $title,
            $content,
            boolval($isPremium),
            $status,
            $cover
        );

        // if the title and cont
        if ($prevArticleData['title'] != '""' || $prevArticleData['content'] != '""') {
            $this->articleHistoryService->store($article::class, $article->id, $prevArticleData['title'], $prevArticleData['content']);
        }

        if (!is_null($status) && strtolower($status) === Article::STATUS_PUBLISHED) {
            $article->histories()->delete();
        }

        if (!is_null($removedTags)) {
            foreach ($removedTags as $tag) {
                $article->tags()->detach($tag);
            }
        }

        if (!is_null($addedTags)) {
            foreach ($addedTags as $tag) {
                $article->tags()->attach($tag);
            }
        }

        DB::commit();

        return response($article);
    }

    public function addComment(int $articleId, StoreCommentRequest $request)
    {
        $content = $request->validated('content');
        $status = $request->validated('status', Comment::STATUS_DRAFT);
        $article = $this->articleService->findOrThrow($articleId);

        $user = Auth::user();

        $comment = $this->articleService->addComment($article, $status, $content, $user);

        return $comment;
    }

    public function delete(Article $article)
    {
        $authenticatedUser = Auth::user();

        if ($authenticatedUser->id !== $article->author()->first()->id) {
            throw new HttpException(403, 'You are not allowed to delete articles belonging to other people');
        }

        $article->comments()->delete();

        $article->delete();

        return $article;
    }

    public function addTagToArticle(int $articleId, int $tagId)
    {
        $article = $this->articleService->findOrThrow($articleId);

        $authenticatedUser = Auth::user();

        if ($authenticatedUser->id !== $article->author()->first()->id) {
            throw new HttpException(403, 'You are not allowed to delete articles belonging to other people');
        }

        $tag = $this->tagService->findOrThrow($tagId);

        $article->tags()->attach($tag->id);

        $article->load('tags');

        return $article;
    }

    public function removeTagFromArticle(int $articleId, int $tagId)
    {
        $article = $this->articleService->findOrThrow($articleId);

        $authenticatedUser = Auth::user();

        if ($authenticatedUser->id !== $article->author()->first()->id) {
            throw new HttpException(403, 'You are not allowed to delete articles belonging to other people');
        }

        $tag = $this->tagService->findOrThrow($tagId);

        $article->tags()->detach($tag->id);

        $article->load('tags');

        return $article;
    }

    public function filterArticlesByTagId(int $tagId, FilterArticlesByTagRequest $request)
    {
        $page = (int) ($request->validated('page') ?? 1);
        $pageSize = (int) ($request->validated('perPage') ?? 5);
        $sorts = $request->validated('sort') ?? [];

        $this->tagService->findOrThrow($tagId);

        $articles = $this->articleService->filterArticlesByTagId($tagId, $page, $pageSize, $sorts);

        return $articles;
    }

    public function draftHistories(IndexDraftHistoriesRequest $request, Article $article)
    {
        $page = (int) ($request->validated('page') ?? 1);
        $pageSize = (int) ($request->validated('perPage') ?? 5);
        $sorts = $request->validated('sort') ?? [];
        $authorId = $request->validated('filter.authorId');
        $searchValue = $request->validated('search');
        $tags = $request->validated('filter.tags'); // comma-separated tag names
        $status = $request->validated('filter.status');
        $createdSinceDate = $request->validated('filter.createdSinceDate')
            ? Carbon::parse($request->validated('filter.createdSinceDate'))
            : null;


        if ($article->author_id !== Auth::user()->id) {
            abort(403, 'You are not allowed to view draft histories belonging to other people');
        }

        if (!is_null($tags)) {
            $tags = array_map(function ($tag) {
                return strtolower(trim($tag));
            }, explode(',', $tags));
        }

        $query = $this->articleHistoryService->listAllDraftHistories(
            $article,
            $sorts,
            $authorId,
            $createdSinceDate,
            $searchValue,
            $status,
            $tags
        );

        return $query
            ->paginate(perPage: $pageSize, page: $page)
            ->withQueryString();
    }
}
