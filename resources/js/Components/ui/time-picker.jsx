import { Popover, PopoverContent, PopoverTrigger } from '@/Components/ui/popover';
import { Clock } from 'lucide-react';

const HOURS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

export default function TimePicker({ value, onChange }) {
    const [h, m] = (value || '07:00').split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hr12 = h % 12 === 0 ? 12 : h % 12;

    const combine = (hr, min, ap) => {
        let hh = hr % 12;
        if (ap === 'PM') hh += 12;
        return `${String(hh).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
    };

    const format = (t) => {
        const [hh, mm] = t.split(':').map(Number);
        const ap = hh >= 12 ? 'PM' : 'AM';
        const hr = hh % 12 === 0 ? 12 : hh % 12;
        return `${String(hr).padStart(2, '0')}:${String(mm).padStart(2, '0')} ${ap}`;
    };

    const col = 'flex max-h-56 w-16 flex-col gap-1 overflow-y-auto';
    const btn = (selected) =>
        'rounded-lg px-2 py-1.5 text-xs font-medium ' +
        (selected ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-indigo-50');

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 shadow-sm transition hover:bg-gray-50"
                >
                    <span>{value ? format(value) : 'Select time'}</span>
                    <Clock className="h-4 w-4 text-gray-400" />
                </button>
            </PopoverTrigger>
            <PopoverContent className="p-2">
                <div className="flex gap-2">
                    {/* Hours */}
                    <div className={col}>
                        {HOURS.map((hr) => (
                            <button key={hr} type="button" className={btn(hr === hr12)} onClick={() => onChange(combine(hr, m, ampm))}>
                                {String(hr).padStart(2, '0')}
                            </button>
                        ))}
                    </div>
                    {/* Minutes */}
                    <div className={col}>
                        {MINUTES.map((min) => (
                            <button key={min} type="button" className={btn(min === m)} onClick={() => onChange(combine(hr12, min, ampm))}>
                                {String(min).padStart(2, '0')}
                            </button>
                        ))}
                    </div>
                    {/* AM / PM */}
                    <div className="flex w-16 flex-col gap-1">
                        {['AM', 'PM'].map((ap) => (
                            <button key={ap} type="button" className={btn(ap === ampm)} onClick={() => onChange(combine(hr12, m, ap))}>
                                {ap}
                            </button>
                        ))}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}