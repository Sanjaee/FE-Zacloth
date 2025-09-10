import { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Search, User, LogOut, LogIn, Settings, Shield } from "lucide-react";
import { useRouter } from "next/router";

interface NavbarProps {
  onSearchChange: (searchTerm: string) => void;
  searchTerm: string;
}

export default function Navbar({ onSearchChange, searchTerm }: NavbarProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  const handleSearchChange = (value: string) => {
    setLocalSearchTerm(value);
    onSearchChange(value);
  };

  const handleLogin = () => {
    router.push("/login");
  };

  const handleProfile = () => {
    // Store current page in session storage for redirect after login
    if (typeof window !== "undefined") {
      sessionStorage.setItem("redirectAfterLogin", router.asPath);
    }

    if (session?.user?.role === "admin") {
      router.push("/admin");
    } else {
      router.push("/dashboard");
    }
  };

  const handleSettings = () => {
    // Add settings page navigation here
    console.log("Navigate to settings");
  };

  const handleLogout = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">ZACloth</h1>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search products..."
                value={localSearchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            {status === "loading" ? (
              <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
            ) : session ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700 hidden sm:block">
                    {session.user.name || session.user.username}
                  </span>
                </div>

                {/* Profile Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-10 w-10 rounded-full p-0 hover:bg-gray-50"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm hover:shadow-md transition-shadow">
                        {(session.user.name || session.user.username || "U")
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48" align="end" forceMount>
                    <DropdownMenuItem
                      onClick={handleProfile}
                      className="flex items-center gap-2"
                    >
                      <User className="h-4 w-4" />
                      {session.user.role === "admin"
                        ? "Admin Panel"
                        : "Profile"}
                    </DropdownMenuItem>
                    {session.user.role === "admin" && (
                      <DropdownMenuItem
                        onClick={handleSettings}
                        className="flex items-center gap-2"
                      >
                        <Shield className="h-4 w-4" />
                        Settings
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="flex items-center gap-2 text-red-600 focus:text-red-600"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={handleLogin}
                className="flex items-center space-x-1"
              >
                <LogIn className="h-4 w-4" />
                <span>Login</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
