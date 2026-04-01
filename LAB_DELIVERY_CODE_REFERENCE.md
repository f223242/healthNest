# Lab Delivery Boy Feature - Quick Code Reference

## 1. How Patients Access Lab Delivery Boys

**Patient Flow:**

1. Dashboard → "Lab Services" button
2. Select a lab
3. New: Choose between "Lab at Center" OR "Home Service"
4. If "Home Service" → Directed to lab delivery boy selection screen
5. Select a delivery person with good rating
6. Continue to lab test booking

---

## 2. New Screen Code Structure

**File:** `app/(protected)/request-lab-home-service.tsx`

### Main Hook:

```ts
const { getAllUsers, user } = useAuthContext();
```

### Fetch Lab Delivery Boys:

```ts
const fetchLabDeliveryPersons = useCallback(async () => {
  try {
    // Get all users with delivery role and lab type
    const users = await getAllUsers("Lab Delivery");

    // Filter and map to DeliveryPerson format
    const deliveryData: DeliveryPerson[] = await Promise.all(
      users
        .filter((user: User) => user.profileCompleted && user.additionalInfo)
        .map(async (user: User, index: number) => {
          // ... fetch ratings, availability, etc.
          return {
            id: index + 1,
            name: fullName,
            avatar: profileImage,
            rating: 4.5, // fetched from ratings
            totalDeliveries: 50,
            isAvailable: true,
            deliveryTime: "15-25 min", // lab samples faster
            distance: city,
            vehicleType: "Bike",
            vehicleNumber: "ABC-123",
            deliveryType: "lab",
            uid: user.uid,
          };
        }),
    );

    setDeliveryPersons(deliveryData);
  } catch (error) {
    console.error("Error fetching lab delivery persons:", error);
  }
}, [getAllUsers]);
```

### Navigate to Booking:

```ts
<DeliveryPersonCard
  {...item}
  onPress={() => {
    router.push({
      pathname: "/(protected)/lab-booking-form",
      params: {
        labId,
        labName,
        deliveryPersonId: item.uid,
        deliveryPersonName: item.name,
        serviceMode: "home",    // NEW: indicates home service
        serviceType: "lab",
      },
    });
  }}
/>
```

---

## 3. Lab Services Screen Update

**File:** `app/(protected)/lab-services.tsx`

### New State:

```ts
const [serviceMode, setServiceMode] = useState<"center" | "home" | null>(null);
```

### Service Mode Selection UI:

```tsx
{
  !serviceMode ? (
    <View style={styles.serviceModeContainer}>
      <Text style={styles.serviceModeTitle}>Select Service Type</Text>
      <View style={styles.serviceModeButtonsRow}>
        {/* Option 1: Lab at Center */}
        <TouchableOpacity
          style={styles.serviceModeButton}
          onPress={() => setServiceMode("center")}
        >
          <Ionicons name="business" size={32} color={colors.primary} />
          <Text style={styles.serviceModeButtonText}>Lab at Center</Text>
          <Text style={styles.serviceModeButtonSubtext}>Visit our lab</Text>
        </TouchableOpacity>

        {/* Option 2: Home Service (NEW) */}
        <TouchableOpacity
          style={styles.serviceModeButton}
          onPress={() => {
            router.push({
              pathname: "/(protected)/request-lab-home-service",
              params: { labId, labName },
            });
          }}
        >
          <Ionicons name="home" size={32} color="#4CAF50" />
          <Text style={[styles.serviceModeButtonText, { color: "#4CAF50" }]}>
            Home Service
          </Text>
          <Text style={styles.serviceModeButtonSubtext}>Sample at home</Text>
        </TouchableOpacity>
      </View>
    </View>
  ) : (
    <>{/* Original test selection UI */}</>
  );
}
```

---

## 4. Route Registration

**File:** `app/(protected)/_layout.tsx`

```tsx
<Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
  {/* ... other screens ... */}
  <Stack.Screen name="request-medicine" options={{ headerShown: false }} />
  <Stack.Screen
    name="request-lab-home-service"
    options={{ headerShown: false }}
  />{" "}
  {/* NEW */}
  <Stack.Screen name="delivery-profile" options={{ headerShown: false }} />
  {/* ... rest of screens ... */}
</Stack>
```

---

## 5. Backend Integration (Already Implemented)

### Existing Function Supports Lab Delivery:

**File:** `hooks/useFirebaseAuth.tsx` (in `getAllUsers`)

```ts
const getAllUsers = async (filter?: string) => {
  let q;

  if (filter === "Medicine Delivery") {
    q = query(
      usersRef,
      where("role", "==", "delivery"),
      where("deliveryType", "==", "medicine"),
    );
  } else if (filter === "Lab Delivery") {
    // ✅ Already implemented
    q = query(
      usersRef,
      where("role", "==", "delivery"),
      where("deliveryType", "==", "lab"),
    );
  }

  return snap.docs.map((d) => ({ uid: d.id, ...d.data() }) as UserProfile);
};
```

### Firestore Query:

```
Collection: users
Query: role == "delivery" AND deliveryType == "lab" AND profileCompleted == true
```

---

## 6. UI Components (Reused)

### DeliveryPersonCard

```tsx
import DeliveryPersonCard from "@/component/DeliveryPersonCard";

<DeliveryPersonCard
  id={1}
  name="Ahmad Khan"
  avatar="https://..."
  rating={4.8}
  totalDeliveries={150}
  isAvailable={true}
  deliveryTime="15-25 min"
  distance="2.5 km"
  vehicleType="Bike"
  vehicleNumber="JK-01-ABC"
  deliveryType="lab"
  uid="user123"
  onPress={() => {
    /* navigate */
  }}
/>;
```

### DeliveryFilterButtons

```tsx
import DeliveryFilterButtons from "@/component/DeliveryFilterButtons";

<DeliveryFilterButtons
  activeFilter={filter}
  onFilterChange={(newFilter) => setFilter(newFilter)}
/>;
```

---

## 7. Error Handling Examples

### No Delivery Boys Available:

```tsx
{filteredDeliveryPersons.length === 0 ? (
  <View style={styles.emptyStateContainer}>
    <Ionicons name="sad-outline" size={60} color={colors.lightGray} />
    <Text style={styles.emptyStateTitle}>No Lab Delivery Available</Text>
    <Text style={styles.emptyStateText}>
      No lab delivery persons are currently available in your area.
    </Text>
  </View>
) : (
  <FlatList data={filteredDeliveryPersons} ... />
)}
```

### Ratings Fetch Error:

```ts
let rating = 0;
try {
  const ratingStats =
    await FeedbackComplaintService.getProviderRatingStats(uid);
  rating = ratingStats.averageRating || 0;
} catch (err) {
  console.log("No ratings for delivery person:", uid);
  // Falls back to rating = 0
}
```

---

## 8. Parameter Reference

### To Lab Booking Form:

```ts
{
  labId: "lab-user-uid",
  labName: "ABC Lab",
  deliveryPersonId: "driver-uid",        // NEW
  deliveryPersonName: "Ahmad Khan",      // NEW
  serviceMode: "home",                   // NEW: "home" or "center"
  serviceType: "lab",                    // NEW: always "lab"
  selectedServices: JSON.stringify([...])  // unchanged
}
```

---

## 9. Testing Commands

### 1. Create Lab Delivery User:

```js
// In Firebase Console → Users
{
  uid: "driver123",
  email: "driver@example.com",
  firstname: "Ahmad",
  lastname: "Khan",
  role: "delivery",           // ✓ Required
  deliveryType: "lab",        // ✓ Required (not "medicine")
  profileCompleted: true      // ✓ Required
}

// In additionalInfo:
{
  profileImage: "https://...",
  vehicleType: "Bike",
  vehicleNumber: "JK-01-ABC",
  city: "Islamabad",
  availability: "available"
}
```

### 2. Test User Flow:

1. Login as patient
2. Go to Dashboard
3. Tap "Lab Services"
4. Select any lab
5. Tap "Home Service" button (new!)
6. See list of lab delivery boys
7. Filter by "Available"
8. Click on a delivery boy
9. Should navigate to lab-booking-form with `serviceMode: "home"`

---

## 10. Key Differences: Medicine vs Lab Delivery

| Aspect             | Medicine                           | Lab                           |
| ------------------ | ---------------------------------- | ----------------------------- |
| **Delivery Type**  | `deliveryType: "medicine"`         | `deliveryType: "lab"`         |
| **Icon**           | 🚚 (medkit)                        | 🏥 (home)                     |
| **Time**           | "20-30 min"                        | "15-25 min"                   |
| **Query Filter**   | `getAllUsers("Medicine Delivery")` | `getAllUsers("Lab Delivery")` |
| **Service Mode**   | Not applicable                     | "home" or "center"            |
| **What's Carried** | Medicine packages                  | Blood/test samples            |

---

## 11. API Response Example

### getAllUsers("Lab Delivery") returns:

```json
[
  {
    "uid": "lab-driver-001",
    "email": "driver1@example.com",
    "firstname": "Ahmad",
    "lastname": "Khan",
    "role": "delivery",
    "deliveryType": "lab",
    "profileCompleted": true,
    "additionalInfo": {
      "profileImage": "https://...",
      "vehicleType": "Bike",
      "vehicleNumber": "JK-01-ABC",
      "city": "Islamabad",
      "availability": "available"
    }
  },
  {
    "uid": "lab-driver-002",
    ...
  }
]
```

Mapped to DeliveryPerson:

```json
[
  {
    "id": 1,
    "name": "Ahmad Khan",
    "avatar": "https://...",
    "rating": 4.8,
    "totalDeliveries": 150,
    "isAvailable": true,
    "deliveryTime": "15-25 min",
    "distance": "Islamabad",
    "vehicleType": "Bike",
    "vehicleNumber": "JK-01-ABC",
    "deliveryType": "lab",
    "uid": "lab-driver-001"
  }
]
```

---

## Summary

✅ **Fully implemented lab delivery boy selection**
✅ **Mirrors medicine delivery UI/UX**
✅ **Uses existing backend filters**
✅ **No new API endpoints required**
✅ **Integrated with rabbit appointment flow**
✅ **Real-time ratings & availability**
✅ **Error handling & empty states**
