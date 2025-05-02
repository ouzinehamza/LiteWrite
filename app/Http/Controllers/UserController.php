<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateUserRequest;
use App\Http\Requests\IndexUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Services\UserService;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpKernel\Exception\HttpException;

class UserController
{
    private UserService $userService;


    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    public function index(IndexUserRequest $request)
    {
        $page = (int) ($request->validated('page') ?? 1);
        $pageSize = (int) ($request->validated('perPage') ?? 5);
        $sorts = $request->validated('sort') ?? [];

        $users = $this->userService->listUsers($page, $pageSize, $sorts);

        return $users;
    }

    public function create(CreateUserRequest $request)
    {
        $name = $request->validated('name');
        $email = $request->validated('email');
        $password = $request->validated('password');

        $user = $this->userService->create($name, $email, $password);

        $token = $user->createToken('User Login Token');

        return response()->json([
            'user' => $user,
            'type' => 'Bearer',
            'token' => $token->plainTextToken,
        ], 201);
    }


    public function show(User $user)
    {
        return $user;
    }

    public function update(UpdateUserRequest $request, User $user)
    {
        if (Auth::user()->id !== $user->id) {
            throw new HttpException(403, "Cannot update another user's details");
        }

        $newName = $request->validated('name');
        $newEmail = $request->validated('email');
        $newPassword = $request->validated('password');


        if ($newName) {
            $user->name = $newName;
        }

        if ($newEmail) {
            $user->email = $newEmail;
        }

        if ($newPassword) {
            $user->password = Hash::make($newPassword);
        }

        $avatar = $request->file('avatar');

        if (!is_null($avatar)) {
            // Delete the old cover photo if exists
            if ($user->avatar) {
                // Strip '/storage/' from the path to match the storage/app/public structure
                $oldAvatarPath = str_replace('/storage/', '', $user->avatar);
                Storage::disk('public')->delete($oldAvatarPath);
            }
            $avatarUrl = Storage::disk('public')->putFileAs('avatars', $avatar, $user->id . str($user->updated_at) . '.' . $avatar->getClientOriginalExtension());
            $relativeUrl = Storage::disk('public')->url($avatarUrl);
            $user->avatar = $relativeUrl;
        }

        $user->save();

        return response($user);
    }

    public function delete(User $user)
    {
        if (Auth::user()->id !== $user->id) {
            throw new HttpException(403, "Cannot delete another user's account");
        }

        // using this approaching because adding an ON DELETE CASCADE migration for the author_id field on articles
        // requires knowing the exact name of the FK constraint.
        $user->articles()->delete();
        $user->delete();

        return response(status: 204);
    }

    public function logout(FormRequest $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response(['message' => 'User logged out successfully']);
    }
}
