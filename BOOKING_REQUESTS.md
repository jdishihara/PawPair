# Booking Request Feature

## Overview

Dog owners can now send booking requests to dog sitters directly through the messaging system. Sitters can accept or decline these requests with a single tap.

## Features

### For Dog Owners:
- **Send Booking Requests**: Tap the calendar icon in the chat header to create a booking request
- **Include All Details**: Date, time, duration, address, and dog information
- **Track Status**: See when requests are accepted or declined

### For Dog Sitters:
- **View Request Details**: See all booking information in an organized card
- **Accept/Decline**: Simple buttons to respond to requests
- **Care Karma**: Same features for Care Karma students earning service hours

## How It Works

### 1. Creating a Booking Request (Owner)

1. Open a conversation with a dog sitter
2. Tap the **calendar icon** (📅) in the top-right corner
3. Fill in the booking details:
   - Date (e.g., 2024-03-15)
   - Start time (e.g., 09:00)
   - End time (e.g., 17:00)
   - Duration (auto-calculated if not provided)
   - Address (pre-filled from your profile)
4. Dog information is pre-filled from your profile:
   - Dog name, breed, age, weight, size
   - You can modify these for the specific booking
5. Add special instructions (optional)
6. Tap **"Send Booking Request"**

### 2. Responding to Requests (Sitter)

1. Booking requests appear as special cards in the conversation
2. Review all the details:
   - Date, time, and location
   - Dog information
   - Special instructions
3. Tap either:
   - **"Accept"** - Confirms you'll take the booking
   - **"Decline"** - Politely declines the request

### 3. Status Updates

- **Pending**: Yellow badge (⏱️) - Waiting for sitter response
- **Accepted**: Green badge (✅) - Sitter has confirmed
- **Declined**: Red badge (❌) - Sitter has declined

## Technical Implementation

### Data Structure

```typescript
interface BookingRequest {
  id: string;
  conversationId: string;
  requesterId: string; // Dog owner email
  sitterId: string; // Dog sitter email
  status: 'pending' | 'accepted' | 'declined';

  // Booking details
  date: string;
  startTime: string;
  endTime: string;
  duration: string;
  address: string;

  // Dog information
  dogName: string;
  dogBreed: string;
  dogAge: string;
  dogWeight: string;
  dogSize?: 'small' | 'medium' | 'large' | 'extra_large';
  specialInstructions?: string;

  // Metadata
  createdAt: string;
  updatedAt: string;
}
```

### Storage

- **Key**: `pawpair_booking_requests`
- **Storage**: AsyncStorage (local device storage)
- **Integration**: Linked with messaging system

### Components

1. **BookingRequestModal** (`components/BookingRequestModal.tsx`)
   - Form for creating booking requests
   - Auto-fills user's dog information
   - Validates required fields

2. **BookingRequestCard** (`components/BookingRequestCard.tsx`)
   - Displays booking request details
   - Accept/Decline buttons for sitters
   - Status badges and updates

3. **ChatScreen Integration** (`app/screens/ChatScreen.tsx`)
   - Calendar button for owners
   - Renders booking cards in message list
   - Handles status updates

### API Functions

All functions in `utils/messageStorage.ts`:

```typescript
// Create a new booking request
createBookingRequest(conversationId, sitterEmail, bookingDetails)

// Get booking request by ID
getBookingRequest(requestId)

// Update status (accept/decline)
updateBookingRequestStatus(requestId, status)

// Get all user's booking requests
getUserBookingRequests()

// Get booking requests for a conversation
getConversationBookingRequests(conversationId)
```

## User Experience

### Owner Flow:
1. Browse sitters using swipe feature or map
2. Match with a sitter or view their profile
3. Start a conversation
4. Send a booking request with all details
5. Receive notification when sitter responds
6. See status in conversation

### Sitter Flow:
1. Receive booking request in conversation
2. Review all details in organized card
3. Accept or decline with one tap
4. Owner is immediately notified
5. If accepted, arrangement is confirmed

## Future Enhancements

- [ ] Calendar integration to prevent double-bookings
- [ ] Push notifications for new requests and responses
- [ ] Payment integration for paid sitters
- [ ] Service hour tracking for Care Karma students
- [ ] Booking history and analytics
- [ ] Recurring bookings
- [ ] Cancellation and rescheduling
- [ ] Rating and review system after completion

## Notes

- Booking requests are stored locally on the device
- Each request creates a special message in the conversation
- Status updates create response messages
- Care Karma sitters see service hours instead of payment info
- All timestamps use ISO format for consistency
