"use client";

import React, { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { Button } from "./ui/button";
import { toast } from "../hooks/use-toast";
import { Toaster } from "./ui/toaster";

interface QRCodeData {
  qrCode: string;
  profileUrl: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  qrCode?: string;
  profileUrl?: string;
}

export function ClientDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [qrCodeData, setQrCodeData] = useState<QRCodeData | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (session?.user?.profileId) {
      generateQRCode(session.user.profileId);
    }
  }, [session?.user?.profileId]);

  const generateQRCode = async (profileId: string) => {
    setQrLoading(true);
    setError("");
    try {
      // Import API client
      const { api } = await import("../lib/api");

      console.log("Generating QR for profile:", profileId);

      const data = (await api.qr.generateProfileSimple(
        profileId
      )) as ApiResponse<QRCodeData>;

      console.log("QR Response:", data);

      if (data.success) {
        setQrCodeData({
          qrCode: data.qrCode!,
          profileUrl: data.profileUrl!,
        });
      } else {
        setError(data.message || "Failed to generate QR code");
        toast({
          title: "Error",
          description: data.message || "Gagal membuat QR code",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error("QR Generation Error:", err);
      setError(
        err.message || "Network error occurred while generating QR code"
      );
      toast({
        title: "Error",
        description:
          err.message || "Network error occurred while generating QR code",
        variant: "destructive",
      });
    } finally {
      setQrLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Success",
      description: "Text berhasil di-copy ke clipboard!",
    });
  };

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
              <Button
                onClick={() => router.push("/dashboard/update")}
                variant="outline"
              >
                Update Profile
              </Button>
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

            {/* Profile ID Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-xl text-purple-600">🆔</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Profile ID
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 font-mono">
                        {session.user.profileId || "N/A"}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="mt-8 bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              📱 QR Code Profile Anda
            </h2>
            <p className="text-gray-600 mb-6">
              QR code ini dapat digunakan untuk berbagi profil Anda dengan orang
              lain. Ketika di-scan, akan mengarahkan ke halaman profil Anda.
            </p>

            {qrLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Generating QR Code...</p>
                </div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-red-800 mb-2">
                  Error Loading QR Code
                </h3>
                <p className="text-red-700 mb-4">{error}</p>
                <Button
                  onClick={() =>
                    session.user.profileId &&
                    generateQRCode(session.user.profileId)
                  }
                  variant="outline"
                >
                  Try Again
                </Button>
              </div>
            ) : qrCodeData ? (
              <div className="flex flex-col md:flex-row gap-8 items-center">
                {/* QR Code Display */}
                <div className="flex flex-col items-center">
                  <div className="bg-white p-6 rounded-lg shadow-sm border-2 border-gray-200">
                    <img
                      src={qrCodeData.qrCode}
                      alt="Profile QR Code"
                      className="w-64 h-64"
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-4 text-center">
                    Scan QR code ini untuk mengakses profil Anda
                  </p>
                </div>

                {/* Profile Information */}
                <div className="flex-1 space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Profile URL
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-mono bg-white px-3 py-2 rounded border flex-1">
                        {qrCodeData.profileUrl}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(qrCodeData.profileUrl)}
                      >
                        Copy
                      </Button>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">
                      Cara Menggunakan
                    </h3>
                    <ul className="text-blue-800 text-sm space-y-1">
                      <li>• Simpan QR code ini di galeri Anda</li>
                      <li>• Bagikan dengan orang lain untuk akses profil</li>
                      <li>• Cetak untuk kartu nama atau brosur</li>
                      <li>• Scan dengan aplikasi QR code reader</li>
                    </ul>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4">
                    <h3 className="font-semibold text-green-900 mb-2">
                      Informasi Profil
                    </h3>
                    <div className="text-green-800 text-sm space-y-1">
                      <p>
                        <strong>Nama:</strong> {session.user.name}
                      </p>
                      <p>
                        <strong>Username:</strong> {session.user.username}
                      </p>
                      <p>
                        <strong>Profile ID:</strong> {session.user.profileId}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                  No Profile ID Available
                </h3>
                <p className="text-yellow-700">
                  Profile ID tidak tersedia. Silakan hubungi administrator untuk
                  mendapatkan Profile ID.
                </p>
              </div>
            )}
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
                client. Di sini Anda dapat mengakses QR code profil Anda dan
                fitur-fitur lainnya.
              </p>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">
                  Fitur yang Tersedia:
                </h3>
                <ul className="text-blue-800 space-y-1">
                  <li>• Melihat profil Anda</li>
                  <li>• Mengakses QR code profile</li>
                  <li>• Membagikan profil dengan QR code</li>
                  <li>• Mengelola data pribadi</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Toaster />
    </div>
  );
}
