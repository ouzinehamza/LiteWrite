<?php

namespace App\Http\Services;

use App\Models\Article;
use App\Models\EntityHistory;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class ArticleHistoryService
{
	public function store(
		string $model,
		int $model_id,
		string $title,
		string $content,

	): EntityHistory {
		$history = new EntityHistory();

		$history->title = $title;
		$history->content = $content;
		$history->draftable_type = $model;
		$history->draftable_id = $model_id;

		$history->save();

		return $history;
	}

	public function listAllDraftHistories(
		Article $article,
		array $sorts = [],
		?int $authorId,
		?Carbon $createdSinceDate,
		?string $searchValue,
		?string $status,
		?array $tags = []
	) {
		$query = $article->histories();

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
}
