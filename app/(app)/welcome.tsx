import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Dimensions, Image, StatusBar, View } from "react-native";
import Animated, {
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withRepeat,
	withSequence,
	withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Colors } from "@/constants/Colors";

const { width, height } = Dimensions.get('window');

// Responsive helper functions
const wp = (percentage: number) => (width * percentage) / 100;
const hp = (percentage: number) => (height * percentage) / 100;
const responsiveFontSize = (size: number) => Math.sqrt((height * width) / (375 * 812)) * size;

export default function WelcomeScreen() {
	const router = useRouter();

	// Animation values
	const float1 = useSharedValue(0);
	const float2 = useSharedValue(0);
	const float3 = useSharedValue(0);
	const rotate1 = useSharedValue(0);
	const rotate2 = useSharedValue(0);
	const scale1 = useSharedValue(1);
	const scale2 = useSharedValue(1);
	const scale3 = useSharedValue(1);
	const opacity1 = useSharedValue(0.5);
	const opacity2 = useSharedValue(0.3);

	useEffect(() => {
		// Floating animations
		float1.value = withRepeat(
			withSequence(
				withTiming(10, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
				withTiming(0, { duration: 3000, easing: Easing.inOut(Easing.sin) })
			),
			-1,
			false
		);

		float2.value = withRepeat(
			withSequence(
				withTiming(-8, { duration: 2500, easing: Easing.inOut(Easing.sin) }),
				withTiming(0, { duration: 2500, easing: Easing.inOut(Easing.sin) })
			),
			-1,
			false
		);

		float3.value = withRepeat(
			withSequence(
				withTiming(6, { duration: 4000, easing: Easing.inOut(Easing.sin) }),
				withTiming(0, { duration: 4000, easing: Easing.inOut(Easing.sin) })
			),
			-1,
			false
		);

		// Rotation animations
		rotate1.value = withRepeat(
			withTiming(360, { duration: 20000, easing: Easing.linear }),
			-1,
			false
		);

		rotate2.value = withRepeat(
			withTiming(-360, { duration: 15000, easing: Easing.linear }),
			-1,
			false
		);

		// Scale animations
		scale1.value = withRepeat(
			withSequence(
				withTiming(1.2, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
				withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.sin) })
			),
			-1,
			false
		);

		scale2.value = withRepeat(
			withSequence(
				withTiming(0.8, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
				withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.sin) })
			),
			-1,
			false
		);

		scale3.value = withRepeat(
			withSequence(
				withTiming(1.1, { duration: 2500, easing: Easing.inOut(Easing.sin) }),
				withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.sin) })
			),
			-1,
			false
		);

		// Opacity animations
		opacity1.value = withRepeat(
			withSequence(
				withTiming(0.1, { duration: 3500, easing: Easing.inOut(Easing.sin) }),
				withTiming(0.5, { duration: 3500, easing: Easing.inOut(Easing.sin) })
			),
			-1,
			false
		);

		opacity2.value = withRepeat(
			withSequence(
				withTiming(0.6, { duration: 4500, easing: Easing.inOut(Easing.sin) }),
				withTiming(0.2, { duration: 4500, easing: Easing.inOut(Easing.sin) })
			),
			-1,
			false
		);
	}, []);

	// Animated styles
	const floatingStyle1 = useAnimatedStyle(() => ({
		transform: [{ translateY: float1.value }],
	}));

	const floatingStyle2 = useAnimatedStyle(() => ({
		transform: [{ translateY: float2.value }],
	}));

	const floatingStyle3 = useAnimatedStyle(() => ({
		transform: [{ translateY: float3.value }],
	}));

	const rotatingStyle1 = useAnimatedStyle(() => ({
		transform: [{ rotate: `${rotate1.value}deg` }],
	}));

	const rotatingStyle2 = useAnimatedStyle(() => ({
		transform: [{ rotate: `${rotate2.value}deg` }],
	}));

	const scalingStyle1 = useAnimatedStyle(() => ({
		transform: [{ scale: scale1.value }],
	}));

	const scalingStyle2 = useAnimatedStyle(() => ({
		transform: [{ scale: scale2.value }],
	}));

	const scalingStyle3 = useAnimatedStyle(() => ({
		transform: [{ scale: scale3.value }],
	}));

	const opacityStyle1 = useAnimatedStyle(() => ({
		opacity: opacity1.value,
	}));

	const opacityStyle2 = useAnimatedStyle(() => ({
		opacity: opacity2.value,
	}));

	return (
		<SafeAreaView className="flex-1 bg-red-800">
			<StatusBar barStyle="light-content" backgroundColor="#9a0f21" />
			
			{/* Background Gradient */}
			<LinearGradient
				colors={['#9a0f21', '#c41e3a', '#9a0f21']}
				className="absolute inset-0"
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 1 }}
			/>
			
			{/* Background Decorative Elements */}
			<View className="absolute inset-0">
				{/* Large background circles with floating animation */}
				<Animated.View 
					style={[floatingStyle1]}
					className="absolute top-16 right-12 w-20 h-20 bg-white/5 rounded-full" 
				/>
				<Animated.View 
					style={[scalingStyle1]}
					className="absolute top-32 left-8 w-16 h-16 bg-white/8 rounded-full" 
				/>
				<Animated.View 
					style={[floatingStyle2]}
					className="absolute top-48 right-20 w-12 h-12 bg-white/6 rounded-full" 
				/>
				<Animated.View 
					style={[scalingStyle2]}
					className="absolute bottom-40 left-16 w-24 h-24 bg-white/4 rounded-full" 
				/>
				<Animated.View 
					style={[floatingStyle3]}
					className="absolute bottom-32 right-6 w-14 h-14 bg-white/7 rounded-full" 
				/>
				
				{/* Medium decorative shapes with rotation */}
				<Animated.View 
					style={[rotatingStyle1]}
					className="absolute top-24 left-20 w-8 h-8 bg-white/10 rounded-lg" 
				/>
				<Animated.View 
					style={[scalingStyle3, floatingStyle1]}
					className="absolute top-56 right-16 w-6 h-12 bg-white/8 rounded-full" 
				/>
				<Animated.View 
					style={[opacityStyle1]}
					className="absolute bottom-48 right-24 w-10 h-6 bg-white/6 rounded-full" 
				/>
				<Animated.View 
					style={[rotatingStyle2]}
					className="absolute bottom-60 left-12 w-4 h-8 bg-white/9 rounded-lg" 
				/>
				
				{/* Small floating dots with opacity animation */}
				<Animated.View 
					style={[opacityStyle1, floatingStyle2]}
					className="absolute top-28 right-32 w-2 h-2 bg-white/25 rounded-full" 
				/>
				<Animated.View 
					style={[scalingStyle1]}
					className="absolute top-44 left-32 w-1.5 h-1.5 bg-white/30 rounded-full" 
				/>
				<Animated.View 
					style={[opacityStyle2]}
					className="absolute top-52 right-28 w-1 h-1 bg-white/35 rounded-full" 
				/>
				<Animated.View 
					style={[floatingStyle3, scalingStyle2]}
					className="absolute bottom-36 left-8 w-2.5 h-2.5 bg-white/20 rounded-full" 
				/>
				<Animated.View 
					style={[opacityStyle1]}
					className="absolute bottom-52 right-12 w-1.5 h-1.5 bg-white/28 rounded-full" 
				/>
				<Animated.View 
					style={[floatingStyle1]}
					className="absolute bottom-44 left-28 w-1 h-1 bg-white/32 rounded-full" 
				/>
				
				{/* Rectangular decorative elements with combined animations */}
				<Animated.View 
					style={[floatingStyle2, opacityStyle2]}
					className="absolute top-36 left-2 w-3 h-12 bg-white/6 rounded-lg" 
				/>
				<Animated.View 
					style={[scalingStyle3]}
					className="absolute top-60 right-4 w-2 h-8 bg-white/8 rounded-full" 
				/>
				<Animated.View 
					style={[floatingStyle3, rotatingStyle1]}
					className="absolute bottom-24 left-4 w-4 h-10 bg-white/5 rounded-lg" 
				/>
				<Animated.View 
					style={[opacityStyle1, scalingStyle1]}
					className="absolute bottom-56 right-8 w-2.5 h-6 bg-white/7 rounded-full" 
				/>
			</View>
			
			{/* Logo Container */}
			<View className="absolute top-20 left-5 z-10">
				<View className="w-16 h-16 bg-white rounded-full justify-center items-center shadow-lg">
					<Image
						source={require("@/assets/images/logo/dc-logo-red.png")}
						className="w-12 h-12"
						resizeMode="contain"
					/>
				</View>
			</View>

			{/* Title Section */}
			<View className="absolute top-36 left-5 right-5 z-10">
				<Text 
					className="text-white font-black text-5xl leading-tight tracking-tight"
					style={{
						textShadowColor: 'rgba(0, 0, 0, 0.3)',
						textShadowOffset: { width: 2, height: 2 },
						textShadowRadius: 4,
					}}
				>
					Dream Big
				</Text>
				<Text 
					className="text-white font-black text-5xl leading-tight tracking-tight -mt-2"
					style={{
						textShadowColor: 'rgba(0, 0, 0, 0.3)',
						textShadowOffset: { width: 2, height: 2 },
						textShadowRadius: 4,
					}}
				>
					Work Hard
				</Text>
			</View>

			{/* Illustration Container */}
			<View className="flex-1 relative overflow-hidden">
				<View 
					className="absolute left-[-15%] bottom-[12%] z-20"
					style={{ transform: [{ rotate: '-5deg' }] }}
				>
					<Image
						source={require("@/assets/images/home/face1.png")}
						style={{ width: width * 0.8, height: height * 0.45 }}
						resizeMode="contain"
					/>
				</View>
				<View 
					className="absolute right-[-8%] bottom-[15%] z-10"
					style={{ transform: [{ rotate: '10deg' }] }}
				>
					<Image
						source={require("@/assets/images/home/face2.png")}
						style={{ width: width * 0.6, height: height * 0.35 }}
						resizeMode="contain"
					/>
				</View>
				
				{/* Floating Elements for Visual Interest */}
				<View className="absolute top-[30%] right-10 w-3 h-3 bg-white/30 rounded-full z-30" />
				<View className="absolute top-[40%] left-15 w-2 h-2 bg-white/20 rounded-full z-30" />
				<View className="absolute top-[25%] left-10 w-1 h-1 bg-white/40 rounded-full z-30" />
				<View className="absolute top-[35%] right-20 w-1.5 h-1.5 bg-white/25 rounded-full z-30" />
			</View>

			{/* Button Container */}
			<View className="absolute bottom-12 left-5 right-5 z-10">
				{/* Button Shadow */}
				<View className="absolute top-1 left-1 right-1 h-12 bg-black/10 rounded-full" />
				
				<Button
					className="bg-white h-12 rounded-full justify-center items-center shadow-xl border border-white/20"
					style={{
						shadowColor: '#000',
						shadowOffset: { width: 0, height: 6 },
						shadowOpacity: 0.3,
						shadowRadius: 10,
						elevation: 12,
					}}
					onPress={() => router.push("/login")}
				>
					<Text 
						className="font-bold text-lg tracking-wide"
						style={{ color: Colors.light.primary }}
					>
						Get Started
					</Text>
				</Button>
			</View>

			{/* Additional Decorative Elements */}
			<View className="absolute top-[20%] right-8 w-8 h-8 border-2 border-white/20 rounded-full z-5" />
			<View className="absolute top-[45%] left-8 w-6 h-6 border border-white/15 rounded-full z-5" />
		</SafeAreaView>
	);
}
