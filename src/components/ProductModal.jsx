import { X } from "lucide-react";
import { useEffect, useState, useRef, useContext } from "react";
import { CirclePlus, CircleMinus } from "lucide-react";
import fetcher from "../helpers/fetcher";
import { AlertContext } from "../contexts/AlertContext";
// import Spinner from './Spinner';
export default function ProductModal({
  productData,
  formData,
  setProductModal,
  products,
  setProducts,
}) {
  const [quantity, setQuantity] = useState(1);
  const { addAlert } = useContext(AlertContext);
  const modalRef = useRef(null);
  const [currentProduct, setCurrentProduct] = useState("");
  const [prioritizedProducts, setPrioritizedProducts] = useState([]);
  const [productTotals, setProductTotals] = useState([]);
  const [productQuantities, setProductQuantities] = useState({});
  const [availableProducts, setAvailableProducts] = useState([]);

  const [seasonalProducts, setSeasonalProducts] = useState([]);
  const [permanentProducts, setPermanentProducts] = useState([]);

  useEffect(() => {
    if (productData && prioritizedProducts) {
      const seasonal = productData.filter(
        (product) =>
          product.seasonal &&
          !prioritizedProducts.some((p) => p.name === product.name)
      );
      setSeasonalProducts(seasonal);
      const permanent = productData.filter((product) => {
        return (
          !product.seasonal &&
          !prioritizedProducts.some((p) => p.name === product.name) &&
          !product.name.includes("rabatem")
        );
      });
      setPermanentProducts(permanent);
    }
  }, [productData, prioritizedProducts]);

  useEffect(() => {
    async function getData() {
      const [prioritizedProductsData, productTotals] = await Promise.all([
        fetcher("/products/getFavorite"),
        fetcher(`/products/getProductTotals/${formData.date}`),
      ]);

      setPrioritizedProducts(prioritizedProductsData);
      setProductTotals(productTotals);
    }
    if (formData) {
      setAvailableProducts(Object.keys(formData.stock));
      getData();
    }
  }, [formData]);

  function handleAddProduct(e, maxQuantity) {
    e.preventDefault();
    e.stopPropagation();

    const name = e.target.querySelector("#productSelect").value;
    if (name === "default") return;

    // Check if product exists in the products list if so terminate call and alert
    const isProductAlreadyAdded = products.some(
      (product) => product.name === name
    );
    if (isProductAlreadyAdded) {
      addAlert("error", "Ten produkt został już dodany do zamówienia.");
      return;
    }

    const product = productData.find((product) => product.name === name);
    const uniqueId = crypto.randomUUID();
    const productObject = {
      name,
      id: uniqueId,
      quantity: e.target.querySelector("#quantity").value,
      price: product.price,
      packagingMethod: product.packagingMethod,
      maxQuantity,
    };

    setProducts((prevProducts) => [...prevProducts, productObject]);
    setProductModal(false);
  }

  useEffect(() => {
    if (productData && productTotals.length !== 0) {
      let quantities = {};
      productData.forEach(({ name }) => {
        const onStock = formData.stock[name] ? formData.stock[name] : 0;
        const ordered = productTotals[name] ? productTotals[name] : 0;
        quantities[name] = onStock - ordered;
      });
      setProductQuantities(quantities);
    }
  }, [productTotals, productData]);

  function handleChange(e) {
    const name = e.target.value;
    if (e.target.value === "default") {
      return;
    }
    const product = productData.find((product) => product.name === name);
    setCurrentProduct(product);
  }

  useEffect(() => {
    function closeFunction(e) {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setProductModal(false);
      }
    }
    window.addEventListener("click", closeFunction);

    return () => {
      window.removeEventListener("click", closeFunction);
    };
  }, [setProductModal]);

  if (productData) {
    return (
      <div className="absolute flex inset-0 justify-center top-[30%] w-screen h-screen md:text-xl">
        <div className="fixed w-[9999px] h-[9999px] top-0 left-0 backdrop-blur-sm z-[9998]"></div>
        <form
          className="relative w-[80vw] h-[35vh] md:w-[60vw] xl:w-[50vw] bg-white shadow-xl border-[1px] border-darkcoral rounded-lg z-[9999] p-4 pt-8 flex flex-col gap-4"
          onSubmit={(e) =>
            handleAddProduct(e, productQuantities[currentProduct.name])
          }
          ref={modalRef}
        >
          <button
            className="absolute right-2 top-2"
            onClick={() => {
              setProductModal(false);
            }}
          >
            <X />
          </button>
          <div className="flex flex-col gap-2 items-center">
            <label htmlFor="productSelect" className="text-lg md:text-xl">
              Produkt:
            </label>
            <select
              name="productSelect"
              id="productSelect"
              onChange={handleChange}
              required
              className="w-full p-2 border-[1px] border-[#CCCCCC]  noScrollbar"
            >
              <option value="default"> - Wybierz z listy -</option>
              <optgroup
                label="Najczęściej zamawiane"
                className="text-[#f28a72]"
              >
                {prioritizedProducts.map((product, index) =>
                  productQuantities[product.name] > 0 ? (
                    <option
                      value={product.name}
                      key={`priority-${index}`}
                      className="text-[#303c6c] font-[600]"
                    >
                      {product.name}
                      {productQuantities[product.name] <
                      Math.min(
                        Math.ceil(formData.stock[product.name] * 0.2),
                        150
                      )
                        ? ` - zostało ${productQuantities[product.name]}${
                            product.packagingMethod === "kg" ? " kg" : ""
                          }`
                        : ""}
                    </option>
                  ) : (
                    <option
                      value={product.name}
                      key={`priority-${index}`}
                      className="text-slate font-[600]"
                      disabled
                    >
                      {product.name} - niedostępne
                    </option>
                  )
                )}
              </optgroup>
              {permanentProducts.length > 0 ? (
                <optgroup label="Stała oferta" className="text-[#f28a72]">
                  {permanentProducts.map((product, index) =>
                    productQuantities[product.name] > 0 &&
                    availableProducts.includes(product.name) ? (
                      <option
                        value={product.name}
                        key={`regular-${index}`}
                        className="text-[#303c6c] font-[600]"
                      >
                        {product.name}
                        {productQuantities[product.name] <
                        Math.min(
                          Math.ceil(formData.stock[product.name] * 0.2),
                          150
                        )
                          ? ` - zostało ${productQuantities[product.name]}${
                              product.packagingMethod === "kg" ? " kg" : ""
                            }`
                          : ""}
                        {product.packagingMethod === "kg" &&
                          product.packagingMethod}
                      </option>
                    ) : (
                      <option
                        value={product.name}
                        key={`regular-${index}`}
                        className="text-slate font-[600]"
                        disabled
                      >
                        {product.name} - niedostępne
                      </option>
                    )
                  )}
                </optgroup>
              ) : null}
              {seasonalProducts.length > 0 ? (
                <optgroup label="Sezonowe" className="text-[#f28a72]">
                  {seasonalProducts.map((product, index) =>
                    productQuantities[product.name] > 0 ? (
                      <option
                        value={product.name}
                        key={`seasonal-${index}`}
                        className="text-[#303c6c] font-[600]"
                      >
                        {product.name}
                        {productQuantities[product.name] <
                        Math.min(
                          Math.ceil(formData.stock[product.name] * 0.2),
                          150
                        )
                          ? ` - zostało ${productQuantities[product.name]}${
                              product.packagingMethod === "kg" ? " kg" : ""
                            }`
                          : ""}
                        {product.packagingMethod === "kg" &&
                          product.packagingMethod}
                      </option>
                    ) : (
                      <option
                        value={product.name}
                        key={`seasonal-${index}`}
                        className="text-slate font-[600]"
                        disabled
                      >
                        {product.name} - niedostępne
                      </option>
                    )
                  )}
                </optgroup>
              ) : null}
            </select>
          </div>
          <div className="flex flex-col gap-2 items-center">
            <label htmlFor="quantity" className="text-lg md:text-xl">
              Ilość:{" "}
              {currentProduct ? `(${currentProduct.packagingMethod})` : ""}
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={quantity}
                onChange={(e) => {
                  setQuantity(e.target.value);
                }}
                max={productQuantities[currentProduct.name]}
                step="0.01"
                required
                className="w-[100px] border-[1px] border-[#CCCCCC] p-1 text-lg"
              />
              <div className="flex gap-2 h-full justify-center self-start">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    if (quantity + 1 > productQuantities[currentProduct.name])
                      return;
                    setQuantity((current) => current + 1);
                  }}
                >
                  <CirclePlus className="w-[2rem] h-auto" />
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    if (quantity - 1 >= 0) {
                      setQuantity((current) => current - 1);
                    }
                  }}
                >
                  <CircleMinus className="w-[2rem] h-auto" />
                </button>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-full">
            <button className="w-full! flex justify-center items-center h-[50px] bg-[#f28a7280]!">
              Dodaj
            </button>
          </div>
        </form>
      </div>
    );
  }
}
