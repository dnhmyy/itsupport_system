export type Role = 'admin' | 'technician' | 'staff';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  created_at: string;
}

export interface Asset {
  id: number;
  name: string;
  type: string;
  brand: string;
  model?: string;
  specification: string;
  warranty_start_at?: string;
  warranty_end_at?: string;
  expected_lifetime_years?: number;
  units_count?: number;
  units?: AssetUnit[];
  created_at: string;
}

export interface AssetUnit {
  id: number;
  asset_id: number;
  name?: string;
  serial_number?: string;
  specification?: string;
  status: 'available' | 'used' | 'broken' | 'repair';
  branch?: string;
  assigned_to_user_id?: number;
  received_at?: string;
  warranty_expiry?: string;
  asset?: Asset;
  assigned_user?: User;
  created_at: string;
}

export interface MonitoringHost {
  id: number;
  name: string;
  type: 'server' | 'router' | 'nvr' | 'docker' | 'other';
  ip_address: string;
  container_name?: string;
  username?: string;
  password?: string;
  status: 'up' | 'down' | 'unknown';
  last_error?: string;
  last_checked_at?: string;
  created_at: string;
}

export interface Ticket {
  id: number;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'done' | 'closed';
  progress_percentage: number;
  created_by_user_id: number;
  assigned_to_user_id?: number;
  asset_unit_id?: number;
  monitoring_host_id?: number;
  attachment_path?: string | null;
  attachment_original_name?: string | null;
  attachment_mime_type?: string | null;
  attachment_url?: string | null;
  creator?: User;
  assignee?: User;
  asset_unit?: AssetUnit;
  monitoring_host?: MonitoringHost;
  activities?: TicketActivity[];
  created_at: string;
  updated_at?: string;
}

export interface TicketActivity {
  id: number;
  ticket_id: number;
  user_id: number;
  type: 'comment' | 'status_change' | 'assignment' | 'progress_change' | 'attachment';
  activity: string;
  status_to?: string;
  progress_to?: number;
  user?: User;
  created_at: string;
}

export interface Credential {
  id: number;
  title: string;
  category: string;
  username: string;
  password?: string;
  url?: string;
  notes?: string;
  created_at: string;
}

export interface AuditLog {
  id: number;
  user_id?: number;
  action: string;
  module: string;
  description: string;
  ip_address?: string;
  user_agent?: string;
  user?: User;
  created_at: string;
}

export interface UserNotification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  read_at?: string | null;
  created_at: string;
}
