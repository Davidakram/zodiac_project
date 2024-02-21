import React, { useState } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import { DatePicker } from "@mui/x-date-pickers";
import { Box, Typography } from "@mui/material";
import { toast } from "react-toastify";
import axios from "axios";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";

const GetSales = () => {
  const [dates, setDates] = useState({ startDate: null, endDate: null });
  const [sales, setSales] = useState([]);

  const handleGetSales = async () => {
    const formattedDates = {
      startDate: dates.startDate
        ? new Date(dates.startDate).toLocaleDateString("en-US")
        : null,
      endDate: dates.endDate
        ? new Date(dates.endDate).toLocaleDateString("en-US")
        : null,
    };
    console.log("Selected Dates:", formattedDates);
    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/api/getsalesbydate",
        formattedDates
      );
      const formattedSales = response.data.sales.map((sale) => {
        return Object.fromEntries(
          Object.entries(sale).map(([key, value]) => [key, value || "-"])
        );
      });
      setSales(
        formattedSales.map((sales) => ({
          ...sales,
          id: sales.sale_id,
        }))
      );
      console.log(response);
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
    { field: "total_price", headerName: "Total Price", flex: 1 },
    { field: "sale_date", headerName: "Date", flex: 1 },
  ];

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
      totalMoney += sale.total_price;
    });
    return totalMoney.toFixed(0);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div
        className="container border rounded mt-3"
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
            <DatePicker
              label="Start Date"
              inputFormat="MM/dd/yyyy"
              value={dates.startDate}
              onChange={(newValue) => handleDateChange("startDate", newValue)}
            />
          </div>
          <div>
            <DatePicker
              label="End Date"
              inputFormat="MM/dd/yyyy"
              value={dates.endDate}
              onChange={(newValue) => handleDateChange("endDate", newValue)}
            />
          </div>
        </Box>
        <div className="w-100 text-center">
          <button
            type="button"
            className="btn btn-outline-primary mt-3"
            disabled={isButtonDisabled}
            onClick={handleGetSales}
          >
            Get Sales
          </button>
        </div>
        {sales.length > 0 ? (
          <>
            {" "}
            <DataGrid
              rows={sales}
              columns={Salescolumns}
              pageSize={5}
              components={{ Toolbar: GridToolbar }}
              sx={{ marginTop: 3 }}
            />{" "}
            <Typography variant="h6" gutterBottom>
              Total Money Collected during this Duration: EG{" "}
              {calculateTotalMoney(sales)}
            </Typography>
          </>
        ) : (
          <div className="mt-5 w-100 text-center">
            No Sales for selected duration
          </div>
        )}
      </div>
    </LocalizationProvider>
  );
};

export default GetSales;
