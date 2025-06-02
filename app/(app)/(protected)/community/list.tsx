import CommunitiesList from '@/components/community/CommunitiesList';
import { useRouter } from 'expo-router';
import React from 'react';

interface Community {
  id: string;
  name: string;
  logo: string;
  description: string;
  memberCount: number;
  isFollowing: boolean;
}

const CommunitiesListScreen = () => {
  const router = useRouter();

  const handleCommunityPress = (community: Community) => {
    // Navigate to the community detail screen
    router.push(`/(app)/(protected)/community/${community.id}`);
  };

  const handleBack = () => {
    // Navigate back to the main community screen
    router.back();
  };

  return (
    <CommunitiesList 
      onCommunityPress={handleCommunityPress}
      onBack={handleBack}
      showBackButton={true}
    />
  );
};

export default CommunitiesListScreen; 