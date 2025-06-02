# Community Components

A comprehensive set of React Native components for managing university communities and events. This module includes multiple screens that work together to provide a complete community management experience.

## Components Overview

### 1. Main Event Feed (`community.tsx`)
The primary community screen that displays events in a feed format.

**Features:**
- Horizontal scrollable community icons
- Filter tags for event categories
- Week navigation with arrows
- Event cards with thumbnails and details
- Integrated filters modal

**Usage:**
```tsx
import Community from '@/app/(app)/(protected)/community';

<Community />
```

### 2. Filters Modal (`FiltersModal.tsx`)
A modal component for filtering events and communities.

**Features:**
- Follow status toggles (All/Following/Not Following)
- Community selection with visual indicators
- Event type filter tags
- Apply/Clear functionality

**Props:**
```tsx
interface FiltersModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
}
```

**Usage:**
```tsx
import FiltersModal from '@/components/community/FiltersModal';

<FiltersModal
  visible={showModal}
  onClose={() => setShowModal(false)}
  onApply={(filters) => console.log(filters)}
/>
```

### 3. Communities List (`CommunitiesList.tsx`)
A searchable list of all communities with alphabetical indexing.

**Features:**
- Search functionality
- Alphabetical section headers
- Right-side alphabet index
- Community cards with member counts
- Following status indicators

**Props:**
```tsx
interface CommunitiesListProps {
  onCommunityPress?: (community: Community) => void;
}
```

**Usage:**
```tsx
import CommunitiesList from '@/components/community/CommunitiesList';

<CommunitiesList 
  onCommunityPress={(community) => navigateToCommunity(community)}
/>
```

### 4. Community Profile (`CommunityProfile.tsx`)
Detailed view of a specific community.

**Features:**
- Banner with gradient overlay
- Community logo and stats
- Follow/Unfollow functionality
- About section
- Upcoming events list
- Contact information

**Props:**
```tsx
interface CommunityProfileProps {
  community: Community;
  onBack?: () => void;
  onEventPress?: (event: Event) => void;
}
```

**Usage:**
```tsx
import CommunityProfile from '@/components/community/CommunityProfile';

<CommunityProfile 
  community={communityData}
  onBack={() => navigation.goBack()}
  onEventPress={(event) => navigateToEvent(event)}
/>
```

### 5. Event Detail (`EventDetail.tsx`)
Detailed view of a specific event.

**Features:**
- Event poster with color background
- Community information
- Event tags
- Date, time, and location details
- Attendee count
- Join/Leave functionality
- Add to calendar and share options
- Event guidelines

**Props:**
```tsx
interface EventDetailProps {
  event: Event;
  onBack?: () => void;
  onCommunityPress?: () => void;
}
```

**Usage:**
```tsx
import EventDetail from '@/components/community/EventDetail';

<EventDetail 
  event={eventData}
  onBack={() => navigation.goBack()}
  onCommunityPress={() => navigateToCommunity()}
/>
```

### 6. Community Demo (`CommunityDemo.tsx`)
A demonstration component showing how all screens work together.

**Features:**
- Screen navigation management
- Mock data for testing
- Example of component integration

## Data Structures

### Community Interface
```tsx
interface Community {
  id: string;
  name: string;
  logo: string;
  description: string;
  memberCount: number;
  isFollowing: boolean;
  bannerColor?: string;
  eventCount?: number;
}
```

### Event Interface
```tsx
interface Event {
  id: string;
  name: string;
  date: string;
  time?: string;
  location: string;
  community: {
    name: string;
    logo: string;
  };
  thumbnail: string;
  description: string;
  tags?: string[];
  attendeeCount?: number;
  isJoined?: boolean;
  posterColor?: string;
}
```

### Filter State Interface
```tsx
interface FilterState {
  followStatus: 'all' | 'following' | 'not_following';
  selectedCommunities: string[];
  eventTypes: string[];
}
```

## Styling

All components use `StyleSheet.create()` and follow a consistent design system:

- **Primary Color**: `#007bff` (Blue)
- **Success Color**: `#4caf50` (Green)
- **Background**: `#fff` (White)
- **Secondary Background**: `#f8f9fa` (Light Gray)
- **Text Colors**: `#333` (Dark), `#666` (Medium), `#999` (Light)

## Dependencies

- `react-native`
- `@expo/vector-icons` (MaterialIcons)
- Standard React Native components (FlatList, ScrollView, etc.)

## Integration with Navigation

These components are designed to work with React Navigation or Expo Router. Each component accepts navigation callbacks as props to handle screen transitions.

Example with Expo Router:
```tsx
import { router } from 'expo-router';

<CommunitiesList 
  onCommunityPress={(community) => 
    router.push(`/community/${community.id}`)
  }
/>
```

## Mock Data

Each component includes mock data for development and testing. In a production app, you would replace this with API calls to your backend service.

## Features Summary

✅ **Complete UI Implementation**: All wireframe requirements implemented
✅ **TypeScript Support**: Fully typed components and interfaces
✅ **Responsive Design**: Works on different screen sizes
✅ **Interactive Elements**: Touch feedback and state management
✅ **Modern UI**: Clean, modern design with shadows and animations
✅ **Accessibility**: Proper button sizing and contrast
✅ **Reusable Components**: Modular and composable design
✅ **Mock Data**: Ready-to-use placeholder content

## Getting Started

1. Import the desired component
2. Provide the required props
3. Handle navigation callbacks
4. Replace mock data with real API calls
5. Customize styling as needed

The components are designed to be plug-and-play while remaining flexible for customization. 