<?php


namespace Tests\Feature;

use App\Models\Subscription;
use App\Models\User;
use Database\Factories\UserFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SubscriptionTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_list_own_subscriptions(): void
    {
        $user = UserFactory::new()->createOne();
        Subscription::factory()->count(3)->for($user)->create();

        $response = $this->actingAs($user)->getJson('/api/subscriptions');

        $response->assertStatus(200);
        $response->assertJsonCount(3, 'data'); // Pagination response
    }

    public function test_user_cannot_list_subscriptions_when_not_authenticated(): void
    {
        $response = $this->getJson('/api/subscriptions');

        $response->assertStatus(401);
    }

    public function test_user_can_view_single_subscription(): void
    {
        $user = UserFactory::new()->createOne();

        $subscription = Subscription::factory()->for($user)->create();

        $response = $this->actingAs($user)->getJson('/api/subscriptions/' . $subscription->id);

        $response->assertStatus(200);
        $response->assertJson([
            'id' => $subscription->id,
            'user_id' => $user->id,
        ]);
    }

    public function test_user_cannot_view_other_users_subscription(): void
    {
        $user = UserFactory::new()->createOne();

        $otherUser = UserFactory::new()->createOne();
        $subscription = Subscription::factory()->for($otherUser)->create();

        $response = $this->actingAs($user)->getJson('/api/subscriptions/' . $subscription->id);

        $response->assertStatus(403); // Forbidden
    }

    public function test_user_can_create_subscription(): void
    {
        $user = UserFactory::new()->createOne();

        $response = $this->actingAs($user)->postJson('/api/subscriptions', [
            'user_id' => $user->id,
            'plan' => [
                'code' => 'monthly',
                'title' => 'Monthly',
                'duration' => 1,
                'price' => 9.99,
            ],
            'creditCard' => [
                'card_number' => '4242424242424242',
                'cvv' => '333',
                'expiry_date' => [
                    'month' => 3,
                    'year' => 2025,
                ],
                'name' => 'dddddd',
                'surname' => 'dddddd',
                'address' => 'dddddd',
            ],
        ]);

        $response->assertStatus(201);
        $response->assertJson([
            'message' => 'Subscription created successfully.',
            'subscription' => [
                'user_id' => $user->id,
                'plan' => 'monthly',
            ],
        ]);

        $this->assertDatabaseHas('subscriptions', [
            'user_id' => $user->id,
            'plan' => 'monthly',
        ]);
    }

    // TODO: ensure that the user cannot create a subscription for another user
    // public function test_user_cannot_create_subscription_for_another_user(): void
    // {
    //     $user = UserFactory::new()->createOne();
    //     $otherUser = UserFactory::new()->createOne();

    //     $response = $this->actingAs($user)->postJson('/api/subscriptions', [
    //         'user_id' => $otherUser->id,
    //         'plan' => [
    //             'code' => 'monthly',
    //             'title' => 'Monthly',
    //             'duration' => 1,
    //             'price' => 9.99,
    //         ],
    //         'creditCard' => [
    //             'card_number' => '4242424242424242',
    //             'cvv' => '333',
    //             'expiry_date' => [
    //                 'month' => 3,
    //                 'year' => 2025,
    //             ],
    //             'name' => 'dddddd',
    //             'surname' => 'dddddd',
    //             'address' => 'dddddd',
    //         ],
    //     ]);

    //     $response->assertStatus(403); // Unauthorized
    // }

    public function test_user_cannot_extend_active_subscription(): void
    {
        $user = UserFactory::new()->createOne();

        // Create an active subscription
        $activeSubscription = Subscription::factory()->for($user)->create([
            'plan' => 'monthly',
            'starts_at' => now(),
            'ends_at' => now()->addMonth(),
            'cancelled_at' => null,
        ]);

        // User subscribes again to the same plan
        $response = $this->actingAs($user)->postJson('/api/subscriptions', [
            'user_id' => $user->id,
            'plan' => [
                'code' => 'monthly',
                'title' => 'Monthly',
                'duration' => 1,
                'price' => 9.99,
            ],
            'creditCard' => [
                'card_number' => '4242424242424242',
                'cvv' => '333',
                'expiry_date' => [
                    'month' => 3,
                    'year' => 2025,
                ],
                'name' => 'dddddd',
                'surname' => 'dddddd',
                'address' => 'dddddd',
            ],
        ]);

        $response->assertStatus(409); // Ensure a new subscription is created
        $response->assertJson([
            'message' => 'An active subscription already exists.',
        ]);

        // Ensure no new subscription was created
        $this->assertDatabaseCount('subscriptions', 1);
        $this->assertDatabaseHas('subscriptions', [
            'user_id' => $user->id,
            'plan' => 'monthly',
            'starts_at' => $activeSubscription->starts_at->format('Y-m-d H:i:s'),
            'ends_at' => $activeSubscription->ends_at->format('Y-m-d H:i:s'),
            'cancelled_at' => null,
        ]);
    }


    public function test_user_can_update_subscription(): void
    {
        $user = UserFactory::new()->createOne();
        $subscription = Subscription::factory()->for($user)->create();

        $response = $this->actingAs($user)->putJson('/api/subscriptions/' . $subscription->id, [
            'ends_at' => now()->addMonths(6),
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('subscriptions', [
            'id' => $subscription->id,
            'ends_at' => now()->addMonths(6),
        ]);
    }

    public function test_user_cannot_update_subscription_for_another_user(): void
    {
        $user = UserFactory::new()->createOne();
        $otherUser = UserFactory::new()->createOne();
        $subscription = Subscription::factory()->for($otherUser)->create();

        $response = $this->actingAs($user)->putJson('/api/subscriptions/' . $subscription->id, [
            'ends_at' => now()->addMonths(6),
        ]);

        $response->assertStatus(403); // Forbidden
    }

    public function test_user_can_delete_subscription(): void
    {
        $user = UserFactory::new()->createOne();
        $subscription = Subscription::factory()->for($user)->create();

        $response = $this->actingAs($user)->deleteJson('/api/subscriptions/' . $subscription->id);

        $response->assertStatus(200);
        $response->assertJson(['message' => 'Subscription deleted successfully']);

        $this->assertDatabaseMissing('subscriptions', [
            'id' => $subscription->id,
        ]);
    }

    public function test_user_cannot_delete_subscription_of_another_user(): void
    {
        $user = UserFactory::new()->createOne();
        $otherUser = UserFactory::new()->createOne();
        $subscription = Subscription::factory()->for($otherUser)->create();

        $response = $this->actingAs($user)->deleteJson('/api/subscriptions/' . $subscription->id);

        $response->assertStatus(403); // Forbidden
        $this->assertDatabaseHas('subscriptions', [
            'id' => $subscription->id,
        ]);
    }

    public function test_validation_errors_when_creating_subscription(): void
    {
        $user = UserFactory::new()->createOne();

        $response = $this->actingAs($user)->postJson('/api/subscriptions', [
            'plan' => 'invalid_plan', // Invalid plan
        ]);

        $response->assertStatus(422); // Validation error
        $response->assertJsonValidationErrors(['plan', 'user_id']);
    }

    public function test_user_with_no_subscriptions_has_no_active_subscription(): void
    {
        $user = User::factory()->create();

        $this->assertFalse($user->has_active_subscription);
    }

    public function test_user_with_expired_subscription_has_no_active_subscription(): void
    {
        $user = User::factory()->create();

        Subscription::factory()->for($user)->create([
            'starts_at' => now()->subMonths(2),
            'ends_at' => now()->subMonth(), // Expired subscription
        ]);

        $this->assertFalse($user->has_active_subscription);
    }

    public function test_user_with_active_subscription_has_active_subscription(): void
    {
        $user = UserFactory::new()->createOne();

        Subscription::factory()->for($user)->create([
            'starts_at' => now()->subDays(10),
            'ends_at' => now()->addDays(10), // Active subscription
        ]);

        $this->assertTrue($user->has_active_subscription);
    }

    public function test_user_with_future_subscription_still_has_no_active_subscription(): void
    {
        $user = UserFactory::new()->createOne();

        Subscription::factory()->for($user)->create([
            'starts_at' => now()->addMonth(), // Starts in the future
            'ends_at' => now()->addMonths(2),
        ]);

        $this->assertFalse($user->has_active_subscription);
    }

    public function test_user_with_multiple_subscriptions_checks_latest_only(): void
    {
        $user = User::factory()->create();

        // Expired subscription
        Subscription::factory()->for($user)->create([
            'starts_at' => now()->subMonths(3),
            'ends_at' => now()->subMonth(),
        ]);

        // Active subscription
        Subscription::factory()->for($user)->create([
            'starts_at' => now()->subDays(10),
            'ends_at' => now()->addDays(10), // Latest and active
        ]);

        $this->assertTrue($user->has_active_subscription);
    }

    public function test_user_with_no_active_but_future_subscription_has_no_active_subscription(): void
    {
        $user = User::factory()->create();

        // Expired subscription
        Subscription::factory()->for($user)->create([
            'starts_at' => now()->subMonths(3),
            'ends_at' => now()->subMonth(),
        ]);

        // Future subscription
        Subscription::factory()->for($user)->create([
            'starts_at' => now()->addMonth(), // Starts in the future
            'ends_at' => now()->addMonths(2),
        ]);

        $this->assertFalse($user->has_active_subscription);
    }
}
