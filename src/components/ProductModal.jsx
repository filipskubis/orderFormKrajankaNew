import { Check, ChevronRight, CircleMinus, CirclePlus, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import Big from "big.js";
import fetcher from "../helpers/fetcher.js";

const weight = new Intl.NumberFormat("pl-PL", { maximumFractionDigits: 2 });

export default function ProductModal({ formData, products, setProductModal, setProducts }) {
  const modalRef = useRef(null);
  const openerRef = useRef(document.activeElement);
  const [selectedId, setSelectedId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [weightDialogProduct, setWeightDialogProduct] = useState(null);
  const [catalogProducts, setCatalogProducts] = useState([]);
  const selectedProduct = formData.products.find((product) => product.id === selectedId);
  const productOptions = useMemo(() => {
    const offeredIds = new Set(formData.products.map((product) => String(product.productId || "")));
    const offeredNames = new Set(formData.products.map((product) => product.name));
    const unavailableCatalogProducts = catalogProducts
      .filter((product) => !offeredIds.has(String(product._id)) && !offeredNames.has(product.name))
      .map((product) => ({ ...product, unavailable: true }));

    return [...formData.products, ...unavailableCatalogProducts];
  }, [catalogProducts, formData.products]);

  useEffect(() => {
    const opener = openerRef.current;
    modalRef.current?.focus();
    const close = (event) => {
      if (event.key === "Escape") setProductModal(false);
    };
    window.addEventListener("keydown", close);
    return () => {
      window.removeEventListener("keydown", close);
      opener?.focus?.();
    };
  }, [setProductModal]);

  useEffect(() => {
    fetcher("/products/get").then(setCatalogProducts).catch(() => setCatalogProducts([]));
  }, []);

  const selectProduct = (event) => {
    const product = formData.products.find((candidate) => candidate.id === event.target.value);
    setSelectedId(event.target.value);
    setQuantity(1);
    if (product?.selectionMode === "weighted-items") setWeightDialogProduct(product);
  };

  const addQuantity = (event) => {
    event.preventDefault();
    if (!selectedProduct || selectedProduct.selectionMode === "weighted-items" || products.some((product) => product.formProductId === selectedProduct.id)) return;
    setProducts((current) => [...current, {
      id: selectedProduct.id,
      formProductId: selectedProduct.id,
      selectionMode: "quantity",
      name: selectedProduct.name,
      price: selectedProduct.price,
      quantity: Number(quantity),
      maxQuantity: selectedProduct.remainingQuantity,
      packagingMethod: selectedProduct.packagingMethod,
    }]);
    setProductModal(false);
  };

  const addWeighted = (product, item) => {
    if (!item.available || products.some((line) => line.weightedItemId === item.id)) return;
    setProducts((current) => [...current, {
      id: item.id,
      formProductId: product.id,
      weightedItemId: item.id,
      selectionMode: "weighted-items",
      name: product.name,
      price: product.price,
      quantity: item.weight,
      weight: item.weight,
      packagingMethod: "kg",
      lineTotal: item.totalPrice,
    }]);
    setWeightDialogProduct(null);
    setProductModal(false);
  };

  return <div className="absolute flex inset-0 justify-center top-[30%] w-screen h-screen md:text-xl">
    <button type="button" aria-label="Zamknij wybór produktów" onClick={() => setProductModal(false)} className="fixed inset-0 z-[9998] bg-black/15 backdrop-blur-md" />
    <form ref={modalRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="product-modal-title" className="relative z-[9999] flex w-[80vw] self-start flex-col gap-4 rounded-lg border-[1px] border-darkcoral bg-white p-4 pb-[66px] pt-8 shadow-xl outline-none md:w-[60vw] xl:w-[50vw]" onSubmit={addQuantity}>
      <button type="button" aria-label="Zamknij" className="absolute right-2 top-2" onClick={() => setProductModal(false)}><X /></button>
      <h2 id="product-modal-title" className="sr-only">Wybierz produkt</h2>
      <div className="flex flex-col gap-2 items-center">
        <label htmlFor="productSelect" className="text-lg md:text-xl">Produkt:</label>
        <select id="productSelect" value={selectedId} onChange={selectProduct} className="w-full p-2 font-bold border-[1px] border-[#CCCCCC]" style={{ fontWeight: 700 }}>
          <option value="">— Wybierz z listy —</option>
          {productOptions.map((product) => {
            const weighted = product.selectionMode === "weighted-items";
            const unavailable = product.unavailable || (weighted ? product.weightedItems.every((item) => !item.available) : product.remainingQuantity <= 0);
            return <option key={product.id || product._id} value={product.id || ""} disabled={unavailable || (!weighted && products.some((line) => line.formProductId === product.id))} style={{ fontWeight: 700 }}>
              {product.name} {unavailable ? "- niedostępne" : weighted ? "| wybierz sztukę" : `| ${product.price} zł`}
            </option>;
          })}
        </select>
      </div>
      {selectedProduct && selectedProduct.selectionMode !== "weighted-items" && <>
        <div className="flex flex-col gap-2 items-center">
          <label htmlFor="quantity" className="text-lg md:text-xl">Ilość: ({selectedProduct.packagingMethod})</label>
          <div className="flex gap-2">
            <input id="quantity" type="number" value={quantity} min="1" max={selectedProduct.remainingQuantity} step="1" onChange={(event) => setQuantity(Number(event.target.value))} className="w-[100px] border-[1px] border-[#CCCCCC] p-1 text-lg" />
            <div className="flex gap-2">
              <button type="button" onClick={() => setQuantity((current) => Math.min(selectedProduct.remainingQuantity, current + 1))}><CirclePlus className="w-[2rem] h-auto" /></button>
              <button type="button" onClick={() => setQuantity((current) => Math.max(1, current - 1))}><CircleMinus className="w-[2rem] h-auto" /></button>
            </div>
          </div>
        </div>
        <button
          type="submit"
          className="absolute bottom-0 left-0 h-[50px] w-full rounded-b-lg text-center"
          style={{
            alignItems: "center",
            backgroundColor: "rgb(242 138 114 / 0.5)",
            display: "flex",
            justifyContent: "center",
            width: "100%",
          }}
        >
          Dodaj
        </button>
      </>}
    </form>
    {weightDialogProduct && <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <button type="button" aria-label="Wróć do wyboru produktu" onClick={() => setWeightDialogProduct(null)} className="absolute inset-0 bg-black/20 backdrop-blur-md" />
      <section role="dialog" aria-modal="true" aria-labelledby="weight-dialog-title" className="relative w-[80vw] max-h-[70vh] overflow-y-auto rounded-lg border border-darkcoral bg-white p-4 shadow-xl md:w-[60vw] xl:w-[50vw]">
        <button type="button" aria-label="Wróć" className="absolute right-2 top-2" onClick={() => setWeightDialogProduct(null)}><X /></button>
        <h2 id="weight-dialog-title" className="mb-4 text-xl">{weightDialogProduct.name}</h2>
        <p className="mb-4 border-b border-[#CCCCCC] pb-3 text-sm opacity-75">Wybierz konkretną sztukę</p>
        <ul className="flex flex-col gap-4 pt-2">{weightDialogProduct.weightedItems.map((item) => {
          const selected = products.some((line) => line.weightedItemId === item.id);
          return <li key={item.id}><button type="button" disabled={!item.available || selected} onClick={() => addWeighted(weightDialogProduct, item)} className="weight-option"><span className="weight-option__label">{weight.format(item.weight)} kg · {Big(item.totalPrice).toFixed(2)} zł</span><span className={`weight-option__action ${item.available && !selected ? "" : "weight-option__action--muted"}`}>{selected ? <><Check aria-hidden="true" className="h-4 w-4" />Dodano</> : item.available ? <>Wybierz<ChevronRight aria-hidden="true" className="h-4 w-4" /></> : "Wyprzedane"}</span></button></li>;
        })}</ul>
      </section>
    </div>}
  </div>;
}
