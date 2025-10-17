# API Requirements for Lawyer Booking System

This document outlines all the API endpoints required by the frontend for the lawyer booking system.

---

## 🔄 **Booking Flow Overview**

### **When Client Opens Appointment Modal:**
The frontend executes the following sequence automatically:

1. **Fetch Lawyer Schedules** → `GET /api/lawyer/{lawyer_id}/schedules`
   - Retrieves all available schedules for the lawyer

2. **Auto-select Today's Date** → Frontend automatically selects current date

3. **Fetch Booked Appointments** → `GET /api/lawyer/{lawyer_id}/appointments?date={today}`
   - Retrieves all booked appointments for today's date
   - Used to mark slots as "Booked" in the UI

4. **Generate Available Slots** → Frontend generates hourly slots based on:
   - Lawyer's schedule for today (start time to end time)
   - Excludes already booked slots from step 3

5. **Display Time Slots** → User sees available and booked slots immediately

**Result:** Client sees today's availability instantly without needing to click anything!

---

## 🔹 **1. Get Lawyer Schedules**

**Endpoint:** `GET /api/lawyer/{lawyer_id}/schedules`

**Description:** Fetches all schedules for a specific lawyer. **Called automatically when appointment modal opens.**

**Path Parameters:**
- `lawyer_id` (integer) - The ID of the lawyer

**When Called:**
- Automatically when client opens appointment modal
- When lawyer views/manages their schedules

**Response (Success - 200):**
```json
{
  "schedules": [
    {
      "ID": 1,
      "lawyer_id": 123,
      "Date": "2025-10-15",
      "Day": "Monday",
      "Start Time": "9 AM",
      "End Time": "5 PM"
    },
    {
      "ID": 2,
      "lawyer_id": 123,
      "Date": "2025-10-16",
      "Day": "Tuesday",
      "Start Time": "10 AM",
      "End Time": "6 PM"
    }
  ]
}
```

**Response (No Schedules - 404):**
```json
{
  "message": "No schedules found for this lawyer"
}
```

---

## 🔹 **2. Get Booked Appointments for a Specific Date**

**Endpoint:** `GET /api/lawyer/{lawyer_id}/appointments?date={date}`

**Description:** Fetches all booked appointments for a lawyer on a specific date to prevent double booking. **Called automatically when appointment modal opens (for today's date) and when user selects a different date.**

**Path Parameters:**
- `lawyer_id` (integer) - The ID of the lawyer

**Query Parameters:**
- `date` (string, format: YYYY-MM-DD) - The date to fetch appointments for

**Example:** `/api/lawyer/123/appointments?date=2025-10-15`

**When Called:**
- Automatically when client opens appointment modal (with today's date)
- When user selects a different date from the calendar
- This ensures real-time availability checking

**Response (Success - 200):**
```json
{
  "appointments": [
    {
      "id": 456,
      "lawyer_id": 123,
      "user_id": 789,
      "date": "2025-10-15",
      "appointment_start_time": "9 AM",
      "appointment_end_time": "10 AM",
      "status": "confirmed"
    },
    {
      "id": 457,
      "lawyer_id": 123,
      "user_id": 790,
      "date": "2025-10-15",
      "appointment_start_time": "2 PM",
      "appointment_end_time": "3 PM",
      "status": "confirmed"
    }
  ]
}
```

**Response (No Appointments - 200):**
```json
{
  "appointments": []
}
```

**Note:** The `appointment_start_time` field is crucial for matching with available time slots. It must be in the format: "H AM/PM" (e.g., "9 AM", "10 AM", "2 PM") - hour only, no minutes

---

## 🔹 **3. Create New Schedule (Lawyer Panel)**

**Endpoint:** `POST /api/lawyer/schedule`

**Description:** Creates a new availability schedule for a lawyer for a specific date

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "lawyer_id": 123,
  "date": "2025-10-20",
  "start_time": "9 AM",
  "end_time": "5 PM"
}
```

**Field Descriptions:**
- `lawyer_id` (integer, required) - The ID of the lawyer
- `date` (string, required, format: YYYY-MM-DD) - The date for the schedule
- `start_time` (string, required, format: H AM/PM) - Start time of availability (hour only, e.g., "9 AM", "10 AM")
- `end_time` (string, required, format: H AM/PM) - End time of availability (hour only, e.g., "5 PM", "6 PM")

**Response (Success - 201):**
```json
{
  "message": "Schedule created successfully",
  "schedule": {
    "ID": 3,
    "lawyer_id": 123,
    "Date": "2025-10-20",
    "Day": "Wednesday",
    "Start Time": "9 AM",
    "End Time": "5 PM",
    "created_at": "2025-10-10T14:30:00Z"
  }
}
```

**Response (Error - 400):**
```json
{
  "message": "Invalid data provided",
  "errors": [
    "End time must be after start time"
  ]
}
```

**Response (Conflict - 409):**
```json
{
  "message": "Schedule already exists for this date"
}
```

---

## 🔹 **4. Update Schedule (Lawyer Panel)**

**Endpoint:** `PUT /api/lawyer/schedule/{schedule_id}`

**Description:** Updates an existing schedule

**Path Parameters:**
- `schedule_id` (integer) - The ID of the schedule to update

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "lawyer_id": 123,
  "date": "2025-10-20",
  "start_time": "8 AM",
  "end_time": "6 PM"
}
```

**Response (Success - 200):**
```json
{
  "message": "Schedule updated successfully",
  "schedule": {
    "ID": 3,
    "lawyer_id": 123,
    "Date": "2025-10-20",
    "Day": "Wednesday",
    "Start Time": "8 AM",
    "End Time": "6 PM",
    "updated_at": "2025-10-10T15:00:00Z"
  }
}
```

**Response (Not Found - 404):**
```json
{
  "message": "Schedule not found"
}
```

---

## 🔹 **5. Delete Schedule (Lawyer Panel)**

**Endpoint:** `DELETE /api/lawyer/schedule/{schedule_id}`

**Description:** Deletes a schedule

**Path Parameters:**
- `schedule_id` (integer) - The ID of the schedule to delete

**Response (Success - 200):**
```json
{
  "message": "Schedule deleted successfully"
}
```

**Response (Not Found - 404):**
```json
{
  "message": "Schedule not found"
}
```

**Response (Error - 400):**
```json
{
  "message": "Cannot delete schedule with existing appointments",
  "active_appointments": 3
}
```

**Note:** Consider adding logic to prevent deletion of schedules that have confirmed appointments, or implement a cascade delete/notification system for affected clients.

---

## 🔹 **6. Create Appointment (Existing Endpoint - Updated Requirements)**

**Endpoint:** `POST /api/telr-payment-form`

**Description:** Creates a new appointment and initiates payment (existing endpoint, but updated with new fields)

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer {jwt_token}
```

**Updated Request Body:**
```json
{
  "user_id": 789,
  "lawyer_id": 123,
  "lawyer_name": "John Doe",
  "department_id": 5,
  "date": "2025-10-15",
  "appointment_start_time": "2 PM",
  "appointment_end_time": "3 PM",
  "fee": 500,
  "duration": 60,
  "schedule_id": 1,
  "fname": "Jane",
  "lname": "Smith",
  "email": "jane.smith@example.com",
  "phone": "+971501234567"
}
```

**New/Modified Fields:**
- `appointment_end_time` (string, NEW) - End time of the appointment
- `duration` (integer) - Always 60 minutes (1 hour) for the new system

**Important Validation Required:**
Before creating an appointment, the backend should:
1. Verify that the time slot is not already booked
2. Verify that the schedule exists for the given date
3. Ensure appointment_start_time falls within the schedule's start/end time range

**Response:** (Same as existing implementation)

---

## 📋 **Summary of Required Changes**

### ✅ **New Endpoints Needed:**
1. `GET /api/lawyer/{lawyer_id}/appointments?date={date}` - Fetch booked appointments for a date
2. `POST /api/lawyer/schedule` - Create new schedule
3. `PUT /api/lawyer/schedule/{schedule_id}` - Update schedule
4. `DELETE /api/lawyer/schedule/{schedule_id}` - Delete schedule

### ✅ **Modified Endpoints:**
1. `POST /api/telr-payment-form` - Add `appointment_end_time` field support

### ✅ **Modified Data Structure:**
The existing schedule table should include a `Date` field (or modify the existing structure to support date-specific scheduling instead of just day-of-week)

---

## 🗄️ **Database Schema Recommendations**

### **Schedules Table Updates:**
```sql
CREATE TABLE schedules (
    ID INT PRIMARY KEY AUTO_INCREMENT,
    lawyer_id INT NOT NULL,
    Date DATE NOT NULL,                    -- Specific date (e.g., 2025-10-15)
    Day VARCHAR(20),                       -- Day name (e.g., "Monday") - computed/stored
    Start_Time VARCHAR(20) NOT NULL,       -- Format: "9 AM" (hour only, no minutes)
    End_Time VARCHAR(20) NOT NULL,         -- Format: "5 PM" (hour only, no minutes)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (lawyer_id) REFERENCES lawyers(id),
    UNIQUE KEY unique_lawyer_date (lawyer_id, Date)  -- Prevent duplicate schedules for same date
);
```

### **Appointments Table Updates:**
```sql
ALTER TABLE appointments
ADD COLUMN appointment_end_time VARCHAR(20) AFTER appointment_start_time;
```

---

## 🧪 **Testing Scenarios**

### **1. Schedule Management:**
- Create schedule for future date
- Try creating duplicate schedule for same date (should fail)
- Update schedule with valid times
- Try updating with end_time before start_time (should fail)
- Delete schedule without appointments
- Try deleting schedule with active appointments (should warn/fail)

### **2. Booking System:**
- Fetch appointments for a date with no bookings
- Fetch appointments for a date with multiple bookings
- Book an available time slot
- Try booking an already booked time slot (should fail)
- Try booking outside schedule hours (should fail)
- Book multiple consecutive hours

### **3. Edge Cases:**
- Booking on the same day
- Booking across midnight (if applicable)
- Time zone handling
- Concurrent booking attempts for the same slot

---

## 🎯 **Business Logic Requirements**

1. **One Booking Per Hour:**
   - Each hour slot can only have ONE booking
   - System should validate this on the backend

2. **Schedule Validation:**
   - End time must be after start time
   - Schedules cannot overlap for the same date
   - Minimum schedule duration: 1 hour

3. **Booking Validation:**
   - Appointment must fall within schedule hours
   - Time slot must not be already booked
   - Date must not be in the past

4. **Cascade Operations:**
   - When deleting a schedule with appointments, either:
     - Block the deletion and show error
     - Move appointments to "cancelled" status and notify clients

---

## 📞 **Contact for Questions**

If you have any questions about these API requirements, please contact the frontend development team.

**Date Created:** October 10, 2025
**Version:** 1.0
