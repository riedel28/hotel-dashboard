import { Trans, useLingui } from '@lingui/react/macro';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { type PaginationState, type SortingState } from '@tanstack/react-table';
import { XIcon } from 'lucide-react';

import { fetchUsersParamsSchema, usersQueryOptions } from '@/api/users';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import {
  ErrorDisplayError,
  ErrorDisplayMessage,
  ErrorDisplayTitle
} from '@/components/ui/error-display';
import { SearchInput } from '@/components/ui/search-input';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { cn } from '@/lib/utils';

import { InviteUserModal } from './-components/invite-user-modal';
import UsersTable from './-components/users-table';

function UsersPage() {
  const { page, per_page, q, sort_by, sort_order } = Route.useSearch();
  const navigate = Route.useNavigate();

  const { t } = useLingui();
  useDocumentTitle(t`Users`);

  const usersQuery = useQuery(
    usersQueryOptions({
      page,
      per_page,
      q,
      sort_by,
      sort_order
    })
  );

  const handleSearchChange = (searchTerm: string) => {
    navigate({
      to: '/users',
      search: (prev) => ({
        ...prev,
        page: 1,
        q: searchTerm || undefined
      })
    });
  };

  const handlePaginationChange = (
    updaterOrValue:
      | PaginationState
      | ((old: PaginationState) => PaginationState)
  ) => {
    const pagination =
      typeof updaterOrValue === 'function'
        ? updaterOrValue({
            pageIndex: (page ?? 1) - 1,
            pageSize: per_page ?? 10
          })
        : updaterOrValue;

    navigate({
      to: '/users',
      search: (prev) => ({
        ...prev,
        page: pagination.pageIndex + 1,
        per_page: pagination.pageSize
      })
    });
  };

  const handleSortingChange = (
    updaterOrValue: SortingState | ((old: SortingState) => SortingState)
  ) => {
    const sorting =
      typeof updaterOrValue === 'function'
        ? updaterOrValue(
            sort_by
              ? [{ id: sort_by, desc: sort_order === 'desc' }]
              : [{ id: 'created_at', desc: true }]
          )
        : updaterOrValue;

    const firstSort = sorting[0];
    if (firstSort) {
      navigate({
        to: '/users',
        search: (prev) => ({
          ...prev,
          page: 1,
          sort_by: firstSort.id as
            | 'email'
            | 'first_name'
            | 'last_name'
            | 'country_code'
            | 'created_at',
          sort_order: firstSort.desc ? ('desc' as const) : ('asc' as const)
        })
      });
    } else {
      navigate({
        to: '/users',
        search: (prev) => ({
          ...prev,
          page: 1,
          sort_by: undefined,
          sort_order: undefined
        })
      });
    }
  };

  const handleClearFilters = () => {
    navigate({
      to: '/users',
      search: {
        page: 1,
        per_page: per_page,
        q: undefined,
        sort_by: undefined,
        sort_order: undefined
      }
    });
  };

  const sorting: SortingState = sort_by
    ? [{ id: sort_by, desc: sort_order === 'desc' }]
    : [{ id: 'created_at', desc: true }];

  const renderTableContent = () => {
    if (usersQuery.isLoading) {
      return (
        <UsersTable
          data={[]}
          isLoading={true}
          pageIndex={(page ?? 1) - 1}
          pageSize={per_page ?? 10}
          totalCount={0}
          pageCount={0}
          onPaginationChange={handlePaginationChange}
          sorting={sorting}
          onSortingChange={handleSortingChange}
        />
      );
    }

    if (usersQuery.isError) {
      return (
        <div className="flex min-h-[60vh] items-center justify-center">
          <ErrorDisplayError className="w-md max-w-md">
            <ErrorDisplayTitle>
              <Trans>Something went wrong</Trans>
            </ErrorDisplayTitle>
            <ErrorDisplayMessage>
              {usersQuery.error.message || (
                <Trans>An error occurred while fetching users</Trans>
              )}
            </ErrorDisplayMessage>
          </ErrorDisplayError>
        </div>
      );
    }

    if (usersQuery.data) {
      return (
        <UsersTable
          data={usersQuery.data.index}
          pageIndex={(page ?? 1) - 1}
          pageSize={per_page ?? 10}
          totalCount={usersQuery.data.total}
          pageCount={usersQuery.data.page_count}
          onPaginationChange={handlePaginationChange}
          sorting={sorting}
          onSortingChange={handleSortingChange}
        />
      );
    }

    return null;
  };

  return (
    <div className="space-y-1">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink to="/">
              <Trans>Home</Trans>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              <Trans>Users</Trans>
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-6 flex justify-between">
        <h1 className="text-2xl font-bold">
          <Trans>Users</Trans>
        </h1>
        <InviteUserModal />
      </div>

      <div className="space-y-2.5">
        <div className="flex items-center justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <SearchInput
              value={q || ''}
              onChange={handleSearchChange}
              placeholder={t`Search users`}
              wrapperClassName="w-full sm:w-[250px]"
              debounceMs={500}
            />
            {q && (
              <Button
                variant="secondary"
                onClick={handleClearFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                <XIcon />
                <Trans>Clear filters</Trans>
              </Button>
            )}
          </div>
        </div>

        {q && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Trans>
              Show results for:{' '}
              <span className="font-medium text-foreground">"{q}"</span>
            </Trans>
          </div>
        )}

        <div
          className={cn(
            'opacity-100 transition-opacity duration-300 ease-in-out',
            {
              'opacity-70': usersQuery.isFetching
            }
          )}
        >
          {renderTableContent()}
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/_dashboard-layout/(user-view)/users/')({
  validateSearch: (search) => fetchUsersParamsSchema.parse(search),
  component: UsersPage
});
