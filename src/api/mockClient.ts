import { demoActivities } from "../data/demo";
import type { Activity } from "../types";

/**
 * Temporary, non-persistent data source for the scaffold preview.
 * Replace this client when Supabase tables and server operations are ready.
 */
export const mockClient = {
  async getRecentActivities(): Promise<Activity[]> {
    return demoActivities;
  },
};
