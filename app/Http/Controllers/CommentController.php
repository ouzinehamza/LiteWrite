<?php

namespace App\Http\Controllers;

use App\Http\Requests\IndeCommentHistoryRequest;
use App\Http\Requests\UpdateCommentRequest;
use App\Http\Services\CommentHistoryService;
use App\Http\Services\CommentService;
use App\Models\Comment;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class CommentController
{
    public function __construct(
        private CommentService $commentService,
        private CommentHistoryService $commentHistoryService,
    ) {}

    public function update(Comment $comment, UpdateCommentRequest $request)
    {
        $content = $request->validated('content');
        $status = $request->validated('status');

        if ($comment->author_id != Auth::user()->id) {
            abort(403, 'Cannot update comment created by another user');
        }

        $prevCommentValue = $comment->content;

        DB::beginTransaction();
        $this->commentService->update($comment, $status, $content);
        $this->commentHistoryService->store($comment, $prevCommentValue);
        if (!is_null($status) && strtolower($status) === Comment::STATUS_PUBLISHED) {
            $comment->histories()->delete();
        }
        DB::commit();

        return $comment;
    }

    public function delete(int $commentId)
    {
        $user = Auth::user();
        return $this->commentService->delete($commentId, $user);
    }

    public function commentDraftHistories(IndeCommentHistoryRequest $request, Comment $comment)
    {
        $page = (int) ($request->validated('page') ?? 1);
        $pageSize = (int) ($request->validated('perPage') ?? 5);
        $sorts = $request->validated('sort') ?? [];
        $authorId = $request->validated('filter.authorId');
        $searchValue = $request->validated('search');
        $status = $request->validated('filter.status');
        $createdSinceDate = $request->validated('filter.createdSinceDate')
            ? Carbon::parse($request->validated('filter.createdSinceDate'))
            : null;

        if ($comment->author_id !== Auth::user()->id) {
            abort(403, 'You are not allowed to view draft histories belonging to other people');
        }

        $query = $this->commentHistoryService->listAllDraftHistories(
            $comment,
            $sorts,
            $authorId,
            $createdSinceDate,
            $searchValue,
            $status,
        );

        return $query
            ->paginate(perPage: $pageSize, page: $page)
            ->withQueryString();
    }
}
