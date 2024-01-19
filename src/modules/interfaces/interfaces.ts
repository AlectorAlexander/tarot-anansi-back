export interface validateToken {
  isValid: boolean;
  user?: {
    name: string;
    email: string;
    id: string;
    photo: string;
    isAdmin: boolean;
  };
}
