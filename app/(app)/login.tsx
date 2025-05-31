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
	const { signInWithPassword } = useSupabase();
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
			await signInWithPassword(data.email, data.password);
			form.reset();
		} catch (error: Error | any) {
			console.log(error.message);
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
				<Text className="text-4xl font-bold text-white">Login</Text>
			</View>


			<View style={styles.formContainer}>
				<ScrollView showsVerticalScrollIndicator={false}>
					<Form {...form}>
						<View style={styles.inputsContainer}>
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<View style={styles.inputWrapper}>
										<View style={styles.iconContainer}>
											<MaterialIcons name="mail-outline" size={20} color={COLORS.lightText} />
										</View>
										<FormInput
											style={styles.input}
											placeholder="Email"
											autoCapitalize="none"
											autoComplete="email"
											autoCorrect={false}
											keyboardType="email-address"
											placeholderTextColor="#999"
											{...field}
										/>
									</View>
								)}
							/>
							<FormField
								control={form.control}
								name="password"
								render={({ field }) => (
									<View style={styles.inputWrapper}>
										<View style={styles.iconContainer}>
											<MaterialIcons name="lock-outline" size={20} color={COLORS.lightText} />
										</View>
										<FormInput
											style={styles.input}
											placeholder="Password"
											autoCapitalize="none"
											autoCorrect={false}
											secureTextEntry={!passwordVisible}
											placeholderTextColor="#999"
											{...field}
										/>
										<TouchableOpacity style={styles.rightIconContainer} onPress={togglePasswordVisibility}>
											<MaterialIcons 
												name={passwordVisible ? "visibility" : "visibility-off"} 
												size={20} 
												color={COLORS.lightText} 
											/>
										</TouchableOpacity>
									</View>
								)}
							/>

							<View style={styles.optionsContainer}>
								<TouchableOpacity style={styles.rememberContainer} onPress={toggleRememberMe}>
									<View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
										{rememberMe && <MaterialIcons name="check" size={16} color="#fff" />}
									</View>
									<Text style={styles.rememberText}>Remember me</Text>
								</TouchableOpacity>
								<TouchableOpacity>
									<Text style={styles.forgotText}>Forgot password?</Text>
								</TouchableOpacity>
							</View>
						</View>
					</Form>

					<Button
						style={styles.loginButton}
						onPress={form.handleSubmit(onSubmit)}
						disabled={form.formState.isSubmitting}
					>
						{form.formState.isSubmitting ? (
							<ActivityIndicator color="#fff" size="small" />
						) : (
							<Text style={styles.loginButtonText}>LOGIN</Text>
						)}
					</Button>
				</ScrollView>
			</View>
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
		backgroundColor: COLORS.background,
		borderRadius: 25,
		justifyContent: 'center',
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 4,
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
		height: height * 0.65, // Increased height to ensure form is visible
		backgroundColor: COLORS.background,
		borderTopLeftRadius: 30,
		borderTopRightRadius: 30,
		paddingHorizontal: 24,
		paddingTop: 40,
		paddingBottom: 40,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: -3,
		},
		shadowOpacity: 0.1,
		shadowRadius: 10,
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
		flex: 1,
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
