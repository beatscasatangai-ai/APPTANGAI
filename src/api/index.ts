/**
 * Frontend data seam. Switch this export from mockClient to the live Supabase
 * client during backend integration; components should use this module only.
 */
export { mockClient as walletApi } from "./mockClient";
