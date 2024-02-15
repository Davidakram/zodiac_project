import React, { useState } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import {
  Button,
  TextField,
  Container,
  Typography,
  Grid,
  MenuItem,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers";
import "../../components/styles/addProduct.css";
import axios from "axios";
import { toast } from "react-toastify";

const initialValues = {
  product_type: "",
  original_price: "",
  selling_price: "",
  product_name: "",
  product_count: "",
  product_size: "",
  nicotine_percentage: "",
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async (values, { setSubmitting }) => {
    setIsSubmitting(true);
    try {
      const formattedData = {
        ...values,
        date_added: new Date(values.date_added).toISOString().split("T")[0],
      };
      const response = await axios.post(
        "http://127.0.0.1:5000/api/productsproccess",
        formattedData
      );
      toast.success("Product added successfully");
    } catch (error) {
      toast.error("Error adding Product");
      console.error("Error sending data:", error);
    }
    setIsSubmitting(false);
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" component="h1" gutterBottom>
        Add Product
      </Typography>
      <Formik
        initialValues={initialValues}
        validationSchema={ProductSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched, handleChange, handleBlur }) => (
          <Form>
            <Grid container spacing={2}>
              {Object.keys(initialValues).map((key) => (
                <Grid item xs={12} key={key}>
                  {key === "product_size" ? (
                    <Field
                      as={TextField}
                      select
                      name={key}
                      label="Product Size"
                      fullWidth
                      variant="outlined"
                      error={errors[key] && touched[key]}
                      helperText={touched[key] && errors[key]}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    >
                      <MenuItem value="30 ml">30 ml</MenuItem>

                      <MenuItem value="60 ml">60 ml</MenuItem>
                      <MenuItem value="100 ml">100 ml</MenuItem>
                      <MenuItem value="150 ml">150 ml</MenuItem>
                    </Field>
                  ) : key === "date_added" ? (
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
                  ) : key === "nicotine_percentage" ? (
                    <Field
                      as={TextField}
                      select
                      name={key}
                      label="Nicotine Percentage"
                      fullWidth
                      variant="outlined"
                      error={errors[key] && touched[key]}
                      helperText={touched[key] && errors[key]}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    >
                      {[0, 3, 6, 9, 12, 18].map((value) => (
                        <MenuItem key={value} value={value}>
                          {value}
                        </MenuItem>
                      ))}
                    </Field>
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
                      error={errors[key] && touched[key]}
                      helperText={touched[key] && errors[key]}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  )}
                </Grid>
              ))}
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Loading" : "Submit"}
                </Button>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    </Container>
  );
};

export default ProductForm;
