import Community from '@/app/(app)/(protected)/community';
import React, { useState } from 'react';
import { View } from 'react-native';
import CommunitiesList from './CommunitiesList';
import CommunityProfile from './CommunityProfile';
import EventDetail from './EventDetail';

type Screen = 'feed' | 'communities' | 'profile' | 'event';

interface CommunityData {
  id: string;
  name: string;
  logo: string;
  description: string;
  memberCount: number;
  isFollowing: boolean;
  bannerColor: string;
  eventCount: number;
}

interface EventData {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
  community: {
    name: string;
    logo: string;
  };
  thumbnail: string;
  description: string;
  tags: string[];
  attendeeCount: number;
  isJoined: boolean;
  posterColor: string;
}

const mockCommunity: CommunityData = {
  id: 'cs',
  name: 'Computer Science Club',
  logo: '💻',
  description: 'A community for computer science students and enthusiasts. We organize workshops, hackathons, coding competitions, and tech talks. Join us to learn, collaborate, and advance your programming skills while connecting with like-minded individuals.',
  memberCount: 234,
  isFollowing: true,
  bannerColor: '#9a0f21',
  eventCount: 12,
};

const mockEvent: EventData = {
  id: '1',
  name: 'React Native Workshop',
  date: 'December 15, 2024',
  time: '2:00 PM',
  location: 'Computer Lab 101, Engineering Building',
  community: {
    name: 'Computer Science Club',
    logo: '💻',
  },
  thumbnail: '💻',
  description: 'Learn the fundamentals of React Native development in this hands-on workshop. We\'ll cover setting up your development environment, creating your first app, navigation, state management, and deploying to both iOS and Android. Perfect for students with basic React knowledge who want to dive into mobile development.',
  tags: ['Workshop', 'Mobile Development', 'React Native', 'Programming'],
  attendeeCount: 45,
  isJoined: false,
  posterColor: '#9a0f21',
};

const CommunityDemo: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('feed');

  const handleCommunityPress = (community: any) => {
    setCurrentScreen('profile');
  };

  const handleEventPress = (event?: any) => {
    setCurrentScreen('event');
  };

  const goBack = () => {
    switch (currentScreen) {
      case 'communities':
      case 'profile':
      case 'event':
        setCurrentScreen('feed');
        break;
      default:
        break;
    }
  };

  const goToCommunities = () => {
    setCurrentScreen('communities');
  };

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'feed':
        return <Community />;
      
      case 'communities':
        return (
          <CommunitiesList 
            onCommunityPress={handleCommunityPress}
          />
        );
      
      case 'profile':
        return (
          <CommunityProfile 
            community={mockCommunity}
            onBack={goBack}
            onEventPress={handleEventPress}
          />
        );
      
      case 'event':
        return (
          <EventDetail 
            event={mockEvent}
            onBack={goBack}
            onCommunityPress={() => setCurrentScreen('profile')}
          />
        );
      
      default:
        return <Community />;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {renderCurrentScreen()}
    </View>
  );
};

export default CommunityDemo; 