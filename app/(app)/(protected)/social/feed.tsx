import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import React, { useRef, useState } from 'react';
import {
    Animated,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Dummy data for posts
const dummyPosts = [
  {
    id: '1',
    username: 'john_doe',
    avatar: 'https://via.placeholder.com/40',
    content: 'Just finished my morning workout! Feeling great 💪',
    image: 'https://via.placeholder.com/300x200',
    likes: 23,
    comments: 5,
    shares: 2,
    timestamp: '2 hours ago',
    isAnonymous: false,
  },
  {
    id: '2',
    username: 'Anonymous',
    avatar: 'https://via.placeholder.com/40',
    content: 'Does anyone know a good place to study on campus? The library is always packed!',
    image: null,
    likes: 12,
    comments: 8,
    shares: 1,
    timestamp: '4 hours ago',
    isAnonymous: true,
  },
  {
    id: '3',
    username: 'sarah_smith',
    avatar: 'https://via.placeholder.com/40',
    content: 'Beautiful sunset today! 🌅 Perfect end to a productive day.',
    image: 'https://via.placeholder.com/300x200',
    likes: 45,
    comments: 12,
    shares: 7,
    timestamp: '6 hours ago',
    isAnonymous: false,
  },
  {
    id: '4',
    username: 'Anonymous',
    avatar: 'https://via.placeholder.com/40',
    content: 'Can we talk about how difficult the midterm was? I think I need to find a study group.',
    image: null,
    likes: 34,
    comments: 15,
    shares: 3,
    timestamp: '8 hours ago',
    isAnonymous: true,
  },
];

const SocialFeedScreen = () => {
  const navigation = useNavigation<any>();
  const [searchText, setSearchText] = useState('');
  const [posts] = useState(dummyPosts);
  const insets = useSafeAreaInsets();
  
  // FAB animation and scroll state
  const fabOpacity = useRef(new Animated.Value(1)).current;
  const fabScale = useRef(new Animated.Value(1)).current;
  const scrollY = useRef(0);
  const lastScrollY = useRef(0);
  const fabVisible = useRef(true);

  // Initialize FAB entrance animation
  React.useEffect(() => {
    // Entrance animation
    fabScale.setValue(0);
    fabOpacity.setValue(0);
    
    Animated.parallel([
      Animated.spring(fabScale, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(fabOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePostPress = (post: any) => {
    navigation.navigate('PostDetail', { post });
  };

  const handleCreatePost = () => {
    // Haptic feedback on tap
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Tap animation
    Animated.sequence([
      Animated.timing(fabScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(fabScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    navigation.navigate('CreatePost');
  };

  // Handle scroll to auto-hide/show FAB
  const handleScroll = (event: any) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const diff = currentScrollY - lastScrollY.current;
    
    // Only react to significant scroll changes to avoid jitter
    if (Math.abs(diff) > 5) {
      if (diff > 0 && currentScrollY > 50) {
        // Scrolling down - hide FAB
        if (fabVisible.current) {
          fabVisible.current = false;
          Animated.parallel([
            Animated.timing(fabOpacity, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(fabScale, {
              toValue: 0.8,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start();
        }
      } else if (diff < 0) {
        // Scrolling up - show FAB
        if (!fabVisible.current) {
          fabVisible.current = true;
          Animated.parallel([
            Animated.timing(fabOpacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(fabScale, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start();
        }
      }
    }
    
    lastScrollY.current = currentScrollY;
    scrollY.current = currentScrollY;
  };

  const PostItem = ({ post }: { post: any }) => (
    <TouchableOpacity style={styles.postContainer} onPress={() => handlePostPress(post)}>
      <View style={styles.postHeader}>
        <View style={styles.userInfo}>
          <Image source={{ uri: post.avatar }} style={styles.avatar} />
          <Text style={styles.username}>{post.username}</Text>
        </View>
        <Text style={styles.timestamp}>{post.timestamp}</Text>
      </View>
      
      <Text style={styles.postContent}>{post.content}</Text>
      
      {post.image && (
        <Image source={{ uri: post.image }} style={styles.postImage} />
      )}
      
      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>❤️</Text>
          <Text style={styles.actionCount}>{post.likes}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionCount}>{post.comments}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>📤</Text>
          <Text style={styles.actionCount}>{post.shares}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search posts…"
          value={searchText}
          onChangeText={setSearchText}
        />
        <MaterialIcons name="search" size={24} color="#666" style={styles.searchIcon} />
      </View>

      {/* Posts Feed */}
      <ScrollView 
        style={styles.feedContainer} 
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {posts.map((post) => (
          <PostItem key={post.id} post={post} />
        ))}
      </ScrollView>

      {/* Enhanced Floating Action Button */}
      <Animated.View 
        style={[
          styles.fab,
          {
            opacity: fabOpacity,
            transform: [{ scale: fabScale }],
            bottom: Math.max(120, insets.bottom + 20), // Dynamic bottom positioning
          },
        ]}
      >
        <TouchableOpacity 
          style={styles.fabButton} 
          onPress={handleCreatePost}
          activeOpacity={0.8}
        >
          <MaterialIcons name="add" size={28} color="white" />
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
  searchIcon: {
    marginLeft: 8,
  },
  feedContainer: {
    flex: 1,
  },
  postContainer: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  postContent: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  actionIcon: {
    fontSize: 18,
    marginRight: 4,
  },
  actionCount: {
    fontSize: 14,
    color: '#666',
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  fabButton: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    backgroundColor: '#9a0f21',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SocialFeedScreen; 