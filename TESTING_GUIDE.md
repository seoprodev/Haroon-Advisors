# Testing Guide for Lawyer Booking System

This guide will help you test all the new features and bug fixes in the app.

---

## 🚀 **How to Run the App**

```bash
# Start the development server
npm start

# Or for Android
npm run android

# Or for iOS
npm run ios
```

---

## ✅ **What Was Fixed/Implemented**

### **1. One Booking Per Hour Slot**
- Previously: Users could book any time with any duration
- Now: Only 1-hour slots are available, and each hour can only be booked once

### **2. Clear Time Slot Display**
- Previously: Users selected time manually with a time picker
- Now: All available hourly slots are displayed clearly with status (Available/Booked)

### **3. 10-Day Calendar Intervals**
- Previously: Calendar showed all 365 days
- Now: Calendar shows 10 days at a time with navigation buttons

### **4. Lawyer Schedule Management**
- Previously: No way for lawyers to set their schedules
- Now: Complete schedule management screen with add/edit/delete functionality

---

## 🧪 **Testing Scenarios**

### **📱 CLIENT SIDE TESTING (LawyerProfile Screen)**

#### **Test 1: View Lawyer Profile and Auto-Load Today's Slots**
1. Log in as a **client**
2. Navigate to any lawyer's profile
3. Click **"Make an Appointment"** button

**Expected Results:**
- Modal opens with appointment booking form
- Calendar is visible with **today's date already selected** (highlighted in primary color)
- Three navigation buttons appear: "← Previous 10 Days", "Today", "Next 10 Days →"
- **Time slots for today are automatically displayed** below the calendar (if lawyer has a schedule for today)
- Available and booked slots are shown immediately without requiring user to click the date
- Loading indicator appears briefly while fetching schedules and appointments

---

#### **Test 2: 10-Day Calendar Navigation**
1. Open appointment modal
2. Note the dates visible on the calendar (should be ~10 days)
3. Click **"Next 10 Days →"** button
4. Verify the calendar updates to show the next 10 days
5. Click **"← Previous 10 Days"** button
6. Verify it goes back
7. Click **"Today"** button
8. Verify it returns to current date range

**Expected Results:**
- Calendar always shows approximately 10 days
- Navigation works smoothly
- Current date range includes today when clicking "Today"

---

#### **Test 3: Verify Today's Slots Auto-Display**
1. When modal opens, today's date should already be selected
2. Verify time slots are shown automatically (no need to click date)

**Expected Results:**
- Below the calendar, you should see a section titled "Select Time Slot (1 Hour Sessions)"
- All available hourly slots for today are displayed in cards (e.g., "9 AM - 10 AM")
- Each slot shows the fee (د.إ XXX)
- Booked slots appear grayed out with "Booked" label
- Available slots are clickable

#### **Test 3b: Select a Different Date**
1. Click on a different date that has a lawyer's schedule (enabled date in calendar)
2. Wait for time slots to load

**Expected Results:**
- Previous slot selection is cleared
- Time slots update to show the new date's availability
- API call is made to fetch booked appointments for the new date
- Slots refresh to reflect new date's bookings

**Example Display:**
```
9 AM - 10 AM
Fee: د.إ 500
[Available - can be clicked]

10 AM - 11 AM
Booked
[Grayed out - cannot be clicked]

11 AM - 12 PM
Fee: د.إ 500
[Available - can be clicked]
```

---

#### **Test 4: Book an Available Slot**
1. Select an **available time slot** (not grayed out)
2. Verify the slot highlights in the primary color (#81D8D0)
3. A "✓ Selected" indicator appears
4. **"Confirm Booking"** button appears below the slots
5. Click **"Confirm Booking"**

**Expected Results:**
- Payment flow initiates
- Appointment data includes:
  - `appointment_start_time`: "9 AM"
  - `appointment_end_time`: "10 AM"
  - `duration`: 60
  - `fee`: (hourly rate)

---

#### **Test 5: Try to Book a Booked Slot**
1. Try to click on a slot that shows "Booked"

**Expected Results:**
- Slot is not clickable
- No selection happens
- Slot remains grayed out

---

#### **Test 6: Switch Between Dates**
1. Modal opens with today's date and slots already showing
2. Select a different date from the calendar
3. Verify time slots update based on new date's schedule and bookings
4. Select another date
5. Click "Today" button to return to today

**Expected Results:**
- Time slots refresh when changing dates
- Previously selected slot is cleared when switching dates
- New date's availability is shown correctly after each selection
- Booked slots are accurately marked based on the selected date
- "Today" button returns to current date and shows today's slots

---

### **⚖️ LAWYER SIDE TESTING (Schedules Screen)**

#### **Test 7: Access Schedule Management**
1. Log in as a **lawyer**
2. Navigate to **"Schedules"** tab/screen (in lawyer panel)

**Expected Results:**
- You see your profile at the top
- **"Add New Schedule"** button is visible
- List of existing schedules (if any) is displayed
- Each schedule shows:
  - Date
  - Day name
  - Start time - End time
  - **Edit** and **Delete** buttons

---

#### **Test 8: Create a New Schedule**
1. Click **"Add New Schedule"** button
2. A modal opens with the title "Add New Schedule"
3. Select a **future date** from date picker
4. Select a **start time** from dropdown (e.g., 9 AM)
5. Select an **end time** from dropdown (e.g., 5 PM)
6. Click **"Add Schedule"** button

**Expected Results:**
- Modal closes
- Toast message: "Schedule added successfully"
- New schedule appears in the list
- Schedule is grouped by date

**⚠️ Note:** If the API is not implemented yet, you will see an error. This is expected.

---

#### **Test 9: Validate Schedule Times**
1. Try to create a schedule where **end time is before or equal to start time**
   - Example: Start: 5 PM, End: 9 AM
2. Click **"Add Schedule"**

**Expected Results:**
- Alert appears: "End time must be after start time"
- Schedule is NOT created

---

#### **Test 10: Edit Existing Schedule**
1. Find an existing schedule in the list
2. Click **"Edit"** button
3. Modal opens with title "Edit Schedule"
4. Current date and times are pre-filled
5. Modify the times
6. Click **"Update Schedule"**

**Expected Results:**
- Modal closes
- Toast message: "Schedule updated successfully"
- Schedule list refreshes with updated times

---

#### **Test 11: Delete Schedule**
1. Find a schedule in the list
2. Click **"Delete"** button
3. Confirmation alert appears: "Are you sure you want to delete this schedule?"
4. Click **"Delete"**

**Expected Results:**
- Alert closes
- Toast message: "Schedule deleted successfully"
- Schedule is removed from the list

---

#### **Test 12: View Schedules Grouped by Date**
1. Create multiple schedules for different dates
2. Create multiple time slots for the same date

**Expected Results:**
- Schedules are grouped by date
- Each date section shows all schedules for that date
- Dates are displayed in chronological order

**Example Display:**
```
October 15, 2025
├─ 9 AM - 5 PM [Edit] [Delete]

October 16, 2025
├─ 9 AM - 12 PM [Edit] [Delete]
├─ 2 PM - 6 PM [Edit] [Delete]
```

---

## 🎨 **UI/UX Testing**

### **Color Theme Verification**
- **Primary Color**: #81D8D0 (teal/turquoise)
- Selected time slots should highlight in this color
- "Add New Schedule" button uses this color
- Navigation buttons use this color

### **Dark Mode Testing**
1. Enable dark mode on your device
2. Test all screens
3. Verify text is readable
4. Verify colors contrast properly

### **RTL (Arabic) Testing**
1. Change app language to Arabic (if supported)
2. Verify layouts flip correctly
3. Verify text aligns right
4. Verify buttons and navigation work correctly

---

## 🐛 **Known Issues / API Requirements**

### **APIs Not Yet Implemented:**
These features will work once the backend implements the required APIs:

1. **Fetching Booked Appointments**
   - Currently: All slots show as "Available"
   - After API: Booked slots will show as "Booked"

2. **Creating Schedules**
   - Currently: May show error
   - After API: Schedules will be saved to database

3. **Updating Schedules**
   - Currently: May show error
   - After API: Schedules will be updated in database

4. **Deleting Schedules**
   - Currently: May show error
   - After API: Schedules will be deleted from database

**👉 Refer to `API_REQUIREMENTS.md` for complete API documentation.**

---

## 📋 **Checklist for Testing**

### **Client Side:**
- [ ] Calendar shows 10-day intervals
- [ ] Navigation buttons work (Previous/Today/Next)
- [ ] Time slots display correctly
- [ ] Available slots are clickable
- [ ] Booked slots are grayed out and not clickable
- [ ] Slot selection highlights properly
- [ ] "Confirm Booking" button appears after selection
- [ ] Booking flow initiates correctly
- [ ] Changing dates updates time slots

### **Lawyer Side:**
- [ ] Schedule list displays correctly
- [ ] "Add New Schedule" button works
- [ ] Date picker opens and works
- [ ] Time dropdowns display hour-only options (12 AM - 11 PM)
- [ ] Time validation works (end > start)
- [ ] Schedule creation works (or shows proper error if API not ready)
- [ ] Schedule editing works
- [ ] Schedule deletion works with confirmation
- [ ] Schedules are grouped by date
- [ ] Loading states display correctly

### **General:**
- [ ] App doesn't crash
- [ ] Color theme is consistent
- [ ] Dark mode works
- [ ] RTL (Arabic) works if applicable
- [ ] Translations appear correctly

---

## 📞 **How to Report Issues**

If you find any issues:

1. **Document the issue:**
   - What were you doing?
   - What did you expect to happen?
   - What actually happened?
   - Include screenshots if possible

2. **Check console logs:**
   - Open developer console
   - Look for any error messages
   - Include these in your report

3. **Note your environment:**
   - Device type (iOS/Android)
   - OS version
   - App version

---

## 🎉 **Testing Complete!**

Once all tests pass:
1. ✅ Client booking works with hourly slots
2. ✅ Only one booking per hour
3. ✅ 10-day calendar navigation works
4. ✅ Lawyers can manage their schedules
5. ✅ UI is clean and follows color theme

**Next Steps:**
- Backend team implements APIs (see API_REQUIREMENTS.md)
- Re-test after API integration
- Deploy to production

---

**Good luck with testing! 🚀**
