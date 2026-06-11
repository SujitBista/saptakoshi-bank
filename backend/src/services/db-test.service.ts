import * as dbTestRepository from "../repositories/db-test.repository";

export async function getDatabaseTimestamp(): Promise<Date> {
  return dbTestRepository.getDatabaseTimestamp();
}
