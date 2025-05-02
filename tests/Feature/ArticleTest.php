<?php

namespace Tests\Feature;

use App\Models\Article;
use App\Models\Comment;
use Database\Factories\TagFactory;
use Database\Factories\UserFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ArticleTest extends TestCase
{
    use RefreshDatabase;

    public function test_article_creation(): void
    {
        // given: a user on our app
        $user = UserFactory::new()
            ->set('name', 'test user')
            ->createOne();

        // when: creating a new article as that user
        $response = $this
            ->actingAs($user)
            ->postJson(
                '/api/articles',
                [
                    'title' => 'test title',
                    'content' => 'test content',
                ]
            );

        // then: assert that article was created by correct user
        $response->assertStatus(201);
        $this->assertDatabaseHas('articles', [
            'title' => 'test title',
            'content' => 'test content',
            'author_id' => $user->id,
        ]);
    }

    public function test_edit_article(): void
    {
        $user = UserFactory::new()
            ->set('name', 'test user')
            ->createOne();

        $article = Article::factory()
            ->set('title', 'test title')
            ->set('content', 'test content')
            ->for($user, 'author')
            ->createOne();


        // when: creating a new article as that user
        $response = $this
            ->actingAs($user)
            ->putJson(
                '/api/articles/' . $article->id,
                [
                    'title' => 'updated title',
                    'content' => 'updated content',
                ]
            );

        $response->assertStatus(200);
        $this->assertDatabaseHas('articles', [
            'title' => 'updated title',
            'content' => 'updated content',
            'author_id' => $user->id,
        ]);
    }

    public function test_delete_article(): void
    {
        $user = UserFactory::new()
            ->set('name', 'test user')
            ->createOne();

        $article = Article::factory()
            ->set('title', 'test title')
            ->set('content', 'test content')
            ->for($user, 'author')
            ->createOne();


        // when: creating a new article as that user
        $response = $this
            ->actingAs($user)
            ->deleteJson(
                '/api/articles/' . $article->id
            );

        $response->assertStatus(200);
        $this->assertDatabaseMissing('articles', [
            'id' => $article->id,
        ]);
    }

    public function test_tag_article(): void
    {
        $user = UserFactory::new()
            ->set('name', 'test user')
            ->createOne();

        $tag = TagFactory::new()->createOne();

        $article = Article::factory()
            ->set('title', 'test title')
            ->set('content', 'test content')
            ->for($user, 'author')
            ->createOne();


        // when: creating a new article as that user
        $response = $this
            ->actingAs($user)
            ->postJson(
                '/api/articles/' . $article->id . '/tags/' . $tag->id
            );

        $response->assertStatus(200);
        $this->assertDatabaseHas('article_tag', [
            'article_id' => $article->id,
            'tag_id' => $tag->id,
        ]);
    }

    public function test_remove_article_tag(): void
    {
        $user = UserFactory::new()
            ->set('name', 'test user')
            ->createOne();

        $tag = TagFactory::new()->createOne();

        $article = Article::factory()
            ->set('title', 'test title')
            ->set('content', 'test content')
            ->for($user, 'author')
            ->createOne();


        // when: creating a new article as that user
        $response = $this
            ->actingAs($user)
            ->deleteJson(
                '/api/articles/' . $article->id . '/tags/' . $tag->id
            );

        $response->assertStatus(200);
        $this->assertDatabaseMissing('article_tag', [
            'article_id' => $article->id,
            'tag_id' => $tag->id,
        ]);
    }

    public function test_cannot_delete_article_created_by_someone_else(): void
    {
        $user1 = UserFactory::new()->createOne();
        $user2 = UserFactory::new()->createOne();
        $articleFromUser1 = Article::factory()
            ->set('title', 'test title')
            ->set('content', 'test content')
            ->for($user1, 'author')
            ->createOne();

        // when: trying to edit article from another user
        $response = $this
            ->actingAs($user2)
            ->deleteJson(
                '/api/articles/' . $articleFromUser1->id
            );

        // then: assert that action is forbidden
        $response->assertForbidden();
        $this->assertDatabaseHas(
            'articles',
            [
                'title' => 'test title',
                'content' => 'test content',
                'author_id' => $user1->id,
            ]
        );
    }

    public function test_cannot_tag_article_created_by_someone_else(): void
    {
        $user1 = UserFactory::new()->createOne();
        $user2 = UserFactory::new()->createOne();
        $articleFromUser1 = Article::factory()
            ->set('title', 'test title')
            ->set('content', 'test content')
            ->for($user1, 'author')
            ->createOne();

        $tag = TagFactory::new()->createOne();

        $response = $this
            ->actingAs($user2)
            ->postJson(
                '/api/articles/' . $articleFromUser1->id . '/tags/' . $tag->id
            );

        $response->assertForbidden();
    }

    public function test_cannot_untag_article_created_by_someone_else(): void
    {
        $user1 = UserFactory::new()->createOne();
        $user2 = UserFactory::new()->createOne();
        $articleFromUser1 = Article::factory()
            ->set('title', 'test title')
            ->set('content', 'test content')
            ->for($user1, 'author')
            ->createOne();

        $tag = TagFactory::new()->createOne();

        // user1 tags article
        $this
            ->actingAs($user1)
            ->postJson(
                '/api/articles/' . $articleFromUser1->id . '/tags/' . $tag->id
            );


        // user2 tries to remove tag from article
        $response = $this
            ->actingAs($user2)
            ->deleteJson(
                '/api/articles/' . $articleFromUser1->id . '/tags/' . $tag->id
            );

        $response->assertForbidden();
        $this->assertDatabaseHas(
            'article_tag',
            [
                'article_id' => $articleFromUser1->id,
                'tag_id' => $tag->id
            ]
        );
    }

    public function test_cannot_change_article_authored_by_someone_else(): void
    {
        // given: two users and an article created by first user
        $user1 = UserFactory::new()->createOne();
        $user2 = UserFactory::new()->createOne();
        $articleFromUser1 = Article::factory()
            ->set('title', 'test title')
            ->set('content', 'test content')
            ->for($user1, 'author')
            ->createOne();

        // when: trying to edit article from another user
        $response = $this
            ->actingAs($user2)
            ->putJson(
                '/api/articles/' . $articleFromUser1->id,
                [
                    'title' => 'changed title',
                    'content' => 'changed content',
                ]
            );

        // then: assert that action is forbidden
        $response->assertForbidden();
        $this->assertDatabaseHas(
            'articles',
            [
                'title' => 'test title',
                'content' => 'test content',
                'author_id' => $user1->id,
            ]
        );
    }

    public function test_article_list(): void
    {
        // given: a user on our app
        $user = UserFactory::new()
            ->set('name', 'test user')
            ->createOne();

        // when: creating a new article as that user
        $article = Article::factory()
            ->set('title', 'test title')
            ->set('content', 'test content')
            ->for($user, 'author')
            ->createOne();

        // then: assert that article was created by correct user
        $this->assertDatabaseHas('articles', [
            'title' => 'test title',
            'content' => 'test content',
            'author_id' => $user->id,
        ]);

        // when: listing articles
        $response = $this
            ->actingAs($user)
            ->getJson('/api/articles');

        // then: assert that article was listed
        $response->assertStatus(200);
        $this->assertDatabaseHas('articles', [
            'title' => 'test title',
            'content' => 'test content',
            'author_id' => $user->id,
        ]);
    }

    public function test_article_detail(): void
    {
        // given: a user on our app
        $user = UserFactory::new()
            ->set('name', 'test user')
            ->createOne();

        // when: creating a new article as that user
        $article = Article::factory()
            ->set('title', 'test title')
            ->set('content', 'test content')
            ->for($user, 'author')
            ->createOne();

        // then: assert that article was created by correct user
        $this->assertDatabaseHas('articles', [
            'title' => 'test title',
            'content' => 'test content',
            'author_id' => $user->id,
        ]);

        // when: listing articles
        $response = $this
            ->actingAs($user)
            ->getJson('/api/articles/' . $article->id);

        // then: assert that article was listed
        $response->assertStatus(200);
        $this->assertDatabaseHas('articles', [
            'title' => 'test title',
            'content' => 'test content',
            'author_id' => $user->id,
        ]);
    }

    /**
     * Verify An Unauthorized used cannot create article
     * Given: An Authenticated User
     * When: Tries to create article
     * Then: Assert unathorized error sent and the attempted article is not in the database
     */
    public function test_cannot_create_article_without_authentication(): void
    {
        $response = $this->postJson('/api/articles', [
            'title' => 'unauth title',
            'content' => 'unauth content',
        ]);

        $response->assertStatus(401);
        $this->assertDatabaseMissing('articles', [
            'title' => 'unauth title',
            'content' => 'unauth content',
        ]);
    }

    public function test_cannot_update_article_without_authentication(): void
    {
        $article = Article::factory()->createOne([
            'title' => 'original title',
            'content' => 'original content',
        ]);

        $response = $this->putJson('/api/articles/' . $article->id, [
            'title' => 'updated title',
            'content' => 'updated content',
        ]);

        $response->assertStatus(401);
        $this->assertDatabaseHas('articles', [
            'title' => 'original title',
            'content' => 'original content',
        ]);
    }

    public function test_cannot_delete_article_without_authentication(): void
    {
        $article = Article::factory()->createOne([
            'title' => 'test title',
            'content' => 'test content',
        ]);

        $response = $this->deleteJson('/api/articles/' . $article->id);

        $response->assertStatus(401);
        $this->assertDatabaseHas('articles', [
            'title' => 'test title',
            'content' => 'test content',
        ]);
    }

    public function test_article_creation_with_invalid_data(): void
    {
        $user = UserFactory::new()->createOne();

        $response = $this->actingAs($user)->postJson('/api/articles', [
            'title' => '', // Invalid title (empty)
            'content' => '', // Invalid content (empty)
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['title', 'content']);
    }

    public function test_article_detail_with_non_existent_id(): void
    {
        $user = UserFactory::new()->createOne();

        $response = $this->actingAs($user)->getJson('/api/articles/9999'); // Assuming ID 9999 doesn't exist

        $response->assertStatus(404);
        $response->assertJson(['message' => 'Article not found']);
    }
    public function test_get_paginated_articles(): void
    {
        $user = UserFactory::new()->createOne();
        Article::factory()->for($user, 'author')->count(15)->create();

        $response = $this->actingAs($user)->getJson('/api/articles');

        $response->assertStatus(200);
        $response->assertJsonCount(5, 'data');
    }

    
    // -------------- Comments ------------------------------

    public function test_attach_comment_to_article(): void
    {
        // Arrange
        $user = UserFactory::new()->createOne();
        $article = Article::factory()->for($user, 'author')->createOne();

        // Act: Make a POST request to create a comment for the article
        $response = $this->actingAs($user)->postJson("/api/articles/{$article->id}/comments", [
            'content' => 'This is a test comment',
        ]);

        // Assert
        $response->assertStatus(201); // Expecting a successful creation
        $this->assertDatabaseHas('comments', [
            'content' => 'This is a test comment',
            'article_id' => $article->id,
            'author_id' => $user->id,
        ]);
    }

    public function test_attach_comment_to_nonexistent_article(): void
    {
        $user = UserFactory::new()->createOne();
        $nonExistentArticleId = 999;

        $response = $this->actingAs($user)->postJson("/api/articles/{$nonExistentArticleId}/comments", [
            'content' => 'This is a test comment',
        ]);

        $response->assertStatus(404);
        $response->assertJson(['message' => 'Article not found']);
    }

    public function test_get_comments_for_article(): void
    {
        // Arrange
        $user = UserFactory::new()->createOne();
        $article = Article::factory()->for($user, 'author')->createOne();
        $comments = Comment::factory()
            ->for($article) // Associate each comment with the article
            ->for($user, 'author') // Associate each comment with the user
            ->count(15)
            ->create();
        // Act: Make a GET request to retrieve comments for the article
        $response = $this->actingAs($user)->getJson("/api/articles/{$article->id}/comments");

        // Assert
        $response->assertStatus(200); // Expecting a successful response
        $response->assertJsonCount(5, 'data'); // Expecting 10 comments in the response
    }   

    public function test_get_comments_for_nonexistent_article(): void
    {
        $user = UserFactory::new()->createOne();
        $nonExistentArticleId = 999;

        $response = $this->actingAs($user)->getJson("/api/articles/{$nonExistentArticleId}/comments");

        $response->assertStatus(404);
        $response->assertJson(['message' => 'Article not found']);
    }

    public function test_get_comments_for_article_sorted(): void
    {
        // Arrange
        $user = UserFactory::new()->createOne();
        $article = Article::factory()->for($user, 'author')->createOne();
        $comments = Comment::factory()
            ->for($article) // Associate each comment with the article
            ->for($user, 'author') // Associate each comment with the user
            ->count(15)
            ->create();
        
            // Act: Make a GET request to retrieve comments for the article
        $response = $this->actingAs($user)->getJson("/api/articles/{$article->id}/comments?sorts[created_at]=desc");

        // Assert
        $response->assertStatus(200); // Expecting a successful response
        $response->assertJsonCount(5, 'data'); // Expecting 10 comments in the response
    }

    /**
     * Test retrieving comments for a nonexistent article with sorting.
     *
     * This test verifies that attempting to retrieve comments for an 
     * article that does not exist results in a 404 response with the 
     * appropriate error message.
     */
    public function test_get_comments_for_nonexistent_article_sorted(): void
    {
        $user = UserFactory::new()->createOne();
        $nonExistentArticleId = 999;

        $response = $this->actingAs($user)->getJson("/api/articles/{$nonExistentArticleId}/comments?sorts[created_at]=desc");

        $response->assertStatus(404);
        $response->assertJson(['message' => 'Article not found']);
    }

    public function test_unauthenticated_user_cannot_create_comment(): void
    {
        $article = Article::factory()->createOne();
    
        $response = $this->postJson("/api/articles/{$article->id}/comments", [
            'content' => 'This is a test comment',
        ]);
    
        $response->assertStatus(401); // Expecting unauthorized response
    }

    public function test_unauthenticated_user_cannot_edit_comment(): void
    {
        $comment = Comment::factory()->createOne();

        $response = $this->putJson("/api/comments/{$comment->id}", [
            'content' => 'Updated comment content',
        ]);

        $response->assertStatus(401); // Expecting unauthorized response
    }

    public function test_unauthenticated_user_cannot_delete_comment(): void
    {
        $comment = Comment::factory()->createOne();
        // dd($comment);

        $response = $this->deleteJson("/api/comments/{$comment->id}");

        $response->assertStatus(401); // Expecting unauthorized response
    }

    public function test_user_can_update_own_comment(): void
    {
        $user = UserFactory::new()->createOne();
        $article = Article::factory()->for($user, 'author')->createOne();
        $comment = Comment::factory()->for($article)->for($user, 'author')->createOne();

        $response = $this->actingAs($user)->putJson("/api/comments/{$comment->id}", [
            'content' => 'Updated comment content',
            'status' => 'published'
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('comments', [
            'id' => $comment->id,
            'content' => 'Updated comment content',
        ]);
    }

    public function test_user_cannot_update_another_users_comment(): void
    {
        $user = UserFactory::new()->createOne();
        $otherUser = UserFactory::new()->createOne();
        $article = Article::factory()->for($otherUser, 'author')->createOne();
        $comment = Comment::factory()->for($article)->for($otherUser, 'author')->createOne();

        $response = $this->actingAs($user)->putJson("/api/comments/{$comment->id}", [
            'content' => 'Unauthorized update attempt',
        ]);

        $response->assertStatus(403); // Expecting forbidden response
    }

    public function test_user_can_delete_own_comment(): void
    {
        $user = UserFactory::new()->createOne();
        $article = Article::factory()->for($user, 'author')->createOne();
        $comment = Comment::factory()->for($article)->for($user, 'author')->createOne();

        $response = $this->actingAs($user)->deleteJson("/api/comments/{$comment->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('comments', [
            'id' => $comment->id,
        ]);
    }

    public function test_user_cannot_delete_another_users_comment(): void
    {
        $user = UserFactory::new()->createOne();
        $otherUser = UserFactory::new()->createOne();
        $article = Article::factory()->for($otherUser, 'author')->createOne();
        $comment = Comment::factory()->for($article)->for($otherUser, 'author')->createOne();

        $response = $this->actingAs($user)->deleteJson("/api/comments/{$comment->id}");

        $response->assertStatus(403); // Expecting forbidden response
    }

    public function test_comment_creation_with_missing_content(): void
    {
        $user = UserFactory::new()->createOne();
        $article = Article::factory()->for($user, 'author')->createOne();

        $response = $this->actingAs($user)->postJson("/api/articles/{$article->id}/comments", [
            // 'content' => 'This is a test comment', intentionally missing
        ]);

        $response->assertStatus(422); // Expecting validation error response
        $response->assertJsonValidationErrors(['content']);
    }


    public function test_get_comments_for_article_with_custom_page_size(): void
    {
        $user = UserFactory::new()->createOne();
        $article = Article::factory()->for($user, 'author')->createOne();
        $comments = Comment::factory()
            ->for($article)
            ->for($user, 'author')
            ->count(15)
            ->create();

        $response = $this->actingAs($user)->getJson("/api/articles/{$article->id}/comments?pageSize=5");

        $response->assertStatus(200);
        $response->assertJsonCount(5, 'data'); // Expecting 5 comments due to custom page size
    }

    public function test_get_comments_for_article_with_no_comments(): void
    {
        $user = UserFactory::new()->createOne();
        $article = Article::factory()->for($user, 'author')->createOne();

        $response = $this->actingAs($user)->getJson("/api/articles/{$article->id}/comments");

        $response->assertStatus(200);
        $response->assertJsonCount(0, 'data'); // Expecting no comments in the response
    }

    // ========== Article Status Test ===============
    public function test_article_has_default_status_draft()
    {
        // given: a user on our app
        $user = UserFactory::new()
            ->set('name', 'test user')
            ->createOne();

        // when: creating a new article as that user
        $response = $this
            ->actingAs($user)
            ->postJson(
                '/api/articles',
                [
                    'title' => 'test title',
                    'content' => 'test content',
                ]
            );
        

        // then: assert that article was created with default status as draft
        $this->assertEquals('draft', $response->json('status'));
    }

    public function test_article_can_be_updated_to_published()
    {
        $user = UserFactory::new()
        ->set('name', 'test user')
        ->createOne();

        $article = Article::factory()
            ->set('title', 'test title')
            ->set('content', 'test content')
            ->for($user, 'author')
            ->createOne();

        // when: creating a new article as that user
        $response = $this
            ->actingAs($user)
            ->putJson(
                '/api/articles/' . $article->id,
                [
                    'title' => 'updated title',
                    'content' => 'updated content',
                ]
            );

        $response->assertStatus(200);
        $this->assertDatabaseHas('articles', [
            'title' => 'updated title',
            'content' => 'updated content',
            'author_id' => $user->id,
            'status' => 'published',
        ]);
    }

    public function test_invalid_status_throws_exception()
    {
        $this->expectException(\InvalidArgumentException::class);

        Article::create([
            'title' => 'Test Article',
            'content' => 'This is a test article.',
            'status' => 'invalid-status',
        ]);
    }

    public function test_article_defaults_to_draft_when_status_is_missing()
    {
        $user = UserFactory::new()
            ->set('name', 'test user')
            ->createOne();

        $response = $this->actingAs($user)
            ->postJson('/api/articles', [
                'title' => 'test title',
                'content' => 'test content',
            ]);

        $response->assertStatus(201);
        $this->assertEquals('draft', $response->json('status'));
    }

    public function test_article_can_only_transition_from_draft_to_published()
    {
        $user = UserFactory::new()
            ->set('name', 'test user')
            ->createOne();

        $article = Article::factory()
            ->set('title', 'test title')
            ->set('content', 'test content')
            ->for($user, 'author')
            ->state(['status' => 'draft'])
            ->createOne();

        $response = $this->actingAs($user)
            ->putJson('/api/articles/' . $article->id, [
                'title' => 'updated title',
                'content' => 'updated content',
                'status' => 'published',
            ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('articles', [
            'id' => $article->id,
            'status' => 'published',
        ]);
    }

    public function test_status_is_included_in_article_response()
    {
        $user = UserFactory::new()
            ->set('name', 'test user')
            ->createOne();

        $article = Article::factory()
            ->set('title', 'test title')
            ->set('content', 'test content')
            ->for($user, 'author')
            ->state(['status' => 'draft'])
            ->createOne();

        $response = $this->actingAs($user)
            ->getJson('/api/articles/' . $article->id);

        $response->assertStatus(200);
        $response->assertJson([
            'id' => $article->id,
            'status' => 'draft',
        ]);
    }

    public function test_filter_articles_by_status(): void
    {
        $user = UserFactory::new()->createOne();

        // Create 5 articles with default status 'draft'
        $articles = Article::factory()
            ->for($user, 'author')
            ->count(5)
            ->create(['status' => 'draft']);

        // Update 3 of the articles to 'published' using the API
        $articles->take(3)->each(function ($article) use ($user) {
            $response = $this
                ->actingAs($user)
                ->putJson(
                    '/api/articles/' . $article->id,
                    [
                        'title' => 'updated title for ' . $article->id,
                        'content' => 'updated content for ' . $article->id,
                        'status' => 'published',
                    ]
                );

            $response->assertStatus(200); // Ensure each update is successful
        });

        // Assert filtering by status 'draft'
        $responseDraft = $this->actingAs($user)
            ->getJson('/api/articles?filter[status]=draft');

        $responseDraft->assertStatus(200);
        $responseDraft->assertJsonCount(2, 'data');

        // Assert filtering by status 'published'
        $responsePublished = $this->actingAs($user)
            ->getJson('/api/articles?filter[status]=published');

        $responsePublished->assertStatus(200);
        $responsePublished->assertJsonCount(3, 'data');
    }

}
