<?php

namespace App\Http\Services;

use App\Models\Subscription;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class SubscriptionService
{
  public function listSubscriptions(User $user, int $page, int $pageSize, array $sorts = [])
  {
      $query = Subscription::query()
          ->where('user_id', $user->id);

      foreach ($sorts as $field => $direction) {
          $query->orderBy($field, $direction);
      }

      if (empty($sorts)) {
          $query->orderBy('created_at', 'desc');
      }

      return $query
          ->paginate(perPage: $pageSize, page: $page)
          ->withQueryString();
  }

  public function create(
    int $user_id,
    string $plan,
    string $start_at,
    string $end_at
  ): Subscription {
    $subscription = new Subscription;

    $subscription->user_id = $user_id;
    $subscription->plan = $plan;
    $subscription->starts_at = $start_at;
    $subscription->ends_at = $end_at;

    $subscription->save();
    return $subscription;
  }

  public function findSubscriptionById(int $subscriptionId): ?Subscription
  {
    return Subscription::query()
      ->where('id', $subscriptionId)
      ->first();
  }
}
