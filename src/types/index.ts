export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'agent' | 'admin';
  avatar?: string;
  phone?: string;
  isBanned?: boolean;
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
  status?: 'pending' | 'approved' | 'rejected' | 'sold';
  postedBy: string | { name: string; email: string; avatar: string; role: string; phone: string };
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
  propertyTitle?: string;
}

export interface IContactMessage {
  _id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt?: string;
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
  propertiesByType?: { _id: string; count: number }[];
  recentTestimonials?: {
    _id: string;
    propertyId: string;
    propertyTitle: string;
    userName: string;
    rating: number;
    comment: string;
    createdAt: string;
  }[];
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

export interface IInquiry {
  _id: string;
  propertyId: string;
  propertyTitle: string;
  fromUserId: string;
  fromUserName: string;
  fromUserEmail: string;
  toUserId: string;
  message: string;
  replies: IInquiryReply[];
  status: 'pending' | 'replied';
  createdAt: string;
  toAgent?: { name: string; avatar: string };
}

export interface IInquiryReply {
  message: string;
  repliedBy: string;
  repliedByName: string;
  repliedByRole?: string;
  createdAt: string;
}

export interface IVisit {
  _id: string;
  propertyId: string;
  propertyTitle: string;
  propertyImage: string;
  visitorId: string;
  visitorName: string;
  visitorEmail: string;
  visitorPhone: string;
  ownerId: string;
  preferredDate: string;
  preferredTime: string | null;
  message: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  owner?: { name: string; avatar: string; phone: string };
  visitor?: { name: string; avatar: string; email: string };
}

export interface IPayment {
  _id: string;
  userId: string;
  propertyId: string;
  dealId?: string;
  stripePaymentId: string;
  amount: number;
  currency: string;
  paymentType?: string;
  status: string;
  userName?: string;
  propertyTitle?: string;
  createdAt: string;
}

export interface IAdminStats {
  totalUsers: number;
  totalAgents: number;
  totalProperties: number;
  totalReviews: number;
  totalPayments: number;
  totalInquiries: number;
  pendingProperties: number;
  totalRevenue: number;
  usersByRole: { _id: string; count: number }[];
  propertiesByType: { _id: string; count: number }[];
  recentUsers: IUser[];
  recentProperties: IProperty[];
  monthlyUsers: { month: string; count: number }[];
  monthlyProperties: { month: string; count: number }[];
  recentInquiries: IAdminInquiry[];
  totalDeals: number;
  activeDeals: number;
}

export interface IAdminInquiry {
  _id: string;
  propertyId: string;
  propertyTitle: string;
  fromUserId: string;
  fromUserName: string;
  fromUserEmail: string;
  toUserId: string;
  toAgentName: string;
  message: string;
  replies: { message: string; repliedBy: string; repliedByName: string; createdAt: string }[];
  status: string;
  createdAt: string;
}

// ─── Deals / Buying System ───

export type DealStatus = 'pending' | 'countered' | 'accepted' | 'payment_pending' | 'payment_verified' | 'completed' | 'rejected';
export type FinancingMethod = 'cash' | 'bank_transfer' | 'loan' | 'mortgage';

export interface IDealHistoryEntry {
  action: 'offer_made' | 'countered' | 'accepted' | 'rejected' | 'payment_submitted' | 'payment_verified' | 'completed' | 'withdrawn';
  amount?: number;
  message: string;
  byUserId: string;
  byUserName: string;
  byRole: string;
  createdAt: string;
}

export interface IDeal {
  _id: string;
  propertyId: string;
  propertyTitle: string;
  propertyImage: string;
  propertyPrice: number;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  agentId: string;
  agentName: string;
  offerAmount: number;
  finalAmount: number;
  message: string;
  financingMethod: FinancingMethod;
  status: DealStatus;
  paymentMethod?: string;
  paymentNote?: string;
  // Stripe payment fields
  stripePaymentId?: string;
  stripePaymentStatus?: string | null;
  earnestMoneyBDT?: number;
  earnestMoneyUSD?: string;
  history: IDealHistoryEntry[];
  createdAt: string;
  updatedAt: string;
  // Populated fields
  agent?: { name: string; avatar: string };
  buyer?: { name: string; email: string; avatar: string };
  property?: { title: string; images: string[] };
}

/** Admin-specific deal alias (flat, no populated sub-objects expected) */
export type IAdminDeal = IDeal;