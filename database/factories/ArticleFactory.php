<?php

namespace Database\Factories;

use App\Models\Article;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Article>
 */
class ArticleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => $this->faker->sentence(6),
            'content' => $this->faker->randomHtml(4, 10),
            'is_premium' => $this->faker->boolean(),
            'author_id' => User::factory(),
            'cover_url' => $this->faker->boolean() ? 'https://picsum.photos/500/380' : null,
            'status' => Article::STATUS_PUBLISHED
        ];
    }
}
