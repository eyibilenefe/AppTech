import { MaterialIcons } from '@expo/vector-icons';
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
	ActivityIndicator,
	Dimensions,
	Image,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	StatusBar,
	StyleSheet,
	TouchableOpacity,
	View,
	Animated,
} from "react-native";
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
	const { signInWithUniversityApi } = useSupabase();
	const [passwordVisible, setPasswordVisible] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [username, setUsername] = useState<string | null>(null);

    const welcomeAnimation = useState(new Animated.Value(0))[0];

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	async function onSubmit(data: z.infer<typeof formSchema>) {
		try {
			setIsLoading(true);
			setError(null);
			await signInWithUniversityApi(data.email, data.password);
			form.reset();
		} catch (error: Error | any) {
			console.error("Login error:", error);
			setError(error.message || "An error occurred during login");
		} finally {
			setIsLoading(false);
		}
	}

	const togglePasswordVisibility = () => {
		setPasswordVisible(!passwordVisible);
	};

	const handleEmailChange = (text: string) => {
		form.setValue("email", text);
        // Regex for isimsoyisim@std.iyte.edu.tr or isimsoyisim@iyte.edu.tr
		const regex = /^([a-zA-Z0-9_.-]+)@(?:std\.)?iyte\.edu\.tr$/i;
		const match = text.match(regex);

		if (match) {
			const name = match[1].replace(/[._-]/g, ' '); // Replace dots, underscores, or hyphens with a space
            const formattedName = name.split(' ').map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join(' ');
			setUsername(`Merhaba, ${formattedName}`);
            Animated.timing(welcomeAnimation, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
		} else {
			setUsername(null);
            Animated.timing(welcomeAnimation, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
		}
	};


	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			style={styles.container}
		>
			<StatusBar barStyle="light-content" />

			{/* Background Images */}
			<View style={styles.backgroundImageContainer}>
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
			</View>

			{/* Header */}
            <View style={styles.headerContainer}>
                <View style={styles.logoContainer}>
                    <Image
                        source={require("@/assets/images/logo/dc-logo-black.png")}
                        style={styles.logo}
                    />
                </View>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Sign In</Text>
                    {username && (
                        <Animated.View style={{ opacity: welcomeAnimation }}>
                            <Text style={styles.welcomeMessage}>{username}</Text>
                        </Animated.View>
                    )}
                </View>
            </View>


			{/* Form */}
			<ScrollView
				style={styles.formScrollView}
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps="handled"
				contentContainerStyle={styles.formContentContainer}
			>
					<Form {...form}>
						<View style={{ gap: 16, flexDirection: 'column' }}>
							{/* Email Field */}
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<View style={{ marginBottom: 16 }}>
										<Text style={styles.label}>
											Email Address
										</Text>
										<View style={styles.inputContainer}>
											<MaterialIcons name="mail-outline" size={24} color="#EF4444" style={styles.icon} />
											<FormInput
												style={styles.input}
												placeholder="isimsoyisim@iyte.edu.tr"
												autoCapitalize="none"
												autoComplete="email"
												autoCorrect={false}
												keyboardType="email-address"
												keyboardAppearance="light"
												placeholderTextColor="#9CA3AF"
												{...field}
												onChangeText={handleEmailChange}
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
									<View style={{ marginBottom: 24 }}>
										<Text style={styles.label}>
											Password
										</Text>
										<View style={styles.inputContainer}>
											<MaterialIcons name="lock-outline" size={24} color="#EF4444" style={styles.icon} />
											<FormInput
												style={styles.input}
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
												style={styles.rightIcon}
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
					<View style={{ marginTop: 32 }}>
						<Button
							style={styles.loginButton}
							onPress={form.handleSubmit(onSubmit)}
							disabled={form.formState.isSubmitting}
						>
							{form.formState.isSubmitting ? (
								<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
									<ActivityIndicator color="#fff" size="small" />
									<Text style={styles.loginButtonText}>
										Signing In...
									</Text>
								</View>
							) : (
								<Text style={styles.loginButtonText}>
									Sign In
								</Text>
							)}
						</Button>
					</View>

					{/* Forgot Password Link */}
					<View style={{ marginTop: 24, alignItems: 'center' }}>
						<TouchableOpacity activeOpacity={0.7}>
							<Text style={styles.forgotText}>
								Forgot your password?
							</Text>
						</TouchableOpacity>
					</View>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: COLORS.background,
	},
	backgroundImageContainer: {
		position: 'absolute',
		top: 0,
		left: 0,
		width: '100%',
		height: height * 0.5,
	},
	backgroundImage: {
		position: 'absolute',
		width: '100%',
		height: '100%',
	},
    headerContainer: {
        height: height * 0.4,
        justifyContent: 'flex-start',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
	logoContainer: {
		position: 'absolute',
		top: (Platform.OS === 'android' ? StatusBar.currentHeight : 0) + 40,
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
	titleContainer: {
		position: 'absolute',
		top: (Platform.OS === 'android' ? StatusBar.currentHeight : 0) + 100,
		left: 20,
	},
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: 'white',
        textShadowColor: 'rgba(0, 0, 0, 0.25)',
        textShadowOffset: {width: 0, height: 2},
        textShadowRadius: 4,
    },
    welcomeMessage: {
        fontSize: 20,
        fontWeight: '600',
        color: 'white',
        marginTop: 8,
        textShadowColor: 'rgba(0, 0, 0, 0.25)',
        textShadowOffset: {width: 0, height: 1},
        textShadowRadius: 2,
    },
	formScrollView: {
        flex: 1,
		backgroundColor: 'white',
		borderTopLeftRadius: 30,
		borderTopRightRadius: 30,
		elevation: 10,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: -10 },
		shadowOpacity: 0.1,
		shadowRadius: 10,
	},
    formContentContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
		paddingVertical: 40,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginLeft: 4,
        marginBottom: 8
    },
    inputContainer: {
        position: 'relative',
        justifyContent: 'center'
    },
	input: {
		height: 56,
		paddingLeft: 56,
		paddingRight: 56, // Make space for the right icon
		backgroundColor: 'white',
		borderWidth: 2,
		borderColor: '#E5E7EB',
		borderRadius: 16,
		color: '#111827',
		fontSize: 16,
	},
	icon: {
		position: 'absolute',
		left: 20,
		zIndex: 1,
	},
	rightIcon: {
		position: 'absolute',
		right: 16,
		zIndex: 1,
		padding: 4,
        height: '100%',
        justifyContent: 'center',
	},
	loginButton: {
		height: 56,
		backgroundColor: '#EF4444',
		borderRadius: 16,
		elevation: 8,
		justifyContent: 'center',
		alignItems: 'center',
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
	},
    loginButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16
    },
    forgotText: {
        color: '#EF4444',
        fontWeight: '500',
        fontSize: 14
    }
});
''
