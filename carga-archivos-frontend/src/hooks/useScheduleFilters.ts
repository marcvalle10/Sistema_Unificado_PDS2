import { useHistoricalFilters } from "./useHistoricalFilters";

export const useScheduleFilters = (totalItems: number, itemsPerPage?: number) =>
  useHistoricalFilters(totalItems, itemsPerPage);