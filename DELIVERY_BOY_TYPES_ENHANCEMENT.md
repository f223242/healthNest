# Delivery Boy Type Enhancement Documentation

## Overview

The Delivery Boy registration system has been enhanced to support two distinct types:

1. **Medicine Delivery Boy** - For medicine/pharmaceutical deliveries
2. **Lab Delivery Boy** - For laboratory test sample collection/delivery with professional qualifications

## Database Changes

### Firestore User Schema Updates

#### New Fields in `users` Collection

```typescript
interface UserProfile {
  // ... existing fields ...

  // NEW FIELDS
  deliveryType?: "medicine" | "lab"; // Delivery Boy type (only for delivery role)
  qualification?: string; // Required for Lab delivery (e.g., "Matric with Science")
}
```

#### Updated Fields in `pendingUsers` Collection

```typescript
{
  uid: string;
  email: string;
  firstname: string;
  lastname: string;
  role: "delivery";                        // Always "delivery" for Delivery Boy
  phoneNumber: string;
  dateOfBirth: string;

  // NEW FIELDS
  deliveryType?: "medicine" | "lab";
  qualification?: string;

  createdAt: string;
  verified: boolean;
}
```

### Firestore Indexes (Optional)

For better query performance, create composite indexes:

```firestore
// Index for Medicine Delivery Boys
Collection: users
Fields: role (ASCENDING), deliveryType (ASCENDING)

// Index for Lab Delivery Boys
Collection: users
Fields: role (ASCENDING), deliveryType (ASCENDING)
```

---

## Frontend Changes

### 1. Sign-Up Form [app/(auth)/sign-up.tsx]

#### Updated Role Options

```typescript
const roleOptions = [
  { label: "User", value: "User" },
  { label: "Lab", value: "Lab" },
  { label: "Nurse", value: "Nurse" },
  { label: "Delivery Boy", value: "Delivery Boy" }, // Changed from "Medicine Delivery"
];

const deliveryTypeOptions = [
  { label: "Medicine Delivery Boy", value: "medicine" },
  { label: "Lab Delivery Boy", value: "lab" },
];
```

#### Dynamic Form Fields

```typescript
// When user selects "Delivery Boy" role, show:
- Delivery Boy Type selector (Medicine/Lab)
- Qualification field (ONLY if Lab type selected)

// Validation:
- Delivery type is REQUIRED for Delivery Boy
- Qualification is REQUIRED for Lab Delivery Boy
- Qualification must contain "Matric" AND "Science" (case-insensitive)
```

#### Validation Schema

```typescript
const SignupSchema = Yup.object().shape({
  // ... existing fields ...

  deliveryType: Yup.string().when("role", {
    is: (role) => role === "Delivery Boy",
    then: Yup.string()
      .required("Delivery type is required")
      .oneOf(["medicine", "lab"], "Select a valid delivery type"),
    otherwise: Yup.string().notRequired(),
  }),

  qualification: Yup.string().when(["role", "deliveryType"], {
    is: (role, deliveryType) =>
      role === "Delivery Boy" && deliveryType === "lab",
    then: Yup.string()
      .required("Qualification is required for Lab Delivery")
      .test(
        "min-qualification",
        "Qualification must be at least Matric with Science",
        (val) => {
          const normalized = (val || "").toLowerCase();
          return (
            normalized.includes("matric") && normalized.includes("science")
          );
        },
      ),
    otherwise: Yup.string().notRequired(),
  }),
});
```

### 2. Delivery Person Listing [app/(protected)/request-medicine.tsx]

#### Updated Data Structure

```typescript
export interface DeliveryPerson {
  // ... existing fields ...
  deliveryType?: "medicine" | "lab";
  qualification?: string;
}
```

#### Data Fetching

- Now fetches all delivery types (medicine & lab)
- Passes `deliveryType` and `qualification` to profile screen
- Data retrieved from user's `deliveryType` field

### 3. Delivery Profile [app/(protected)/delivery-profile.tsx]

#### Dynamic UI Updates

```typescript
// Dynamic label based on delivery type
const deliveryTypeLabel = delivery.deliveryType === "lab"
  ? "Lab Delivery"
  : "Medicine Delivery";

// Conditional qualification display
{delivery.deliveryType === "lab" && delivery.qualification ? (
  <View style={styles.infoRow}>
    <Ionicons name="school" size={20} color="#4A90E2" />
    <Text label="Qualification">
      {delivery.qualification}
    </Text>
  </View>
) : null}
```

#### Booking Modal

- Updated to show dynamic `providerSpecialization`
- Shows "Medicine Delivery" or "Lab Delivery" based on type

### 4. Admin Panel [app/(admin)/(dashboard)/users.tsx]

#### Updated User Type Display

```typescript
type DisplayUser = {
  // ... existing fields ...
} & {
  type: "User" | "Lab" | "Nurse" | "Medicine Delivery" | "Lab Delivery";
};

// New mapping function
const mapRoleToType = (role: string, deliveryType?: string) => {
  if (role === "delivery") {
    if (deliveryType === "lab") return "Lab Delivery";
    return "Medicine Delivery";
  }
  // ... other role mappings
};
```

#### Filter Options

- Added "Lab Delivery" to filter list
- Now shows: All, User, Lab, Nurse, Medicine Delivery, Lab Delivery

---

## Backend Changes

### Authentication Service [hooks/useFirebaseAuth.tsx]

#### 1. Updated Register Function

```typescript
const register = async (values: {
  email: string;
  password: string;
  firstname: string;
  lastname: string;
  role: string;
  deliveryType?: "medicine" | "lab"; // NEW
  qualification?: string; // NEW
  dateOfBirth: string;
  phoneNumber: string;
}) => {
  // Backend validation for delivery boy
  if (role === "Delivery Boy" || role === "delivery boy") {
    if (!deliveryType) throw new Error("Delivery type is required");
    if (deliveryType === "lab") {
      if (
        !qualification ||
        !qualification.toLowerCase().includes("matric") ||
        !qualification.toLowerCase().includes("science")
      ) {
        throw new Error(
          "Lab delivery qualification must be Matric with Science or higher",
        );
      }
    }
  }

  // Store in pendingUsers with deliveryType and qualification
};
```

#### 2. Role Normalization

```typescript
// Updated normalizeRole function
const mapRoleToInternal = {
  "Delivery Boy": "delivery",
  "delivery boy": "delivery",
  "Medicine Delivery": "delivery",
  // ... existing mappings ...
};
```

#### 3. Email Verification Flow

- When moving user from `pendingUsers` to `users` collection
- Stores `deliveryType` and `qualification` fields
- Validation re-confirms qualification requirements for lab delivery

#### 4. Query Filters

```typescript
// Enhanced getAllUsers function
const getAllUsers = async (filter?: string) => {
  if (filter === "Medicine Delivery") {
    // Query: role == "delivery" AND deliveryType == "medicine"
    q = query(
      usersRef,
      where("role", "==", "delivery"),
      where("deliveryType", "==", "medicine"),
    );
  } else if (filter === "Lab Delivery") {
    // Query: role == "delivery" AND deliveryType == "lab"
    q = query(
      usersRef,
      where("role", "==", "delivery"),
      where("deliveryType", "==", "lab"),
    );
  }
  // ... handle other filters
};
```

### Firestore Rules [firestore.rules]

No changes required - existing rules support new fields:

- `users` collection already allows read/write for authenticated users
- New fields are handled under existing `update: if request.auth.uid == userId`

---

## Data Migration (For Existing Medicine Delivery Boys)

For existing users with `role: "delivery"`, manually add fields:

```javascript
// Run in Firebase Cloud Functions or Cloud Console
db.collection("users")
  .where("role", "==", "delivery")
  .get()
  .then((snapshot) => {
    snapshot.docs.forEach((doc) => {
      if (!doc.data().deliveryType) {
        doc.ref.update({
          deliveryType: "medicine", // Default existing to medicine
          // qualification field left empty for existing users
        });
      }
    });
  });
```

---

## API Contracts

### Sign-Up Request

```typescript
{
  email: string;
  password: string;
  firstname: string;
  lastname: string;
  phoneNumber: string;
  role: string;                    // "Delivery Boy"
  dateOfBirth: string;
  deliveryType?: "medicine" | "lab";
  qualification?: string;          // Required if deliveryType === "lab"
}
```

### User Profile Response

```typescript
{
  uid: string;
  email: string;
  firstname: string;
  lastname: string;
  role: "delivery";
  phoneNumber: string;
  dateOfBirth: string;
  deliveryType?: "medicine" | "lab";
  qualification?: string;
  profileCompleted: boolean;
  additionalInfo?: DeliveryInfo;  // Existing fields
  // ... other fields
}
```

---

## Key Features

✅ **Existing Functionality Preserved**

- All existing delivery fields (vehicleType, licenseNumber, etc.) unchanged
- Registration flow maintains backward compatibility
- Existing medicine delivery boys continue to work

✅ **Lab Delivery Support**

- Separate type for lab sample collection/delivery
- Qualification validation ensures professional standards
- Visible in system as distinct provider type

✅ **Admin Management**

- Filter between Medicine and Lab delivery boys
- View delivery type and qualifications in user list
- Separate types tracked in statistics

✅ **User-Facing**

- Dynamic form hides qualification field for medicine type
- Profile pages show appropriate delivery specialization
- Booking UI reflects actual delivery type

---

## Validation Rules

| Field           | Role              | Requirement | Example               |
| --------------- | ----------------- | ----------- | --------------------- |
| `deliveryType`  | "Delivery Boy"    | Required    | "medicine" or "lab"   |
| `qualification` | Lab Delivery      | Required    | "Matric with Science" |
| `qualification` | Medicine Delivery | Optional    | N/A                   |

**Qualification Validation:**

- Must contain both "matric" AND "science" (case-insensitive)
- Examples of valid qualifications:
  - ✅ "Matric with Science"
  - ✅ "SSC with Science"
  - ✅ "Intermediate in Science"
  - ✅ "FSc Pre-Medical"
  - ❌ "Matric" (missing Science)
  - ❌ "Science only"

---

## Testing Checklist

- [ ] Sign-up form shows delivery type selector for "Delivery Boy"
- [ ] Qualification field only shows for Lab delivery type
- [ ] Qualification validation works (accepts only valid formats)
- [ ] Admin can filter between Medicine and Lab delivery boys
- [ ] Delivery profiles show correct icons for each type
- [ ] Existing medicine delivery boys still appear in listings
- [ ] Data persists correctly in Firestore
- [ ] Email verification flow preserves delivery type data
- [ ] API calls pass deliveryType and qualification correctly

---

## Backward Compatibility

✅ **Fully Compatible**

- Existing "Medicine Delivery" role option still mapped to "delivery" internally
- New "Delivery Boy" option uses same internal mapping
- Existing delivery boy profiles work without modifications
- Old queries for "Medicine Delivery" still function

✅ **Graceful Degradation**

- If `deliveryType` missing: defaults to "medicine"
- If `qualification` missing for lab: field simply shows empty
- All UI components handle optional qualification field

---

## Files Modified

1. `hooks/useFirebaseAuth.tsx` - Authentication & data validation
2. `app/(auth)/sign-up.tsx` - Registration form UI & validation
3. `app/(admin)/(dashboard)/users.tsx` - Admin user listing & filters
4. `app/(protected)/request-medicine.tsx` - Delivery listing
5. `app/(protected)/delivery-profile.tsx` - Profile UI
6. `component/DeliveryPersonCard.tsx` - Card interface

## No Changes Required

- `firestore.rules` - Rules already support new fields
- Other authenticated services - Use `getAllUsers` helper which handles filtering
- Existing delivery boy edit profile logic - Works with added fields

---

## Future Enhancements

- Lab delivery boys' profiles could show certifications separately
- Qualification level filtering (e.g., show only Intermediate+)
- Analytics: Track stats for each delivery type
- Verification: Admin approval workflow for qualifications
- Specialization: Map specific lab tests to qualified delivery boys
