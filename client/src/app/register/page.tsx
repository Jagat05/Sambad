"use client";
import React from "react";
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import Link from "next/link";

interface FormValues {
  username: string;
  email: string;
  role: string;
  password: string;
  confirmPassword: string;
}

const validationSchema = Yup.object<FormValues>({
  username: Yup.string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be less than 20 characters")
    .required("Username is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  role: Yup.string()
    .oneOf(
      ["admin", "manager", "employee", "intern"],
      "Please select a valid role"
    )
    .required("Role is required"),
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
  role: "",
  password: "",
  confirmPassword: "",
};

export default function Register() {
  const handleSubmit = async (
    values: FormValues,
    { setSubmitting, resetForm }: FormikHelpers<FormValues>
  ) => {
    console.log("Submitting:", values); // using values to avoid unused warning

    const fakeApiCall = new Promise<void>((res) => setTimeout(res, 2000));

    toast.promise(fakeApiCall, {
      loading: "Creating account…",
      success: "🎉 Registration successful!",
      error: "🚨 Registration failed. Try again.",
    });

    try {
      await fakeApiCall;
      resetForm();
    } catch {
      // Additional error logic if needed
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
            {({ isSubmitting, setFieldValue }) => (
              <Form className="space-y-4">
                {/* Username & Email */}
                {["username", "email"].map((field) => (
                  <div key={field} className="space-y-2">
                    <Label htmlFor={field}>
                      {field.charAt(0).toUpperCase() + field.slice(1)}
                    </Label>
                    <Field
                      as={Input}
                      id={field}
                      name={field}
                      type={field}
                      placeholder={`Enter your ${field}`}
                      className="w-full"
                    />
                    <ErrorMessage
                      name={field}
                      component="div"
                      className="text-sm text-destructive"
                    />
                  </div>
                ))}

                {/* Role selection */}
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select onValueChange={(v) => setFieldValue("role", v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      {["admin", "manager", "employee", "intern"].map((r) => (
                        <SelectItem key={r} value={r}>
                          {r.charAt(0).toUpperCase() + r.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <ErrorMessage
                    name="role"
                    component="div"
                    className="text-sm text-destructive"
                  />
                </div>

                {/* Password & Confirm Password */}
                {["password", "confirmPassword"].map((field) => (
                  <div key={field} className="space-y-2">
                    <Label htmlFor={field}>
                      {field === "password" ? "Password" : "Confirm Password"}
                    </Label>
                    <Field
                      as={Input}
                      id={field}
                      name={field}
                      type="password"
                      placeholder={`Enter your ${field}`}
                      className="w-full"
                    />
                    <ErrorMessage
                      name={field}
                      component="div"
                      className="text-sm text-destructive"
                    />
                  </div>
                ))}

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
