// CSEDU Digital Knowledge Platform - Type Definitions
// Based on SDD v1.0 Core Entities

// User Roles (RBAC)
export type RoleTier = 'public' | 'member' | 'staff' | 'admin' | 'ai_admin';

// Media Status
export type MediaStatus = 'draft' | 'review' | 'published' | 'archived';

// Access Tiers
export type AccessTier = 'public' | 'member' | 'staff' | 'restricted';

// Fine Status
export type FineStatus = 'pending' | 'paid' | 'waived';

// Payment Status
export type PaymentStatus = 'pending' | 'successful' | 'failed';

// Hold Status
export type HoldStatus = 'active' | 'fulfilled' | 'cancelled';

// Research Status
export type ResearchStatus = 'draft' | 'review' | 'published';

// Project Status
export type ProjectStatus = 'draft' | 'approved' | 'published';

// Loan Status
export type LoanStatus = 'active' | 'returned' | 'overdue';

// Media Formats
export type MediaFormat = 
  | 'pdf' 
  | 'docx' 
  | 'doc' 
  | 'pptx' 
  | 'xlsx' 
  | 'mp4' 
  | 'mp3' 
  | 'jpg' 
  | 'png' 
  | 'gif';

// Role permissions mapping
export const ROLE_PERMISSIONS: Record<RoleTier, string[]> = {
  public: ['view_public_catalog', 'search_public'],
  member: [
    'view_public_catalog',
    'search_public',
    'borrow_books',
    'view_member_content',
    'upload_projects',
    'use_ai_chat',
  ],
  staff: [
    'view_public_catalog',
    'search_public',
    'borrow_books',
    'view_member_content',
    'upload_projects',
    'use_ai_chat',
    'manage_catalog',
    'manage_loans',
    'view_staff_content',
    'upload_media',
    'manage_research',
  ],
  admin: [
    'view_public_catalog',
    'search_public',
    'borrow_books',
    'view_member_content',
    'upload_projects',
    'use_ai_chat',
    'manage_catalog',
    'manage_loans',
    'view_staff_content',
    'upload_media',
    'manage_research',
    'manage_users',
    'view_audit_logs',
    'manage_permissions',
  ],
  ai_admin: [
    'view_public_catalog',
    'search_public',
    'borrow_books',
    'view_member_content',
    'upload_projects',
    'use_ai_chat',
    'manage_catalog',
    'manage_loans',
    'view_staff_content',
    'upload_media',
    'manage_research',
    'manage_users',
    'view_audit_logs',
    'manage_permissions',
    'configure_ai_models',
    'view_ai_analytics',
    'manage_embeddings',
  ],
};

// Check if a role has a specific permission
export function hasPermission(role: RoleTier, permission: string): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

// Check if user can access content based on access tier
export function canAccessContent(userRole: RoleTier, contentAccessTier: AccessTier): boolean {
  const accessHierarchy: Record<AccessTier, number> = {
    public: 0,
    member: 1,
    staff: 2,
    restricted: 3,
  };

  const roleAccessLevel: Record<RoleTier, number> = {
    public: 0,
    member: 1,
    staff: 2,
    admin: 3,
    ai_admin: 3,
  };

  return roleAccessLevel[userRole] >= accessHierarchy[contentAccessTier];
}

// Display names for roles
export const ROLE_DISPLAY_NAMES: Record<RoleTier, string> = {
  public: 'Public User',
  member: 'Member',
  staff: 'Staff',
  admin: 'Administrator',
  ai_admin: 'AI Administrator',
};

// Display names for media status
export const STATUS_DISPLAY_NAMES: Record<MediaStatus, string> = {
  draft: 'Draft',
  review: 'Under Review',
  published: 'Published',
  archived: 'Archived',
};
