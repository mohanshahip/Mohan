# Admin Panel Data-Fetching Architecture Refactor

This document outlines the refactored data-fetching architecture for the Admin Panel, aimed at providing parity between tabular and image-grid views.

## 1. Core Architecture: `useAdminData` Hook

The centerpiece of the refactor is the `useAdminData` custom hook, which encapsulates all data-fetching logic for admin dashboards.

### Features:
- **Unified Parameters**: Handles `lang`, `page`, `limit`, `search`, and custom filters consistently across all modules.
- **Loading & Error Handling**: Integrated with `UIContext` for loading states and `ToastContext` for error notifications.
- **Pagination**: Manages `page`, `totalPages`, and `total` items automatically.
- **Real-time Updates**: Listens to `new_activity` socket events to refresh data when changes occur elsewhere in the system.
- **Automatic Refresh**: Refetches data when filters, search queries, or page numbers change.

### Usage:
```javascript
const {
  data,
  loading,
  page,
  setPage,
  totalPages,
  total,
  searchQuery,
  setSearchQuery,
  filters,
  setFilters,
  refresh
} = useAdminData('/api/endpoint', { status: 'all' }, 'entityName', ['socket_event']);
```

## 2. Parity Between Table and Grid Views

Every dashboard (Poems, Projects, Gallery, Skills) now supports a consistent set of features regardless of the visual layout:

### Features Standardized:
- **Server-side Search**: Regex-based search across multiple fields (title, description, tags, etc.).
- **Filtering**: Language, category, and status filtering applied uniformly.
- **Pagination**: Identical pagination controls for both tables and grids.
- **Bulk Actions**: Support for selecting multiple items and applying actions like publish, unpublish, and delete.
- **Stats**: Real-time summary statistics displayed above the content.
- **Image Metadata**: Full image objects (URLs, alt text, primary status) are fetched and formatted by the backend, ensuring reliability in grid views.

## 3. Backend Optimizations

The following backend controllers were refactored to support the new frontend architecture:
- `galleryController.js`: Added support for pagination, regex search, and full image metadata formatting.
- `skillController.js`: Added pagination support and standardized query parameter handling.

## 4. Deviation & Optimization Notes

- **Grid View Default**: The Gallery dashboard now defaults to `grid` view mode for better visual presentation of image assets, while still providing a `table` view for quick management.
- **Manual vs. Calculated Stats**: Some dashboards (Poems) use dedicated stats endpoints, while others (Projects, Skills) calculate stats from the current dataset for performance efficiency on smaller collections.
- **Socket Event Filtering**: `useAdminData` now intelligently filters `new_activity` events by entity type to avoid unnecessary refetches.

## 5. Image Metadata Standards

Image metadata is handled according to the following standards:
- **URL Resolution**: Backend prepends the correct base URL for local assets.
- **Alt Text**: Fallback mechanisms ensure every image has descriptive alt text (e.g., gallery title).
- **Primary Image**: Grid views prioritized the `isPrimary` image for thumbnails.
- **Loading Performance**: Dashboards use lazy loading for the list/grid components to improve initial page load speed.
