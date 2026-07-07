import { apiClient } from "@/lib/api-client";
import { getToken } from "@/lib/auth";
import type {
  DailyCashDenomination,
  DailyCashDenominationFormValues,
  DailyCashDenominationListResponse,
  DailyCashDenominationSearchFilters,
} from "@/features/daily-cash-denominations/types";

interface DailyCashDenominationResponse {
  denomination: DailyCashDenomination;
}

function buildSearchParams(filters: DailyCashDenominationSearchFilters): string {
  const params = new URLSearchParams();

  if (filters.page !== undefined) {
    params.set("page", String(filters.page));
  }

  if (filters.limit !== undefined) {
    params.set("limit", String(filters.limit));
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

function toCount(value: string): number {
  const normalized = value.trim();
  return normalized ? Number(normalized) : 0;
}

export async function createDailyCashDenomination(
  values: DailyCashDenominationFormValues
): Promise<DailyCashDenomination> {
  const response = await apiClient<DailyCashDenominationResponse>(
    "/api/daily-cash-denominations",
    {
      method: "POST",
      token: getToken(),
      body: {
        denominationDate: values.denominationDate,
        thousandCount: toCount(values.thousandCount),
        fiveHundredCount: toCount(values.fiveHundredCount),
        oneHundredCount: toCount(values.oneHundredCount),
        fiftyCount: toCount(values.fiftyCount),
        twentyCount: toCount(values.twentyCount),
        tenCount: toCount(values.tenCount),
        fiveCount: toCount(values.fiveCount),
        twoCount: toCount(values.twoCount),
        oneCount: toCount(values.oneCount),
        coin10Count: toCount(values.coin10Count),
        coin5Count: toCount(values.coin5Count),
        coin2Count: toCount(values.coin2Count),
        coin1Count: toCount(values.coin1Count),
        notes: values.notes.trim() || undefined,
      },
    }
  );

  return response.denomination;
}

export async function fetchDailyCashDenominations(
  filters: DailyCashDenominationSearchFilters = {}
): Promise<DailyCashDenominationListResponse> {
  return apiClient<DailyCashDenominationListResponse>(
    `/api/daily-cash-denominations${buildSearchParams(filters)}`,
    { token: getToken() }
  );
}
