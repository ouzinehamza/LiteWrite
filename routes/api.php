<?php

use App\Http\Controllers\ArticleController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\SampleController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\UserController;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Carbon\Carbon;

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

/**
 * Add your routes below, one per line
 */

Route::get('/version', [SampleController::class, 'version']);
Route::post('/echo', [SampleController::class, 'echo']);


/**
 * Users
 */
Route::get('/users', [UserController::class, 'index']);
Route::get('/users/{user}', [UserController::class, 'show']);


Route::post('/login', function (Request $request) {
    $email = $request->get('email');
    $password = $request->get('password');

    $user = User::query()->where('email', $email)->first();

    if (!$user) {
        throw new HttpException(404, 'User with this email does not exist');
    }

    if (!Hash::check($password, $user->password)) {
        throw new HttpException(401, 'Wrong credentials');
    }

    $token = $user->createToken('name-irrelevant');

    return [
        'type' => 'Bearer',
        'token' => $token->plainTextToken
    ];
});

Route::post('/users', [UserController::class, 'create']);

/**
 * Articles
 */
Route::get('/articles', [ArticleController::class, 'index']);
Route::get('/articles/{articleId}', [ArticleController::class, 'show']);

Route::get('/articles/{articleId}/comments', [ArticleController::class, 'comments']);

Route::get('articles/tags/{tagId}', [ArticleController::class, 'filterArticlesByTagId']);
Route::post('/articles/{articleId}/tags/{tagId}', [ArticleController::class, 'addTagToArticle']);
Route::delete('/articles/{articleId}/tags/{tagId}', [ArticleController::class, 'removeTagFromArticle']);


/**
 * Tags
 */
Route::post('/tags', [TagController::class, 'create']);
Route::get('/tags', [TagController::class, 'index']);
Route::get('/tags/{tagId}', [TagController::class, 'show']);
Route::put('/tags/{tagId}', [TagController::class, 'update']);
Route::delete('/tags/{tagId}', [TagController::class, 'delete']);

/**
 * Subscription plans
 */
Route::get('/subscription-plans', [SubscriptionController::class, 'getSubscriptionPlans']);

/**
 * Authenticated routes
 *
 * IMPORTANT: add ->middleware(['auth:sanctum']) to routes which are supposed to be authenticated
 */
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get(
        '/me',
        function () {
            return Auth::user();
        }
    );

    Route::post('/logout', [UserController::class, 'logout']);

    Route::put('/users/{user}', [UserController::class, 'update']);
    Route::delete('/users/{user}', [UserController::class, 'delete']);


    Route::post('/articles', [ArticleController::class, 'store']);
    Route::post('/articles/{article}/remove-cover', [ArticleController::class, 'removeCoverPhoto']);

    Route::put('/articles/{article}', [ArticleController::class, 'update']);
    Route::delete('/articles/{article}', [ArticleController::class, 'delete']);


    Route::post('/articles/{articleId}/tags/{tagId}', [ArticleController::class, 'addTagToArticle']);
    Route::delete('/articles/{articleId}/tags/{tagId}', [ArticleController::class, 'removeTagFromArticle']);

    Route::post('/articles/{articleId}/comments', [ArticleController::class, 'addComment']);
    Route::put('/comments/{comment}', [CommentController::class, 'update']);
    Route::delete('/comments/{commentId}', [CommentController::class, 'delete']);

    // =========Subscription Routes =========
    Route::get('/subscriptions', [SubscriptionController::class, 'index']);
    Route::post('/subscriptions', [SubscriptionController::class, 'store']);
    Route::delete('/subscriptions', [SubscriptionController::class, 'cancel']);

    Route::get('/subscriptions/{id}', [SubscriptionController::class, 'show']);
    Route::put('/subscriptions/{id}', [SubscriptionController::class, 'update']);
    Route::delete('/subscriptions/{id}', [SubscriptionController::class, 'destroy']);

    Route::get('/articles/{article}/drafts', [ArticleController::class, 'draftHistories']);
    Route::get('/comments/{comment}/drafts', [CommentController::class, 'commentDraftHistories']);
});
