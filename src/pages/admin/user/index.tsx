import React, { useState } from "react";
import { Button } from "../../../components/ui/button";
import { toast } from "../../../hooks/use-toast";

interface GeneratedUser {
  id: string;
  username: string;
  password: string;
  createdAt: string;
  profile: {
    id: string;
    fullName: string;
  };
}

interface QRCodeData {
  qrCode: string;
  profileUrl: string;
}

const AdminIndex = () => {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedUser, setGeneratedUser] = useState<GeneratedUser | null>(
    null
  );
  const [qrCodeData, setQrCodeData] = useState<QRCodeData | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerateUser = async () => {
    if (!username.trim()) {
      setError("Username is required");
      return;
    }

    setLoading(true);
    setError("");
    setGeneratedUser(null);
    setQrCodeData(null);

    try {
      const response = await fetch("/api/admin/generate-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: username.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedUser(data.user);
        setUsername("");

        // Show success toast
        toast({
          title: "Success",
          description: "User berhasil dibuat!",
        });

        // Automatically generate QR code after user creation
        if (data.user.profile?.id) {
          await generateQRCode(data.user.profile.id);
        }
      } else {
        setError(data.message || "Failed to generate user");
        toast({
          title: "Error",
          description: data.message || "Gagal membuat user",
          variant: "destructive",
        });
      }
    } catch (err) {
      setError("Network error occurred");
      toast({
        title: "Error",
        description: "Network error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Success",
      description: "Text berhasil di-copy ke clipboard!",
    });
  };

  const generateQRCode = async (profileId: string) => {
    setQrLoading(true);
    setError("");
    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      console.log("Generating QR for profile:", profileId);
      console.log("Backend URL:", backendUrl);

      const response = await fetch(
        `${backendUrl}/qr/profile/${profileId}/simple`
      );
      const data = await response.json();

      console.log("QR Response:", data);

      if (data.success) {
        setQrCodeData(data);
        toast({
          title: "Success",
          description: "QR Code berhasil dibuat!",
        });
      } else {
        setError(data.message || "Failed to generate QR code");
        toast({
          title: "Error",
          description: data.message || "Gagal membuat QR code",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("QR Generation Error:", err);
      setError("Network error occurred while generating QR code");
      toast({
        title: "Error",
        description: "Network error occurred while generating QR code",
        variant: "destructive",
      });
    } finally {
      setQrLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Panel</h1>

        {/* User Generation Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Generate New User
          </h2>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username for new user"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
            </div>

            <Button
              onClick={handleGenerateUser}
              disabled={loading || !username.trim()}
              className="w-full"
            >
              {loading ? "Generating..." : "Generate User"}
            </Button>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Generated User Result */}
        {generatedUser && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-800 mb-4">
              ✅ User Generated Successfully!
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between bg-white p-3 rounded border">
                <span className="font-medium text-gray-700">Username:</span>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-gray-900">
                    {generatedUser.username}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(generatedUser.username)}
                  >
                    Copy
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between bg-white p-3 rounded border">
                <span className="font-medium text-gray-700">Password:</span>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-gray-900">
                    {generatedUser.password}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(generatedUser.password)}
                  >
                    Copy
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between bg-white p-3 rounded border">
                <span className="font-medium text-gray-700">Profile ID:</span>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-gray-900">
                    {generatedUser.profile.id}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(generatedUser.profile.id)}
                  >
                    Copy
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between bg-white p-3 rounded border">
                <span className="font-medium text-gray-700">Created:</span>
                <span className="text-gray-600">
                  {new Date(generatedUser.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-yellow-800 text-sm">
                ⚠️ <strong>Important:</strong> Please save these credentials
                securely. The password cannot be retrieved again.
              </p>
            </div>
          </div>
        )}

        {/* QR Code Section - Auto Generated */}
        {generatedUser && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">
              📱 Profile QR Code (Auto Generated)
            </h3>

            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <p className="text-blue-700 mb-4">
                  QR code automatically generated for this user's profile. When
                  scanned, it will direct to their profile page.
                </p>
              </div>

              {qrCodeData && (
                <div className="flex flex-col items-center">
                  <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <img
                      src={qrCodeData.qrCode}
                      alt="Profile QR Code"
                      className="w-48 h-48"
                    />
                  </div>

                  <div className="mt-4 text-center">
                    <p className="text-sm text-blue-600 mb-2">Profile URL:</p>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono bg-white px-2 py-1 rounded border">
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
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminIndex;
