/** Perfil completo del usuario — campo phone_number, NO phone; sin updated_at */
export interface UserProfile {
  user_id:       string;
  email:         string;
  full_name:     string;
  phone_number:  string | null;
  date_of_birth: string | null;
  created_at:    string;
}

/** Campos editables — phone_number, NO phone */
export interface UpdateProfileRequest {
  full_name?:    string;
  phone_number?: string;
  date_of_birth?: string;
}

/** Usuario del dashboard — distinto de UserProfile, incluye account_status */
export interface DashboardUser {
  user_id:        string;
  email:          string;
  full_name:      string;
  account_status: 'active' | 'locked' | 'disabled';
}
