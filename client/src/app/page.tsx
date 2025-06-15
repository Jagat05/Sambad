"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// import { Link } from "react-router-dom";
import { User, Mail } from "lucide-react";
import Link from "next/link";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/20">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Sambad
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connect, collaborate, and communicate with your organization through
            our secure chat platform.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                <User className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">New to Sambad?</CardTitle>
              <CardDescription>
                Create your account and join your organization's communication
                hub.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="/register">
                <Button className="w-full" size="lg">
                  Create Account
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-secondary/10 rounded-full w-fit">
                <Mail className="w-8 h-8 text-secondary-foreground" />
              </div>
              <CardTitle className="text-2xl">Welcome Back!</CardTitle>
              <CardDescription>
                Sign in to continue your conversations and stay connected with
                your team.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="/login">
                <Button variant="outline" className="w-full" size="lg">
                  Sign In
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 text-center">
          <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Secure</h3>
              <p className="text-muted-foreground text-sm">
                End-to-end encryption keeps your conversations private and
                secure.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Organized</h3>
              <p className="text-muted-foreground text-sm">
                Role-based access ensures the right people have the right
                permissions.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Efficient</h3>
              <p className="text-muted-foreground text-sm">
                Real-time messaging keeps your team connected and productive.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
