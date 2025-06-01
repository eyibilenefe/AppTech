import { MaterialIcons } from '@expo/vector-icons';
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { ActivityIndicator, Dimensions, Image, KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View } from "react-native";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormField, FormInput } from "@/components/ui/form";
import { Text } from "@/components/ui/text";
import { useSupabase } from "@/context/supabase-provider";

// Hide the header for this screen
export const options = {
	headerShown: false,
};

// Define theme colors
const COLORS = {
	primary: '#E53935', // Red color
	secondary: '#FF5252',
	text: '#333',
	lightText: '#666',
	background: '#fff',
	inputBg: 'rgba(255, 255, 255, 0.9)',
};

const { width, height } = Dimensions.get('window');

const formSchema = z.object({
	email: z.string().email("Please enter a valid email address."),
	password: z
		.string()
		.min(8, "Please enter at least 8 characters.")
		.max(64, "Please enter fewer than 64 characters."),
});

export default function SignIn() {
	const { signInWithUniversityApi, signInWithPassword } = useSupabase();
	const [passwordVisible, setPasswordVisible] = useState(false);
	const [rememberMe, setRememberMe] = useState(false);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	async function onSubmit(data: z.infer<typeof formSchema>) {
		try {
			await signInWithUniversityApi(data.email, data.password);
            // await signInWithPassword(data.email, data.password);
			form.reset();
		} catch (error: Error | any) {
			console.log("onSubmit error after signInWithUniversityApi:", error.message);
		}
	}

	const togglePasswordVisibility = () => {
		setPasswordVisible(!passwordVisible);
	};

	const toggleRememberMe = () => {
		setRememberMe(!rememberMe);
	};

	return (
		<KeyboardAvoidingView 
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			style={styles.container}
		>
			<StatusBar barStyle="dark-content" />
			
			<Image
				source={require("@/assets/images/login_screen/teknopark.jpg")}
				style={styles.backgroundImage}
				resizeMode="cover"
			/>

			<Image 
				source={require('@/assets/images/home/signin-bg.png')}
				style={styles.backgroundImage}
				resizeMode="cover"
			/>
			
			<View style={styles.logoContainer}>
				<Image
					source={require("@/assets/images/logo/dc-logo-black.png")}
					style={styles.logo}
				/>
			</View>

			<View style={styles.title}>
				<Text className="text-4xl font-bold text-white">Sign In</Text>
			</View>


			<KeyboardAvoidingView 
                style={styles.formContainer}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
				<ScrollView 
					showsVerticalScrollIndicator={false} 
					className="flex-1"
					keyboardShouldPersistTaps="handled"
					contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
				>
					{/* Form Header */}
					<View className="mb-8">
						<Text className="text-2xl font-bold text-gray-800 mb-2">Welcome Back</Text>
						<Text className="text-base text-gray-500">Sign in to continue to your account</Text>
					</View>

					<Form {...form}>
						<View className="flex flex-col gap-4">
							{/* Email Field */}
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<View className="space-y-4">
										<Text className="text-sm font-medium text-gray-700 ml-1">Email Address</Text>
										<View className="relative">
											<View className="absolute left-6 top-1/2 -translate-y-1/2 z-10">
												<MaterialIcons name="mail-outline" size={24} color="#EF4444" />
											</View>
											<FormInput
                                                style={{
                                                    height: 56,
                                                }}
												className="pl-16 pr-6 bg-white border-2 border-gray-200 rounded-xl text-gray-800 placeholder:text-gray-400 focus:border-red-500 focus:bg-red-50/30 transition-colors text-base"
												placeholder="Enter your email"
												autoCapitalize="none"
												autoComplete="email"
												autoCorrect={false}
												keyboardType="email-address"
												keyboardAppearance="light"
												placeholderTextColor="#9CA3AF"
												{...field}
											/>
										</View>
									</View>
								)}
							/>

							{/* Password Field */}
							<FormField
								control={form.control}
								name="password"
								render={({ field }) => (
									<View className="space-y-4 mb-6">
										<Text className="text-sm font-medium text-gray-700 ml-1">Password</Text>
										<View className="relative">
											<View className="absolute left-6 top-1/2 -translate-y-1/2 z-10">
												<MaterialIcons name="lock-outline" size={24} color="#EF4444" />
											</View>
											<FormInput
                                                style={{
                                                    height: 56,
                                                }}
												className="pl-16 pr-16 bg-white border-2 border-gray-200 rounded-xl text-gray-800 placeholder:text-gray-400 focus:border-red-500 focus:bg-red-50/30 transition-colors text-base"
												placeholder="Enter your password"
												autoCapitalize="none"
												autoCorrect={false}
												secureTextEntry={!passwordVisible}
												keyboardAppearance="light"
												keyboardType="default"
												placeholderTextColor="#9CA3AF"
												{...field}
											/>
											<TouchableOpacity 
												className="absolute right-6 top-1/2 -translate-y-1/2 z-10 p-2" 
												onPress={togglePasswordVisibility}
												activeOpacity={0.7}
											>
												<MaterialIcons 
													name={passwordVisible ? "visibility" : "visibility-off"} 
													size={24} 
													color="#6B7280" 
												/>
											</TouchableOpacity>
										</View>
									</View>
								)}
							/>
						</View>
					</Form>

					{/* Login Button */}
					<View className="mt-8">
						<Button
							className="h-14 bg-gradient-to-r from-red-500 to-red-600 rounded-xl active:scale-[0.98] transition-transform"
							style={{
								backgroundColor: '#EF4444',
								elevation: 8,
							}}
							onPress={form.handleSubmit(onSubmit)}
							disabled={form.formState.isSubmitting}
						>
							{form.formState.isSubmitting ? (
								<View className="flex-row items-center justify-center space-x-2">
									<ActivityIndicator color="#fff" size="small" />
									<Text className="text-white font-semibold text-base ml-2">Signing In...</Text>
								</View>
							) : (
								<Text className="text-white font-semibold text-base tracking-wide">Sign In</Text>
							)}
						</Button>
					</View>

					{/* Forgot Password Link */}
					<View className="mt-6 items-center">
						<TouchableOpacity activeOpacity={0.7}>
							<Text className="text-red-500 font-medium text-sm">Forgot your password?</Text>
						</TouchableOpacity>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: COLORS.background,
	},
	backgroundImage: {
		position: 'absolute',
		top: 0,
		width: width,
		height: height * 0.5,
	},
	logoContainer: {
		position: 'absolute',
		top: 60,
		left: 20,
		width: 50,
		height: 50,
		backgroundColor: 'rgba(255, 255, 255, 0.95)',
		borderRadius: 25,
		justifyContent: 'center',
		alignItems: 'center',
		elevation: 4,
	},
	logo: {
		width: 40,
		height: 40,
	},
	title: {
		fontSize: 32,
		fontWeight: '700',
		color: COLORS.text,
		position: 'absolute',
		top: 120,
		left: 20,
	},
	formContainer: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		height: height * 0.65,
		backgroundColor: 'rgba(255, 255, 255, 0.98)',
		borderTopLeftRadius: 30,
		borderTopRightRadius: 30,
		paddingHorizontal: 24,
		paddingTop: 40,
		paddingBottom: 40,
		elevation: 10,
	},
	inputsContainer: {
		marginTop: 20,
	},
	inputWrapper: {
		flexDirection: 'row',
		alignItems: 'center',
		width: '100%',
		height: 56,
		backgroundColor: 'rgba(255, 255, 255, 0.9)',
		borderRadius: 12,
		marginBottom: 20,
		position: 'relative',
	},
	input: {
		height: 56,
		paddingLeft: 48,
		paddingRight: 16,
		fontSize: 16,
		color: COLORS.text,
	},
	iconContainer: {
		position: 'absolute',
		left: 16,
		width: 24,
		height: 56,
		justifyContent: 'center',
		alignItems: 'center',
		zIndex: 10,
	},
	rightIconContainer: {
		position: 'absolute',
		right: 16,
		width: 24,
		height: 56,
		justifyContent: 'center',
		alignItems: 'center',
		zIndex: 10,
	},
	optionsContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginTop: 10,
		marginBottom: 10,
	},
	rememberContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	checkbox: {
		width: 20,
		height: 20,
		borderWidth: 2,
		borderColor: COLORS.primary,
		borderRadius: 4,
		justifyContent: 'center',
		alignItems: 'center',
	},
	checkboxChecked: {
		backgroundColor: COLORS.primary,
	},
	rememberText: {
		color: COLORS.lightText,
		fontSize: 14,
	},
	forgotText: {
		color: COLORS.primary,
		fontSize: 14,
		fontWeight: '500',
	},
	loginButton: {
		backgroundColor: COLORS.primary,
		height: 56,
		borderRadius: 28,
		marginTop: 40,
		justifyContent: 'center',
		alignItems: 'center',
		shadowColor: COLORS.primary,
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 8,
	},
	loginButtonText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: '600',
	},
	signupContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 24,
	},
	signupText: {
		color: COLORS.lightText,
		fontSize: 14,
	},
	signupLink: {
		color: COLORS.primary,
		fontSize: 14,
		fontWeight: '600',
	},
});
