<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        RateLimiter::for('login', function (Request $request) {
            return Limit::perMinutes(5, 5)
                ->by((string) $request->ip().'|'.strtolower((string) $request->input('email')))
                ->response(function () {
                    return response()->json([
                        'message' => 'Too many login attempts. Please try again later.',
                    ], 429);
                });
        });

        RateLimiter::for('sensitive-actions', function (Request $request) {
            return Limit::perMinute(5)
                ->by((string) optional($request->user())->id.'|'.$request->ip())
                ->response(function () {
                    return response()->json([
                        'message' => 'Too many sensitive requests. Please wait a moment and try again.',
                    ], 429);
                });
        });

        RateLimiter::for('page-gate', function (Request $request) {
            return Limit::perMinute(10)
                ->by((string) optional($request->user())->id.'|'.$request->ip())
                ->response(function () {
                    return response()->json([
                        'message' => 'Too many PIN verification attempts. Please try again later.',
                    ], 429);
                });
        });

        RateLimiter::for('monitoring-check', function (Request $request) {
            return Limit::perMinute(10)
                ->by((string) optional($request->user())->id.'|'.$request->ip())
                ->response(function () {
                    return response()->json([
                        'message' => 'Too many monitoring requests. Please slow down and try again.',
                    ], 429);
                });
        });
    }
}
