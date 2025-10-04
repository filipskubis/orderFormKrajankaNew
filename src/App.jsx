import Alerts from "./components/Alerts";
import Form from "./components/Form";
import AlertProvider from "./contexts/AlertContextProvider";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import SuccessPage from "./components/SuccessPage.jsx";
import UndefinedPage from "./components/UndefinedPage.jsx";
import ErrorPage from "./components/ErrorPage.jsx";
import Layout from "./components/Layout.jsx";
import Expired from "./components/Expired.jsx";
const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: ":id", element: <Form /> },
      { path: "/", element: <UndefinedPage /> },
    ],
    errorElement: <ErrorPage />,
  },
  { path: "*", element: <UndefinedPage /> },
  { path: "/wyczerpane", element: <Expired /> },
  {
    path: "/sukces/:id",
    element: <SuccessPage />,
  },
]);

function App() {
  return (
    <AlertProvider>
      <Alerts />
      <RouterProvider router={router} />
    </AlertProvider>
  );
}

export default App;
