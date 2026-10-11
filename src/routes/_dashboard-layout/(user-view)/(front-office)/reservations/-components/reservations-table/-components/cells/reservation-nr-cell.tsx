interface ReservationNrCellProps {
  reservationNr: string;
}

export function ReservationNrCell({ reservationNr }: ReservationNrCellProps) {
  return (
    // One line whatever the column's width: the number is cut off, never wrapped
    <span className="block truncate font-medium" title={reservationNr}>
      {reservationNr}
    </span>
  );
}
