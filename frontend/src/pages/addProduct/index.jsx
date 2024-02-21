import React, { useEffect, useState } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import {
  Button,
  TextField,
  Typography,
  Grid,
  MenuItem,
  Autocomplete,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers";
import "../../components/styles/addProduct.css";
import axios from "axios";
import { toast } from "react-toastify";
import styled from "@emotion/styled";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";

const initialValues = {
  product_type: "",
  original_price: "",
  selling_price: "",
  product_name: "",
  product_count: "",
  product_size: "",
  nicotine_percentage: "",
  mtl_or_dl: "",

  date_added: null,
};

// Validation schema using Yup
const ProductSchema = Yup.object().shape({
  product_type: Yup.string().required("Required"),
  original_price: Yup.number()
    .min(0, "Must be greater than or equal to 0")
    .required("Required"),
  selling_price: Yup.number()
    .min(0, "Must be greater than or equal to 0")
    .required("Required"),
  product_name: Yup.string().required("Required"),
  product_count: Yup.number()
    .min(0, "Must be a positive number")
    .required("Required"),
  product_size: Yup.string(),
  nicotine_percentage: Yup.number(),
  date_added: Yup.date(),
});

const ProductForm = () => {
  const history = useHistory();
  const ModernButton = styled(Button)({
    background: "linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)",
    border: 0,
    borderRadius: 3,
    boxShadow: "0 3px 5px 2px rgba(255, 105, 135, .3)",
    color: "white",
    height: 48,
    padding: "0 30px",
    "&:hover": {
      backgroundColor: "rgba(255, 152, 0, 0.85)",
    },
  });
  const [productNames, setProductNames] = useState([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async (values, { setSubmitting }) => {
    setIsSubmitting(true);
    console.log(values);
    try {
      const formattedData = {
        ...values,
        date_added: new Date(values.date_added).toLocaleDateString("en-US"),
      };
      console.log(formattedData);
      const response = await axios.post(
        "http://127.0.0.1:5000/api/productsproccess",
        formattedData
      );
      toast.success("Product added successfully");
      history.push("/products");
    } catch (error) {
      toast.error("Error adding Product");
      console.error("Error sending data:", error);
    }
    setIsSubmitting(false);
  };

  const getProductNames = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:5000/api/productsnames"
      );
      setProductNames(response.data.products_names_list);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getProductNames();
  }, []);

  return (
    <div className="container border rounded mt-5 p-3">
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        className="addProductTitle"
      >
        Add Product
      </Typography>
      <Formik
        initialValues={initialValues}
        validationSchema={ProductSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched, handleChange, handleBlur }) => (
          <Form className="addProductForm">
            <Grid container spacing={2}>
              {Object.keys(initialValues).map((key) => (
                <Grid item xs={12} key={key}>
                  {key === "date_added" ? (
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <Field fullWidth name="date_added">
                        {({ field }) => (
                          <DatePicker
                            {...field}
                            label="Date Added"
                            inputFormat="MM/dd/yyyy"
                            error={errors.date_added && touched.date_added}
                            helperText={touched.date_added && errors.date_added}
                            onBlur={handleBlur}
                            onChange={(newValue) => {
                              handleChange({
                                target: {
                                  name: "date_added",
                                  value: newValue,
                                },
                              });
                            }}
                          />
                        )}
                      </Field>
                    </LocalizationProvider>
                  ) : key === "product_name" ? (
                    <Autocomplete
                      freeSolo
                      options={productNames}
                      getOptionLabel={(option) => {
                        // Check if the option is a string; if so, return it directly. If it's an object, return its product_name.
                        return typeof option === "string"
                          ? option
                          : option.product_name;
                      }}
                      onChange={(event, newValue) => {
                        handleChange({
                          target: {
                            name: "product_name",
                            value: newValue
                              ? typeof newValue === "string"
                                ? newValue
                                : newValue.product_name
                              : "",
                          },
                        });
                      }}
                      onBlur={handleBlur}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="outlined"
                          label="Product Name"
                          name="product_name"
                          error={errors.product_name && touched.product_name} // Update error based on product_name field
                          helperText={
                            touched.product_name && errors.product_name
                          } // Update helper text based on product_name field
                        />
                      )}
                    />
                  ) : (
                    <Field
                      as={TextField}
                      name={key}
                      label={
                        key.replace(/_/g, " ").charAt(0).toUpperCase() +
                        key.replace(/_/g, " ").slice(1)
                      }
                      fullWidth
                      variant="outlined"
                      select={
                        key === "product_type" ||
                        key === "product_size" ||
                        key === "mtl_or_dl" ||
                        key === "nicotine_percentage"
                      }
                      error={errors[key] && touched[key]}
                      helperText={touched[key] && errors[key]}
                    >
                      {[
                        "product_size",
                        "product_type",
                        "mtl_or_dl",
                        "nicotine_percentage",
                      ].includes(key) &&
                        getSelectMenuItems(key).map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                    </Field>
                  )}
                </Grid>
              ))}
              <Grid item xs={12}>
                <ModernButton
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Loading" : "Submit"}
                </ModernButton>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    </div>
  );
};

function getSelectMenuItems(key) {
  const options = {
    product_type: [
      "Liquid",
      "Tank",
      "Pod",
      "Mod",
      "Battery",
      "Disposable",
      "Charger",
      "Coil",
      "Cotton",
    ],
    product_size: ["30 ml", "60 ml", "100 ml", "150 ml"],
    mtl_or_dl: ["Mtl", "Dl"],
    nicotine_percentage: [0, 3, 6, 9, 12, 18],
  };
  return options[key].map((value) => ({ value, label: value }));
}
export default ProductForm;
