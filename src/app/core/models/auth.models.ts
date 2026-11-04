export interface LoginRequest {
  email:    string;
  password: string;
}

export interface RegisterRequest {
  full_name: string;
  email:     string;
  password:  string;
}

export interface LoginResponse {
  token:      string;
  expires_in: number;
  user: {
    user_id:   string;
    email:     string;
    full_name: string;
  };
}

export interface RegisterResponse {
  user_id:    string;
  email:      string;
  full_name:  string;
  created_at: string;
}

/** Payload del JWT — campo user_id, NO sub */
export interface JwtPayload {
  user_id: string;
  email:   string;
  iat:     number;
  exp:     number;
}

export interface PasswordRecoveryRequest {
  email: string;
}

export interface PasswordResetRequest {
  token:        string;
  new_password: string;
}
