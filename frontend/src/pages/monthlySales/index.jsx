import React, { useEffect, useState } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "../../components/styles/sellingPage.css";
import {  Typography } from "@mui/material";
import { toast } from "react-toastify";
import axios from "axios";

const MonthlySales = () => {
    const [sales, setSales] = useState([]);

  const getSalesFunction = async () => {
    try {
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      const formattedDates = {
        startDate: firstDayOfMonth.toLocaleDateString("en-US"), 
        endDate: today.toLocaleDateString("en-US"),
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

    } catch (e) {
      toast.error("Error while getting sales, please try again");
      console.log(e);
      setSales([]);
    }
  };
  useEffect(() => {
    getSalesFunction();
  }, []);

  
 




  const calculateTotalMoney = (sales) => {
    let totalMoney = 0;

    sales.forEach((sale) => {
      if (sale.total_price > 0) {
        totalMoney += sale.total_price;
      }
    });
    const formattedTotalMoney = totalMoney > 9999 
    ? totalMoney % 10000 
    : totalMoney; 
    return formattedTotalMoney.toFixed(0);
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
        {sales.length > 0 ? (
          <>
            <Typography
              variant="h6"
              gutterBottom
              mt={3}
              sx={{ color: "white" , fontWeight:"bold"}}
            >
             ده اللي في الدرج يا اقرع: {calculateTotalMoney(sales)}   جنيه مصري فقط لا غير يا اقرع     
              
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

export default MonthlySales;
