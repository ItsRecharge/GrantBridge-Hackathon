import { createContext, useState } from 'react';

export const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateProfile = (profileData) => {
    setProfile(profileData);
  };

  const clearProfile = () => {
    setProfile(null);
  };

  const value = {
    profile,
    loading,
    error,
    updateProfile,
    clearProfile,
    setLoading,
    setError,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};
