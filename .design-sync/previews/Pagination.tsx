import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from 'tanstack-dashboard-ui';

export function Default() {
  return (
    <Pagination style={{ width: 520 }}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#page-1" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#page-1">1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#page-2" isActive>
            2
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#page-3">3</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#page-3" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

export function WithEllipsis() {
  return (
    <Pagination style={{ width: 560 }}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#page-6" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#page-1">1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#page-6">6</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#page-7" isActive>
            7
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#page-8">8</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#page-24">24</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#page-8" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

export function WithResultCount() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        width: 640
      }}
    >
      <span style={{ fontSize: 13 }}>Showing 21–40 of 482 reservations</span>
      <Pagination style={{ margin: 0, width: 'auto' }}>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#page-1" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#page-1">1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#page-2" isActive>
              2
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#page-3">3</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#page-3" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
