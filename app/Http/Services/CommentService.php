<?php

namespace App\Http\Services;

use App\Models\Comment;
use App\Models\User;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class CommentService
{

	public function findCommentById(int $commentId): ?Comment
	{
		return Comment::query()
			->where('id', $commentId)
			->with('author')
			->first();
	}

	public function update(Comment $comment, string $status, string $content): bool
	{
		$comment->content = $content;
		$comment->status = $status;

		return $comment->save();
	}

	public function delete(int $commentId, User $user): Comment
	{
		$comment = $this->findCommentById($commentId);

		if (is_null($comment)) {
			abort(404, 'Comment not found');
		}

		if ($comment->author_id != $user->id) {
			abort(403, 'Cannot update comment created by another user');
		}

		$comment->delete();

		return $comment;
	}
}
