<?php

namespace App\Http\Services;

use App\Models\Comment;
use App\Models\EntityHistory;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Builder;

class CommentHistoryService
{
	public function store(
		Comment $comment,
		string $content
	): EntityHistory {
		$history = new EntityHistory();

		$history->title = '';
		$history->content = $content;
		$history->draftable_type = $comment::class;
		$history->draftable_id = $comment->id;

		$history->save();

		return $history;
	}

	public function listAllDraftHistories(
		Comment $comment,
		array $sorts = [],
		?int $authorId,
		?Carbon $createdSinceDate,
		?string $searchValue,
		?string $status,
	) {
		$query = $comment->histories();

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

		if (!is_null($status)) {
			$query->where('status', $status);
		}

		return $query;
	}
}
