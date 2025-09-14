import { NoticeStatus } from "@/auth/roles";

export interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
}

export interface Notice {
  _id: string;
  title: string;
  category: string;
  fileUrl?: string;
  createdAt: string;
  status: NoticeStatus;
  createdBy: User | string;
  approvedBy?: User | string | null;
  approvedAt?: string | null;
  rejectionReason?: string | null;
}
