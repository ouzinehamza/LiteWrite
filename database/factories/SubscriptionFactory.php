<?php

namespace Database\Factories;

use App\Models\Subscription;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Subscription>
 */
class SubscriptionFactory extends Factory
{
    protected $model = Subscription::class;

    public function definition()
    {
        $start_at = fake()->dateTimeBetween('now');
        $plan = fake()->randomElement(['monthly', 'yearly']); // To randomly pick a plan

        return [
            'user_id' => User::factory(),
            'plan' => $plan,
            'starts_at' => $start_at,
            'ends_at' => $plan === 'monthly'
                ? (clone $start_at)->modify('+1 month')
                : (clone $start_at)->modify('+1 year'),
        ];
    }
}
