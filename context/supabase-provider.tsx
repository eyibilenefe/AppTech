import { Session, User } from "@supabase/supabase-js";
import { SplashScreen, useRouter, useSegments } from "expo-router";
import { createContext, useContext, useEffect, useState } from "react";
import { Alert } from "react-native";

import { supabase } from "@/utils/supabase";

SplashScreen.preventAutoHideAsync();

// Type for user data from University API
type UniversityUserData = {
	id: string; // UUID
	name: string;
	student_id_no: string;
	department: string;
	email: string;
	tel_no: string;
};

// NEW: Type for user profile from 'users' table
type UserProfile = {
	id: string;
	name: string;
	st_id: string;
	dept: string;
	email: string;
	pp: string | null;
	bio: string | null;
	tel_no: string | null;
	is_valid: boolean;
};

// NEW: Type representing a user coming from the custom /api/login endpoint
type ApiUser = {
	id: string;
	name: string;
	dept: string;
	st_id: string;
	mail: string;
	authToken: string;
};

type SupabaseContextProps = {
	user: User | null;
	profile: UserProfile | null;
	session: Session | null;
	initialized?: boolean;
	apiUser: ApiUser | null;
	signUp: (email: string, password: string) => Promise<void>;
	signInWithPassword: (email: string, password: string) => Promise<void>;
	signInWithMagicLink: (email: string) => Promise<void>;
	signInWithUniversityApi: (email: string, password: string) => Promise<void>;
	signOut: () => Promise<void>;
	refreshProfile: () => Promise<void>;
	updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
	loginWithAPI: (mail: string, password: string) => Promise<void>;
	logoutAPI: () => void;
};

type SupabaseProviderProps = {
	children: React.ReactNode;
};

export const SupabaseContext = createContext<SupabaseContextProps>({
	user: null,
	profile: null,
	session: null,
	initialized: false,
	apiUser: null,
	signUp: async () => {},
	signInWithPassword: async () => {},
	signInWithMagicLink: async () => {},
	signInWithUniversityApi: async () => {},
	signOut: async () => {},
	refreshProfile: async () => {},
	updateProfile: async () => {},
	loginWithAPI: async () => {},
	logoutAPI: () => {},
});

export const useSupabase = () => useContext(SupabaseContext);

export const SupabaseProvider = ({ children }: SupabaseProviderProps) => {
	const router = useRouter();
	const segments = useSegments();
	const [user, setUser] = useState<User | null>(null);
	const [session, setSession] = useState<Session | null>(null);
	const [initialized, setInitialized] = useState<boolean>(false);
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [apiUser, setApiUser] = useState<ApiUser | null>(null);

	const signUp = async (email: string, password: string) => {
		const { error } = await supabase.auth.signUp({
			email,
			password,
		});
		if (error) {
			throw error;
		}
	};

	const signInWithPassword = async (email: string, password: string) => {
		const { error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});
		if (error) {
			throw error;
		}
	};

	const signInWithMagicLink = async (email: string) => {
		const { error } = await supabase.auth.signInWithOtp({
			email,
			options: {
				shouldCreateUser: true, // Creates a user if they don't exist
			},
		});
		if (error) {
			throw error;
		}
	};

	// Function to refresh profile data from database
	const refreshProfile = async () => {
		if (!user) return;
		
		try {
			const { data: profileData, error } = await supabase
				.from("users")
				.select("*")
				.eq("id", user.id)
				.single();

			if (error) {
				console.error('Error refreshing profile:', error);
				return;
			}

			setProfile(profileData as UserProfile | null);
		} catch (error) {
			console.error('Error refreshing profile:', error);
		}
	};

	// Function to update profile data both in database and local state
	const updateProfile = async (updates: Partial<UserProfile>) => {
		if (!user) {
			throw new Error('No authenticated user');
		}

		try {
			const { data: updatedProfile, error } = await supabase
				.from("users")
				.update(updates)
				.eq("id", user.id)
				.select()
				.single();

			if (error) {
				throw error;
			}

			// Update local state immediately for better UX
			setProfile(updatedProfile as UserProfile);
			
			return updatedProfile;
		} catch (error) {
			console.error('Error updating profile:', error);
			throw error;
		}
	};

	const signInWithUniversityApi = async (email: string, password: string) => {
		// IMPORTANT: Replace with your actual University API endpoint
		const UNIVERSITY_API_ENDPOINT = process.env.EXPO_PUBLIC_UNIVERSITY_API_ENDPOINT || ""; 

		try {
			// 1. Authenticate with University API
			const apiResponse = await fetch(`${UNIVERSITY_API_ENDPOINT}/api/login`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					// Add any other necessary headers, like an API key
					// "Authorization": "Bearer YOUR_API_KEY",
				},
				body: JSON.stringify({ mail : email, password : password }),
			});


			if (!apiResponse.ok) {
				const errorData = await apiResponse.json().catch(() => ({ message: "University API authentication failed and error response was not valid JSON." }));
				throw new Error(errorData.message || `University API request failed with status ${apiResponse.status}`);
			}

			// The token is sent in a 'Set-Cookie' header. We extract it here.
			const cookieHeader = apiResponse.headers.get("Set-Cookie");
			let token: string | null = null;

			if (cookieHeader) {
				// This regex finds the value of the 'authToken' cookie.
				const match = cookieHeader.match(/authToken=([^;]+)/);
				if (match) {
					token = match[1];
				}
			}

			const data = await apiResponse.json();
			const universityUserData: UniversityUserData = data.user;

			// 2. Sign in or sign up user in Supabase
			let authUser: User | null = null;
			let sessionObj: Session | null = null;

			const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
				email: universityUserData.email,
				password: process.env.EXPO_PUBLIC_SUPABASE_PASSWORD || "",
			});


			if (signInError) {
				const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
					email: universityUserData.email,
					password: process.env.EXPO_PUBLIC_SUPABASE_PASSWORD || "",
				});

				if (signUpError) {
					throw signUpError;
				}

				if (!signUpData.user) {
					throw new Error("Supabase signUp did not return a user.");
				}

				// After a successful sign-up, a session might not be immediately available
				// (e.g., if email confirmation is on). We'll explicitly sign in to get a session.
				const { data: signInAfterSignUpData, error: signInAfterSignUpError } =
					await supabase.auth.signInWithPassword({
						email: universityUserData.email,
						password: process.env.EXPO_PUBLIC_SUPABASE_PASSWORD || "",
					});

				if (signInAfterSignUpError) {
					// This might happen if email confirmation is required and not yet done.
					// The initial sign-up would have worked, but sign-in fails.
					Alert.alert(
						"Account Created",
						"Please check your email to confirm your account, then try signing in again."
					);
					// We return here because we can't proceed without a session.
					// The user needs to take action.
					return;
				}

				if (signInAfterSignUpData.user && signInAfterSignUpData.session) {
					authUser = signInAfterSignUpData.user;
					sessionObj = signInAfterSignUpData.session;
				} else {
					throw new Error("Failed to sign in after user creation.");
				}
			} else if (signInData.user) {
				authUser = signInData.user;
				sessionObj = signInData.session;
			}

			if (!authUser || !sessionObj) {
				throw new Error("Failed to establish a Supabase session.");
			}
			
			// Manually update state if onAuthStateChange hasn't fired yet or to ensure UI updates
			// This is often handled by onAuthStateChange but can be explicit here too.
			setUser(authUser);
			setSession(sessionObj);

			// 3. Upsert user profile in 'users' table
			const profileData = {
				id: authUser.id, // Link to Supabase auth user
				name: universityUserData.name,
				st_id: universityUserData.student_id_no,
				dept: universityUserData.department,
				email: universityUserData.email,
				tel_no: universityUserData.tel_no,
			};

			// Use upsert to either insert a new profile or update an existing one
			// based on the 'email' column, which should have a UNIQUE constraint.
			const { data: upsertedProfile, error: upsertError } = await supabase
				.from("users")
				.upsert(profileData, { onConflict: "email" })
				.select()
				.single();

			if (upsertError) {
				throw upsertError;
			}

			if (upsertedProfile) {
				setProfile(upsertedProfile as UserProfile);
			}

			// If a token is found in the cookie, set the API user state
			if (token) {
				setApiUser({
					id: universityUserData.id,
					name: universityUserData.name,
					dept: universityUserData.department,
					st_id: universityUserData.student_id_no,
					mail: universityUserData.email,
					authToken: token,
				});
			} else {
				console.warn(
					"Could not extract authToken from Set-Cookie header. The header might not be exposed to React Native's fetch."
				);
			}

			// The onAuthStateChange listener in useEffect should also update user/session state
			// and trigger navigation if needed.
		} catch (error: any) {
			console.error("Error in signInWithUniversityApi:", error);
			Alert.alert("Authentication Error", error.message || "An unexpected error occurred.");
			throw error; // Re-throw to be caught by the form submission handler if needed
		}
	};

	const signOut = async () => {
		const { error } = await supabase.auth.signOut();
		setApiUser(null); // Clear the API user on sign out
		if (error) {
			throw error;
		}
	};

	useEffect(() => {
		const fetchSessionAndProfile = async () => {
			const {
				data: { session },
			} = await supabase.auth.getSession();

			setSession(session);
			setUser(session?.user ?? null);

			if (session?.user) {
				const { data: profileData } = await supabase
					.from("users")
					.select("*")
					.eq("id", session.user.id)
					.single();
				setProfile(profileData as UserProfile | null);
			}
			setInitialized(true);
		};

		fetchSessionAndProfile();

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(async (_event, session) => {
			setSession(session);
			setUser(session?.user ?? null);

			if (session?.user) {
				const { data: profileData } = await supabase
					.from("users")
					.select("*")
					.eq("id", session.user.id)
					.single();
				setProfile(profileData as UserProfile | null);
			} else {
				setProfile(null);
			}
		});

		return () => {
			subscription.unsubscribe();
		};
	}, []);

	// Set up real-time subscription for profile updates
	useEffect(() => {
		if (!user) return;

		const profileSubscription = supabase
			.channel('profile-changes')
			.on(
				'postgres_changes',
				{
					event: 'UPDATE',
					schema: 'public',
					table: 'users',
					filter: `id=eq.${user.id}`,
				},
				(payload) => {
					console.log('Profile updated:', payload);
					// Update local profile state with the new data
					setProfile(payload.new as UserProfile);
				}
			)
			.subscribe();

		return () => {
			profileSubscription.unsubscribe();
		};
	}, [user]);

	useEffect(() => {
		if (!initialized) return;

		const inProtectedGroup = segments[1] === "(protected)";

		if (session && !inProtectedGroup) {
			router.replace("/(app)/(protected)");
		} else if (!session) {
			router.replace("/(app)/welcome");
		}

		/* HACK: Something must be rendered when determining the initial auth state... 
		instead of creating a loading screen, we use the SplashScreen and hide it after
		a small delay (500 ms)
		*/

		setTimeout(() => {
			SplashScreen.hideAsync();
		}, 500);
	}, [initialized, session]);

	return (
		<SupabaseContext.Provider
			value={{
				user,
				profile,
				session,
				initialized,
				apiUser,
				signUp,
				signInWithPassword,
				signInWithMagicLink,
				signInWithUniversityApi,
				signOut,
				refreshProfile,
				updateProfile,
				loginWithAPI: async () => {},
				logoutAPI: () => {},
			}}
		>
			{children}
		</SupabaseContext.Provider>
	);
};
