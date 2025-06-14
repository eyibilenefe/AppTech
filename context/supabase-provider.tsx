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
	studentId: string;
	department: string;
	mail: string;
	tel_no: string;
};

// NEW: Type for user profile from 'users' table
type UserProfile = {
	id: string;
	name: string;
	st_id: string;
	dept: string;
	mail: string;
	pp: string | null;
	bio: string | null;
	tel_no: string | null;
	is_valid: boolean;
};

type SupabaseContextProps = {
	user: User | null;
	profile: UserProfile | null;
	session: Session | null;
	initialized?: boolean;
	signUp: (email: string, password: string) => Promise<void>;
	signInWithPassword: (email: string, password: string) => Promise<void>;
	signInWithMagicLink: (email: string) => Promise<void>;
	signInWithUniversityApi: (email: string, password: string) => Promise<void>;
	signOut: () => Promise<void>;
};

type SupabaseProviderProps = {
	children: React.ReactNode;
};

export const SupabaseContext = createContext<SupabaseContextProps>({
	user: null,
	profile: null,
	session: null,
	initialized: false,
	signUp: async () => {},
	signInWithPassword: async () => {},
	signInWithMagicLink: async () => {},
	signInWithUniversityApi: async () => {},
	signOut: async () => {},
});

export const useSupabase = () => useContext(SupabaseContext);

export const SupabaseProvider = ({ children }: SupabaseProviderProps) => {
	const router = useRouter();
	const segments = useSegments();
	const [user, setUser] = useState<User | null>(null);
	const [session, setSession] = useState<Session | null>(null);
	const [initialized, setInitialized] = useState<boolean>(false);
	const [profile, setProfile] = useState<UserProfile | null>(null);

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

			const data = await apiResponse.json();
			const universityUserData : UniversityUserData = data.user;

			// 2. Sign in or sign up user in Supabase
			let authUser: User | null = null;
			let sessionObj: Session | null = null;

			const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
				email: universityUserData.mail,
				password: process.env.EXPO_PUBLIC_SUPABASE_PASSWORD || "",
			});
			console.log("signInData HEEEY");

			if (signInError) {
				const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
					email: universityUserData.mail,
					password: process.env.EXPO_PUBLIC_SUPABASE_PASSWORD || "",
				});

				if (signUpError) {
					console.log("inside signUpError");
					// If sign up also fails (e.g., user already exists but signInWithPassword failed - implies password mismatch for existing Supabase account)
					throw signUpError;
				}
				if (signUpData.user) {
					authUser = signUpData.user;
					sessionObj = signUpData.session; // Session might be null if email confirmation is required and not auto-confirmed
				} else {
					throw new Error("Supabase signUp did not return a user.");
				}
				// Check if session is established, especially if email confirmation is needed.
				// For this flow to be seamless client-side, auto-confirm or no email verification is preferred.
				if (!sessionObj && authUser) {
					Alert.alert(
						"Account Created",
						"Please check your email to confirm your account if required, then try signing in again."
					);
					// Stop further execution as profile creation depends on an active session for RLS.
					// The onAuthStateChange listener will eventually pick up the state.
					// For now, we'll return, and user will need to re-login after confirmation.
					// Alternatively, if you are certain about auto-confirmation, you can proceed.
					return; 
				}

			} else if (signInData.user) {
				authUser = signInData.user;
				sessionObj = signInData.session;
			}

			
			if (!authUser || !sessionObj) {
				throw new Error("Failed to establish a Supabase session. Ensure email confirmation (if enabled) is completed.");
			}
			
			// Manually update state if onAuthStateChange hasn't fired yet or to ensure UI updates
			// This is often handled by onAuthStateChange but can be explicit here too.
			setSession(sessionObj);
			setUser(authUser);


			// 3. Upsert user profile in 'profiles' table
			const { data: existingProfile, error: fetchError } = await supabase
				.from("users")
				.select("id")
				.eq("mail", universityUserData.mail)
				.single();

			if (fetchError && fetchError.code !== "PGRST116") { // PGRST116: "Query returned no rows" (expected if new user)
				throw fetchError;
			}

			const profileData = {
				id: authUser.id, // Link to Supabase auth user
				name: universityUserData.name,
				st_id: universityUserData.studentId,
				dept: universityUserData.department,
				mail: universityUserData.mail, // Ensure this matches authUser.email
				tel_no: universityUserData.tel_no,
			};

			if (existingProfile) {
				// Profile exists, update it
				const { error: updateError } = await supabase
					.from("users")
					.update(profileData)
					.eq("id", existingProfile.id); // Assuming universityUserData.id is PK of profile
				if (updateError) throw updateError;
			} else {
				// Profile doesn't exist, insert it
				// The PK 'id' for profiles table comes from the university API
				const { error: insertError } = await supabase
					.from("users")
					.insert({ ...profileData, id: universityUserData.id }); 
				if (insertError) throw insertError;
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
				signUp,
				signInWithPassword,
				signInWithMagicLink,
				signInWithUniversityApi,
				signOut,
			}}
		>
			{children}
		</SupabaseContext.Provider>
	);
};
