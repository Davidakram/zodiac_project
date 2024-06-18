import React, { useState } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "../../components/styles/sellingPage.css";
import { DatePicker } from "@mui/x-date-pickers";
import { Box, ThemeProvider, Typography, createTheme } from "@mui/material";
import { toast } from "react-toastify";
import axios from "axios";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";

const GetSales = () => {
  const [dates, setDates] = useState({ startDate: null, endDate: null });
  const [sales, setSales] = useState([]);
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
  const getSalesFunction = async () => {
    const formattedDates = {
      startDate: dates.startDate
        ? new Date(dates.startDate).toLocaleDateString("en-US")
        : null,
      endDate: dates.endDate
        ? new Date(dates.endDate).toLocaleDateString("en-US")
        : null,
    };
    const response = await axios.post(
      "http://127.0.0.1:5000/api/getsalesbydate",
      formattedDates
    );
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
  };
  const handleGetSales = async () => {
    try {
      await getSalesFunction();
    } catch (e) {
      toast.error("Error while getting sales , please try again");
      console.log(e);
      setSales([]);
    }
  };
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
    { field: "product_original_price", headerName: "Original Price", flex: 1 },

    { field: "total_price", headerName: "Total Price", flex: 1 },
    { field: "sale_date", headerName: "Date", flex: 1 },
    {
      field: "delete",
      headerName: "Delete",
      flex: 1,
      renderCell: (params) => {
        return (
          <button
            type="btn"
            className="btn btn-outline-danger"
            onClick={() => handleDelete(params.row.id)}
          >
            Delete
          </button>
        );
      },
    },
  ];
  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(
        `http://127.0.0.1:5000/api/deletesale/${id}`
      );
      toast.success("Sale deleted !");
      getSalesFunction();
    } catch (e) {
      console.log(e);
    }
  };

  const isButtonDisabled = !dates.startDate || !dates.endDate;

  const handleDateChange = (dateType, newValue) => {
    setDates((prevState) => ({
      ...prevState,
      [dateType]: newValue,
    }));
  };
  const calculateTotalMoney = (sales) => {
    let totalMoney = 0;

    sales.forEach((sale) => {
      if (sale.total_price > 0) {
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
    return totalProfit.toFixed(0); // toFixed(2) is used to display the total with 2 decimal places
  };
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div
        className="container border rounded mt-5"
        style={{
          border: "1px solid #ccc",
          padding: "20px",
          borderRadius: "5px",
        }}
      >
        <Box
          sx={{ display: "flex", justifyContent: "space-evenly", gap: "20px" }}
        >
          <div>
            <ThemeProvider theme={theme}>
              <DatePicker
                label="Start Date"
                inputFormat="MM/dd/yyyy"
                value={dates.startDate}
                onChange={(newValue) => handleDateChange("startDate", newValue)}
              />
            </ThemeProvider>
          </div>
          <div>
            <ThemeProvider theme={theme}>
              <DatePicker
                label="End Date"
                inputFormat="MM/dd/yyyy"
                value={dates.endDate}
                onChange={(newValue) => handleDateChange("endDate", newValue)}
              />
            </ThemeProvider>
          </div>
        </Box>
        <div className="w-100 text-center">
          <button
            type="button"
            style={{ color: "white" }}
            className="btn add-button mt-3"
            disabled={isButtonDisabled}
            onClick={handleGetSales}
          >
            Get Sales
          </button>
        </div>
        {sales.length > 0 ? (
          <>
            {" "}
            <Box
              mt={3}
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
              />{" "}
            </Box>
            <Typography
              variant="h6"
              gutterBottom
              mt={3}
              sx={{ color: "white" }}
            >
              Total Money Collected during this Duration: EG{" "}
              {calculateTotalMoney(sales)}
            </Typography>
            <Typography variant="h6" gutterBottom sx={{ color: "white" }}>
              Total Profit Collected : EG {calculateTotalProfit(sales)}
            </Typography>
          </>
        ) : (
          <div className="mt-5 w-100 text-center text-light">
            No Sales for selected duration
          </div>
        )}
      </div>
    </LocalizationProvider>
  );
};

export default GetSales;
