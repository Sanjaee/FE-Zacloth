import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "../../components/ui/button";

interface ProfileData {
  id: string;
  fullName: string;
  bio: string | null;
  avatarUrl: string | null;
  username: string;
  createdAt: string;
  socialMedia: {
    instagram: string | null;
    tiktok: string | null;
    xAccount: string | null;
    facebook: string | null;
    youtube: string | null;
    linkedin: string | null;
  };
}

const QRProfilePage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      fetchProfile(id as string);
    }
  }, [id]);

  const fetchProfile = async (profileId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/qr/scan/${profileId}`
      );
      const data = await response.json();

      if (data.success) {
        setProfile(data.profile);
      } else {
        setError(data.message || "Profile not found");
      }
    } catch (err) {
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Profile Not Found
          </h1>
          <p className="text-gray-600 mb-4">
            {error || "The profile you're looking for doesn't exist."}
          </p>
          <Button onClick={() => router.push("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  const socialLinks = [
    { key: "instagram", label: "Instagram", icon: "📷" },
    { key: "tiktok", label: "TikTok", icon: "🎵" },
    { key: "xAccount", label: "X (Twitter)", icon: "🐦" },
    { key: "facebook", label: "Facebook", icon: "👥" },
    { key: "youtube", label: "YouTube", icon: "📺" },
    { key: "linkedin", label: "LinkedIn", icon: "💼" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.fullName}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <span className="text-2xl text-blue-600">
                  {profile.fullName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {profile.fullName}
              </h1>
              <p className="text-gray-600">@{profile.username}</p>
              <p className="text-sm text-gray-500">
                Member since {new Date(profile.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">About</h2>
            <p className="text-gray-700">{profile.bio}</p>
          </div>
        )}

        {/* Social Media Links */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Connect</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {socialLinks.map((social) => {
              const url =
                profile.socialMedia[
                  social.key as keyof typeof profile.socialMedia
                ];
              return (
                <div key={social.key}>
                  {url ? (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <span className="text-xl">{social.icon}</span>
                      <span className="text-sm font-medium text-gray-700">
                        {social.label}
                      </span>
                    </a>
                  ) : (
                    <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg opacity-50">
                      <span className="text-xl">{social.icon}</span>
                      <span className="text-sm font-medium text-gray-500">
                        {social.label}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* QR Code Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <div className="text-blue-600 text-4xl mb-2">📱</div>
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            Scanned via QR Code
          </h3>
          <p className="text-blue-700 text-sm">
            This profile was accessed by scanning a QR code. Share your own QR
            code to let others discover your profile!
          </p>
        </div>
      </div>
    </div>
  );
};

export default QRProfilePage;
