<?php

namespace Database\Seeders;

use App\Models\Article;
use App\Models\Comment;
use App\Models\Subscription;
use App\Models\Tag;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory(10)->create();

        $featuredTag = Tag::factory()->create(['name' => 'Featured']);

        User::factory()
            ->set('name', 'Samuel')
            ->set('email', 'ogboyesam@gmail.com')
            ->set('password', 'test1234')
            ->has(Subscription::factory(1))
            ->has(
                Article::factory(3)
                    ->has(Comment::factory(1))
                    ->afterCreating(function (Article $article) use ($featuredTag) {
                        $article->tags()->attach($featuredTag);
                    })
            )
            ->createOne();
            
        $this->call(ArticleSeeder::class);
    }
}
