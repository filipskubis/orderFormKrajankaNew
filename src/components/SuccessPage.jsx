import "../styles/success.css";
import { Link, useLocation } from "react-router-dom";
export default function SuccessPage() {
  const { state } = useLocation();
  console.log("state", state);
  return (
    <div className="bg-white grid place-content-center inset-0 w-screen h-screen">
      <div className="card md:max-w-[400px]!">
        <div className="header">
          <div className="image">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
              <g
                id="SVGRepo_tracerCarrier"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></g>
              <g id="SVGRepo_iconCarrier">
                {" "}
                <path
                  d="M20 7L9.00004 18L3.99994 13"
                  stroke="#000000"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                ></path>{" "}
              </g>
            </svg>
          </div>
          <div className="content mb-[8px] ">
            <span className="title md:text-2xl!">Dziękujemy!</span>
            <p className="message md:text-lg!">
              Zamówienie przyjęte do realizacji. Dzień przed dostawą powiadomimy
              o planowanej godzinie przyjazdu.
            </p>
          </div>
          <div className="md:text-lg relative flex flex-col gap-[16px]  items-start pt-[32px] before:absolute before:content-[''] before:w-full before:h-[2px] before:bg-[#CCCCCC] before:top-[16px]">
            <p className="font-bold self-center">Podsumowanie: </p>
            <div className="flex flex-col gap-[8px] w-full max-h-[400px] overflow-scroll no-scrollbar">
              {state.products.map(({ name, quantity, packagingMethod }) => {
                return (
                  <div key={`${name}-${quantity}`} className="font-[500]">
                    {name} - {quantity} ({packagingMethod}){" "}
                  </div>
                );
              })}
            </div>
            <p className="font-bold self-center">
              Kwota łączna: {state.sum} PLN
            </p>
          </div>
          <div className="actions"></div>
        </div>
      </div>
    </div>
  );
}
