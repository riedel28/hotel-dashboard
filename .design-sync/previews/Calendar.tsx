import { Calendar } from 'tanstack-dashboard-ui';

const may = new Date(2024, 4, 1);
const d = (day: number) => new Date(2024, 4, day);

export function Default() {
  return <Calendar mode="single" defaultMonth={may} selected={d(17)} />;
}

export function StayRange() {
  return (
    <Calendar
      mode="range"
      numberOfMonths={2}
      defaultMonth={may}
      selected={{ from: d(14), to: d(19) }}
      footer="Arrival 14 May, departure 19 May — 5 nights"
    />
  );
}

export function SoldOutNights() {
  return (
    <Calendar
      mode="single"
      defaultMonth={may}
      selected={d(23)}
      disabled={[d(10), d(11), d(12), d(24), d(25)]}
      footer="Greyed-out nights are sold out at this property."
    />
  );
}

export function MaintenanceBlocks() {
  return (
    <Calendar
      mode="multiple"
      defaultMonth={may}
      selected={[d(6), d(7), d(8), d(20), d(21)]}
      showWeekNumber
      fixedWeeks
      footer="Room 401 is blocked for bathroom refurbishment on the selected days."
    />
  );
}
