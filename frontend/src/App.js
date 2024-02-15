import logo from "./logo.svg";
import "./App.css";
import { ToastContainer } from "react-toastify";
import { Route, Switch } from "react-router-dom";
import ProductForm from "./pages/addProduct";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter } from "react-router-dom/cjs/react-router-dom.min";
import ProductsPage from "./pages/productsAvailabe";

function App() {
  return (
    <div className="app">
      <ToastContainer />
      <BrowserRouter>
        <div className="content">
          {" "}
          <Switch>
            <Route exact path="/add_product" component={ProductForm} />
            <Route exact path="/products" component={ProductsPage} />
          </Switch>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
