"use client";

import React from "react";
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import Link from "next/link";
import axios from "axios";

interface FormValues {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// ✅ Validation Schema
const validationSchema = Yup.object<FormValues>({
  username: Yup.string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be less than 20 characters")
    .required("Username is required"),

  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),

  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Must contain an uppercase letter")
    .matches(/[a-z]/, "Must contain a lowercase letter")
    .matches(/\d/, "Must contain a number")
    .required("Password is required"),

  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
});

const initialValues: FormValues = {
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export default function Register() {
  const handleSubmit = async (
    values: FormValues,
    { setSubmitting, resetForm }: FormikHelpers<FormValues>
  ) => {
    const { confirmPassword, ...dataToSend } = values;

    try {
      // Append role manually as "member"
      const finalData = { ...dataToSend, role: "member" };

      // const res = await axios.post("http://localhost:8080/register", finalData);
      const res = await axios.post(
        process.env.NEXT_PUBLIC_API_URL + "/register",
        finalData
      );
      toast.success("🎉 Registration successful!");
      resetForm();
    } catch (error: any) {
      const response = error?.response?.data;
      const message =
        typeof response === "string"
          ? response
          : response?.message || "🚨 Registration failed. Try again.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/20 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          <CardDescription>
            Join your organization's chat platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-4">
                {/* Username */}
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Field
                    as={Input}
                    id="username"
                    name="username"
                    placeholder="Enter your username"
                    className="w-full"
                  />
                  <ErrorMessage
                    name="username"
                    component="div"
                    className="text-sm text-destructive"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Field
                    as={Input}
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    className="w-full"
                  />
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="text-sm text-destructive"
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Field
                    as={Input}
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    className="w-full"
                  />
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="text-sm text-destructive"
                  />
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Field
                    as={Input}
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    className="w-full"
                  />
                  <ErrorMessage
                    name="confirmPassword"
                    component="div"
                    className="text-sm text-destructive"
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating Account..." : "Create Account"}
                </Button>

                <div className="text-center text-sm">
                  <span className="text-muted-foreground">
                    Already have an account?{" "}
                  </span>
                  <Link
                    href="/login"
                    className="text-primary hover:underline font-medium"
                  >
                    Sign in
                  </Link>
                </div>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </div>
  );
}
