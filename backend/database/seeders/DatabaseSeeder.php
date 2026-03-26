<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        $adminEmail = env('SEED_ADMIN_EMAIL');
        $adminPassword = env('SEED_ADMIN_PASSWORD');
        $techEmail = env('SEED_TECH_EMAIL');
        $techPassword = env('SEED_TECH_PASSWORD');

        if ($adminEmail && $adminPassword) {
            User::updateOrCreate(
                ['email' => $adminEmail],
                [
                    'name' => env('SEED_ADMIN_NAME', 'IT Admin'),
                    'password' => Hash::make($adminPassword),
                    'role' => 'admin',
                ]
            );
        }

        if ($techEmail && $techPassword) {
            User::updateOrCreate(
                ['email' => $techEmail],
                [
                    'name' => env('SEED_TECH_NAME', 'IT Technician'),
                    'password' => Hash::make($techPassword),
                    'role' => 'technician',
                ]
            );
        }
    }
}
