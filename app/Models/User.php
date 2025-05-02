<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    use HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $appends = ['has_active_subscription'];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function articles(): HasMany
    {
        return $this->hasMany(Article::class, 'author_id');
    }

    protected function hasActiveSubscription(): Attribute
    {
        return Attribute::make(
            get: function () {
                $latestSubscription = $this->subscriptions()
                    ->orderBy('ends_at', 'desc')
                    ->first();

                return $latestSubscription &&
                    $latestSubscription->starts_at->lessThanOrEqualTo(now()) &&
                    $latestSubscription->ends_at->isAfter(now());
            }
        );
    }

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }
}
