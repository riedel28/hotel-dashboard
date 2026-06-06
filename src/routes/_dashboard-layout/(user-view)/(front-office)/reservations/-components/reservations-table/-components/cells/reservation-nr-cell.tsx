interface ReservationNrCellProps {
  reservationNr: string;
}

export function ReservationNrCell({ reservationNr }: ReservationNrCellProps) {
  const displayText =
    reservationNr.length > 20
      ? `${reservationNr.substring(0, 20)}...`
      : reservationNr;

  return (
    <span className="font-medium" title={reservationNr}>
      {displayText}
    </span>
  );
}
