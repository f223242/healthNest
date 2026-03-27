# Lab Delivery Boy Selection Feature - Implementation Summary

## Overview

This implementation adds the ability for patients to request lab sample collection at home by selecting a lab delivery boy, mirroring the existing medicine delivery functionality.

## What Was Implemented

### 1. **New Screen: Lab Home Service Delivery Selection**

**File:** `app/(protected)/request-lab-home-service.tsx`

This screen displays a list of available lab delivery boys with:

- Real-time availability status
- Ratings and delivery statistics
- Vehicle information
- Filter options (All / Available only)
- Average rating statistics
- Empty state handling

**Features:**

- Fetches lab delivery boys using `getAllUsers("Lab Delivery")`
- Shows active appointments
- Displays average rating across all delivery persons
- Responsive UI with animations
- Pull-to-refresh functionality

---

### 2. **Updated Lab Services Screen**

**File:** `app/(protected)/lab-services.tsx`

Added service mode selection before showing test options:

```
┌─────────────────────────────────────────┐
│  Select Service Type                    │
├─────────────────────────────────────────┤
│  ┌──────────────┐      ┌──────────────┐ │
│  │  🏢          │      │  🏠          │ │
│  │ Lab at Center│ OR   │ Home Service │ │
│  │ Visit our lab│      │Sample at home│ │
│  └──────────────┘      └──────────────┘ │
└─────────────────────────────────────────┘
```

**New State:**

- `serviceMode`: tracks whether user selected "center" or "home"
- Conditional rendering based on `serviceMode`

**Navigation Flow:**

- If "Lab at Center" → Show test selection
- If "Home Service" → Navigate to `request-lab-home-service` screen

---

### 3. **Updated Protected Routes**

**File:** `app/(protected)/_layout.tsx`

Added new route registration:

```tsx
<Stack.Screen
  name="request-lab-home-service"
  options={{ headerShown: false }}
/>
```

---

## Complete User Flow

```
Dashboard
    ↓
[Select Labs] → Choose a lab
    ↓
[Lab Services] → New: Select Service Mode
    ├─→ Lab at Center → Select tests → Continue to booking
    └─→ Home Service → List lab delivery boys → Select one → Continue to booking
                              ↓
                    [Lab Home Service Screen]
                    - Fetch lab delivery boys
                    - Display availability & ratings
                    - Select delivery person
                    - Proceed to lab booking form
```

---

## API Integration

### Backend Requirements

The implementation uses the existing `getAllUsers()` function with "Lab Delivery" filter:

```ts
const users = await getAllUsers("Lab Delivery");
```

This filters for:

- `role` = "delivery"
- `deliveryType` = "lab"

**No new backend endpoints needed** - uses existing user role filtering.

### Firestore Queries

For lab delivery boys, the app queries:

```
Query: collection("users")
  .where("role", "==", "delivery")
  .where("deliveryType", "==", "lab")
  .where("profileCompleted", "==", true)
```

---

## Data Structure

### Lab Delivery Person Card Props

```ts
interface DeliveryPerson {
  id: number;
  name: string;
  avatar: string;
  rating: number;
  totalDeliveries: number;
  isAvailable: boolean;
  deliveryTime: string; // e.g., "15-25 min"
  distance: string; // city/distance
  vehicleType: string; // e.g., "Bike", "Motorcycle"
  vehicleNumber: string;
  deliveryType: "lab" | "medicine";
  qualification: string;
  uid: string;
}
```

---

## UI Component Reuse

✅ **Components reused from Medicine Delivery:**

- `DeliveryPersonCard` - Displays individual delivery person
- `DeliveryFilterButtons` - Filter by availability
- Same styling & animation patterns
- Identical stat display (average rating, total available)

✅ **Same User Experience:**

- Loading states
- Refresh functionality
- Empty state when no drivers available
- Active appointment highlighting
- Real-time rating integration

---

## Parameters Passed to Booking

When a lab delivery boy is selected:

```ts
router.push({
  pathname: "/(protected)/lab-booking-form",
  params: {
    labId, // from lab selection
    labName, // from lab selection
    deliveryPersonId: uid, // lab delivery person's UID
    deliveryPersonName: name, // delivery person's name
    serviceMode: "home", // always "home" for this flow
    serviceType: "lab", // always "lab"
  },
});
```

---

## State Management

Uses React hooks (built on Formik/FirebaseAuth pattern):

- `deliveryPersons` - List of available lab delivery boys
- `loading` - Initial load state
- `refreshing` - Pull-to-refresh state
- `filter` - Current filter ("all" | "available")
- `activeAppointments` - Set of delivery IDs with active bookings

---

## Error Handling

✅ **Graceful fallbacks:**

- If no lab delivery boys available → Empty state
- If fetch fails → Error message
- If ratings unavailable → Shows 0 rating
- If profile image missing → Placeholder image

```ts
try {
  const users = await getAllUsers("Lab Delivery");
  // Process and display
} catch (error) {
  console.error("Error fetching lab delivery persons:", error);
  // Empty list shown, user can refresh
}
```

---

## Code Changes Summary

### Files Created:

1. `app/(protected)/request-lab-home-service.tsx` - New delivery selection screen

### Files Modified:

1. `app/(protected)/lab-services.tsx` - Added service mode selection UI
2. `app/(protected)/_layout.tsx` - Registered new route

### Files NOT Modified (Already Support Lab Delivery):

- `hooks/useFirebaseAuth.tsx` - `getAllUsers()` already filters "Lab Delivery"
- `services/AppointmentService.ts` - Already supports delivery bookings
- `services/FeedbackComplaintService.ts` - Already fetches ratings

---

## Testing Checklist

- [ ] Create test user with `role: "delivery"` and `deliveryType: "lab"`
- [ ] Complete profile setup for lab delivery user
- [ ] From patient, go to Lab Services → Select "Home Service"
- [ ] Verify list of lab delivery boys appears
- [ ] Verify ratings are fetched correctly
- [ ] Click on a delivery boy → Should navigate to booking form with correct params
- [ ] Verify "Available" filter works
- [ ] Test pull-to-refresh
- [ ] Test empty state (if no lab delivery boys)
- [ ] Verify back button brings user back to service mode selection

---

## Optional Enhancements

### Future Improvements:

1. **Map view** - Show delivery boys on a map with distance
2. **Reviews** - Show customer reviews for each delivery person
3. **Estimated cost** - Display delivery charges
4. **Rating filters** - Filter by minimum rating
5. **Specialization** - Show if delivery person handles certain test types
6. **Communication** - In-app messaging with selected delivery person before booking

---

## Architecture Diagram

```
Select Labs (Lab Profile)
       ↓
Lab Services Screen
       ├─ Service Mode Selection
       │  ├─ Center (existing flow)
       │  └─ Home (NEW)
       │      ↓
       │ Lab Home Service Screen (NEW)
       │  ├─ Fetch: getAllUsers("Lab Delivery")
       │  ├─ Display: DeliveryPersonCard (reused)
       │  ├─ Filter: "All" / "Available"
       │  └─ Select → Pass to booking
       │
       └─ Continue
           ↓
        Lab Booking Form
```

---

## Consistency with Medicine Delivery

| Feature             | Medicine Delivery | Lab Delivery |
| ------------------- | ----------------- | ------------ |
| Filter available    | ✓ Same            | ✓ Same       |
| Real-time ratings   | ✓ Same            | ✓ Same       |
| Card layout         | ✓ Same            | ✓ Same       |
| Active appointments | ✓ Same            | ✓ Same       |
| Refresh capability  | ✓ Same            | ✓ Same       |
| Empty state         | ✓ Same            | ✓ Same       |

---

## Next Steps

1. ✅ Code implementation complete
2. ⏳ Test with lab delivery users (role: "delivery", deliveryType: "lab")
3. ⏳ Update lab booking form to handle "home" service mode
4. ⏳ Add optional message field for delivery instructions
5. ⏳ Test payment integration for home service charges
