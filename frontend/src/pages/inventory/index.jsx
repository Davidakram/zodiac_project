import React, { useState, useEffect } from "react";
import axios from "axios";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Box, CircularProgress, Grid } from "@mui/material";
import { toast } from "react-toastify";

const Inventory = () => {
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
      field: "total_count",
      headerName: "Total Count",
      flex: 0.5,
      editable: true,
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://127.0.0.1:5000/api/inventory");
        const formattedProducts = response.data.grouped_products.map(
          (product) => {
            return Object.fromEntries(
              Object.entries(product).map(([key, value]) => [key, value || "-"])
            );
          }
        );
        setProducts(
          formattedProducts.map((product, idx) => ({
            ...product,
            id: idx,
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
    <Box
      sx={{
        margin: "20px auto",
        width: "90%",
        color: "white",
        textAlign: "center",
      }}
    >
      <Grid container spacing={3}>
        <Grid item xs={12} mb={5}>
          <h4>Inventory</h4>
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
            {" "}
            <DataGrid
              rows={products}
              columns={columns}
              pageSize={5}
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

export default Inventory;
