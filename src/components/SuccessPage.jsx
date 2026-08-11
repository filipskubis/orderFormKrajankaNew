import "../styles/success.css";
import { useLocation } from "react-router-dom";

const money = new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" });
const weight = new Intl.NumberFormat("pl-PL", { maximumFractionDigits: 2 });

export default function SuccessPage() {
  const { state } = useLocation();
  return <div className="bg-white grid place-content-center inset-0 w-screen h-screen"><div className="card md:max-w-[400px]!"><div className="header"><div className="image"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 7 9 18 4 13" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></div><div className="content mb-[8px]"><span className="title md:text-2xl!">Dziękujemy!</span><p className="message md:text-lg! text-balance">Zamówienie przyjęte do realizacji. Dzień przed dostawą powiadomimy o planowanej godzinie przyjazdu.</p></div>{state?.products && <div className="md:text-lg relative flex flex-col gap-4 items-start pt-8 before:absolute before:content-[''] before:w-full before:h-[2px] before:bg-[#CCCCCC] before:top-4"><p className="font-bold self-center">Podsumowanie</p><div className="flex flex-col gap-2 w-full max-h-[400px] overflow-y-auto">{state.products.map((product) => <div key={product.weightedItemId || product.id || `${product.name}-${product.quantity}`} className="font-medium">{product.name} — {product.weight ? `${weight.format(product.weight)} kg` : `${product.quantity} (${product.packagingMethod})`}{product.lineTotal ? ` · ${money.format(Number(product.lineTotal))}` : ""}</div>)}</div><p className="font-bold self-center">Kwota łączna: {money.format(Number(state.total))}</p></div>}</div></div></div>;
}
