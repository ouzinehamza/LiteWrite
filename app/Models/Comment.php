<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Comment extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'content',
        'status',
    ];

    /**
     * The status enum values.
     */
    public const STATUS_DRAFT = 'draft';
    public const STATUS_PUBLISHED = 'published';

    /**
     * Ensure the status attribute is valid.
     */
    public function setStatusAttribute($value)
    {
        if (!in_array($value, [self::STATUS_DRAFT, self::STATUS_PUBLISHED])) {
            throw new \InvalidArgumentException('Invalid status value');
        }

        $this->attributes['status'] = $value;
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function article(): BelongsTo
    {
        return $this->belongsTo(Article::class);
    }

    public function histories(): MorphMany
    {
        return $this->morphMany(EntityHistory::class, 'draftable');
    }
}
