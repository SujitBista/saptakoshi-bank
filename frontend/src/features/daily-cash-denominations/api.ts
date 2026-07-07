import { apiClient } from "@/lib/api-client";
import { getToken } from "@/lib/auth";
import type {
  DailyCashDenomination,
  DailyCashDenominationFormValues,
} from "@/features/daily-cash-denominations/types";

interface DailyCashDenominationResponse {
  denomination: DailyCashDenomination;
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
