import { useContext, useState } from "react";
import { CircleMinus, CirclePlus, Trash2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import useSWR from "swr";
import Big from "big.js";
import PhoneNumberInput from "./PhoneNumberInput.jsx";
import ProductModal from "./ProductModal.jsx";
import Expired from "./Expired.jsx";
import Spinner from "./Spinner.jsx";
import fetcher from "../helpers/fetcher.js";
import { AlertContext } from "../contexts/AlertContext.jsx";

export default function Form() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addAlert } = useContext(AlertContext);
  const { data: formData, isLoading, mutate } = useSWR(id ? `/forms/public/${id}` : null, fetcher);
  const [products, setProducts] = useState([]);
  const [productModal, setProductModal] = useState(false);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const sum = products.reduce((total, product) => total.plus(product.lineTotal || Big(product.quantity).times(product.price)), Big(0)).toFixed(2);
  const removeProduct = (lineId) => setProducts((current) => current.filter((product) => product.id !== lineId));
  const changeQuantity = (lineId, delta) => setProducts((current) => current.flatMap((product) => {
    if (product.id !== lineId) return [product];
    const quantity = product.quantity + delta;
    if (quantity <= 0) return [];
    return quantity <= product.maxQuantity ? [{ ...product, quantity }] : [product];
  }));
  async function handleFormSubmit(event) {
    event.preventDefault();
    const eggs = products.find((product) => product.name?.toLowerCase().includes("jaja"));
    const eggCheck = formData.minimumEggQuantity > 0 && eggs?.quantity >= formData.minimumEggQuantity;
    if (Number(sum) < (formData.minimumOrderValue ?? 80) && !eggCheck) { addAlert("info", `Minimalna wartość zamówienia to ${formData.minimumOrderValue ?? 80} zł.`); return; }
    setSubmitting(true);
    try {
      const result = await fetcher("/orders/addPublic", "POST", { formId: id, address, phone, paymentMethod: "Za pobraniem", note: note || null, selections: products.map((product) => product.selectionMode === "weighted-items" ? { formProductId: product.formProductId, weightedItemId: product.weightedItemId } : { formProductId: product.formProductId, quantity: product.quantity }) });
      navigate(`/sukces/${id}`, { state: result });
    } catch (error) {
      if (error.code === "WEIGHTED_ITEM_UNAVAILABLE") { const unavailable = new Set(error.result?.unavailableWeightedItemIds || []); setProducts((current) => current.filter((product) => !unavailable.has(product.weightedItemId))); await mutate(); }
      addAlert("error", error.message);
    } finally { setSubmitting(false); }
  }
  if (isLoading || !id) return <Spinner />;
  if (!formData) return <Expired />;
  return <>
    {productModal && <ProductModal formData={formData} products={products} setProducts={setProducts} setProductModal={setProductModal} />}
    <form className="w-full h-full xl:h-fit bg-white xl:shadow-xl p-4 rounded-lg flex flex-col gap-8 pb-12 md:text-[2.5vh] md:justify-between xl:text-xl" onSubmit={handleFormSubmit}>
      <div className="relative flex flex-col gap-1 before:absolute before:content-[''] before:w-full before:h-[2px] before:bg-[#CCCCCC] before:-bottom-4"><p className="text-3xl md:text-[48px] xl:text-[36px]">Złóż zamówienie</p><p className="text-xl opacity-[0.8] md:text-2xl">{formData.city} {formData.date}</p></div>
      <div className="relative flex flex-col gap-2 w-full before:absolute before:content-[''] before:w-full before:h-[2px] before:bg-[#CCCCCC] before:-bottom-4"><p>Produkty:</p><button type="button" onClick={() => setProductModal(true)} className="flex ml-1 gap-2 w-fit items-center"><CirclePlus color="#f28a72" /><p className="text-coral md:text-[2.5vh] xl:text-xl">Dodaj Produkt</p></button>{products.length > 0 && <><div className="gap-4 p-1 grid grid-cols-[1.5fr_1fr_1fr_1fr] text-left"><p>Nazwa:</p><p>Cena:</p><p>Ilość:</p><p>Razem:</p></div>{products.map((product, index) => <div key={product.id} className="relative border-[1px] rounded-md p-1 gap-4 grid grid-cols-[1.5fr_1fr_1fr_1fr] items-start text-start"><p className="break-words">{index + 1}. {product.name}{product.weight ? <span className="block text-sm">{product.weight} kg</span> : null}</p><p>{product.price >= 1 ? `${product.price} zł` : `${product.price * 100} gr`}</p>{product.selectionMode === "weighted-items" ? <div className="flex flex-col gap-2 items-start"><span>1 szt.</span><button type="button" aria-label={`Usuń ${product.name}`} onClick={() => removeProduct(product.id)}><Trash2 /></button></div> : <div className="flex flex-col gap-2 items-start"><span>{product.quantity} ({product.packagingMethod})</span><div className="flex gap-2"><button type="button" onClick={() => changeQuantity(product.id, 0.5)}><CirclePlus /></button><button type="button" onClick={() => changeQuantity(product.id, -0.5)}><CircleMinus /></button></div></div>}<p>{String(product.lineTotal || Big(product.quantity).times(product.price))} zł</p></div>)}<div className="gap-4 p-1 flex w-full justify-end"><p className="border-[2px] border-slate p-1 rounded-md flex gap-2"><span>Suma:</span><span>{sum} zł</span></p></div></>}</div>
      <div className="relative flex flex-col gap-1 before:absolute before:content-[''] before:w-full before:h-[2px] before:bg-[#CCCCCC] before:-bottom-4"><label htmlFor="address">Adres:</label><input type="text" id="address" value={address} onChange={(event) => setAddress(event.target.value)} required className="p-1 rounded-lg focus:outline-none border-[1px] border-[#CCCCCC]" /></div>
      <div className="relative flex flex-col gap-1 before:absolute before:content-[''] before:w-full before:h-[2px] before:bg-[#CCCCCC] before:-bottom-4"><PhoneNumberInput value={phone} change={setPhone} /></div>
      <div className="relative flex flex-col md:text-lg gap-1 before:absolute before:content-[''] before:w-full before:h-[2px] before:bg-[#CCCCCC] before:-bottom-4"><p className="md:text-xl">Płatność:</p><div className="radio-input"><label className="label bg-[#f28a7270] rounded-xl"><input type="radio" checked readOnly name="value-radio" /><p className="text">Gotówką przy odbiorze</p></label></div></div>
      <div className="relative flex flex-col gap-1 before:absolute before:content-[''] before:w-full before:h-[2px] before:bg-[#CCCCCC] before:-bottom-4"><p>Dodatkowe informacje:</p><textarea maxLength="100" rows="1" value={note} onChange={(event) => setNote(event.target.value)} className="text-black text-lg focus:outline-none bg-transparent w-full p-2 rounded-lg text-wrap h-fit resize-none no-scrollbar border-[1px] border-[#f28a72]" /></div>
      {formData.note && <div className="relative flex opacity-[0.8] text-[#a01a1a] font-bold flex-col gap-1 before:absolute before:content-[''] before:w-full before:h-[2px] before:bg-[#CCCCCC] before:-bottom-4">{formData.note}</div>}
      <button disabled={submitting} className="text-xl! md:text-2xl! bg-[#f28a72]! p-4! shadow-md! rounded-lg min-w-[50%] self-center mt-[2rem]! tablet:text-2xl disabled:bg-[#CCCCCC]!" type="submit">{submitting ? "Składanie zamówienia…" : "Złóż zamówienie"}</button>
      <p className="-mt-5 text-center text-sm leading-5 text-[#303c6c]/80 md:text-base">Składając zamówienie, zapoznałeś/zapoznałaś się z <Link to="/polityka-prywatnosci" className="font-bold text-[#303c6c] underline decoration-[#f28a72] decoration-2 underline-offset-4 hover:text-[#f28a72] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f28a72] focus-visible:ring-offset-2">Polityką prywatności</Link>.</p>
    </form>
  </>;
}
