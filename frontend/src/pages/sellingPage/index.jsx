import React, { useState, useEffect } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import axios from "axios";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { toast } from "react-toastify";

const SellingPage = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showSellModal, setShowSellModal] = useState(false);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSalesTable, setShowSalesTable] = useState(false);
  const [searchCriteria, setSearchCriteria] = useState({
    product_type: "",
    product_name: "",
    product_size: "",
    nicotine_percentage: "",
    mtl_or_dl: "",
  });

  const fetchData = async (searchCriteria) => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/api/productsearch",
        searchCriteria
      );
      setProducts(
        response.data.products.map((product) => ({
          ...product,
          id: product.id,
        }))
      );
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };
  // Function to fetch sales for the current day
  const fetchSalesForToday = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:5000/api/sales");
      console.log(response);
      setSales(
        response.data.sales.map((sales) => ({
          ...sales,
          id: sales.sale_id,
        }))
      );
    } catch (error) {
      console.error("Failed to fetch today's sales:", error);
      setSales([]);
    }
  };
  useEffect(() => {
    fetchSalesForToday();
  }, [loading]);

  const Salescolumns = [
    { field: "sale_id", headerName: "Sale ID", flex: 0.5 },
    { field: "product_name", headerName: "Product Name", flex: 1 },
    { field: "quantity_sold", headerName: "Quantity Sold", flex: 0.5 },
    { field: "total_price", headerName: "Total Price", flex: 0.5 },
  ];
  // Function to handle selling a product
  const handleSellProduct = (product) => {
    setSelectedProduct(product);
    setShowSellModal(true);
  };

  // ////////////////////////////////////////////Function to confirm selling a product
  const confirmSellProduct = async () => {
    console.log("Selling product:", selectedProduct);
    setLoading(true);
    try {
      const response = await axios.post(
        `http://127.0.0.1:5000/api/selling/${selectedProduct}`
      );
      toast.success("Product Sold successfully");
      fetchData(searchCriteria);
    } catch (error) {
      toast.error("Error Selling this product");
      console.log(error);
    } finally {
      setLoading(false);
    }
    setShowSellModal(false);
  };

  const calculateTotalMoney = (sales) => {
    let totalMoney = 0;
    sales.forEach((sale) => {
      totalMoney += sale.total_price;
    });
    return totalMoney.toFixed(2); // toFixed(2) is used to display the total with 2 decimal places
  };

  // Function to toggle showing/hiding the sales table
  const toggleSalesTable = () => {
    setShowSalesTable(!showSalesTable);
    if (!showSalesTable) {
      fetchSalesForToday(); // Fetch sales when showing the table
    }
  };

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchCriteria((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    console.log(value);
  };
  // useEffect to fetch products when component mounts
  useEffect(() => {
    fetchData(searchCriteria);
  }, [searchCriteria]);
  const generateSelectOptions = (values) => {
    return values.map((value, index) => (
      <MenuItem key={index} value={value}>
        {value}
      </MenuItem>
    ));
  };

  // Define columns for products table
  const columns = [
    { field: "product_name", headerName: "Name", flex: 0.5 },
    { field: "product_type", headerName: "Type", flex: 0.5 },
    { field: "mtl_or_dl", headerName: "Mtl&Dl", flex: 0.5 },

    { field: "product_size", headerName: "Size", flex: 0.5 },
    {
      field: "nicotine_percentage",
      headerName: "Nicotine %",
      flex: 0.5,
    },

    {
      field: "selling_price",
      headerName: "Selling Price",
      flex: 0.5,
    },
    {
      field: "total_count",
      headerName: "Total Count",
      flex: 0.5,
    },
    {
      field: "action",
      headerName: "Action",
      flex: 0.5,
      renderCell: (params) => (
        <button
          type="button"
          className="btn btn-outline-success"
          onClick={() => handleSellProduct(params.row.id)}
          disabled={params.row.total_count === 0}
        >
          Sell
        </button>
      ),
    },
  ];

  return (
    <div className="container mt-5 border rounded p-3">
      <Box
        sx={{
          marginBottom: 5,
          display: "flex",
          justifyContent: "space-around",
        }}
      >
        <TextField
          label="Product Name"
          variant="outlined"
          name="product_name"
          value={searchCriteria.product_name}
          onChange={handleSearchChange}
          sx={{}}
        />
        <FormControl variant="outlined" sx={{ minWidth: 120 }}>
          <InputLabel>Product Type</InputLabel>
          <Select
            value={searchCriteria.product_type}
            onChange={handleSearchChange}
            label="Product Type"
            name="product_type"
          >
            <MenuItem value="">All</MenuItem>
            {generateSelectOptions([
              "Liquid",
              "Tank",
              "Pod",
              "Mod",
              "Battery",
              "Disposable",
              "Charger",
              "Coil",
              "Cotton",
            ])}
          </Select>
        </FormControl>
        <FormControl variant="outlined" sx={{ minWidth: 120 }}>
          <InputLabel>Product Size</InputLabel>
          <Select
            value={searchCriteria.product_size}
            onChange={handleSearchChange}
            label="Product Size"
            name="product_size"
          >
            <MenuItem value="">All</MenuItem>
            {generateSelectOptions(["30 ml", "60 ml", "100 ml", "150 ml"])}
          </Select>
        </FormControl>
        <FormControl variant="outlined" sx={{ minWidth: 120 }}>
          <InputLabel>Nicotine Percentage</InputLabel>
          <Select
            value={searchCriteria.nicotine_percentage}
            onChange={handleSearchChange}
            label="Nicotine Percentage"
            name="nicotine_percentage"
          >
            <MenuItem value="">All</MenuItem>
            {generateSelectOptions([0, 3, 6, 9, 12, 18])}
          </Select>
        </FormControl>
        <FormControl variant="outlined" sx={{ minWidth: 120 }}>
          <InputLabel>MTL or DL</InputLabel>
          <Select
            value={searchCriteria.mtl_or_dl}
            onChange={handleSearchChange}
            label="MTL or DL"
            name="mtl_or_dl"
          >
            <MenuItem value="">All</MenuItem>
            {generateSelectOptions(["Mtl", "Dl"])}
          </Select>
        </FormControl>
      </Box>
      {/* Products Table */}
      <div style={{ height: 400, width: "100%" }}>
        <DataGrid
          rows={products}
          columns={columns}
          pageSize={5}
          disableSelectionOnClick
        />
      </div>

      {/* Sell Modal */}
      <Modal show={showSellModal} onHide={() => setShowSellModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Sale</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to sell{" "}
          {selectedProduct && selectedProduct.product_name}?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSellModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={confirmSellProduct}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Button to toggle showing sales table */}
      <Box>
        <div className="w-100 text-center">
          <button
            className=" mb-4 mt-5 text-center btn btn-outline-dark"
            type="button"
            onClick={toggleSalesTable}
          >
            {showSalesTable ? "Hide Sales" : "Show Sales"}
          </button>
        </div>

        {/* Sales Table */}
        {showSalesTable && (
          <div style={{ width: "100%" }}>
            <Typography variant="h5" gutterBottom>
              Today's Sold Products
            </Typography>
            <DataGrid
              rows={sales}
              columns={Salescolumns}
              pageSize={5}
              components={{ Toolbar: GridToolbar }}
            />
            <Typography variant="h6" gutterBottom>
              Total Money Collected Today: EG {calculateTotalMoney(sales)}
            </Typography>
          </div>
        )}
      </Box>
    </div>
  );
};

export default SellingPage;
