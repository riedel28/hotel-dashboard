interface BookingNrCellProps {
  bookingNr: string;
}

export function BookingNrCell({ bookingNr }: BookingNrCellProps) {
  const displayText = bookingNr.length > 5 ? `${bookingNr.substring(0, 5)}...` : bookingNr;

  return (
    <span className="font-medium" title={bookingNr}>
      {displayText}
    </span>
  );
}


