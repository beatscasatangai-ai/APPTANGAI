import { Wallet } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import ActivityList from "../../components/ActivityList";
import { walletApi, type MemberOption, type WalletProduct } from "../../api";
import type { Activity, AppRole } from "../../types";

type DashboardProps = {
  role: AppRole;
};

export default function Dashboard({ role }: DashboardProps) {
  return role === "member" ? <MemberDashboard /> : <OperatorDashboard />;
}

function MemberDashboard() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [balance, setBalance] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void walletApi.getWalletOverview()
      .then((wallet) => {
        if (active) {
          setActivities(wallet.activities);
          setBalance(wallet.balance);
        }
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : "No se pudo cargar el monedero.");
      });
    return () => { active = false; };
  }, []);

  return (
    <>
      <div className="welcome-row">
        <h1>Mi monedero</h1>
      </div>

      {error && <p className="app-error" role="alert">{error}</p>}
      <section className="balance-card" aria-label="Saldo del monedero">
        <div className="balance-label"><Wallet size={18} /> Saldo actual</div>
        <div className="balance-main">
          <strong>{balance === null ? "…" : balance.toLocaleString("es-ES")}</strong><span>pts</span>
        </div>
      </section>
      <div className="lower-grid">
        <ActivityList activities={activities} />
      </div>
    </>
  );
}

function OperatorDashboard() {
  const [query, setQuery] = useState("");
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [memberId, setMemberId] = useState("");
  const [products, setProducts] = useState<WalletProduct[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    void walletApi.getProducts()
      .then(setProducts)
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "No se pudo cargar el catálogo."));
  }, []);

  async function searchMembers(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setMemberId("");
    setMembers([]);
    setLoadingMembers(true);
    try {
      setMembers(await walletApi.searchMembers(query));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudieron buscar socios.");
    } finally {
      setLoadingMembers(false);
    }
  }

  async function recordDonation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setBusy(true);
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try {
      const result = await walletApi.recordDonation(
        memberId,
        Number(form.get("amount")),
        String(form.get("description") ?? ""),
      );
      setNotice(`Donación registrada: ${result.pointsAwarded.toLocaleString("es-ES")} puntos. Saldo: ${result.balance.toLocaleString("es-ES")} puntos.`);
      formElement.reset();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo registrar la donación.");
    } finally {
      setBusy(false);
    }
  }

  async function redeemProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setBusy(true);
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try {
      const result = await walletApi.redeemProduct(memberId, String(form.get("product")));
      setNotice(`Canje registrado: ${result.productName} · ${result.pointsRedeemed.toLocaleString("es-ES")} puntos. Saldo: ${result.balance.toLocaleString("es-ES")} puntos.`);
      formElement.reset();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo registrar el canje.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="welcome-row"><h1>Operaciones de monedero</h1></div>
      <section className="panel wallet-tools">
        <h2>Seleccionar socio</h2>
        <form className="wallet-form member-search" onSubmit={(event) => { void searchMembers(event); }}>
          <label>Buscar por nombre
            <input
              disabled={busy}
              minLength={2}
              onChange={(event) => {
                setQuery(event.target.value);
                setMembers([]);
                setMemberId("");
                setError("");
                setNotice("");
              }}
              required
              value={query}
            />
            </label>
            <button className="primary-button" disabled={loadingMembers || busy} type="submit">
            {loadingMembers ? "Buscando…" : "Buscar"}
          </button>
        </form>
        {members.length > 0 && (
          <label className="member-select">Socio
            <select disabled={busy} onChange={(event) => setMemberId(event.target.value)} required value={memberId}>
              <option value="">Selecciona un socio</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} · {member.id.slice(0, 8)}
                </option>
              ))}
            </select>
          </label>
        )}
        {members.length === 0 && !loadingMembers && query.trim().length >= 2 && (
          <p className="empty-state">No se encontraron socios con ese nombre.</p>
        )}
      </section>

      <div className="wallet-actions">
        <section className="panel wallet-tools">
          <h2>Registrar donación</h2>
          <form className="wallet-form" onSubmit={(event) => { void recordDonation(event); }}>
            <label>Importe (€)
              <input max="9999999999.99" min="0.01" name="amount" required step="0.01" type="number" />
            </label>
            <label>Descripción (opcional)
              <input maxLength={200} name="description" />
            </label>
            <button className="primary-button" disabled={!memberId || busy} type="submit">
              Registrar donación
            </button>
          </form>
        </section>

        <section className="panel wallet-tools">
          <h2>Registrar canje</h2>
          {products.length === 0 ? (
            <p className="empty-state">No hay productos activos. Añádelos en Supabase para habilitar los canjes.</p>
          ) : (
            <form className="wallet-form" onSubmit={(event) => { void redeemProduct(event); }}>
              <label>Producto
                <select defaultValue="" name="product" required>
                  <option disabled value="">Selecciona un producto</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} · {product.points.toLocaleString("es-ES")} pts
                    </option>
                  ))}
                </select>
              </label>
              <button className="primary-button" disabled={!memberId || busy} type="submit">
                Registrar canje
              </button>
            </form>
          )}
        </section>
      </div>
      {error && <p className="app-error" role="alert">{error}</p>}
      {notice && <p className="wallet-notice" role="status">{notice}</p>}
    </>
  );
}
