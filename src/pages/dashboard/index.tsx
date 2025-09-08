import React from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { Button } from "../../components/ui/button";
import { toast } from "../../hooks/use-toast";

const DashboardPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    router.push("/login");
    return null;
  }

  // Redirect admin users to admin panel
  if (session.user.role === "admin") {
    router.push("/admin");
    return null;
  }

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
      toast({
        title: "Success",
        description: "Logout berhasil!",
      });
      router.push("/login");
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal logout",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Dashboard Client
              </h1>
              <p className="text-gray-600">
                Selamat datang, {session.user.name}!
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Role:{" "}
                <span className="font-medium text-blue-600">
                  {session.user.role}
                </span>
              </div>
              <Button onClick={handleLogout} variant="outline">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xl text-blue-600">
                        {session.user.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Profile
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {session.user.name}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Username Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-xl text-green-600">👤</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Username
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {session.user.username}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Role Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-xl text-purple-600">🔑</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Role
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {session.user.role}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Welcome Message */}
          <div className="mt-8 bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Selamat Datang di Dashboard Client!
            </h2>
            <div className="text-gray-600 space-y-2">
              <p>
                Anda telah berhasil login sebagai <strong>Client</strong>.
              </p>
              <p>
                Dashboard ini adalah area khusus untuk pengguna dengan role
                client. Di sini Anda dapat mengakses fitur-fitur yang tersedia
                untuk client.
              </p>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">
                  Fitur yang Tersedia:
                </h3>
                <ul className="text-blue-800 space-y-1">
                  <li>• Melihat profil Anda</li>
                  <li>• Mengakses QR code profile</li>
                  <li>• Mengelola data pribadi</li>
                  <li>• Dan fitur lainnya sesuai kebutuhan</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
