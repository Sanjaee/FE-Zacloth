import React, { useEffect } from "react";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { LoginForm } from "../components/LoginForm";

const LoginPage = () => {
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession();
      if (session) {
        // Simple redirect based on role
        if (session.user.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      }
    };
    checkSession();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      

      <LoginForm />
    </div>
  );
};

export default LoginPage;
