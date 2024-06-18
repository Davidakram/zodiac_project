import React, { useState, useEffect } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import "../../components/styles/sellingPage.css";
import Cookies from "js-cookie";

import axios from "axios";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  ThemeProvider,
  Typography,
  createTheme,
} from "@mui/material";
import { toast } from "react-toastify";
import { Form } from "react-bootstrap";
import { useUser } from "../../components/context";
import { jwtDecode } from "jwt-decode";

const SellingPage = () => {
  const [user_name, setUserName] = useState("");

  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showSellModal, setShowSellModal] = useState(false);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSalesTable, setShowSalesTable] = useState(false);
  const [sellPrice, setSellPrice] = useState("");

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
      const formattedProducts = response.data.products.map((product) => {
        return Object.fromEntries(
          Object.entries(product).map(([key, value]) => [key, value || "-"])
        );
      });
      setProducts(
        formattedProducts.map((product) => ({
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
      const formattedSales = response.data.sales.map((sale) => {
        return Object.fromEntries(
          Object.entries(sale).map(([key, value]) => [key, value])
        );
      });
      setSales(
        formattedSales.map((sales) => ({
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
    const { user_name } = jwtDecode(Cookies.get("zodiac_token"));
    setUserName(user_name);
    fetchSalesForToday();
  }, [loading]);

  const Salescolumns = [
    { field: "product_name", headerName: "Product Name", flex: 1 },
    { field: "product_type", headerName: "Type", flex: 1 },
    { field: "mtl_or_dl", headerName: "Mtl&Dl", flex: 1 },

    { field: "product_size", headerName: "Size", flex: 1 },
    {
      field: "nicotine_percentage",
      headerName: "Nicotine %",
      flex: 1,
    },

    { field: "quantity_sold", headerName: "Quantity Sold", flex: 1 },
    { field: "total_price", headerName: "Total Price", flex: 1 },
    { field: "product_profit", headerName: "Productprofit", flex: 1 },
  ];
  // Function to handle selling a product
  const handleSellProduct = (product) => {
    setSelectedProduct(product);
    setShowSellModal(true);
  };

  const theme = createTheme({
    components: {
      MuiInputLabel: {
        styleOverrides: {
          root: {
            color: "white", // Makes label text white
            "&.Mui-focused": {
              color: "white", // Keeps text white on focus
            },
          },
        },
      },
      MuiInput: {
        styleOverrides: {
          root: {
            color: "white",
          },
          input: {
            color: "white", // Ensures the text you type is white
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          input: {
            color: "white", // Ensures the text you type is white
          },
        },
      },
      MuiAutocomplete: {
        styleOverrides: {
          inputRoot: {
            color: "white",
          },
        },
      },
      // Add overrides for other components as needed
    },
  });

  // ////////////////////////////////////////////Function to confirm selling a product
  const confirmSellProduct = async () => {
    setLoading(true);

    try {
      const response = await axios.post(
        `http://127.0.0.1:5000/api/selling/${selectedProduct.id}`,
        { selling_price: sellPrice || selectedProduct.selling_price }
      );
      toast.success("Product Sold successfully");
      fetchData(searchCriteria);
    } catch (error) {
      toast.error("Error Selling this product");
      console.log(error);
    } finally {
      setLoading(false);
      setSellPrice("");
    }
    setShowSellModal(false);
  };

  const calculateTotalMoney = (sales) => {
    let totalMoney = 0;
    sales.forEach((sale) => {
      if (sale.total_price !== 0) {
        totalMoney += sale.total_price;
      }
    });
    return totalMoney.toFixed(0);
  };
  const calculateTotalProfit = (sales) => {
    let totalProfit = 0;
    sales.forEach((sale) => {
      if (sale.product_profit !== 0) {
        totalProfit += sale.product_profit;
      }
    });
    return totalProfit.toFixed(0);
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
    { field: "product_name", headerName: "Name", flex: 1 },
    { field: "product_type", headerName: "Type", flex: 1 },
    { field: "mtl_or_dl", headerName: "Mtl&Dl", flex: 1 },

    { field: "product_size", headerName: "Size", flex: 1 },
    {
      field: "nicotine_percentage",
      headerName: "Nicotine %",
      flex: 1,
    },

    {
      field: "selling_price",
      headerName: "Selling Price",
      flex: 1,
    },
    {
      field: "total_count",
      headerName: "Total Count",
      flex: 1,
    },
    {
      field: "action",
      headerName: "Action",
      flex: 1,
      renderCell: (params) => (
        <button
          type="button"
          className="btn add-button"
          onClick={() => handleSellProduct(params.row)}
          disabled={
            params.row.total_count === 0 || params.row.total_count === "-"
          }
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
        <ThemeProvider theme={theme}>
          <TextField
            label="Product Name"
            variant="outlined"
            name="product_name"
            value={searchCriteria.product_name}
            onChange={handleSearchChange}
            sx={{}}
          />
        </ThemeProvider>
        <ThemeProvider theme={theme}>
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
                "Sub Ohm Coil",
                "Ready Maid Coil",
                "Cotton",
                "Glasses",
                "Driptip",
                "Cases",
              ])}
            </Select>
          </FormControl>
        </ThemeProvider>
        <ThemeProvider theme={theme}>
          <FormControl variant="outlined" sx={{ minWidth: 120 }}>
            <InputLabel>Product Size</InputLabel>
            <Select
              value={searchCriteria.product_size}
              onChange={handleSearchChange}
              label="Product Size"
              name="product_size"
            >
              <MenuItem value="">All</MenuItem>
              {generateSelectOptions([
                "15 ml",
                "30 ml",
                "60 ml",
                "100 ml",
                "150 ml",
              ])}
            </Select>
          </FormControl>
        </ThemeProvider>
        <ThemeProvider theme={theme}>
          <FormControl variant="outlined" sx={{ minWidth: 120 }}>
            <InputLabel>Nicotine Percentage</InputLabel>
            <Select
              value={searchCriteria.nicotine_percentage}
              onChange={handleSearchChange}
              label="Nicotine Percentage"
              name="nicotine_percentage"
            >
              <MenuItem value="">All</MenuItem>
              {generateSelectOptions([0, 3, 6, 9, 12, 16, 18, 20, 25, 30, 50])}
            </Select>
          </FormControl>
        </ThemeProvider>
        <ThemeProvider theme={theme}>
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
        </ThemeProvider>
      </Box>
      {/* Products Table */}
      <Box
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
            color: "#424242",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "1px solid #e0e0e0",
            color: "#424242",
            fontSize: "14px",
          },
          "& .MuiDataGrid-columnHeaderTitle": {
            color: "white",
            fontWeight: "bold",
            fontSize: "18px",
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "#f5f5f5",
            borderBottom: "2px solid #e0e0e0",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: "#fafafa",
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "1px solid #e0e0e0",
            backgroundColor: "#f5f5f5",
          },
          "& .MuiCheckbox-root": {
            color: `#757575 !important`,
          },
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: `white !important`,
          },
          "& .css-az8st9-MuiDataGrid-root.MuiDataGrid-autoHeight": {
            boxShadow: "0px 0px 25px 25px #7ffaffbd",
          },
          "& .css-az8st9-MuiDataGrid-root .MuiDataGrid-withBorderColor ": {
            backgroundColor: "inherit !important",
          },
          "& .css-s1v7zr-MuiDataGrid-virtualScrollerRenderZone": {
            backgroundColor: " rgba(0, 0, 0, 0.87) !important",
          },
          "& .css-az8st9-MuiDataGrid-root .MuiDataGrid-cellContent": {
            color: "white !important",
          },
          "& .css-de9k3v-MuiDataGrid-selectedRowCount": {
            color: "white !important",
          },
          "& .css-78c6dr-MuiToolbar-root-MuiTablePagination-toolbar": {
            color: "white !important",
          },
        }}
      >
        <DataGrid
          rows={products}
          columns={columns}
          pageSize={5}
          disableSelectionOnClick
        />
      </Box>

      {/* Sell Modal */}
      <Modal show={showSellModal} onHide={() => setShowSellModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Sale</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to sell{" "}
          {selectedProduct && selectedProduct.product_name}?
          <Form.Group controlId="sellPrice">
            <Form.Label>Sell Price</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter sell price"
              value={sellPrice}
              onChange={(e) => setSellPrice(e.target.value)}
            />
          </Form.Group>
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
          {user_name === "Youssef" && (
            <button
              className=" mb-4 mt-5 add-button"
              type="button"
              onClick={toggleSalesTable}
            >
              {showSalesTable ? "Hide Sales" : "Show Sales"}
            </button>
          )}
        </div>

        {/* Sales Table */}
        {showSalesTable && (
          <div style={{ width: "100%", color: "white" }}>
            <Typography
              variant="h5"
              sx={{ textAlign: "center", fontWeight: "bolder" }}
              mb={4}
              gutterBottom
            >
              Today's Sold Products
            </Typography>
            <Box
              sx={{
                "& .MuiDataGrid-root": {
                  border: "none",
                  color: "#424242",
                },
                "& .MuiDataGrid-cell": {
                  borderBottom: "1px solid #e0e0e0",
                  color: "#424242",
                  fontSize: "14px",
                },
                "& .MuiDataGrid-columnHeaderTitle": {
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "18px",
                },
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: "#f5f5f5",
                  borderBottom: "2px solid #e0e0e0",
                },
                "& .MuiDataGrid-virtualScroller": {
                  backgroundColor: "#fafafa",
                },
                "& .MuiDataGrid-footerContainer": {
                  borderTop: "1px solid #e0e0e0",
                  backgroundColor: "#f5f5f5",
                },
                "& .MuiCheckbox-root": {
                  color: `#757575 !important`,
                },
                "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
                  color: `white !important`,
                },
                "& .css-az8st9-MuiDataGrid-root.MuiDataGrid-autoHeight": {
                  boxShadow: "0px 0px 25px 25px #7ffaffbd",
                },
                "& .css-az8st9-MuiDataGrid-root .MuiDataGrid-withBorderColor ":
                  {
                    backgroundColor: "inherit !important",
                  },
                "& .css-s1v7zr-MuiDataGrid-virtualScrollerRenderZone": {
                  backgroundColor: " rgba(0, 0, 0, 0.87) !important",
                },
                "& .css-az8st9-MuiDataGrid-root .MuiDataGrid-cellContent": {
                  color: "white !important",
                },
                "& .css-de9k3v-MuiDataGrid-selectedRowCount": {
                  color: "white !important",
                },
                "& .css-78c6dr-MuiToolbar-root-MuiTablePagination-toolbar": {
                  color: "white !important",
                },
              }}
            >
              <DataGrid
                rows={sales}
                columns={Salescolumns}
                pageSize={5}
                components={{ Toolbar: GridToolbar }}
              />
            </Box>

            <Typography variant="h6" gutterBottom mt={3}>
              Total Money Collected Today: EG {calculateTotalMoney(sales)}
            </Typography>
            <Typography variant="h6" gutterBottom>
              Total Profit Collected Today: EG {calculateTotalProfit(sales)}
            </Typography>
          </div>
        )}
      </Box>
    </div>
  );
};

export default SellingPage;
