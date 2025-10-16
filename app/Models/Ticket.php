<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ticket extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'server_id',
        'title',
        'message',
        'department',
        'status',
        'priority',
        'assigned_to',
        'additional_access',
        'last_reply_at',
        'closed_at',
    ];

    protected $casts = [
        'last_reply_at' => 'datetime',
        'closed_at' => 'datetime',
        'additional_access' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function server()
    {
        return $this->belongsTo(Server::class);
    }

    public function assignedTo()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function messages()
    {
        return $this->hasMany(TicketMessage::class);
    }

    /**
     * Check if a staff member can manage this ticket
     * Super admins can always manage, assigned staff can manage, additional access can manage
     */
    public function canManage(User $user): bool
    {
        // Super admins bypass all restrictions
        if ($user->isSuperAdmin()) {
            return true;
        }

        // Ticket owner can always view
        if ($this->user_id === $user->id) {
            return true;
        }

        // If ticket is unassigned, any staff with view_tickets can manage
        if (!$this->assigned_to) {
            return $user->hasPermission('view_tickets');
        }

        // If assigned, only assignee and users with additional access can manage
        if ($this->assigned_to === $user->id) {
            return true;
        }

        // Check additional access list
        $additionalAccess = $this->additional_access ?? [];
        return in_array($user->id, $additionalAccess);
    }

    /**
     * Grant access to a staff member
     */
    public function grantAccess(int $userId): void
    {
        $additionalAccess = $this->additional_access ?? [];
        if (!in_array($userId, $additionalAccess)) {
            $additionalAccess[] = $userId;
            $this->additional_access = $additionalAccess;
            $this->save();
        }
    }

    /**
     * Revoke access from a staff member
     */
    public function revokeAccess(int $userId): void
    {
        $additionalAccess = $this->additional_access ?? [];
        $this->additional_access = array_values(array_filter($additionalAccess, fn($id) => $id !== $userId));
        $this->save();
    }
}
