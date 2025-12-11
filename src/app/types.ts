export interface UserType {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "guest";
  createdAt: string;
  updatedAt?: string;
}

export interface AuthResponseType {
  user: {
    uid: string;
    email: string | null;
  };
}

export interface CategoryType {
  id: string;
  name: string;
  order: number;
  iconName?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CardType {
  id: string;
  categoryId: string;
  title: string;
  actionLabel: string;
  actionUrl?: string;
  internalPage?: boolean;
  order: number;
  createdAt: string;
}
