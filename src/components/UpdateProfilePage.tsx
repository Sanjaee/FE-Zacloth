"use client";

import React, { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { Button } from "./ui/button";
import { toast } from "../hooks/use-toast";
import { Toaster } from "./ui/toaster";

interface ProfileData {
  id: string;
  fullName: string;
  bio?: string;
  avatarUrl?: string;
  email?: string;
  instagram?: string;
  tiktok?: string;
  xAccount?: string;
  facebook?: string;
  youtube?: string;
  linkedin?: string;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  profile?: ProfileData;
}

export function UpdateProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    bio: "",
    avatarUrl: "",
    email: "",
    instagram: "",
    tiktok: "",
    xAccount: "",
    facebook: "",
    youtube: "",
    linkedin: "",
  });

  // Fetch profile data when component mounts
  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user) return;

      setFetchingProfile(true);
      try {
        // Import API client
        const { api } = await import("../lib/api");

        const data = (await api.users.getProfile()) as ApiResponse;

        if (data.success && data.profile) {
          setProfileData(data.profile);
          // Initialize form with fetched profile data
          setFormData({
            fullName: data.profile.fullName || "",
            bio: data.profile.bio || "",
            avatarUrl: data.profile.avatarUrl || "",
            email: data.profile.email || "",
            instagram: data.profile.instagram || "",
            tiktok: data.profile.tiktok || "",
            xAccount: data.profile.xAccount || "",
            facebook: data.profile.facebook || "",
            youtube: data.profile.youtube || "",
            linkedin: data.profile.linkedin || "",
          });
        } else {
          // Fallback to session data if profile fetch fails
          setFormData({
            fullName: session.user.name || "",
            bio: "",
            avatarUrl: "",
            email: session.user.email || "",
            instagram: "",
            tiktok: "",
            xAccount: "",
            facebook: "",
            youtube: "",
            linkedin: "",
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        // Fallback to session data on error
        setFormData({
          fullName: session.user.name || "",
          bio: "",
          avatarUrl: "",
          email: session.user.email || "",
          instagram: "",
          tiktok: "",
          xAccount: "",
          facebook: "",
          youtube: "",
          linkedin: "",
        });
      } finally {
        setFetchingProfile(false);
      }
    };

    fetchProfile();
  }, [session?.user]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user) {
      toast({
        title: "Error",
        description: "You must be logged in to update your profile",
        variant: "destructive",
      });
      return;
    }

    if (!formData.fullName.trim()) {
      toast({
        title: "Error",
        description: "Full name is required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Import API client
      const { api } = await import("../lib/api");

      const data = (await api.users.updateProfile(formData)) as ApiResponse;

      if (data.success) {
        setProfileData(data.profile || null);
        toast({
          title: "Success",
          description: "Profile updated successfully!",
        });

        // Redirect to dashboard after successful update
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      } else {
        throw new Error(data.message || "Failed to update profile");
      }
    } catch (error: any) {
      console.error("Profile update error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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

  if (status === "loading" || fetchingProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {status === "loading" ? "Loading..." : "Loading profile data..."}
          </p>
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
                Update Profile
              </h1>
              <p className="text-gray-600">Update your profile information</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => router.push("/dashboard")}
                variant="outline"
              >
                Back to Dashboard
              </Button>
              <Button onClick={handleLogout} variant="outline">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Profile Information
              </h2>
              <p className="text-sm text-gray-600">
                Update your personal information and social media links
                {profileData && (
                  <span className="ml-2 text-green-600 text-xs">
                    ✓ Data loaded
                  </span>
                )}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label
                  htmlFor="bio"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tell us about yourself..."
                />
              </div>

              {/* Avatar URL */}
              <div>
                <label
                  htmlFor="avatarUrl"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Avatar URL
                </label>
                <input
                  type="url"
                  id="avatarUrl"
                  name="avatarUrl"
                  value={formData.avatarUrl}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/your-avatar.jpg"
                />
              </div>

              {/* Social Media Links */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Social Media Links
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="instagram"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Instagram
                    </label>
                    <input
                      type="url"
                      id="instagram"
                      name="instagram"
                      value={formData.instagram}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://instagram.com/yourusername"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="tiktok"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      TikTok
                    </label>
                    <input
                      type="url"
                      id="tiktok"
                      name="tiktok"
                      value={formData.tiktok}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://tiktok.com/@yourusername"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="xAccount"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      X (Twitter)
                    </label>
                    <input
                      type="url"
                      id="xAccount"
                      name="xAccount"
                      value={formData.xAccount}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://x.com/yourusername"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="facebook"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Facebook
                    </label>
                    <input
                      type="url"
                      id="facebook"
                      name="facebook"
                      value={formData.facebook}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://facebook.com/yourusername"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="youtube"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      YouTube
                    </label>
                    <input
                      type="url"
                      id="youtube"
                      name="youtube"
                      value={formData.youtube}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://youtube.com/@yourusername"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="linkedin"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      LinkedIn
                    </label>
                    <input
                      type="url"
                      id="linkedin"
                      name="linkedin"
                      value={formData.linkedin}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://linkedin.com/in/yourusername"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/dashboard")}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="min-w-[120px]"
                >
                  {loading ? "Updating..." : "Update Profile"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Toaster />
    </div>
  );
}
