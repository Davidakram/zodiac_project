import "./App.css";
import { ToastContainer } from "react-toastify";
import { Route, Switch } from "react-router-dom";
import ProductForm from "./pages/addProduct";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter } from "react-router-dom/cjs/react-router-dom.min";
import ProductsPage from "./pages/productsAvailabe";
import SellingPage from "./pages/sellingPage";
import NavBar from "./components/navbar";
import GetSales from "./pages/getSales";
import LoginPage from "./pages/login";
import PrivateRoute from "./components/routes";
import { UserProvider } from "./components/context";
import Inventory from "./pages/inventory";
import PrivateRouteWithUserCheck from "./components/routes/administrator";

function App() {
  return (
    <div className="app">
      <ToastContainer />
      <UserProvider>
        <BrowserRouter>
          <div className="content">
            {" "}
            <NavBar />
            <Switch>
              <PrivateRouteWithUserCheck
                exact
                path="/add_product"
                component={ProductForm}
              />
              <PrivateRouteWithUserCheck
                exact
                path="/products"
                component={ProductsPage}
              />
              <PrivateRoute exact path="/" component={SellingPage} />
              <PrivateRouteWithUserCheck
                exact
                path="/getsales"
                component={GetSales}
              />
              <PrivateRouteWithUserCheck
                exact
                path="/inventory"
                component={Inventory}
              />

              <Route exact path="/login" component={LoginPage} />
            </Switch>
          </div>
        </BrowserRouter>
      </UserProvider>
    </div>
  );
}

export default App;
