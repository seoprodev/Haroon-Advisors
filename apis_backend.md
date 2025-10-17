# API Requirements for Lawyer Booking And Scheduling System

This document outlines all the API endpoints required for the lawyer booking and scheduling system.

---

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
  "errors": ["End time must be after start time"]
}
```

**Response (Conflict - 409):**

```json
{
  "message": "Schedule already exists for this date"
}
```

---

## 🔹 **4. Create Appointment (Existing Endpoint - Updated Requirements)**

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
