<?php

namespace Database\Seeders;

use App\Models\Article;
use App\Models\Comment;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Database\Seeder;

class ArticleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::factory()
            ->has(
                Article::factory()
                    ->count(5)
                    ->has(
                        Comment::factory(20)
                    )
                    ->has(
                        Tag::factory(2)
                    )
            )
            ->createOne();
    }
}
