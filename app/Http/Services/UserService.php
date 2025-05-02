<?php

namespace App\Http\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserService
{
  public function listUsers(int $page, int $pageSize, array $sorts = [])
  {
    $query = User::query();

    foreach ($sorts as $key => $direction) {
      $query = $query->orderBy($key, $direction);
    }

    return $query
      ->paginate(perPage: $pageSize, page: $page)
      ->withQueryString();
  }

  public function create(
    string $name,
    string $email,
    string $password
  ): User {
    $user = new User;

    $user->name = $name;
    $user->email = $email;
    $user->password = Hash::make($password);

    $user->save();
    return $user;
  }

  public function findUserById(int $userId): ?User
  {
    return User::query()
      ->where('id', $userId)
      ->first();
  }

  public function findOrThrow(int $userId): User
  {
    $user = $this->findUserById($userId);

    if (is_null($user)) {
      abort(404, 'User not found');
    }

    return $user;
  }
}
