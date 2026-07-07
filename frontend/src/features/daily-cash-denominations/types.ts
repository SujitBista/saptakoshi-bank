export const DENOMINATION_ROWS = [
  { key: "thousandCount", label: "1000", value: 1000 },
  { key: "fiveHundredCount", label: "500", value: 500 },
  { key: "oneHundredCount", label: "100", value: 100 },
  { key: "fiftyCount", label: "50", value: 50 },
  { key: "twentyCount", label: "20", value: 20 },
  { key: "tenCount", label: "10", value: 10 },
  { key: "fiveCount", label: "5", value: 5 },
  { key: "twoCount", label: "2", value: 2 },
  { key: "oneCount", label: "1", value: 1 },
  { key: "coin10Count", label: "Coin 10", value: 10 },
  { key: "coin5Count", label: "Coin 5", value: 5 },
  { key: "coin2Count", label: "Coin 2", value: 2 },
  { key: "coin1Count", label: "Coin 1", value: 1 },
] as const;

export type DenominationCountField = (typeof DENOMINATION_ROWS)[number]["key"];

export interface DailyCashDenominationFormValues {
  denominationDate: string;
  thousandCount: string;
  fiveHundredCount: string;
  oneHundredCount: string;
  fiftyCount: string;
  twentyCount: string;
  tenCount: string;
  fiveCount: string;
  twoCount: string;
  oneCount: string;
  coin10Count: string;
  coin5Count: string;
  coin2Count: string;
  coin1Count: string;
  notes: string;
}

export interface DailyCashDenomination {
  id: number;
  branchId: number;
  tellerId: number;
  denominationDate: string;
  thousandCount: number;
  fiveHundredCount: number;
  oneHundredCount: number;
  fiftyCount: number;
  twentyCount: number;
  tenCount: number;
  fiveCount: number;
  twoCount: number;
  oneCount: number;
  coin10Count: number;
  coin5Count: number;
  coin2Count: number;
  coin1Count: number;
  totalAmount: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DailyCashDenominationListItem {
  id: number;
  denomination_date: string;
  branch_name: string;
  teller_name: string;
  total_amount: number;
  created_at: string;
}

export interface DailyCashDenominationListResponse {
  data: DailyCashDenominationListItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const DEFAULT_DAILY_CASH_DENOMINATION_PAGE = 1;
export const DEFAULT_DAILY_CASH_DENOMINATION_PAGE_SIZE = 10;
export const DAILY_CASH_DENOMINATION_PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

export interface DailyCashDenominationSearchFilters {
  page?: number;
  limit?: number;
}
