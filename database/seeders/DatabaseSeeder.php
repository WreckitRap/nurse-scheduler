<?php

namespace Database\Seeders;

use App\Models\NurseProfile;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $units = [
            ['name' => 'Emergency Room', 'code' => 'ER'],
            ['name' => 'Intensive Care Unit', 'code' => 'ICU'],
            ['name' => 'Medical-Surgical', 'code' => 'MEDSURG'],
            ['name' => 'Operating Room', 'code' => 'OR'],
            ['name' => 'Pediatrics', 'code' => 'PEDI'],
        ];

        foreach ($units as $unit) {
            Unit::create($unit);
        }

        User::create([
            'name' => 'Nurse Admin',
            'email' => 'admin@hospital.test',
            'password' => Hash::make('password'),
            'role' => 'nurse_admin',
        ]);

        $staff = User::create([
            'name' => 'Nurse Staff One',
            'email' => 'nurse@hospital.test',
            'password' => Hash::make('password'),
            'role' => 'nurse_staff',
        ]);

        NurseProfile::create([
            'user_id' => $staff->id,
            'employee_no' => 'N-0001',
            'unit_id' => Unit::where('code', 'ER')->first()->id,
            'specialization' => 'Registered Nurse',
            'employment_type' => 'full_time',
            'max_weekly_hours' => 40,
        ]);
    }
}