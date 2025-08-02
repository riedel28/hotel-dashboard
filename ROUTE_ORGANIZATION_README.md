# Route Organization Structure

This document describes the organized folder structure for the TanStack Router routes, using route groups for better organization without affecting URL paths.

## Folder Structure

```
src/routes/_dashboard-layout/
├── index.tsx                    # Dashboard home (shared)
├── (user-view)/                 # User view routes (no URL impact)
│   ├── monitoring.tsx           # Monitoring page
│   ├── analytics.tsx            # Analytics page
│   ├── about.tsx                # About page
│   ├── profile.tsx              # Profile page
│   ├── products.tsx             # Content Manager - Products
│   ├── events.tsx               # Content Manager - Events
│   ├── mobile-cms.tsx           # Content Manager - Mobile CMS
│   ├── tv.tsx                   # Content Manager - TV App
│   ├── access-provider.tsx      # Integrations - Access Provider
│   ├── pms-provider.tsx         # Integrations - PMS Provider
│   ├── payment-provider.tsx     # Integrations - Payment Provider
│   ├── company.tsx              # Settings - Company data
│   ├── checkin-page.tsx         # Settings - Checkin Page
│   ├── users.tsx                # Settings - Users
│   ├── rooms.tsx                # Settings - Rooms
│   ├── devices.tsx              # Settings - Devices
│   └── (front-office)/          # Front Office routes (nested group)
│       ├── reservations/        # Reservations with components
│       ├── orders.tsx           # Orders
│       ├── payments.tsx         # Payments
│       └── registration-forms.tsx # Registration forms
└── (admin-view)/                # Admin view routes (no URL impact)
    ├── properties.tsx           # Properties page
    └── customers.tsx            # Customers page
```

## Route Groups

### `(user-view)` Group

Contains all routes that are accessible in the **User View** of the application. These routes are shown in the sidebar when the user is in "User" mode.

**Categories:**

- **Monitoring & Analytics**: monitoring, analytics
- **Content Manager**: products, events, mobile-cms, tv
- **Integrations**: access-provider, pms-provider, payment-provider
- **Settings**: company, checkin-page, users, rooms, devices
- **Front Office**: reservations, orders, payments, registration-forms

### `(admin-view)` Group

Contains all routes that are accessible in the **Admin View** of the application. These routes are shown in the sidebar when the user is in "Admin" mode.

**Categories:**

- **Core Admin**: properties, customers

### Shared Routes

- **index.tsx**: Dashboard home page accessible from both views

## URL Paths

**Important**: Route groups (folders with parentheses) do NOT affect the URL paths. All routes maintain their original URLs:

- `/` → Dashboard home
- `/monitoring` → Monitoring page
- `/properties` → Properties page (admin)
- `/customers` → Customers page (admin)
- `/reservations` → Reservations page
- etc.

## Benefits

1. **Better Organization**: Routes are grouped by their intended view/audience
2. **Clear Separation**: Easy to distinguish between user and admin functionality
3. **Maintainability**: Related routes are co-located
4. **No URL Impact**: Route groups don't change existing URLs
5. **Scalability**: Easy to add new routes to appropriate groups

## Adding New Routes

### For User View:

Place new route files in `src/routes/_dashboard-layout/(user-view)/`

### For Admin View:

Place new route files in `src/routes/_dashboard-layout/(admin-view)/`

### For Shared Routes:

Place in `src/routes/_dashboard-layout/` (root level)

## TanStack Router Features Used

- **Route Groups**: Folders with parentheses `(group-name)` for organization
- **Nested Groups**: `(front-office)` nested within `(user-view)`
- **File-based Routing**: Each `.tsx` file becomes a route
- **Layout Routes**: `_dashboard-layout` provides the dashboard layout wrapper

## Migration Notes

This organization was implemented without breaking any existing functionality:

- All existing URLs remain the same
- All existing imports and references continue to work
- The sidebar navigation logic remains unchanged
- View switching functionality is preserved
