import { useColorScheme } from '@/utils/useColorScheme';
import { TextStyle } from 'react-native';

export interface AppTheme {
  colors: {
    // Base colors
    primary: string;
    secondary: string;
    tertiary: string;
    accent: string;
    
    // Background colors
    background: string;
    cardBackground: string;
    surfaceBackground: string;
    headerBackground: string;
    
    // Text colors
    textPrimary: string;
    textSecondary: string;
    textTertiary: string;
    textInverse: string;
    
    // Status colors
    success: string;
    warning: string;
    error: string;
    info: string;
    
    // Border and divider colors
    border: string;
    divider: string;
    
    // Interactive states
    ripple: string;
    disabled: string;
    
    // Shadow colors
    shadow: string;
  };
  
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    full: number;
  };
  
  typography: {
    fontSizes: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
      xxl: number;
      xxxl: number;
    };
    fontWeights: {
      normal: TextStyle['fontWeight'];
      medium: TextStyle['fontWeight'];
      semibold: TextStyle['fontWeight'];
      bold: TextStyle['fontWeight'];
    };
    lineHeights: {
      tight: number;
      normal: number;
      relaxed: number;
    };
  };
  
  shadows: {
    small: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
    medium: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
    large: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
  };
}

const baseTheme = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  },
  
  borderRadius: {
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  
  typography: {
    fontSizes: {
      xs: 10,
      sm: 12,
      md: 14,
      lg: 16,
      xl: 18,
      xxl: 20,
      xxxl: 24,
    },
    fontWeights: {
      normal: '400' as TextStyle['fontWeight'],
      medium: '500' as TextStyle['fontWeight'],
      semibold: '600' as TextStyle['fontWeight'],
      bold: '700' as TextStyle['fontWeight'],
    },
    lineHeights: {
      tight: 1.2,
      normal: 1.4,
      relaxed: 1.6,
    },
  },
  
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 8,
    },
  },
};

export const lightTheme: AppTheme = {
  colors: {
    // Base colors using IYTE branding
    primary: '#9a0f21',
    secondary: '#d93346',
    tertiary: '#e85766',
    accent: '#c41e3a',
    
    // Background colors
    background: '#f5f5f5',
    cardBackground: '#ffffff',
    surfaceBackground: '#fafafa',
    headerBackground: '#9a0f21',
    
    // Text colors
    textPrimary: '#333333',
    textSecondary: '#666666',
    textTertiary: '#999999',
    textInverse: '#ffffff',
    
    // Status colors
    success: '#4CAF50',
    warning: '#FF6B35',
    error: '#EF4444',
    info: '#9C27B0',
    
    // Border and divider colors
    border: '#e0e0e0',
    divider: '#f0f0f0',
    
    // Interactive states
    ripple: 'rgba(154, 15, 33, 0.1)',
    disabled: '#cccccc',
    
    // Shadow colors
    shadow: '#000000',
  },
  ...baseTheme,
};

export const darkTheme: AppTheme = {
  colors: {
    // Base colors - lighter variants for dark mode
    primary: '#eb677a',
    secondary: '#f07b85',
    tertiary: '#f59094',
    accent: '#e65c70',
    
    // Background colors
    background: '#1a1a1a',
    cardBackground: '#2a2a2a',
    surfaceBackground: '#222222',
    headerBackground: '#eb677a',
    
    // Text colors
    textPrimary: '#ffffff',
    textSecondary: '#cccccc',
    textTertiary: '#aaaaaa',
    textInverse: '#333333',
    
    // Status colors
    success: '#66BB6A',
    warning: '#FF8A65',
    error: '#EF5350',
    info: '#AB47BC',
    
    // Border and divider colors
    border: '#444444',
    divider: '#333333',
    
    // Interactive states
    ripple: 'rgba(235, 103, 122, 0.2)',
    disabled: '#555555',
    
    // Shadow colors
    shadow: '#000000',
  },
  ...baseTheme,
};

export const blackTheme: AppTheme = {
  colors: {
    // Base colors - lightest variants for black theme
    primary: '#f59094',
    secondary: '#faa4a8',
    tertiary: '#ffb8bb',
    accent: '#f07b85',
    
    // Background colors
    background: '#000000',
    cardBackground: '#111111',
    surfaceBackground: '#0a0a0a',
    headerBackground: '#f59094',
    
    // Text colors
    textPrimary: '#ffffff',
    textSecondary: '#cccccc',
    textTertiary: '#aaaaaa',
    textInverse: '#000000',
    
    // Status colors
    success: '#81C784',
    warning: '#FFB74D',
    error: '#FF7043',
    info: '#BA68C8',
    
    // Border and divider colors
    border: '#333333',
    divider: '#222222',
    
    // Interactive states
    ripple: 'rgba(245, 144, 148, 0.3)',
    disabled: '#444444',
    
    // Shadow colors
    shadow: '#000000',
  },
  ...baseTheme,
};

export const getTheme = (colorScheme: 'light' | 'dark' | 'black' = 'light'): AppTheme => {
  switch (colorScheme) {
    case 'dark':
      return darkTheme;
    case 'black':
      return blackTheme;
    default:
      return lightTheme;
  }
};

export const useAppTheme = (): AppTheme => {
  const { colorScheme } = useColorScheme();
  return getTheme(colorScheme);
};

// Common style generators using theme
export const createCommonStyles = (theme: AppTheme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.headerBackground,
    ...theme.shadows.small,
  },
  
  headerTitle: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textInverse,
  },
  
  card: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.medium,
  },
  
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    ...theme.shadows.small,
  },
  
  buttonText: {
    color: theme.colors.textInverse,
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.semibold,
  },
  
  textPrimary: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.normal,
  },
  
  textSecondary: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.normal,
  },
  
  textTertiary: {
    color: theme.colors.textTertiary,
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.normal,
  },
  
  divider: {
    height: 1,
    backgroundColor: theme.colors.divider,
    marginVertical: theme.spacing.md,
  },
  
  bottomSpacing: {
    height: 100,
  },
}); 