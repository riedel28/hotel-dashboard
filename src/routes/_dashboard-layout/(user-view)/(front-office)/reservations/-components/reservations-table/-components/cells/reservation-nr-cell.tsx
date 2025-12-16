interface ReservationNrCellProps {
  reservationNr: string;
}

export function ReservationNrCell({ reservationNr }: ReservationNrCellProps) {
  const displayText =
    reservationNr.length > 10
      ? `${reservationNr.substring(0, 10)}...`
      : reservationNr;

  return (
    <span className="font-medium" title={reservationNr}>
      {displayText}
    </span>
  );
}
