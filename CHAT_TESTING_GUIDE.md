# 🧪 Chat & Notification System - Complete Testing Guide

## ✅ System Status

| Component | Status | Details |
|-----------|--------|---------|
| Patient Chat | ✅ Working | Real Firebase messages |
| Delivery Chat | ✅ Fixed | Shows real user conversations |
| Notifications | ✅ Configured | Created when messages sent |
| Firebase Index | ✅ Resolved | Client-side sorting implemented |
| Firestore Rules | ✅ Active | Authenticated users can read/write |

---

## 🧪 **Test Scenario 1: Patient Sends Message to Delivery Person**

### Step 1: Login as Patient
```
1. Open app/simulator as Patient A
2. Go to "Request Medicine" screen
3. Select "Delivery Person B" from list
4. Tap "Start Chat" button
```

### Step 2: Send Message
```
5. Type message: "Are you available now?"
6. Tap Send button
7. Observe: Message appears in chat bubble (right side, blue)
```

### Step 3: Check Delivery Person Receives
```
8. Switch to Delivery Person B account (new simulator/device/browser)
9. Go to "Chats" tab
10. Observe: "Patient A" appears in conversation list
11. Tap on Patient A name
12. Observe: Message "Are you available now?" appears (left side, gray)
13. Observe: Last message time is current time
```

---

## 🧪 **Test Scenario 2: Delivery Person Replies**

### Step 1: Reply from Delivery Person
```
1. In delivery chat (from previous test)
2. Type message: "Yes, I'm available and can deliver in 30 mins"
3. Tap Send button
4. Observe: Message appears right-aligned, blue background
```

### Step 2: Check Patient Receives
```
5. Switch back to Patient A account
6. Stay in chat or go back and re-enter
7. Observe: Reply message appears on left side, gray background
8. Messages show correct order: Patient → Delivery → Patient
```

---

## 🧪 **Test Scenario 3: Notifications**

### Before Starting
- Make sure both accounts are logged in on different devices/simulators

### Step 1: Send Message from Patient
```
1. Patient account: Send "What's the delivery fee?"
2. Delivery Person account: Should see notification (if app is in background/foreground)
3. Observe: Notification title contains patient name
4. Observe: Notification body contains message preview
```

### Step 2: Check Notification in Firestore
```
1. Open Firebase Console
2. Go to: Firestore Database → Collections → notifications
3. Filter by userId = [delivery person uid]
4. Verify: 
   - type: "message"
   - title: contains patient name
   - body: contains message text
   - read: false
```

### Step 3: Multiple Messages
```
1. Patient sends 3 messages in quick succession
2. Delivery person should see 3 notifications
3. Each notification should have correct message content
```

---

## 🧪 **Test Scenario 4: Conversation List Updates**

### Step 1: Check Initial State
```
1. Login as Delivery Person
2. Go to Chats tab
3. If no messages yet: See "No conversations yet" message
```

### Step 2: Patient Initiates Chat
```
1. Switch to Patient account
2. Select a delivery person and send a message
3. Switch back to Delivery Person account
4. Observe: Conversation appears in Chats list immediately
5. Shows patient name, last message, and time
```

### Step 3: Order Updates
```
1. Send messages from different patients
2. Most recent conversation moves to top
3. Last message text updates in real-time
4. Timestamps update correctly
```

---

## 🧪 **Test Scenario 5: Real-Time Sync**

### Step 1: Open Same Chat in Two Clients
```
1. Patient opens chat with Delivery Person
2. Delivery Person opens same chat on different device
3. Both see same messages
```

### Step 2: Send Message
```
4. Patient sends: "Hello"
5. Delivery Person's screen updates immediately
6. No refresh needed - real-time Firestore listener
```

### Step 3: Simultaneous Messages
```
7. Both send messages at same time
8. Both receive both messages in correct order
9. Timestamps preserved correctly
```

---

## 📊 **Debug Checklist**

### If Patient's Message Not Appearing in Delivery Chat:
- [ ] Check Firebase Console → Collections → conversations
  - Verify doc exists with both patientId and deliveryPersonId
- [ ] Check Firebase Console → Collections → messages
  - Verify message doc exists with correct conversationId
- [ ] Check Firestore Rules are published
  - Should allow read/write for authenticated users

### If Delivery Person Not Seeing Conversations:
- [ ] Verify `deliveryPersonId` field in conversation matches delivery person's uid
- [ ] Check that ChatService.listenToConversations is called with `isDeliveryPerson=true`
- [ ] Check browser console for any error messages
- [ ] Verify delivery person is logged in with correct account

### If Notifications Not Appearing:
- [ ] Check Firebase Console → Collections → notifications
  - Verify doc created with userId = delivery person uid
- [ ] Check notification type is "message"
- [ ] Check read field is false
- [ ] Verify NotificationService.createNotification called after sendMessage

### If Messages Not Sorted Correctly:
- [ ] Check timestamps in Firebase are Timestamp objects (not strings)
- [ ] Client-side sort uses `.toDate().getTime()`
- [ ] Messages should be oldest first (ascending)
- [ ] Conversations should be newest first (descending)

---

## 🔍 **Firebase Collections Structure**

```
conversations/
├── {patientId}_{deliveryPersonId}
│   ├── patientId: string
│   ├── patientName: string
│   ├── patientAvatar: string
│   ├── deliveryPersonId: string
│   ├── deliveryPersonName: string
│   ├── deliveryPersonAvatar: string
│   ├── lastMessage: string
│   ├── lastMessageTime: Timestamp
│   └── createdAt: Timestamp

messages/
├── {auto-generated id}
│   ├── conversationId: string (matches conversation doc id)
│   ├── senderId: string (patient or delivery uid)
│   ├── senderName: string
│   ├── message: string
│   ├── timestamp: Timestamp
│   └── read: boolean

notifications/
├── {auto-generated id}
│   ├── userId: string (delivery person uid)
│   ├── type: "message" | "order" | "status"
│   ├── title: string
│   ├── body: string
│   ├── data: object
│   ├── read: boolean
│   └── timestamp: Timestamp
```

---

## 🚀 **Quick Test Commands**

### Clear App Cache
```bash
# iOS
rm -rf ~/Library/Developer/Xcode/DerivedData/*

# Android
adb shell pm clear com.healthnest

# Expo
expo start --clear
```

### View Console Logs
```bash
# When app running with yarn start
# Errors will show in terminal with line numbers
# Look for: "Error initializing conversation" or similar
```

### Test with Multiple Simulators
```bash
# Terminal 1: Start app
yarn start

# Terminal 2: Open iOS simulator
open -a Simulator

# Terminal 3: Open Android emulator
# Or use web client with Ctrl+W in Expo menu
```

---

## 📝 **Test Report Template**

Use this to document your testing:

```
Date: ________________
Tester: ________________

Test Case: Scenario 1 - Patient Sends Message
Status: [ ] PASS [ ] FAIL
Notes: _________________________________________

Test Case: Scenario 2 - Delivery Reply
Status: [ ] PASS [ ] FAIL
Notes: _________________________________________

Test Case: Scenario 3 - Notifications
Status: [ ] PASS [ ] FAIL
Notes: _________________________________________

Test Case: Scenario 4 - Conversation List
Status: [ ] PASS [ ] FAIL
Notes: _________________________________________

Test Case: Scenario 5 - Real-Time Sync
Status: [ ] PASS [ ] FAIL
Notes: _________________________________________

Overall Status: [ ] ALL PASS [ ] SOME ISSUES [ ] CRITICAL ISSUES
Summary: _________________________________________
```

---

## 🎯 **Success Criteria**

All of the following must be true:
✅ Patient can initiate chat with delivery person  
✅ Message appears in delivery person's chat  
✅ Delivery person can reply  
✅ Patient receives reply in real-time  
✅ Conversation appears in delivery person's Chats list  
✅ Conversation updates with latest message  
✅ Notifications created with correct user ID  
✅ Messages sorted by timestamp correctly  
✅ No Firebase index errors  
✅ No console errors  

---

## 🆘 **If Tests Fail**

1. **Check browser/device console** for error messages
2. **Verify Firebase credentials** are correct
3. **Check Firestore rules** are published
4. **Verify user is authenticated** before accessing chat
5. **Check conversation/message structure** in Firebase Console
6. **Ensure timestamps are Firestore Timestamp objects** (not strings)

Contact support with:
- Screenshot of error
- Console log output
- Firebase collection structure proof
- Step-by-step reproduction instructions
