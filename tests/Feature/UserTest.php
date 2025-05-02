<?php

namespace Tests\Feature;

use App\Models\Article;
use Database\Factories\UserFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class UserTest extends TestCase
{
    use RefreshDatabase;

    public function test_cascade_delete_of_articles_on_user_delete(): void
    {
        $user = UserFactory::new()
            ->set('name', 'test user')
            ->createOne();

        $article = Article::factory()
            ->set('title', 'test title')
            ->set('content', 'test content')
            ->for($user, 'author')
            ->createMany(5);

        $response = $this
            ->actingAs($user)
            ->deleteJson(
                '/api/users/' . $user->id
            );

        $response->assertStatus(204);

        $userArticles = DB::table('articles')->where('author_id', $user->id)->count();

        $this->assertEquals(0, $userArticles);
    }

    public function test_cannot_delete_another_user(): void
    {
        $user1 = UserFactory::new()
            ->set('name', 'test user')
            ->createOne();

        $user2 = UserFactory::new()
            ->set('name', 'test user 2')
            ->createOne();

        $response = $this
            ->actingAs($user1)
            ->deleteJson(
                '/api/users/' . $user2->id
            );

        $response->assertStatus(403);
    }

    public function test_can_update_user_with_avatar(): void
    {
        $user = UserFactory::new()
            ->set('name', 'test user')
            ->createOne();

        Storage::fake('public');

        $file = UploadedFile::fake()->image('avatar.jpg');

        $response = $this->actingAs($user)->putJson('/api/users/' . $user->id, [
            'name' => 'Update name',
            'avatar' => $file
        ]);

        Storage::disk('public')->assertExists('avatars/' . $user->id . str($user->updated_at) . '.' . $file->getClientOriginalExtension());
    }

    // TODO: make this pass when we add email verification
    // a user cannot update email
    // public function test_user_cannot_update_email(): void
    // {

    //     // Create a user
    //     $user = UserFactory::new()->createOne();
       
    //     $email = 'johndoe@gmail.com';

    //     $response = $this
    //         ->actingAs($user)
    //         ->putJson('/api/users/' . $user->id, [
    //         'email' => $email,
    //     ]);

    //     $response->assertStatus(422);
    // }

    public function test_user_deletion(): void
    {
        // given: a user on our app
        $user = UserFactory::new()
            ->set('name', 'test user')
            ->set('email', 'test@me.com')
            ->createOne();


        // then: assert that user was created 
        $this->assertDatabaseHas('users', [
            'name' => 'test user',
            'email' => 'test@me.com',
        ]);

        // when: deleting the user
        $response = $this
            ->actingAs($user)
            ->deleteJson('/api/users/' . $user->id);

        // then: assert that article was deleted
        $response->assertStatus(204);
        $this->assertDatabaseMissing('users', [
            'name' => 'test user',
            'email' => 'test@me.com',
            'id' => $user->id,
        ]);
    }

    // TODO: make this pass
    // deleting user deleters avatar if exists
    // public function test_delete_avatar_on_user_delete(): void
    // {
    //     // Create a user
    //     $user = UserFactory::new()->createOne();
    //     // Mock the storage disk to avoid real file I/O
    //     Storage::fake('public');

    //     $newAvatar = UploadedFile::fake()->image('new-avatar.jpg');
        
    //     $response = $this
    //         ->actingAs($user)
    //         ->putJson('/api/users/' . $user->id, [
    //         'avatar' => $newAvatar,
    //     ]);

    //     $response->assertStatus(200);

    //     $newAvatarPath = '/storage/avatars/' . $user->id . str($user->updated_at) . '.' . $newAvatar->getClientOriginalExtension();
    //     // dd($newAvatarPath);

    //     // $this->assertTrue(Storage::disk('public')->exists($newAvatarPath));
    //     // Storage::disk('public')->assertExists($newAvatarPath);
    //     // Storage::disk('public')->assertExists('avatars/' . $user->id . str($user->updated_at) . '.' . $newAvatar->getClientOriginalExtension());
        

    //     $this->assertDatabaseHas('users', [
    //         'id' => $user->id,
    //         'avatar' => $newAvatarPath,
    //     ]);

    //     $response = $this
    //         ->actingAs($user)
    //         ->deleteJson('/api/users/' . $user->id);

    //     $response->assertStatus(204);

    //     $this->assertDatabaseMissing('users', [
    //         'id' => $user->id
    //     ]);

    //     // Assert that the avatar file was deleted
    //     $this->assertFalse(Storage::disk('public')->exists(str_replace('/storage/', '', $newAvatarPath)));
    // }
}
