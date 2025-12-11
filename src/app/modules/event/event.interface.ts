import { EventStatus } from "@prisma/client";

export interface IEventFilter {
  search?: string;
  type?: string;
  location?: string;
  date?: string;
  minFee?: number;
  maxFee?: number;
  status?: EventStatus;
}

export interface IEventQuery extends IEventFilter {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}