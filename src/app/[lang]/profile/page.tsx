'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import UserProfile from '@/components/user-auth/UserProfile';

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <UserProfile />
    </ProtectedRoute>
  );
} 