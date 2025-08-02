# User/Admin View Switching Implementation

This implementation provides a React context-based solution for switching between user and admin views in the dashboard application.

## Features

- **React Context**: Uses React Context API for state management
- **localStorage Persistence**: View selection is persisted across browser sessions
- **Internationalization**: Fully integrated with react-intl for translations
- **Type Safety**: TypeScript support with proper typing
- **Default View**: Defaults to "user" view on first visit
- **Toast Notifications**: Shows toast notifications when switching views with undo functionality

## Implementation Details

### 1. View Context (`src/contexts/view-context.tsx`)

The core context that manages the view state:

```typescript
interface ViewContextType {
  currentView: ViewType; // 'user' | 'admin'
  setCurrentView: (view: ViewType) => void;
}
```

**Key Features:**

- Automatically loads saved view from localStorage on mount
- Persists view changes to localStorage
- Validates view values to prevent invalid states
- Provides error handling for context usage outside provider
- Shows toast notifications when switching views
- Includes undo functionality to revert view changes

### 2. View Selector Component (`src/layouts/dashboard-layout/view-selector.tsx`)

The UI component for switching views:

- Uses the existing Select component from the UI library
- Integrated with react-intl for translations
- Connected to the view context for state management
- Accessible with proper ARIA labels

### 3. Provider Setup (`src/layouts/dashboard-layout/index.tsx`)

The ViewProvider wraps the entire dashboard layout:

```typescript
<ViewProvider>
  <SidebarProvider>
    {/* Dashboard content */}
  </SidebarProvider>
</ViewProvider>
```

## Usage

### Using the View Context in Components

```typescript
import { useView } from '@/contexts/view-context';

function MyComponent() {
  const { currentView, setCurrentView } = useView();

  return (
    <div>
      {currentView === 'user' ? (
        <UserInterface />
      ) : (
        <AdminInterface />
      )}
    </div>
  );
}
```

### Conditional Rendering Based on View

```typescript
function ConditionalComponent() {
  const { currentView } = useView();

  if (currentView === 'admin') {
    return <AdminOnlyFeature />;
  }

  return <UserFeature />;
}
```

### Example Implementation

See `src/components/view-aware-content.tsx` for a complete example of how to use the view context to show different content based on the current view.

## Translation Keys

The following translation keys are used:

- `header.userView.selectView`: "Select view"
- `header.userView.user`: "User"
- `header.userView.admin`: "Admin"
- `viewAwareContent.title`: "Current View: {view}"
- `viewAwareContent.user.description`: User view description
- `viewAwareContent.user.features`: User features list
- `viewAwareContent.admin.description`: Admin view description
- `viewAwareContent.admin.features`: Admin features list
- `view.toast.switched`: "Switched to {view} view"
- `view.toast.reverted`: "Switched back to {view} view"

## localStorage Key

The view selection is stored in localStorage under the key: `dashboard-view`

## Benefits

1. **Simple Integration**: Easy to add to any component using the `useView` hook
2. **Persistent State**: View selection survives page refreshes and browser sessions
3. **Type Safe**: Full TypeScript support prevents runtime errors
4. **Accessible**: Proper ARIA labels and keyboard navigation
5. **Internationalized**: Supports multiple languages through react-intl
6. **Performance**: Minimal re-renders with efficient context updates
7. **User Feedback**: Toast notifications provide immediate feedback on view changes
8. **Undo Functionality**: Users can easily revert view changes with a single click

## Future Enhancements

- Add view-specific routing restrictions
- Implement role-based access control
- Add view transition animations
- Support for additional view types beyond user/admin
