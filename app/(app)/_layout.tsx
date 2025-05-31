import { Stack } from "expo-router";

import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/utils/useColorScheme";

export const unstable_settings = {
	initialRouteName: "(root)",
};

export default function AppLayout() {
	const { colorScheme } = useColorScheme();

	return (
		<Stack screenOptions={{ headerShown: false, gestureEnabled: false }}>
			<Stack.Screen name="(protected)" />
			<Stack.Screen name="welcome" />
			<Stack.Screen
				name="login"
				options={{
					presentation: "card",
					headerShown: false,
					headerTitle: "Login",
					headerStyle: {
						backgroundColor:
							colorScheme === "dark"
								? Colors.dark.background
								: Colors.light.background,
					},
					headerTintColor:
						colorScheme === "dark"
							? Colors.dark.foreground
							: Colors.light.foreground,
					gestureEnabled: true,
				}}
			/>
			{/* <Stack.Screen
				name="nfc-login"
				options={{
					presentation: "modal",
					headerShown: true,
					headerTitle: "Login with NFC",
					headerStyle: {
						backgroundColor:
							colorScheme === "dark"
								? Colors.dark.background
								: Colors.light.background,
					},
					headerTintColor:
						colorScheme === "dark"
							? Colors.dark.foreground
							: Colors.light.foreground,
					gestureEnabled: true,
				}}
			/> */}
			{/* <Stack.Screen
				name="modal"
				options={{
					presentation: "modal",
					headerShown: true,
					headerTitle: "Modal",
					headerStyle: {
						backgroundColor:
							colorScheme === "dark"
								? Colors.dark.background
								: Colors.light.background,
					},
					headerTintColor:
						colorScheme === "dark"
							? Colors.dark.foreground
							: Colors.light.foreground,
					gestureEnabled: true,
				}}
			/> */}
		</Stack>
	);
}
