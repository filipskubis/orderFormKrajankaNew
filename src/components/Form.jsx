/* eslint-disable no-unused-vars */
import { useContext, useEffect, useRef, useState } from "react";
import { CircleMinus, CirclePlus } from "lucide-react";
import PhoneNumberInput from "./PhoneNumberInput.jsx";
import fetcher from "../helpers/fetcher.js";
import useSWR from "swr";
import ProductModal from "./ProductModal.jsx";
import Expired from "./Expired.jsx";
import Big from "big.js";
import Spinner from "./Spinner.jsx";
import HoldButton from "./HoldButton.jsx";
import { AlertContext } from "../contexts/AlertContext.jsx";
import { Link, useNavigate, useParams } from "react-router-dom";
Big.DP = 2;
Big.RM = Big.roundHalfUp;

export default function Form() {
  const { id } = useParams();
  const { data: formData, isLoading } = useSWR(
    id ? `/forms/get/${id}` : null,
    fetcher,
  );
  const { data: productData } = useSWR("/products/get", fetcher);
  const [products, setProducts] = useState([]);
  const [productModal, setProductModal] = useState(false);
  const [payment, setPayment] = useState("Za pobraniem");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const navigate = useNavigate();

  const { addAlert } = useContext(AlertContext);

  const textarea = useRef(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (textarea.current) {
      textarea.current.addEventListener("input", function () {
        this.style.height = "auto";
        this.style.height = this.scrollHeight + "px";
      });
    }
  }, [textarea]);

  const handleTextareaChange = (e) => {
    setNote(e.target.value);
  };

  async function handleFormSubmit(e) {
    e.preventDefault();
    const sum = products
      .reduce(
        (acc, product) => acc.plus(Big(product.quantity).times(product.price)),
        Big(0),
      )
      .toFixed(2);

    let eggCheck = false;
    const minValue = formData.minimumOrderValue ?? 80;
    const minEggs = formData.minimumEggQuantity ?? 0;

    if (minEggs > 0) {
      products.forEach((p) => {
        if (p.name.toLowerCase().includes("jaja") && p.quantity >= minEggs) {
          eggCheck = true;
        }
      });
    }

    if (sum < minValue && !eggCheck) {
      const eggMsg = minEggs > 0 ? ` lub ${minEggs} jajek` : "";
      addAlert(
        "info",
        `Minimalna wartość zamówienia to ${minValue}zł${eggMsg}.`,
      );
      return;
    }
    const productsNoTotal = products.map(({ total, ...rest }) => rest);

    const body = {
      address,
      phone,
      paymentMethod: payment,
      products: productsNoTotal,
      note: note || null,
      date: formData.date,
      time: null,
    };

    try {
      await fetcher("/orders/addPublic", "POST", body);
      navigate(`/sukces/${id}`, {
        state: { products: productsNoTotal, sum: sum },
      });
    } catch (err) {
      addAlert("error", err);
    }
  }

  function handleAdd(id, maxQuantity) {
    const newProducts = products.map((product) => {
      console.log(typeof product.quantity);
      if (product.id === id && product.quantity + 1 <= maxQuantity) {
        product.quantity++;
      }
      return product;
    });
    setProducts(newProducts);
  }
  function removeProduct(id) {
    const newProducts = products.filter((product) => product.id != id);
    setProducts(newProducts);
  }
  function handleSubtract(id) {
    const productToSubtract = products.find((product) => product.id === id);

    if (!productToSubtract) return;

    if (productToSubtract.quantity - 1 <= 0) {
      removeProduct(id);
    } else {
      const newProducts = products.map((product) => {
        if (product.id === id) {
          return { ...product, quantity: product.quantity - 1 };
        }
        return product;
      });
      setProducts(newProducts);
    }
  }
  if (isLoading || !id) return <Spinner />;
  if (!formData) {
    return navigate("/wyczerpane");
  }
  if (formData) {
    return (
      <>
        {productModal ? (
          <ProductModal
            productData={productData}
            formData={formData}
            setProductModal={setProductModal}
            setProducts={setProducts}
            products={products}
          />
        ) : null}
        <form
          className="w-full h-full xl:h-fit bg-white xl:shadow-xl p-4 rounded-lg flex flex-col gap-8 pb-12 md:text-[2.5vh] md:justify-between xl:text-xl"
          onSubmit={handleFormSubmit}
        >
          <div className="relative flex flex-col gap-1 before:absolute before:content-[''] before:w-full before:h-[2px] before:bg-[#CCCCCC] before:-bottom-4">
            <p className="text-3xl md:text-[48px] xl:text-[36px]">
              {" "}
              Złóż zamówienie
            </p>
            <p className="text-xl opacity-[0.8] md:text-2xl">
              {" "}
              {formData.city} {formData.date}
            </p>
          </div>
          <div className="relative flex flex-col gap-2 w-full before:absolute before:content-[''] before:w-full before:h-[2px] before:bg-[#CCCCCC] before:-bottom-4">
            <p> Produkty: </p>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setProductModal(true);
              }}
              className="flex ml-1 gap-2 w-fit items-center"
            >
              <CirclePlus color="#f28a72" />
              <p className="text-coral md:text-[2.5vh] xl:text-xl">
                {" "}
                Dodaj Produkt
              </p>
            </button>
            {products.length > 0 ? (
              <div className="gap-4 p-1 grid grid-cols-[1.5fr_1fr_1fr_1fr] text-left">
                <p className="col-span-1">Nazwa:</p>
                <p>Cena:</p>
                <p>Ilość:</p>
                <p>Razem:</p>
              </div>
            ) : null}

            {products.map(
              (
                { id, name, price, quantity, packagingMethod, maxQuantity },
                index,
              ) => (
                <div
                  key={id}
                  className="relative border-[1px] rounded-md p-1 gap-4 grid grid-cols-[1.5fr_1fr_1fr_1fr] items-start text-start"
                >
                  <p className="break-words">{`${index + 1}. ${name}`}</p>
                  <p>{price >= 1 ? `${price} zł` : `${price * 100} gr`}</p>
                  <div className="flex flex-col gap-2 items-start">
                    {quantity} ({packagingMethod})
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleAdd(id, maxQuantity);
                        }}
                      >
                        <CirclePlus className="md:w-[28px] md:h-auto" />
                      </button>
                      <HoldButton
                        click={() => {
                          handleSubtract(id);
                        }}
                        hold={() => {
                          removeProduct(id);
                        }}
                      >
                        <CircleMinus className="md:w-[28px] md:h-auto" />
                      </HoldButton>
                    </div>
                  </div>
                  <p>{`${String(Big(quantity).times(price))} zł`}</p>
                </div>
              ),
            )}

            {products.length > 0 ? (
              <div className="gap-4 p-1 flex w-full justify-end">
                <p className="border-[2px] border-slate p-1 rounded-md flex gap-2 ">
                  <p> Suma: </p>
                  <p>
                    {String(
                      products
                        .reduce(
                          (acc, product) =>
                            acc.plus(
                              Big(product.quantity).times(product.price),
                            ),
                          Big(0),
                        )
                        .toFixed(2), // Round the final result to 2 decimal places
                    )}{" "}
                    zł
                  </p>
                </p>
              </div>
            ) : null}
          </div>
          <div className="relative flex flex-col gap-1 before:absolute before:content-[''] before:w-full before:h-[2px] before:bg-[#CCCCCC] before:-bottom-4">
            <label htmlFor="address"> Adres: </label>
            <input
              type="text"
              id="address"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
              }}
              required
              className="p-1 rounded-lg focus:outline-none border-[1px] border-[#CCCCCC]"
            />
          </div>
          <div className="relative flex flex-col gap-1 before:absolute before:content-[''] before:w-full before:h-[2px] before:bg-[#CCCCCC] before:-bottom-4">
            <PhoneNumberInput
              value={phone}
              change={(value) => {
                setPhone(value);
              }}
            />
          </div>
          <div className="relative flex flex-col md:text-lg gap-1 before:absolute before:content-[''] before:w-full before:h-[2px] before:bg-[#CCCCCC] before:-bottom-4">
            <p className="md:text-xl"> Płatność: </p>
            <div className="radio-input ">
              <label className="label checked:border-[1px] checked:border-[#f28a72] bg-[#f28a7270] rounded-xl">
                <input
                  type="radio"
                  id="value-2"
                  checked={payment === "Za pobraniem"}
                  name="value-radio"
                  value="Za pobraniem"
                />
                <p className="text ">Za pobraniem gotówką</p>
              </label>
            </div>
          </div>
          <div className="relative flex flex-col gap-1 before:absolute before:content-[''] before:w-full before:h-[2px] before:bg-[#CCCCCC] before:-bottom-4 ">
            <p>Dodatkowe informacje: </p>
            <textarea
              maxLength="100"
              rows="1"
              value={note}
              onChange={handleTextareaChange}
              ref={textarea}
              className="text-black text-lg focus:outline-none bg-transparent w-full p-2 rounded-lg text-wrap h-fit resize-none no-scrollbar border-[1px] border-[#f28a72]"
            />
          </div>

          {formData.note ? (
            <div className="relative flex opacity-[0.8] text-[#a01a1a] font-bold flex-col gap-1 before:absolute before:content-[''] before:w-full before:h-[2px] before:bg-[#CCCCCC] before:-bottom-4">
              {" "}
              {formData.note}{" "}
            </div>
          ) : null}

          <button
            className="text-xl! md:text-2xl! bg-[#f28a72]! p-4! shadow-md! rounded-lg min-w-[50%] self-center mt-[2rem]! tablet:text-2xl"
            type="submit"
          >
            Złóż zamówienie
          </button>
          <p className="-mt-5 text-center text-sm leading-5 text-[#303c6c]/80 md:text-base">
            Składając zamówienie, zapoznałeś/zapoznałaś się z{" "}
            <Link
              to="/polityka-prywatnosci"
              className="font-bold text-[#303c6c] underline decoration-[#f28a72] decoration-2 underline-offset-4 hover:text-[#f28a72] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f28a72] focus-visible:ring-offset-2"
            >
              Polityką prywatności
            </Link>
            .
          </p>
        </form>
      </>
    );
  }
}
