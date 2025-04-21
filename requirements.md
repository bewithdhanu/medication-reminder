**Feature Explanation Document: Flexible Medication Reminder System**

**1. Feature Name:**

Flexible Medication & Task Reminder

**2. Introduction/Goal:**

To provide users with a highly flexible and reliable system for scheduling recurring reminders, primarily focused on medication adherence but applicable to other timed tasks. The system aims to prevent missed doses/events by allowing detailed customization of frequency, timing, and duration, while respecting user-defined daily quiet periods. This is particularly crucial for users managing complex medication schedules, caregivers tracking doses for others (including infants needing 24/7 care), and individuals prone to forgetting (e.g., elderly, those with cognitive impairments).

**3. Target Audience:**

* Individuals managing their own medication schedules (simple or complex).
* Caregivers managing medication for others (children, elderly, patients).
* Users needing reminders for any recurring task requiring specific timing (e.g., feeding schedules, therapy exercises).
* Users with conditions affecting memory (e.g., Alzheimer's disease).

**4. Core Functionality:**

Users can create custom reminder schedules by defining:
* A starting point (date and time).
* A frequency (how often the reminder repeats).
* An optional end date for the entire schedule.
* Optional daily time constraints (a "do not disturb" window).
* The system then automatically calculates and triggers notifications at the appropriate times.

**5. Key User Interface Components & Inputs:**

* **Schedule Name/Label (Implied):** To identify the reminder (e.g., "Morning Meds," "Pain Relief," "Baby Feed").
* **Start Date:** The calendar date on which the schedule begins.
* **Start Time:** The time of the *first* reminder on the Start Date.
* **Frequency:**
    * **Number:** A numerical input (e.g., `3`, `1`, `2`).
    * **Unit:** A dropdown selection: `Hours`, `Days`, `Weeks`, `Months`.
        * *Example:* `3` + `Hours` = Every 3 hours.
        * *Example:* `1` + `Day` = Every day.
        * *Example:* `2` + `Weeks` = Every two weeks.
        * *Example:* `1` + `Month` = Every month.
* **End Date (Optional):** The last calendar date on which reminders should potentially occur. If left blank, the schedule runs indefinitely until paused or deleted.
* **Daily Time Constraints:**
    * **[Checkbox] Remind Anytime (24 hours):** If checked, reminders can occur at any time of day or night based purely on the frequency calculation. (Useful for critical meds, infant care).
    * **[Time Input] Daily Start Time:** If "Remind Anytime" is *not* checked, this defines the earliest time a reminder can be sent on any given day.
    * **[Time Input] Daily End Time:** If "Remind Anytime" is *not* checked, this defines the latest time a reminder can be sent on any given day. Reminders calculated to fall *after* this time will be skipped until the *next* valid slot on the following day (or later, depending on frequency).
* **Monthly Specifics (if Frequency = Months):**
    * **[Date Input] Day of Month:** User must select the specific day number (1-31) for the monthly reminder.

**6. Scheduling Logic & Workflow:**

1.  **Initiation:** User provides all required inputs (Start Date/Time, Frequency). Optional inputs (End Date, Daily Constraints) are considered.
2.  **First Reminder:** The system schedules the first reminder for the exact Start Date and Start Time.
3.  **Subsequent Reminders Calculation:**
    * Based on the Frequency (X Hours/Days/Weeks/Months), the system calculates the *potential* time for the next reminder.
    * **Hourly:** Adds X hours to the last reminder time.
    * **Daily:** Adds X days to the last reminder time, keeping the same time of day.
    * **Weekly:** Adds X weeks to the last reminder time, keeping the same day of the week and time of day. *Constraint:* All reminders within a weekly schedule occur at the same time on the designated day(s) - initially simplified to the same day of the week as the Start Date.
    * **Monthly:** Schedules for the user-selected day of the month, X months after the last reminder, at the same time of day.
4.  **Validation Checks (before scheduling notification):**
    * **Overall End Date:** Is the calculated time *on or before* the user-defined End Date (if provided)? If after, stop scheduling.
    * **Daily Time Constraints (if "Remind Anytime" is OFF):** Does the calculated time fall *between* the Daily Start Time and Daily End Time (inclusive)?
        * If YES: Schedule the notification.
        * If NO: *Discard* this calculated time slot. Calculate the *next* potential time based on frequency and re-validate. (e.g., If frequency is 6 hours, daily end time is 9 PM, and a reminder triggers at 9 PM, the next calculated time is 3 AM. This is skipped. The system then calculates the *following* 6-hour interval, which might be 9 AM the next day, and validates that.)
    * **Creation Time:** If the schedule is created *after* one or more calculated reminder times for the *current* day have already passed, those past reminders for today are ignored. The system schedules the *first upcoming* valid reminder. (e.g., Creating a 9 AM start, 3-hour frequency schedule at 4 PM means the 9 AM and 12 PM reminders for today are skipped; the first notification will be for 6 PM today, assuming it meets other validation checks).
5.  **Loop:** Repeat steps 3 & 4 until the End Date is reached or the schedule is paused/deleted.

**7. Notification Details:**

* **Timing:** One notification sent precisely *at* the scheduled time. (Consideration for a setting allowing "X minutes before" might be a future enhancement, but the core request is *at* the time).
* **Reliability:** Notifications must be highly reliable and prominent. Avoid situations where alerts might be missed due to device settings or app background state where possible (may require platform-specific considerations like critical alerts).
* **User Interaction:** No confirmation ("I took it") is required from the user via the notification itself. The notification serves purely as an alert.
* **History/Display:** Past/missed notifications should be hidden or moved to a history section in the app interface to avoid cluttering the main view. They should not be permanently deleted from the system logs if auditing is needed, but hidden from the user's primary flow.

**8. Schedule Management:**

Users must be able to manage their created schedules:

* **View:** See a list of active/paused schedules.
* **Pause:** Temporarily stop notifications for a schedule without deleting its settings. Useful for temporary breaks in medication/routine.
* **Resume:** Reactivate a paused schedule. The system should calculate the next valid reminder time based on the original parameters and the current date/time.
* **Edit:** Modify any parameters of an existing schedule (start/end dates, frequency, time constraints). Recalculation of future reminders will be necessary.
* **Delete:** Permanently remove a schedule and all its future planned notifications.

**9. Key Considerations & Edge Cases:**

* **Monthly Frequency on Short Months:** Handle cases where the selected day (e.g., 31st) doesn't exist in a given month (logic should likely default to the last day of that month, or skip - needs definition). *Decision:* For simplicity and predictability, it might be better to only allow selection of days 1-28 for monthly schedules, or clearly state the behaviour for non-existent dates. Picking the date seems most robust.
* **Time Zone Changes:** How are schedules handled if the user changes time zones? (Typically, stick to the device's current time zone for calculations and alerts).
* **Daylight Saving Time:** Ensure calculations correctly handle DST transitions if frequency spans across them (most system date/time libraries handle this).
* **Notification Permissions:** The app must guide the user to grant necessary notification permissions.
* **Accuracy:** Emphasize rigorous testing to ensure calculation logic is precise and reliable ("150% accurate").
