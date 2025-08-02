# Auto View Switching Feature

This feature automatically switches between User and Admin views based on the current URL route, providing a seamless user experience when navigating directly to specific pages.

## How It Works

### 1. **Route Pattern Matching**

The system uses regex patterns to match URLs and determine which view should be active:

```typescript
// Admin patterns
{ pattern: /^\/properties(\/.*)?$/, view: 'admin' }
{ pattern: /^\/customers(\/.*)?$/, view: 'admin' }

// User patterns
{ pattern: /^\/reservations(\/.*)?$/, view: 'user' }
{ pattern: /^\/orders(\/.*)?$/, view: 'user' }
// ... and many more
```

### 2. **Automatic Detection**

When a user navigates to any URL, the system:

1. Detects the current route
2. Matches it against predefined patterns
3. Determines the appropriate view
4. Automatically switches if needed
5. Redirects to the dashboard start page (since current page might not be accessible in new view)

### 3. **User Feedback**

When auto-switching occurs, users see a toast notification:

- "Switched to User view and redirected to dashboard"
- "Switched to Admin view and redirected to dashboard"

## Supported URL Patterns

### **Admin View Routes**

- `/properties` → Auto-switches to Admin view
- `/properties/123` → Auto-switches to Admin view
- `/properties/123/edit` → Auto-switches to Admin view
- `/customers` → Auto-switches to Admin view
- `/customers/456` → Auto-switches to Admin view
- `/customers/456/details` → Auto-switches to Admin view

### **User View Routes**

- `/monitoring` → Auto-switches to User view
- `/analytics` → Auto-switches to User view
- `/reservations` → Auto-switches to User view
- `/reservations/123` → Auto-switches to User view
- `/reservations/123/edit` → Auto-switches to User view
- `/orders` → Auto-switches to User view
- `/orders/789` → Auto-switches to User view
- `/payments` → Auto-switches to User view
- `/products` → Auto-switches to User view
- `/events` → Auto-switches to User view
- `/mobile-cms` → Auto-switches to User view
- `/tv` → Auto-switches to User view
- `/access-provider` → Auto-switches to User view
- `/pms-provider` → Auto-switches to User view
- `/payment-provider` → Auto-switches to User view
- `/company` → Auto-switches to User view
- `/checkin-page` → Auto-switches to User view
- `/users` → Auto-switches to User view
- `/rooms` → Auto-switches to User view
- `/devices` → Auto-switches to User view
- `/registration-forms` → Auto-switches to User view

### **Shared Routes**

- `/` → No auto-switching (respects current view)

## Implementation Details

### **Core Components**

1. **Route Matcher** (`src/utils/route-matcher.ts`)

   - Contains regex patterns for all routes
   - Handles nested routes with `(\/.*)?` pattern
   - Returns the appropriate view for any given pathname

2. **Route Detection Hook** (`src/hooks/use-route-view-detection.ts`)

   - Uses TanStack Router's `useLocation` hook
   - Detects current pathname and determines target view
   - Returns detection results

3. **Auto View Switcher** (`src/components/auto-view-switcher.tsx`)
   - Monitors route changes
   - Triggers view switching when needed
   - Shows toast notifications for user feedback

### **Integration**

The `AutoViewSwitcher` component is integrated into the dashboard layout and runs automatically on every route change.

## Benefits

✅ **Seamless UX**: Users get the right view automatically  
✅ **Smart Redirects**: Redirects to dashboard when switching views  
✅ **Direct URL Access**: Works when users bookmark or share URLs  
✅ **Nested Route Support**: Handles complex URLs like `/reservations/123/edit`  
✅ **User Feedback**: Toast notifications inform users about auto-switching  
✅ **Non-Intrusive**: Only switches when necessary  
✅ **Performance**: Efficient regex pattern matching

## Edge Cases Handled

1. **Nested Routes**: `/reservations/123/edit` correctly switches to User view
2. **Dynamic Segments**: `/customers/456` correctly switches to Admin view
3. **Query Parameters**: `/reservations?page=2` correctly switches to User view
4. **Hash Fragments**: `/reservations#section` correctly switches to User view
5. **No Match**: Routes not in the mapping don't trigger switching

## Adding New Routes

To add auto-switching for a new route:

1. **Add the pattern** to `src/utils/route-matcher.ts`:

```typescript
{ pattern: /^\/new-route(\/.*)?$/, view: 'user' as const }
```

2. **Add translation** (if needed) to the i18n files

3. **Test the pattern** with various URL variations

## Configuration

### **Toast Duration**

The auto-switch toast notification duration can be adjusted in `src/components/auto-view-switcher.tsx`:

```typescript
{
  duration: 3000, // 3 seconds
  position: 'bottom-right'
}
```

### **Pattern Matching**

The regex patterns can be modified in `src/utils/route-matcher.ts` to handle different URL structures.

## Testing Examples

### **Admin View Testing**

- Navigate to `/properties` → Should auto-switch to Admin view and redirect to `/`
- Navigate to `/customers/123` → Should auto-switch to Admin view and redirect to `/`
- Navigate to `/properties/edit` → Should auto-switch to Admin view and redirect to `/`

### **User View Testing**

- Navigate to `/reservations` → Should auto-switch to User view and redirect to `/`
- Navigate to `/reservations/123/edit` → Should auto-switch to User view and redirect to `/`
- Navigate to `/orders/789` → Should auto-switch to User view and redirect to `/`
- Navigate to `/payments/101/refund` → Should auto-switch to User view and redirect to `/`

### **Shared Route Testing**

- Navigate to `/` → Should not auto-switch (respects current view)

## Future Enhancements

1. **Route Metadata**: Add metadata to route definitions for automatic detection
2. **User Preferences**: Respect user's preference for certain routes
3. **Conditional Switching**: Only auto-switch for certain user roles
4. **Analytics**: Track auto-switching events for UX insights
