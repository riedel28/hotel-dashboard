import {
  Badge,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow
} from 'tanstack-dashboard-ui';

const num = { textAlign: 'right' } as const;

export function Reservations() {
  return (
    <Table style={{ minWidth: 720 }}>
      <TableHeader>
        <TableRow>
          <TableHead>Reservation</TableHead>
          <TableHead>Guest</TableHead>
          <TableHead>Room</TableHead>
          <TableHead>Arrival</TableHead>
          <TableHead>Nights</TableHead>
          <TableHead>Status</TableHead>
          <TableHead style={num}>Balance</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>4821</TableCell>
          <TableCell>Anna Krüger</TableCell>
          <TableCell>214 · Deluxe double</TableCell>
          <TableCell>14 Aug</TableCell>
          <TableCell>3</TableCell>
          <TableCell>
            <Badge color="emerald" size="sm">
              Checked in
            </Badge>
          </TableCell>
          <TableCell style={num}>€642.00</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>4822</TableCell>
          <TableCell>Mikkel Sørensen</TableCell>
          <TableCell>302 · Junior suite</TableCell>
          <TableCell>14 Aug</TableCell>
          <TableCell>2</TableCell>
          <TableCell>
            <Badge color="orange" size="sm">
              Arriving
            </Badge>
          </TableCell>
          <TableCell style={num}>€510.00</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>4825</TableCell>
          <TableCell>Tomiwa Okafor</TableCell>
          <TableCell>118 · Standard twin</TableCell>
          <TableCell>15 Aug</TableCell>
          <TableCell>5</TableCell>
          <TableCell>
            <Badge color="sky" size="sm">
              Confirmed
            </Badge>
          </TableCell>
          <TableCell style={num}>€875.00</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>4830</TableCell>
          <TableCell>Beatriz Almeida</TableCell>
          <TableCell>401 · Panorama suite</TableCell>
          <TableCell>16 Aug</TableCell>
          <TableCell>1</TableCell>
          <TableCell>
            <Badge color="rose" size="sm">
              Cancelled
            </Badge>
          </TableCell>
          <TableCell style={num}>€0.00</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}

export function WithFooter() {
  return (
    <Table style={{ minWidth: 560 }}>
      <TableCaption>Folio 4821 — Anna Krüger, room 214</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Posting</TableHead>
          <TableHead style={num}>Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>14 Aug</TableCell>
          <TableCell>Accommodation — Deluxe double</TableCell>
          <TableCell style={num}>€189.00</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>14 Aug</TableCell>
          <TableCell>City tax — 2 guests</TableCell>
          <TableCell style={num}>€10.00</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>15 Aug</TableCell>
          <TableCell>Minibar</TableCell>
          <TableCell style={num}>€24.00</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>15 Aug</TableCell>
          <TableCell>Restaurant — dinner for two</TableCell>
          <TableCell style={num}>€118.50</TableCell>
        </TableRow>
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell>Total</TableCell>
          <TableCell>Due on departure</TableCell>
          <TableCell style={num}>€341.50</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}

export function Borderless() {
  return (
    <Table borderless style={{ minWidth: 480 }}>
      <TableHeader>
        <TableRow>
          <TableHead>Floor</TableHead>
          <TableHead>Rooms</TableHead>
          <TableHead>Cleaned</TableHead>
          <TableHead>Blocked</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Ground</TableCell>
          <TableCell>12</TableCell>
          <TableCell>12</TableCell>
          <TableCell>0</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Second</TableCell>
          <TableCell>24</TableCell>
          <TableCell>24</TableCell>
          <TableCell>0</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Third</TableCell>
          <TableCell>24</TableCell>
          <TableCell>18</TableCell>
          <TableCell>2</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Fourth</TableCell>
          <TableCell>24</TableCell>
          <TableCell>9</TableCell>
          <TableCell>4</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
