import logo from "./logo.svg";
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

function App() {
  return (
    <div className="app">
      <ToastContainer />
      <BrowserRouter>
        <div className="content">
          {" "}
          <NavBar />
          <Switch>
            <Route exact path="/add_product" component={ProductForm} />
            <Route exact path="/products" component={ProductsPage} />
            <Route exact path="/" component={SellingPage} />
            <Route exact path="/getsales" component={GetSales} />
          </Switch>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
