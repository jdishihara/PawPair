# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PawPair is a React Native mobile application built with Expo that connects dog owners with dog sitters through a Tinder-style swipe interface. The app serves two user types: owners looking for sitters and sitters looking to care for dogs.

## Development Commands

**Start Development Server:**
```bash
npx expo start
```

**Platform-Specific Builds:**
```bash
npm run android    # Android emulator
npm run ios        # iOS simulator  
npm run web        # Web browser
```

**Code Quality:**
```bash
npm run lint       # ESLint checking
```

**Reset Project Structure:**
```bash
npm run reset-project  # Moves starter code and creates blank app directory
```

## Architecture Overview

### Project Structure
- `app/` - Main application screens and components using Expo Router
- `components/` - Reusable UI components with theming support
- `hooks/` - Custom React hooks for messaging and theme management
- `types/` - TypeScript type definitions
- `constants/` - App-wide constants like color schemes

### Key Components
- **AuthFlow.tsx** - Multi-step authentication flow handling login, signup, user type selection, and profile creation
- **MessagesScreen.tsx** - Container for conversation list and individual chat screens
- **DogSwipe.tsx** - Swipe interface for sitters to browse dogs
- **DogSitterSwipe.tsx** - Swipe interface for owners to browse sitters

### State Management
The app uses React hooks for state management with mock data:
- `useMessaging` hook provides messaging functionality with mock conversations and users
- Local state management in individual components using useState

### Navigation
- Uses Expo Router with file-based routing
- Bottom tab navigation after authentication
- Conditional routing based on user type (owner vs sitter)

### Technology Stack
- **React Native** with Expo managed workflow
- **TypeScript** for type safety
- **React Navigation** for navigation
- **Expo Vector Icons** for iconography
- **react-native-deck-swiper** for swipe functionality
- **Firebase** listed as dependency but not yet implemented

## Development Notes

### Mock Data Implementation  
Currently uses mock data for all functionality. The `useMessaging` hook and profile data use hardcoded arrays that should be replaced with real API calls and Firebase integration.

### User Authentication
Authentication flow is implemented but uses mock login - no actual backend integration yet. Profile data is collected but not persisted.

### Theming System
Uses React Navigation theming with support for dark/light modes through `useColorScheme` hook and themed components.

### Testing Strategy
No test files currently present. Consider adding tests for authentication flow, messaging functionality, and swipe interactions.