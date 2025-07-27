"use client";

import React from "react";
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import axios from "axios";
import { setUser } from "@/redux/reducerSlices/userSlice";
import { initializeSocket } from "@/utils/socket";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface LoginValues {
  email: string;
  password: string;
}

const validationSchema = Yup.object<LoginValues>({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string().required("Password is required"),
});

const initialValues: LoginValues = {
  email: "",
  password: "",
};

export default function Login() {
  const dispatch = useDispatch();
  const router = useRouter();

  const handleSubmit = async (
    values: LoginValues,
    { setSubmitting }: FormikHelpers<LoginValues>
  ) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/login`,
        values
      );

      const { user, token } = response.data;

      // ✅ Normalize user object
      const normalizedUser = {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar || "",
      };

      // ✅ Save to localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(normalizedUser));

      // ✅ Set to Redux
      dispatch(setUser({ ...normalizedUser, token }));

      // ✅ Initialize socket connection
      initializeSocket(token);

      toast.success("🎉 Login Successful!");
      router.push("/home");
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "🚨 Login failed. Please try again.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/20 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Login Account</CardTitle>
          <CardDescription>Welcome Back</CardDescription>
        </CardHeader>
        <CardContent>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-4">
                <div>
                  <label htmlFor="email">Email</label>
                  <Field
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    className="w-full border rounded px-3 py-2"
                  />
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="text-red-600 text-sm mt-1"
                  />
                </div>
                <div>
                  <label htmlFor="password">Password</label>
                  <Field
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    className="w-full border rounded px-3 py-2"
                  />
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="text-red-600 text-sm mt-1"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? "Signing In..." : "Sign In"}
                </Button>
                <div className="text-center text-sm">
                  <span className="text-muted-foreground">
                    Don&apos;t have an account?{" "}
                  </span>
                  <Link
                    href="/register"
                    className="text-primary hover:underline font-medium"
                  >
                    Register
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
