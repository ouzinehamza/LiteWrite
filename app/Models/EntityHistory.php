<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class EntityHistory extends Model
{
    public function articles(): MorphTo
    {
        return $this->morphTo();
    }

    public function comments(): MorphTo
    {
        return $this->morphTo();
    }
}
