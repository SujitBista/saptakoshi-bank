import { query } from "../config/database";

interface NowRow {
  now: Date;
}

export async function getDatabaseTimestamp(): Promise<Date> {
  const rows = await query<NowRow>("SELECT NOW()");
  return rows[0].now;
}
