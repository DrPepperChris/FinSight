export interface Account {
  id: number;
  accountNumber?: string;
  customerId?: number;
  customerName?: string;
  accountType?: string;
  availableBalance?: number;
  balance?: number;
  status?: string;
  createdDate?: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount?: number;
  totalRecords?: number;
  page?: number;
  pageNumber?: number;
  pageSize: number;
  totalPages?: number;
}