<?php

namespace App\Http\Controllers;

use App\Http\Requests\IndexSubscriptionRequest;
use App\Http\Requests\StoreSubscriptionRequest;
use App\Http\Services\SubscriptionService;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class SubscriptionController
{
    private SubscriptionService $subscriptionService;
    public array $subscriptionPlans;

    public function __construct(SubscriptionService $subscriptionService)
    {
        $this->subscriptionService = $subscriptionService;
        $this->subscriptionPlans = [
            [
                'code' => 'monthly',
                'title' => 'Monthly',
                'duration' => 1, // in months
                'price' => 9.99,
            ],
            [
                'code' => 'yearly',
                'title' => 'Yearly',
                'duration' => 12, // in months
                'price' => 99.99,
            ]
        ];
    }

    public function getSubscriptionPlans()
    {
        return response()->json($this->subscriptionPlans);
    }

    /**
     * Check if the authenticated user is the owner of the Subscription.
     */
    private function ownsSubscription($subscription): bool
    {
        $user = Auth::user();

        // Check if the user is the owner of the subscription
        if ($user->id !== $subscription->user_id) {
            return false;
        }

        return true;
    }

    // List all subscriptions of a user
    public function index(IndexSubscriptionRequest $request)
    {
        $user = Auth::user();

        $page = (int) ($request->validated('page') ?? 1);
        $pageSize = (int) ($request->validated('perPage') ?? 5);
        $sorts = $request->validated('sort') ?? [];

        return $this->subscriptionService->listSubscriptions($user, $page, $pageSize, $sorts);
    }

    // Show a single subscription
    public function show($id)
    {
        $subscription = $this->subscriptionService->findSubscriptionById($id);
        if (is_null($subscription)) {
            return response()->json(['message' => 'Subscription not found'], 404);
        }

        if (!$this->ownsSubscription($subscription)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return $subscription->load('user');
    }

    // Create a new subscription (handled after Stripe payment success)
    public function store(StoreSubscriptionRequest $request)
    {
        $user = Auth::user();
        $validatedData = $request->validated();

        $user_id = $user->id;
        $plan = $validatedData['plan'];
        
        // Find the selected plan
        $selected_plan = collect($this->subscriptionPlans)->firstWhere('code', $plan['code']);
        if (!$selected_plan) {
            return response()->json(['message' => 'Invalid plan selected'], 400);
        }

        return DB::transaction(function () use ($user_id, $plan, $selected_plan, $validatedData) {
            $today = now();

            // Check the latest subscription for the user
            $latestSubscription = Subscription::where('user_id', $user_id)
                ->orderBy('ends_at', 'desc')
                ->first();
            
            if ($latestSubscription && 
                $latestSubscription->ends_at->isAfter($today) && 
                !$latestSubscription->cancelled_at) {
                // Current subscription is still active and not cancelled
                return response()->json([
                    'message' => 'An active subscription already exists.',
                ], 409); // 409 Conflict
            }

            // User doesn't have an active subscription, so we can create a new one
            $start = $today;
            $end = $start->copy()->addMonths($selected_plan['duration']);

            // Create the new subscription
            $subscription = Subscription::create([
                'user_id' => $user_id,
                'plan' => $plan['code'],
                'starts_at' => $start,
                'ends_at' => $end,
            ]);

            // Here you would typically process the payment with the credit card info
            // For this example, we'll just log the last 4 digits of the card number

            return response()->json([
                'message' => 'Subscription created successfully.',
                'subscription' => $subscription,
            ], 201);
        });
    }

    public function cancel(Request $request)
    {
        $user = Auth::user();

        // Find the user's active subscription
        $activeSubscription = Subscription::where('user_id', $user->id)
            ->where('ends_at', '>', now()) // as users cannot have subscriptions in the future
            ->orderBy('ends_at', 'desc')
            ->first();

        if (!$activeSubscription) {
            return response()->json(['message' => 'No active subscription found'], 404);
        }

        // Perform the cancellation
        return DB::transaction(function () use ($activeSubscription) {
            // Set the subscription end date to now
            $activeSubscription->update([
                'ends_at' => now(),
                'cancelled_at' => now(),
            ]);

            // You might want to perform additional actions here, such as:
            // - Notify the user via email
            // - Update user's status in your system
            // - Cancel the subscription in your payment gateway (e.g., Stripe)

            return response()->json([
                'message' => 'Subscription cancelled successfully',
                'subscription' => $activeSubscription
            ]);
        });
    }

    // Update a subscription
    public function update(Request $request, $id)
    {
        $subscription = Subscription::findOrFail($id);

        if (!$this->ownsSubscription($subscription)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $data = $request->validate([
            'starts_at' => 'sometimes|date',
            'ends_at' => 'sometimes|date|after:starts_at',
        ]);

        $subscription->update($data);

        return $subscription;
    }

    // Delete a subscription
    public function destroy($id)
    {
        $subscription = Subscription::findOrFail($id);

        if (!$this->ownsSubscription($subscription)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $subscription->delete();

        return response()->json(['message' => 'Subscription deleted successfully']);
    }
}
