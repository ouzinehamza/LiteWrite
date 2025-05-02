interface ApiUser {
  id: number;
  name: string;
  avatar: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  has_active_subscription: boolean;
}

export default ApiUser;
