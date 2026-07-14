export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'agent';
  avatar?: string;
  phone?: string;
  createdAt: string;
}

export interface IProperty {
  _id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  propertyType: 'apartment' | 'villa' | 'commercial' | 'land';
  price: number;
  priceType: 'monthly' | 'total';
  location: { city: string; area: string };
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  amenities: string[];
  images: string[];
  rating: number;
  reviewCount: number;
  views: number;
  isFeatured: boolean;
  postedBy: string;
  createdAt: string;
}

export interface IReview {
  _id: string;
  propertyId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface IContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface IAuthResponse {
  user: Omit<IUser, 'password'>;
  token: string;
}

export interface IPaginatedResponse<T> {
  success: boolean;
  data: {
    properties: T[];
    total: number;
    page: number;
    totalPages: number;
  };
}

export interface IStats {
  totalProperties: number;
  totalUsers: number;
  totalReviews: number;
  totalCities: number;
}

export interface IFilterParams {
  search?: string;
  type?: string;
  minPrice?: string;
  maxPrice?: string;
  bedrooms?: string;
  minRating?: string;
  city?: string;
  sortBy?: string;
  page?: string;
  limit?: string;
}