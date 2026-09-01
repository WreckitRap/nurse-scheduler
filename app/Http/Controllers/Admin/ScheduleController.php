<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Schedule;
use App\Models\Shift;
use App\Models\ShiftTemplate;
use App\Models\Unit;
use App\Models\User;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\TimeOffRequest;

class ScheduleController extends Controller
{
    private const MAX_CONSECUTIVE_DAYS = 3;

    public function index(Request $request): Response
    {
        $schedules = Schedule::withCount('shifts')->orderByDesc('start_date')->get();

        $selected = $request->query('schedule')
            ? Schedule::with(['shifts.unit', 'shifts.nurses.nurseProfile'])->find($request->query('schedule'))
            : $schedules->first();

        if ($selected && ! $selected->relationLoaded('shifts')) {
            $selected->load(['shifts.unit', 'shifts.nurses.nurseProfile']);
        }

        return Inertia::render('Admin/Schedules/Index', [
            'schedules' => $schedules,
            'schedule' => $selected,
            'shifts' => $selected ? $selected->shifts : collect(),
            'nurses' => User::where('role', 'nurse_staff')
                ->whereHas('nurseProfile', fn ($q) => $q->where('is_active', true))
                ->with('nurseProfile.unit')
                ->get(),
            'templates_count' => ShiftTemplate::where('is_active', true)->count(),
            'leaves' => TimeOffRequest::where('status', 'approved')->get(['user_id', 'start_date', 'end_date']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['nullable', 'string', 'max:255'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
        ]);

        $start = Carbon::parse($data['start_date']);
        $end = Carbon::parse($data['end_date']);

        if ($end->diffInDays($start) > 31) {
            return back()->with('error', 'Schedule range cannot exceed 31 days.');
        }

        $templates = ShiftTemplate::where('is_active', true)->get();

        if ($templates->isEmpty()) {
            return back()->with('error', 'Create at least one active shift template first.');
        }

        $schedule = Schedule::create([
            'name' => $data['name'] ?: $start->format('M d').' – '.$end->format('M d, Y'),
            'start_date' => $start->toDateString(),
            'end_date' => $end->toDateString(),
            'status' => 'draft',
            'created_by' => $request->user()->id,
        ]);

        $units = Unit::orderBy('name')->get();
        $rows = [];

        foreach (CarbonPeriod::create($start, $end) as $day) {
            foreach ($templates as $t) {
                $targets = $t->unit_id ? $units->where('id', $t->unit_id) : $units;
                foreach ($targets as $u) {
                    $rows[] = [
                        'schedule_id' => $schedule->id,
                        'unit_id' => $u->id,
                        'shift_template_id' => $t->id,
                        'date' => $day->toDateString(),
                        'start_time' => $t->start_time,
                        'end_time' => $t->end_time,
                        'required_nurses' => $t->required_nurses,
                        'color' => $t->color,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
            }
        }

        Shift::insert($rows);

        return redirect()->route('admin.schedules.index')->with('success', 'Schedule created with '.count($rows).' shifts.');
    }

    public function show(Schedule $schedule): Response
    {
        $schedule->load(['shifts.unit', 'shifts.nurses']);

        return Inertia::render('Admin/Schedules/Show', [
            'schedule' => $schedule,
            'shifts' => $schedule->shifts,
        ]);
    }

    public function publish(Schedule $schedule): RedirectResponse
    {
        $schedule->update(['status' => 'published']);

        return back()->with('success', 'Schedule published. Staff can now see their shifts.');
    }

    public function assign(Request $request, Shift $shift): RedirectResponse
    {
        $request->validate(['nurse_id' => ['required', 'exists:users,id']]);

        $nurse = User::with('nurseProfile')->findOrFail($request->nurse_id);

        if (! $nurse->nurseProfile?->is_active) {
            return back()->with('error', 'This nurse is inactive.');
        }

        $onLeave = $nurse->timeOffRequests()
            ->where('status', 'approved')
            ->where('start_date', '<=', $shift->date)
            ->where('end_date', '>=', $shift->date)
            ->exists();

        if ($onLeave) {
            return back()->with('error', $nurse->name.' is on approved leave that day.');
        }

        if ($shift->nurses()->where('user_id', $nurse->id)->exists()) {
            return back()->with('error', $nurse->name.' is already assigned to this shift.');
        }

        $sameDay = Shift::where('date', $shift->date)
        ->where('id', '!=', $shift->id)
        ->whereHas('nurses', fn ($q) => $q->where('user_id', $nurse->id))
        ->with('unit')
        ->first();

        if ($sameDay) {
            return back()->with('error', $nurse->name.' is already on duty that day ('.$sameDay->unit->name.', '.substr($sameDay->start_time, 0, 5).'). One shift per day only.');
        }

        // Consecutive-days rule (max 3 days straight)
        $workedDates = $nurse->shifts()
            ->pluck('date')
            ->map(fn ($d) => Carbon::parse($d)->toDateString())
            ->unique()
            ->values();

        $newDate = Carbon::parse($shift->date)->toDateString();

        if (! $workedDates->contains($newDate)) {
            $back = 0;
            $cursor = Carbon::parse($newDate);
            while ($workedDates->contains($cursor->subDay()->toDateString())) {
                $back++;
            }

            $forward = 0;
            $cursor = Carbon::parse($newDate);
            while ($workedDates->contains($cursor->addDay()->toDateString())) {
                $forward++;
            }

            $streak = $back + 1 + $forward;

            if ($streak > self::MAX_CONSECUTIVE_DAYS) {
                return back()->with('error', 'Cannot be done: '.$nurse->name.' already has '.self::MAX_CONSECUTIVE_DAYS.' days straight duty.');
            }
        }

        $shift->nurses()->attach($nurse->id);

        return back()->with('success', $nurse->name.' assigned to the shift.');
    }

    public function unassign(Shift $shift, User $nurse): RedirectResponse
    {
        $shift->nurses()->detach($nurse->id);

        return back()->with('success', $nurse->name.' removed from the shift.');
    }

    private function findOverlap(Shift $shift, int $nurseId): ?Shift
    {
        $others = Shift::where('date', $shift->date)
            ->where('id', '!=', $shift->id)
            ->whereHas('nurses', fn ($q) => $q->where('user_id', $nurseId))
            ->with('unit')
            ->get();

        foreach ($others as $other) {
            if ($this->overlaps($shift, $other)) {
                return $other;
            }
        }

        return null;
    }

    private function overlaps(Shift $a, Shift $b): bool
    {
        $aS = $this->toMin($a->start_time);
        $aE = $this->toMin($a->end_time);
        if ($aE <= $aS) $aE += 1440;

        $bS = $this->toMin($b->start_time);
        $bE = $this->toMin($b->end_time);
        if ($bE <= $bS) $bE += 1440;

        return $aS < $bE && $bS < $aE;
    }

    private function toMin(string $t): int
    {
        [$h, $m] = array_map('intval', explode(':', $t));

        return $h * 60 + $m;
    }
}