import { useRouter } from "expo-router";
import React from "react";
import { Dimensions, Image, StyleSheet, View } from "react-native";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Colors } from "@/constants/Colors";


const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
	const router = useRouter();

	return (
		<View style={styles.container}>
			<View style={styles.logoContainer}>
				<Image
					source={require("@/assets/images/logo/dc-logo-red.png")}
					style={styles.logo}
				/>
			</View>

			<Text style={styles.title}>Dream Big{'\n'}Work Hard</Text>

			<View style={styles.illustrationContainer}>
				<View style={styles.face1}>
					<Image
						source={require("@/assets/images/home/face1.png")}
						style={styles.faceImage1}
						resizeMode="contain"
					/>
				</View>
				<View style={styles.face2}>
					<Image
						source={require("@/assets/images/home/face2.png")}
						style={styles.faceImage2}
						resizeMode="contain"
					/>
				</View>
			</View>

			<View style={styles.buttonContainer}>
				<Button
					style={styles.button}
					onPress={() => router.push("/login")}
				>
					<Text style={styles.buttonText}>Get started</Text>
				</Button>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#9a0f21',
	},
	logoContainer: {
		position: 'absolute',
		top: 60,
		left: 20,
		width: 50,
		height: 50,
		backgroundColor: '#fff',
		borderRadius: 25,
		justifyContent: 'center',
		alignItems: 'center',
	},
	logo: {
		width: 40,
		height: 40,
	},
	title: {
		position: 'absolute',
		top: 120,
		left: 20,
		fontSize: 48,
		fontWeight: '800',
		color: '#fff',
		lineHeight: 60,
	},
	illustrationContainer: {
		flex: 1,
		position: 'relative',
	},
	face1: {
		position: 'absolute',
		left: '-15%',
		bottom: '12%',
		transform: [{ rotate: '-5deg' }],
		zIndex: 2,
	},
	face2: {
		position: 'absolute',
		right: '-8%',
		bottom: '15%',
		transform: [{ rotate: '10deg' }],
		zIndex: 1,
	},
	faceImage1: {
		width: width * 0.8,
		height: width * 1.2,
	},
	faceImage2: {
		width: width * 0.6,
		height: width * 0.9,
	},
	buttonContainer: {
		position: 'absolute',
		bottom: 50,
		left: 20,
		right: 20,
	},
	button: {
		backgroundColor: '#fff',
		height: 60,
		borderRadius: 30,
		justifyContent: 'center',
		alignItems: 'center',
		zIndex: 4,
		shadowColor: '#9a0f21',
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 0.5,
		shadowRadius: 8,
		elevation: 8,
	},
	buttonText: {
		color: Colors.light.primary,
		fontSize: 18,
		fontWeight: '600',
	},
	gradient: {
		height: 100,
		zIndex: 3,
		opacity: 0.5,
	},
});
