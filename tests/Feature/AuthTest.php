<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Factories\UserFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;
   /**
    * A User can login
    * Given: a user on our app
    * When: logging in as that user
    * Then: assert that user is logged in
    */
    public function test_user_can_login(): void
    {
        // given: a user on our app
        $user = UserFactory::new()
            ->set('name', 'test user')
            ->createOne();

        // when: logging in as that user
        $response = $this
            ->postJson(
                '/api/login',
                [
                    'email' => $user->email,
                    'password' => 'password',
                ]
            );

        // then: assert that user is logged in
        $response->assertStatus(200);
    }

     /**
     * Invalid credentials
     * Given: a user on our app
     * When: logging in as that user
     * Then: assert that user is not logged in
     */
    public function test_invalid_credentials(): void
    {
        // given: a user on our app
        $user = UserFactory::new()
            ->set('name', 'test user')
            ->createOne();

        // when: logging in as that user
        $response = $this
            ->postJson(
                '/api/login',
                [
                    'email' => $user->email,
                    'password' => 'wrong-password',
                ]
            );

        // then: assert that user is not logged in
        $response->assertStatus(401);
    }

    /**
     * Verify login with unregistered email
     * Given: an unknown user
     * When: logging in as that user
     * Then: assert that user is not logged in
     */
    public function test_login_with_unregistered_email(): void
    {
        $response = $this->postJson('/api/login', [
            'email' => 'unregistered@me.com', // Email not in the system
            'password' => 'Password1@',
        ]);

        $response->assertStatus(404);
        $this->assertDatabaseMissing('users', [
            'email' => 'unregistered@me.com',
        ]);
    }

    // ----------------------Register----------------------

    /**
     * A User can register
     * When: registering a new user
     * Then: assert that user is registered
     */
    public function test_user_can_register(): void
    {

        // when: registering as new user
        $response = $this
            ->postJson(
                '/api/users',
                [
                    'name' => "test user",
                    'email' => 'test@me.com',
                    'password' => 'Password1@',
                    // 'password_confirmation' => 'Password1@',
                ]
            );

        // then: assert that user is registered
        $response->assertStatus(201);
        $this->assertDatabaseHas('users', [
            'name' => 'test user',
            'email' => 'test@me.com',
        ]);
    }

    /**
     * Verify low password strength
     * When: registering as new user
     * Then: assert that user is registered
     */
    public function test_low_password_strength(): void
    {
        // when: registering as new user
        $response = $this
            ->postJson(
                '/api/users',
                [
                    'name' => "test user",
                    'email' => 'test@me.com',
                    'password' => 'pass',
                    // 'password_confirmation' => 'pass',
                ]
            );

        // then: assert that user is registered
        $response->assertStatus(422);
        $response->assertJsonValidationErrors('password');
        $this->assertDatabaseMissing('users', [
            'name' => 'test user',
            'email' => 'test@me.com',
        ]);
    }

    // TODO: implement password confirmation
    /**
     * Verify password confirmation
     * When: registering as new user
     * Then: assert that user is registered
     */
    // public function test_password_confirmation(): void
    // {
    //     // when: registering as new user
    //     $response = $this
    //         ->postJson(
    //             '/api/users',
    //             [
    //                 'name' => "test user",
    //                 'email' => 'test@me.com',
    //                 'password' => 'Password1@',
    //                 'password_confirmation' => 'Password2@',
    //             ]
    //         );

    //     // then: assert that user is registered
    //     $response->assertStatus(422);
    //     $response->assertJsonValidationErrors('password');
    //     $this->assertDatabaseMissing('users', [
    //         'name' => 'test user',
    //         'email' => 'test@me.com',
    //     ]);
    // }

    // TODO: implement password validation
    /**
     * Verify password min length
     * When: registering as new user
     * Then: assert that user is not registered
     */
    // public function test_password_min_length_validation(): void
    // {
    //     $response = $this->postJson('/api/register', [
    //         'name' => 'test user',
    //         'email' => fake()->unique()->safeEmail(),
    //         'password' => 'Pass1@', // Too short
    //         'password_confirmation' => 'Pass1@',
    //     ]);

    //     $response->assertStatus(422);
    //     $response->assertJsonValidationErrors('password');
    // }

    /**
     * Verify email validation
     * Given: a user
     * When: registering as new user
     * Then: assert that user is not registered
     */
    public function test_email_validation(): void
    {
        $response = $this->postJson('/api/users', [
            'name' => 'test user',
            'email' => 'invalid-email', // Invalid email format
            'password' => 'Password1@',
            // 'password_confirmation' => 'Password1@',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('email');
        $this->assertDatabaseMissing('users', [
            'name' => 'test user',
            'email' => 'invalid-email',
        ]);
    }

    /**
     * Verify duplicate email
     * Given: a user
     * When: registering as new user
     * Then: assert that user is not registered
     */
    public function test_duplicate_email_registration(): void
    {
        // Given: a user
        UserFactory::new()->createOne([
            'email' => 'test@me.com',
        ]);

        // When: registering as new user
        $response = $this->postJson('/api/users', [
            'name' => 'test user',
            'email' => 'test@me.com', // Duplicate email
            'password' => 'Password1@',
            // 'password_confirmation' => 'Password1@',
        ]);

        // Then: assert that user is not registered
        $response->assertStatus(422);
        $response->assertJsonValidationErrors('email');
        $this->assertDatabaseMissing('users', [
            'name' => 'test user',
            'email' => 'test@me.com',
        ]);
    }

    /**
     * A User can register with avatar upload
     * When: registering a new user
     * Then: assert that user is registered
     */
    public function test_user_can_register_with_avatar(): void
    {

        // Mock the storage disk to avoid real file I/O
        Storage::fake('public');

        // Simulate an uploaded file
        $avatar = UploadedFile::fake()->image('avatar.jpg');
        // when: registering as new user
        $response = $this
            ->postJson(
                '/api/users',
                [
                    'name' => "test user",
                    'email' => 'test@me.com',
                    'password' => 'Password1@',
                    // 'password_confirmation' => 'Password1@',
                    'avatar' => $avatar
                ]
            );

        // then: assert that user is registered
        $response->assertStatus(201);
        $this->assertDatabaseHas('users', [
            'name' => 'test user',
            'email' => 'test@me.com',
        ]);

        // Assert that the avatar file was stored correctly
        // Get the user from the database to verify avatar path
        $user = User::where('email', 'test@me.com')->first();

        // Extract the filename part from the stored URL
        $expectedFilePath = str_replace(Storage::disk('public')->url(''), '', $user->avatar_url);

        // Assert that the avatar file was stored correctly
        Storage::disk('public')->assertExists($expectedFilePath);

        // Optionally, check that the response contains the correct structure or URL
        $response->assertJsonStructure([
            'type',
            'token',
            'user' => [
                'name',
                'email',
                'has_active_subscription',
            ],
        ]);
    }

    // TODO: Add test for invalid avatar
    // public function test_user_cannot_register_with_invalid_avatar(): void
    // {
    //     Storage::fake('public');

    //     $invalidAvatar = UploadedFile::fake()->create('not-an-image.pdf', 100, 'application/pdf');

    //     $response = $this->postJson('/api/users', [
    //         'name' => 'test user',
    //         'email' => 'test@me.com',
    //         'password' => 'Password1@',
    //         // 'password_confirmation' => 'Password1@',
    //         'avatar' => $invalidAvatar,
    //     ]);

    //     $response->assertStatus(422);
    //     $response->assertJsonValidationErrors('avatar');
    // }

    // TODO: Add test for large avatar
    // public function test_user_cannot_register_with_large_avatar(): void
    // {
    //     Storage::fake('public');

    //     $largeAvatar = UploadedFile::fake()->image('large-avatar.jpg')->size(11000); // 11 MB, assuming 10MB limit

    //     $response = $this->postJson('/api/register', [
    //         'name' => 'test user',
    //         'email' => 'test@me.com',
    //         'password' => 'Password1@',
    //         'password_confirmation' => 'Password1@',
    //         'avatar' => $largeAvatar,
    //     ]);

    //     $response->assertStatus(422);
    //     $response->assertJsonValidationErrors('avatar');
    // }
}
