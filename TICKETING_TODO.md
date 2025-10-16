# Ticketing System - Remaining TODOs

## ✅ Completed
1. Fixed logging formatter type hint error
2. Removed user "reopen" route - users can only mark tickets as resolved, not reopen them
3. Added `tickets()` relationship to User model
4. Added `additional_access` JSON field to tickets table for future permission system

## 🔨 In Progress / Remaining Tasks

### 1. Ticket Assignment Exclusivity
**Requirement**: When a ticket is assigned to a staff member, other admins (except super admins) cannot manage the ticket unless granted access.

**Implementation Plan**:
- Add permission check in all admin action methods (`adminReply`, `adminSetStatus`, `adminSetPriority`, `adminAssignTicket`)
- Use `$ticket->canManage($user)` method (already added to Ticket model)
- Return 403 error with message: "This ticket is assigned to another staff member. Request access from {assignee_name}."

**Files to Modify**:
- `app/Http/Controllers/TicketController.php` - Add permission checks to all admin methods
- `resources/js/pages/admin/ticket-detail.tsx` - Disable form controls when user can't manage

### 2. Permission Request System
**Requirement**: Staff members can request access to assigned tickets from the assignee or super admins.

**Implementation Plan**:
- Create `ticket_access_requests` table with fields:
  - `id`, `ticket_id`, `requester_id`, `status` (pending/approved/denied), `timestamps`
- Add routes:
  - `POST /admin/tickets/{ticket}/request-access` - Request access
  - `POST /admin/tickets/{ticket}/grant-access` - Grant access (assignee/super admin only)
  - `POST /admin/tickets/{ticket}/revoke-access` - Revoke access
- Add UI in admin ticket detail page:
  - "Request Access" button for non-assignee staff
  - "Pending Access Requests" section for assignee/super admin
  - List of users with granted access

### 3. Status Change Message Badges
**Requirement**: When status changes, show a full-width badge in conversation like "Username marked ticket as resolved"

**Implementation Plan**:
- Create `ticket_events` table or add `type` field to `ticket_messages`:
  - Types: `message`, `status_change`, `priority_change`, `assignment_change`
- When status/priority/assignment changes, create an event entry
- Update message rendering to show different UI for events:
  ```tsx
  {msg.type === 'status_change' && (
    <div className="w-full py-2 px-4 bg-blue-500/10 border border-blue-500/20 rounded-lg text-center">
      <span className="text-sm text-blue-400">
        {msg.user_name} marked ticket as {msg.new_status}
      </span>
    </div>
  )}
  ```

**Files to Create/Modify**:
- Migration: Add `type` and `metadata` (JSON) to `ticket_messages` table
- `TicketController.php` - Create event messages on status/priority/assignment changes
- `admin/ticket-detail.tsx` and `ticket-detail.tsx` - Render event badges

### 4. Update User Ticket Detail Page
**Current Issue**: User ticket detail page still shows "Reopen" button

**Fix**:
- Remove "Reopen" button from `resources/js/pages/ticket-detail.tsx`
- Only show "Mark as Resolved" button when status is 'open'
- Show message "Contact support to reopen this ticket" when resolved/closed

### 5. Add Admin Permission Checks to All Actions
**Files**: `app/Http/Controllers/TicketController.php`

Add to these methods:
```php
public function adminReply(Request $request, Ticket $ticket)
{
    // Add at the top:
    abort_unless($ticket->canManage(Auth::user()), 403,
        'This ticket is assigned to another staff member.');

    // ... rest of method
}
```

Methods to update:
- `adminReply()` - Line 571
- `adminSetStatus()` - Line 651
- `adminSetPriority()` - Line 738
- `adminAssignTicket()` - Line 704
- `adminDelete()` - Line 770

### 6. Update Admin Ticket Detail Frontend
**File**: `resources/js/pages/admin/ticket-detail.tsx`

Add checks:
```tsx
const canManage = ticket.can_manage; // Pass from backend

{/* Disable controls when can't manage */}
<Textarea
    disabled={!canManage}
    // ...
/>

<Select
    disabled={!canManage}
    // ...
/>

{/* Show request access button */}
{!canManage && !hasPermission('*') && (
    <Button onClick={handleRequestAccess}>
        Request Access from {ticket.assigned_to_name}
    </Button>
)}
```

---

## 📝 Quick Implementation Guide

### Step 1: Add Permission Checks (Easiest)
1. Add `abort_unless($ticket->canManage(Auth::user()), 403);` to all admin action methods
2. Pass `can_manage` boolean to frontend in `adminShow()` method
3. Disable UI controls based on `can_manage` prop

### Step 2: Remove User Reopen Button (Easiest)
1. Edit `resources/js/pages/ticket-detail.tsx`
2. Remove/hide the reopen button
3. Only show "Mark as Resolved" when status is 'open'

### Step 3: Add Status Change Badges (Medium)
1. Add `type` and `metadata` columns to `ticket_messages` table
2. Create event messages on status changes
3. Update message rendering to show badges for events

### Step 4: Permission Request System (Complex)
1. Create `ticket_access_requests` table
2. Add request/grant/revoke methods
3. Add routes
4. Build UI for requesting and granting access

---

## 🔒 Security Notes

- Super admins (`is_admin = true`) bypass ALL restrictions
- Ticket owners can always view their own tickets
- Unassigned tickets can be managed by any staff with `view_tickets` permission
- Assigned tickets can only be managed by assignee + users with granted access
- Permission checks must be in BOTH backend (controller) and frontend (UI)

---

## 🎨 UI Mockup for Status Change Badge

```
┌─────────────────────────────────────────────┐
│ John Doe                            [Staff] │
│ Here is my reply to your question...       │
│ [attachment.pdf]                            │
│ 10:30 AM                                    │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│    🟢 John Doe marked ticket as resolved    │
│                10:35 AM                     │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Jane Smith                                  │
│ Thank you for your help!                    │
│ 10:40 AM                                    │
└─────────────────────────────────────────────┘
```

---

## Priority
1. **HIGH**: Add permission checks to admin actions (Step 1)
2. **HIGH**: Remove user reopen button (Step 2)
3. **MEDIUM**: Add status change badges (Step 3)
4. **LOW**: Permission request system (Step 4) - Can be added later

