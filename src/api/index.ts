import type { Activity } from "../types";
import { supabase } from "../lib/supabase";

export type MemberOption = { id: string; name: string };
export type WalletProduct = { id: string; name: string; points: number };

function client() {
  if (!supabase) throw new Error("Supabase no está configurado.");
  return supabase;
}

function points(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 0) {
    throw new Error("El servidor devolvió un saldo de puntos no válido.");
  }
  return parsed;
}

function signedPoints(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed)) {
    throw new Error("El servidor devolvió un movimiento de puntos no válido.");
  }
  return parsed;
}

export const walletApi = {
  async getWalletOverview(): Promise<{ balance: number; activities: Activity[] }> {
    const db = client();
    const [{ data: balance, error: balanceError }, { data, error }] = await Promise.all([
      db.rpc("get_wallet_balance", { p_member_id: null }),
      db.from("wallet_transactions")
        .select("id, kind, points, amount_eur, description, created_at")
        .order("created_at", { ascending: false })
        .limit(10),
    ]);
    if (balanceError) throw balanceError;
    if (error) throw error;

    const activities = (data ?? []).map((transaction) => {
      if (transaction.kind !== "donation" && transaction.kind !== "redemption") {
        throw new Error("El servidor devolvió una operación de monedero no válida.");
      }
      const donation = transaction.kind === "donation";
      const amount = Number(transaction.amount_eur);
      return {
        id: transaction.id,
        title: donation ? "Donación acreditada" : "Producto canjeado",
        detail: donation
          ? `Donación · ${new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(amount)}`
          : transaction.description ?? "Canje",
        date: new Date(transaction.created_at).toLocaleString("es-ES", {
          dateStyle: "medium",
          timeStyle: "short",
        }),
        points: signedPoints(transaction.points),
        kind: donation ? "donation" as const : "redeem" as const,
      };
    });

    return { balance: points(balance), activities };
  },

  async searchMembers(query: string): Promise<MemberOption[]> {
    const { data, error } = await client().rpc("search_approved_members", {
      p_query: query.trim(),
    });
    if (error) throw error;
    return (data ?? []).map((member: { member_id: string; full_name: string }) => ({
      id: member.member_id,
      name: member.full_name,
    }));
  },

  async getProducts(): Promise<WalletProduct[]> {
    const { data, error } = await client()
      .from("wallet_products")
      .select("id, name, points")
      .eq("active", true)
      .order("name");
    if (error) throw error;
    return (data ?? []).map((product) => ({
      id: product.id,
      name: product.name,
      points: points(product.points),
    }));
  },

  async recordDonation(memberId: string, amount: number, description: string) {
    const { data, error } = await client().rpc("record_donation", {
      p_member_id: memberId,
      p_amount_eur: amount,
      p_description: description.trim() || null,
    });
    if (error) throw error;
    const result = data?.[0];
    if (!result) throw new Error("No se recibió la confirmación de la donación.");
    return {
      pointsAwarded: points(result.points_awarded),
      balance: points(result.current_balance),
    };
  },

  async redeemProduct(memberId: string, productId: string) {
    const { data, error } = await client().rpc("redeem_product", {
      p_member_id: memberId,
      p_product_id: productId,
    });
    if (error) throw error;
    const result = data?.[0];
    if (!result) throw new Error("No se recibió la confirmación del canje.");
    return {
      productName: result.product_name,
      pointsRedeemed: points(result.points_redeemed),
      balance: points(result.current_balance),
    };
  },
};
