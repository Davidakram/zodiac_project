import React, { useState, useEffect } from "react";
import axios from "axios";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Box, CircularProgress, Grid } from "@mui/material";
import { toast } from "react-toastify";

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const columns = [
    { field: "product_name", headerName: "Name", flex: 0.5, editable: true },
    { field: "product_type", headerName: "Type", flex: 0.5, editable: true },
    { field: "mtl_or_dl", headerName: "Mtl&Dl", flex: 0.5, editable: true },

    { field: "product_size", headerName: "Size", flex: 0.5, editable: true },
    {
      field: "nicotine_percentage",
      headerName: "Nicotine %",
      flex: 0.5,
      editable: true,
    },
    {
      field: "original_price",
      headerName: "Original Price",
      flex: 0.5,
      editable: true,
    },
    {
      field: "selling_price",
      headerName: "Selling Price",
      flex: 0.5,
      editable: true,
    },
    {
      field: "total_count",
      headerName: "Total Count",
      flex: 0.5,
      editable: true,
    },
  ];

  const handleProcessRowUpdate = async (newRow) => {
    try {
      console.log(newRow);
      // Send the updated row to the backend
      await axios.put(
        `http://127.0.0.1:5000/api/productmodify/${newRow.id}`,
        newRow
      );

      toast.success("Product was updated successfully");
      return newRow; // Important: Return the updated row data to confirm the update.
    } catch (error) {
      console.error("Failed to update product:", error);
      toast.error("Failed to update product");
      throw new Error("Server error. Update failed."); // Prevent DataGrid from updating its internal state
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          "http://127.0.0.1:5000/api/productsproccess"
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
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box sx={{ margin: "20px auto", width: "90%" }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <h4>Products Available</h4>
        </Grid>
        <Grid item xs={12}>
          <Box
            height="75vh"
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
                color: "#424242",
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
                color: `#424242 !important`,
              },
            }}
          >
            {" "}
            <DataGrid
              rows={products}
              columns={columns}
              pageSize={5}
              processRowUpdate={handleProcessRowUpdate}
              autoHeight
              disableSelectionOnClick
              components={{ Toolbar: GridToolbar }}
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProductsPage;
