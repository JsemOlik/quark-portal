# Ticketing System Frontend Update Plan

## Overview
The backend ticketing system has been completely rewritten with advanced features. This document outlines all frontend changes needed to match the backend capabilities.

## Completed Backend Features
- ✅ Priority system (low, normal, high, urgent)
- ✅ Assignment system (assign tickets to staff)
- ✅ Advanced filtering (status, department, priority, assigned_to, search)
- ✅ Email notifications (ticket replies, status changes)
- ✅ Permission-based authorization
- ✅ Tracking timestamps (last_reply_at, closed_at)
- ✅ Improved logging and security

## Frontend Files to Update

### PRIORITY 1 (CRITICAL) - Must Update First

#### 1. `resources/js/pages/admin-tickets.tsx`
**Current Issues:**
- No filtering UI
- No priority display
- No assignment display
- Links to user detail page instead of proper admin view
- No bulk actions
- Basic table with minimal information

**Required Changes:**
- Add filter bar with dropdowns:
  - Status filter (open, resolved, closed, all)
  - Department filter (billing, technical, general, all)
  - Priority filter (low, normal, high, urgent, all)
  - Assigned to filter (staff dropdown + "unassigned" option)
  - Search input (title, message, user name/email)
- Add priority badges with color coding:
  - Urgent: Red background
  - High: Orange background
  - Normal: Blue background
  - Low: Gray background
- Add assignment column with inline dropdown to change assignment
- Add quick action buttons per ticket:
  - Change status dropdown
  - Change priority dropdown
  - View/Reply button
- Add bulk action checkboxes and toolbar:
  - Select all checkbox
  - Bulk assign
  - Bulk change status
  - Bulk change priority
- Add statistics row at top:
  - Total tickets
  - Open tickets count
  - Unassigned tickets count
  - My tickets count (if assigned to current user)
- Add sorting options:
  - By priority
  - By date
  - By last reply
- Add pagination or infinite scroll
- Better responsive design

**New Props Needed from Backend:**
```typescript
{
  tickets: Ticket[];
  staffMembers: { id: number; name: string }[];
  filters: {
    status?: string;
    department?: string;
    priority?: string;
    assigned_to?: string;
    search?: string;
  };
  permissions: string[];
  csrf: string;
}
```

**New Routes to Use:**
- `GET /admin/tickets` - with query params for filters
- `POST /admin/tickets/{ticket}/assign` - assign ticket
- `POST /admin/tickets/{ticket}/priority` - change priority
- `POST /admin/tickets/{ticket}/status` - change status
- `DELETE /admin/tickets/{ticket}` - delete ticket

---

#### 2. `resources/js/pages/ticket-detail.tsx`
**Current Issues:**
- No priority display
- No assignment display
- Delete button is commented out
- Doesn't show staff actions for staff users
- No permission-based UI

**Required Changes:**
- Add ticket metadata section showing:
  - Priority badge (with color)
  - Assigned staff (if any)
  - Created date
  - Last reply date
  - Status badge
- For staff users with permissions, add action panel:
  - Change status dropdown (if has close_tickets permission)
  - Change priority dropdown (if has view_tickets permission)
  - Assign to staff dropdown (if has assign_tickets permission)
  - Delete button (if has delete_tickets permission)
- Uncomment and enable delete button for ticket owners
- Add permission checks using permissions array:
  ```typescript
  const hasPermission = (permission: string) => {
    return permissions.includes('*') || permissions.includes(permission);
  };
  ```
- Show different UI based on:
  - isOwnTicket (user's ticket)
  - isAdmin (staff with permissions)
  - ticket status (closed tickets can't be replied to by users)
- Add visual distinction for staff replies vs user replies:
  - Staff replies: Different background color, staff badge
  - User replies: Standard styling
- Add attachment icon for messages with attachments
- Improve mobile responsiveness

**New Props from Backend:**
```typescript
{
  ticket: {
    id: number;
    title: string;
    department: string;
    status: string;
    priority: string;
    server_name: string | null;
    created_at: string;
    user_id: number;
    assigned_to: number | null;
    assigned_to_name: string | null;
  };
  messages: Message[];
  isAdmin: boolean;
  isOwnTicket: boolean;
  permissions: string[];
  csrf: string;
}
```

---

#### 3. `resources/js/pages/tickets.tsx` (User View)
**Current Issues:**
- No filtering UI
- No priority display
- No search functionality
- Basic list with minimal sorting

**Required Changes:**
- Add filter bar:
  - Status filter dropdown (all, open, resolved, closed)
  - Department filter dropdown (all, billing, technical, general)
  - Search input
  - Clear filters button
- Add priority badges to ticket list
- Add last reply timestamp
- Improve ticket card/row design:
  - Show priority with colored left border
  - Show status badge
  - Show department badge
  - Show created date and last reply date
  - Show message preview (truncated)
  - Show server name if attached
- Add empty state when no tickets found
- Add loading state while fetching
- Improve create ticket form:
  - Better validation feedback
  - Character counter for message
  - Better styling
  - Success animation after submission
- Add keyboard shortcuts (optional):
  - / to focus search
  - n to create new ticket

**New Props from Backend:**
```typescript
{
  tickets: Ticket[];
  servers: Server[];
  isAdmin: boolean;
  filters: {
    status?: string;
    department?: string;
    search?: string;
  };
  csrf: string;
}
```

**New Routes to Use:**
- `GET /dashboard/tickets?status=X&department=Y&search=Z`

---

### PRIORITY 2 (IMPORTANT) - Update After Priority 1

#### 4. Create `resources/js/components/ticket-filters.tsx`
Reusable filter component for both user and admin views.

**Component Props:**
```typescript
interface TicketFiltersProps {
  filters: {
    status?: string;
    department?: string;
    priority?: string;
    assigned_to?: string;
    search?: string;
  };
  showPriority?: boolean;
  showAssignment?: boolean;
  staffMembers?: { id: number; name: string }[];
  onFilterChange: (filters: any) => void;
}
```

**Features:**
- Dropdown for status
- Dropdown for department
- Dropdown for priority (if showPriority)
- Dropdown for assignment (if showAssignment)
- Search input with debounce
- Clear all filters button
- Active filter count badge

---

#### 5. Create `resources/js/components/ticket-priority-badge.tsx`
Reusable priority badge component.

**Component Props:**
```typescript
interface PriorityBadgeProps {
  priority: 'low' | 'normal' | 'high' | 'urgent';
  size?: 'sm' | 'md' | 'lg';
  editable?: boolean;
  onPriorityChange?: (priority: string) => void;
}
```

**Styling:**
- Urgent: `bg-red-500/10 text-red-400 border-red-500/20`
- High: `bg-orange-500/10 text-orange-400 border-orange-500/20`
- Normal: `bg-blue-500/10 text-blue-400 border-blue-500/20`
- Low: `bg-gray-500/10 text-gray-400 border-gray-500/20`

---

#### 6. Create `resources/js/components/ticket-status-badge.tsx`
Reusable status badge component.

**Component Props:**
```typescript
interface StatusBadgeProps {
  status: 'open' | 'resolved' | 'closed';
  size?: 'sm' | 'md' | 'lg';
}
```

**Styling:**
- Open: `bg-blue-500/10 text-blue-400 border-blue-500/20`
- Resolved: `bg-green-500/10 text-green-400 border-green-500/20`
- Closed: `bg-gray-500/10 text-gray-400 border-gray-500/20`

---

#### 7. Create `resources/js/components/ticket-assignment-dropdown.tsx`
Reusable assignment dropdown with instant update.

**Component Props:**
```typescript
interface AssignmentDropdownProps {
  ticketId: number;
  currentAssignee: number | null;
  currentAssigneeName: string | null;
  staffMembers: { id: number; name: string }[];
  onAssignmentChange?: (newAssigneeId: number | null) => void;
}
```

**Features:**
- Dropdown with staff list
- "Unassigned" option
- Shows current assignee
- Instant update on change
- Loading state during API call

---

### PRIORITY 3 (ENHANCEMENT) - Nice to Have

#### 8. Create `resources/js/components/ticket-bulk-actions.tsx`
Bulk actions toolbar for admin view.

**Features:**
- Appears when tickets are selected
- Shows count of selected tickets
- Actions:
  - Bulk assign to staff
  - Bulk change status
  - Bulk change priority
  - Bulk delete (with confirmation)
- Clear selection button

---

#### 9. Add keyboard shortcuts to ticket list pages
**Shortcuts:**
- `/` - Focus search input
- `n` - New ticket
- `Escape` - Clear filters
- `j/k` - Navigate up/down in list
- `Enter` - Open selected ticket

---

#### 10. Add real-time updates (optional, future enhancement)
- Use Laravel Echo + Pusher/Soketi
- Real-time notifications when:
  - New reply added to your ticket
  - Ticket assigned to you
  - Status changes
- Toast notifications
- Auto-refresh ticket list

---

## Implementation Order

### Phase 1 (Do Now - Most Critical)
1. Update `ticket-detail.tsx` - Add priority, assignment, delete button
2. Update `admin-tickets.tsx` - Complete rewrite with filters and actions
3. Update `tickets.tsx` - Add filters and priority badges

### Phase 2 (Do Next)
4. Create `ticket-priority-badge.tsx` component
5. Create `ticket-status-badge.tsx` component
6. Create `ticket-filters.tsx` component
7. Create `ticket-assignment-dropdown.tsx` component

### Phase 3 (Polish)
8. Create `ticket-bulk-actions.tsx` component
9. Add keyboard shortcuts
10. Improve animations and transitions
11. Add loading states and skeletons
12. Improve mobile responsiveness

---

## Backend Routes Reference

### User Routes (`/dashboard/tickets`)
- `GET /tickets` - List user's tickets (with filters)
- `POST /tickets` - Create ticket
- `GET /tickets/{ticket}` - View ticket detail
- `POST /tickets/{ticket}/reply` - Reply to ticket
- `POST /tickets/{ticket}/resolve` - Mark as resolved
- `POST /tickets/{ticket}/open` - Reopen ticket
- `POST /tickets/{ticket}/delete` - Delete ticket
- `GET /tickets/attachment/{message}` - Download attachment

### Admin Routes (`/admin/tickets`)
- `GET /tickets` - List all tickets (with filters)
- `POST /tickets/{ticket}/reply` - Admin reply
- `POST /tickets/{ticket}/status` - Change status
- `POST /tickets/{ticket}/assign` - Assign to staff
- `POST /tickets/{ticket}/priority` - Change priority
- `DELETE /tickets/{ticket}` - Delete ticket

---

## Permission Checks

### Frontend Permission Helper
```typescript
const hasPermission = (permission: string) => {
  return permissions.includes('*') || permissions.includes(permission);
};
```

### Required Permissions
- `view_tickets` - View all tickets (admin list)
- `reply_tickets` - Reply to any ticket
- `close_tickets` - Change ticket status
- `assign_tickets` - Assign tickets to staff
- `delete_tickets` - Delete any ticket

### UI Visibility Rules
- Status change dropdown: `hasPermission('close_tickets')`
- Assignment dropdown: `hasPermission('assign_tickets')`
- Priority dropdown: `hasPermission('view_tickets')` (any staff)
- Delete button (admin): `hasPermission('delete_tickets')`
- Reply (admin): `hasPermission('reply_tickets')`
- Admin ticket list: `hasPermission('view_tickets')`

---

## Color Scheme Reference

### Priority Colors
```typescript
const priorityColors = {
  urgent: 'bg-red-500/10 text-red-400 border-red-500/20',
  high: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  normal: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  low: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};
```

### Status Colors
```typescript
const statusColors = {
  open: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  resolved: 'bg-green-500/10 text-green-400 border-green-500/20',
  closed: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};
```

### Department Colors
```typescript
const departmentColors = {
  billing: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  technical: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  general: 'bg-brand/10 text-brand border-brand/20',
};
```

---

## Testing Checklist

### User Features
- [ ] Create ticket
- [ ] View ticket list
- [ ] Filter by status
- [ ] Filter by department
- [ ] Search tickets
- [ ] Reply to ticket
- [ ] Upload attachment
- [ ] Download attachment
- [ ] Mark ticket as resolved
- [ ] Reopen ticket
- [ ] Delete own ticket
- [ ] See priority badges
- [ ] See last reply timestamp

### Admin Features
- [ ] View all tickets
- [ ] Filter by status, department, priority, assignment
- [ ] Search all tickets
- [ ] Reply to any ticket
- [ ] Change ticket status
- [ ] Change ticket priority
- [ ] Assign ticket to staff
- [ ] Unassign ticket
- [ ] Delete any ticket
- [ ] View unassigned tickets first
- [ ] See priority sorting (urgent first)

### Permissions
- [ ] Staff with view_tickets can see admin list
- [ ] Staff with reply_tickets can reply
- [ ] Staff with close_tickets can change status
- [ ] Staff with assign_tickets can assign
- [ ] Staff with delete_tickets can delete
- [ ] Staff without permission gets 403

### Email Notifications
- [ ] User receives email when admin replies
- [ ] Admin receives email when user replies (if assigned)
- [ ] User receives email when status changes
- [ ] Emails contain correct ticket link
- [ ] Emails are queued properly

---

## Notes
- All backend features are complete and production-ready
- Frontend is using existing basic UI - needs enhancement
- Priority focus: admin-tickets.tsx (most broken)
- Use existing brand color scheme (brand, brand-cream, brand-brown)
- Maintain consistency with existing admin pages
- Ensure mobile responsiveness
