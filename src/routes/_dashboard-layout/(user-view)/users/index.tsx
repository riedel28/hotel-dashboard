import { Trans, useLingui } from '@lingui/react/macro';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { type PaginationState, type SortingState } from '@tanstack/react-table';
import { z } from 'zod';

import { rolesQueryOptions } from '@/api/roles';
import {
  fetchUsersParamsSchema,
  userQueryOptions,
  usersQueryOptions
} from '@/api/users';
import { ClearFiltersButton } from '@/components/clear-filters-button';
import { EmptyFilterResult } from '@/components/empty-table-state';
import { tableLoadError } from '@/components/load-error';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { CountryPicker } from '@/components/ui/country-picker';
import {
  DataGridCheckboxFilter,
  DataGridCheckboxFilterClear,
  DataGridCheckboxFilterFooter
} from '@/components/ui/data-grid-checkbox-filter';
import { SearchInput } from '@/components/ui/search-input';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { cn } from '@/lib/utils';

import { InviteUserModal } from './-components/invite-user-modal';
import { UserFormDrawer } from './-components/user-form-drawer';
import UsersTable from './-components/users-table';

function UsersPage() {
  const {
    page,
    per_page,
    q,
    country_code,
    role,
    sort_by,
    sort_order,
    user: openUserId
  } = Route.useSearch();
  const navigate = Route.useNavigate();

  const { t } = useLingui();
  useDocumentTitle(t`Users`);

  const usersQuery = useQuery(
    usersQueryOptions({
      page,
      per_page,
      q,
      country_code,
      role,
      sort_by,
      sort_order
    })
  );
  const { data: roles = [] } = useQuery(rolesQueryOptions());
  const pageUsers = usersQuery.data?.index ?? [];
  // The open user is normally on the page; a link to one that is not loads it
  const listedUser = pageUsers.find((u) => u.id === openUserId);
  const fetchedUserQuery = useQuery({
    ...userQueryOptions(openUserId ?? 0),
    enabled: openUserId !== undefined && !listedUser && !usersQuery.isPending
  });
  const openUser =
    openUserId === undefined
      ? undefined
      : (listedUser ?? fetchedUserQuery.data);
  const openUserById = (userId: number) =>
    navigate({ to: '/users', search: (prev) => ({ ...prev, user: userId }) });
  // Stepping replaces the entry, so Back leaves the drawer, not each user
  const selectUser = (userId: number) =>
    navigate({
      to: '/users',
      search: (prev) => ({ ...prev, user: userId }),
      replace: true
    });
  const closeUser = () =>
    navigate({
      to: '/users',
      search: (prev) => ({ ...prev, user: undefined })
    });
  const roleOptions = roles.map((r) => ({
    value: String(r.id),
    label: r.name
  }));
  const hasActiveFilters = Boolean(q || country_code || role?.length);

  // A changed filter starts again on the first page
  const setFilters = (
    filters: Partial<{
      q: string;
      country_code: string;
      role: number[];
    }>
  ) => {
    navigate({
      to: '/users',
      search: (prev) => ({ ...prev, page: 1, ...filters })
    });
  };

  const handleSearchChange = (searchTerm: string) =>
    setFilters({ q: searchTerm || undefined });

  const handlePaginationChange = (
    updaterOrValue:
      | PaginationState
      | ((old: PaginationState) => PaginationState)
  ) => {
    const pagination =
      typeof updaterOrValue === 'function'
        ? updaterOrValue({
            pageIndex: (page ?? 1) - 1,
            pageSize: per_page ?? 25
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
        country_code: undefined,
        role: undefined,
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
          pageSize={per_page ?? 25}
          totalCount={0}
          pageCount={0}
          onPaginationChange={handlePaginationChange}
          sorting={sorting}
          onSortingChange={handleSortingChange}
        />
      );
    }

    const error = tableLoadError(
      usersQuery,
      <Trans>Couldn't load users</Trans>
    );
    if (error) {
      return (
        <UsersTable
          data={[]}
          pageIndex={(page ?? 1) - 1}
          pageSize={per_page ?? 25}
          error={error}
        />
      );
    }

    if (usersQuery.data) {
      return (
        <UsersTable
          data={usersQuery.data.index}
          pageIndex={(page ?? 1) - 1}
          pageSize={per_page ?? 25}
          totalCount={usersQuery.data.total}
          pageCount={usersQuery.data.page_count}
          onPaginationChange={handlePaginationChange}
          sorting={sorting}
          onSortingChange={handleSortingChange}
          onUserOpen={openUserById}
          selectedUserId={openUser?.id}
          // The list always holds the one looking at it, so only the
          // filters can leave it empty
          emptyMessage={
            <EmptyFilterResult
              description={<Trans>No users match the filters.</Trans>}
              onClearFilters={handleClearFilters}
            />
          }
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
        <h1 className="text-xl font-bold">
          <Trans>Users</Trans>
        </h1>
        <InviteUserModal />
      </div>

      <div className="space-y-2.5">
        {/* One row from `sm` up; on a phone the search keeps its row and
            the other filters go under it */}
        <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
          <SearchInput
            value={q || ''}
            onChange={handleSearchChange}
            placeholder={t`Search users`}
            wrapperClassName="w-full sm:w-72 sm:min-w-36 sm:shrink"
            debounceMs={500}
          />
          <CountryPicker
            value={country_code}
            onValueChange={(code) =>
              setFilters({ country_code: code || undefined })
            }
            placeholder={t`All countries`}
            // Room for nearly every name; the very longest are cut short
            className="w-full sm:w-64 sm:min-w-40 sm:shrink"
          />
          <DataGridCheckboxFilter
            label={<Trans>Role</Trans>}
            placeholder={<Trans>All roles</Trans>}
            options={roleOptions}
            value={role?.map(String) ?? []}
            onValueChange={(ids) =>
              setFilters({ role: ids.length ? ids.map(Number) : undefined })
            }
            // Fits "Role: Roomservice Order Agent", the longest one
            className="w-full sm:w-66 sm:min-w-36 sm:shrink"
          >
            <DataGridCheckboxFilterFooter>
              <DataGridCheckboxFilterClear>
                <Trans>Reset</Trans>
              </DataGridCheckboxFilterClear>
            </DataGridCheckboxFilterFooter>
          </DataGridCheckboxFilter>
          <ClearFiltersButton
            hasActiveFilters={hasActiveFilters}
            onClear={handleClearFilters}
          />
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

        <UserFormDrawer
          user={openUser}
          pageUsers={pageUsers}
          onSelect={selectUser}
          onClose={closeUser}
        />
      </div>
    </div>
  );
}

export const Route = createFileRoute('/_dashboard-layout/(user-view)/users/')({
  // The list's filters plus the user open in the drawer
  validateSearch: (search) =>
    fetchUsersParamsSchema
      .extend({ user: z.coerce.number().int().positive().optional() })
      .parse(search),
  component: UsersPage
});
