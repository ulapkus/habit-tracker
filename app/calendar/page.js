"use client";
import React, { useState, useEffect } from "react";
import styles from "../styles/page.module.css";
import ICAL from "ical.js";
import Chatbot from "../chatbot/page";

const Calendar = () => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [calendarData, setCalendarData] = useState(null);

  // Find patterns in the schedule
  const analyzeSchedule = (events) => {
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const schedule = {};

    // Initialize schedule structure
    daysOfWeek.forEach((day) => {
      schedule[day] = {
        firstEvent: null,
        lastEvent: null,
        gaps: [],
        events: [],
      };
    });

    // Sort events by start time
    events.sort((a, b) => a.start - b.start);

    // Populate events by day
    events.forEach((event) => {
      const day = daysOfWeek[event.start.getDay()];
      const eventData = {
        summary: event.summary,
        start: event.start,
        end: event.end,
        startTime: event.start.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        endTime: event.end.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        duration: (event.end - event.start) / (1000 * 60), // duration in minutes
      };

      schedule[day].events.push(eventData);

      // Update first and last events
      if (
        !schedule[day].firstEvent ||
        event.start < schedule[day].firstEvent.start
      ) {
        schedule[day].firstEvent = eventData;
      }

      if (!schedule[day].lastEvent || event.end > schedule[day].lastEvent.end) {
        schedule[day].lastEvent = eventData;
      }
    });

    // Find gaps between events (30+ minutes)
    daysOfWeek.forEach((day) => {
      const dayEvents = schedule[day].events;
      if (dayEvents.length > 1) {
        dayEvents.sort((a, b) => a.start - b.start);

        for (let i = 0; i < dayEvents.length - 1; i++) {
          const currentEventEnd = dayEvents[i].end;
          const nextEventStart = dayEvents[i + 1].start;
          const gapMinutes = (nextEventStart - currentEventEnd) / (1000 * 60);

          if (gapMinutes >= 30) {
            schedule[day].gaps.push({
              after: dayEvents[i].summary,
              before: dayEvents[i + 1].summary,
              startTime: currentEventEnd.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              endTime: nextEventStart.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              duration: gapMinutes,
            });
          }
        }
      }
    });

    return schedule;
  };

  // Format the analyzed schedule for the AI
  const formatScheduleForAI = (events) => {
    const analyzedSchedule = analyzeSchedule(events);
    const daysOfWeek = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    let formattedData = "DETAILED SCHEDULE ANALYSIS:\n\n";

    daysOfWeek.forEach((day) => {
      const dayData = analyzedSchedule[day];

      formattedData += `=== ${day} ===\n`;

      // Add daily pattern insights
      if (dayData.firstEvent) {
        formattedData += `First activity: ${dayData.firstEvent.summary} at ${dayData.firstEvent.startTime}\n`;
      } else {
        formattedData += "No scheduled events\n";
      }

      if (dayData.lastEvent) {
        formattedData += `Last activity: ${dayData.lastEvent.summary} at ${dayData.lastEvent.endTime}\n`;
      }

      // Add morning routine insights
      if (dayData.firstEvent) {
        const morningHour = dayData.firstEvent.start.getHours();
        if (morningHour < 10) {
          formattedData += `Morning start time: ${dayData.firstEvent.startTime}\n`;
        }
      }

      // Add evening routine insights
      if (dayData.lastEvent) {
        const eveningHour = dayData.lastEvent.end.getHours();
        if (eveningHour > 17) {
          formattedData += `Evening end time: ${dayData.lastEvent.endTime}\n`;
        }
      }

      // Add all events for the day
      if (dayData.events.length > 0) {
        formattedData += "\nEvents:\n";
        dayData.events.forEach((event) => {
          formattedData += `- ${event.summary}: ${event.startTime} - ${
            event.endTime
          } (${Math.round(event.duration)} minutes)\n`;
        });
      }

      // Add notable gaps in schedule
      if (dayData.gaps.length > 0) {
        formattedData += "\nFree time gaps:\n";
        dayData.gaps.forEach((gap) => {
          formattedData += `- ${gap.startTime} to ${gap.endTime} (${Math.round(
            gap.duration
          )} minutes) between "${gap.after}" and "${gap.before}"\n`;
        });
      }

      formattedData += "\n";
    });

    // Add weekly patterns
    formattedData += "WEEKLY PATTERNS:\n";

    // Identify consistent wake-up times
    const morningTimes = daysOfWeek
      .map((day) => analyzedSchedule[day].firstEvent)
      .filter((event) => event && event.start.getHours() < 10)
      .map((event) => event.startTime);

    if (morningTimes.length > 0) {
      formattedData += `Typical wake-up/start times: ${morningTimes.join(
        ", "
      )}\n`;
    }

    // Identify lunch breaks
    const lunchBreaks = Object.values(analyzedSchedule).flatMap((day) =>
      day.gaps.filter((gap) => {
        const hour = new Date(`2023-01-01T${gap.startTime}`).getHours();
        return hour >= 11 && hour <= 14 && gap.duration >= 30;
      })
    );

    if (lunchBreaks.length > 0) {
      formattedData += `Potential lunch breaks: ${lunchBreaks
        .map((gap) => gap.startTime + " to " + gap.endTime)
        .join(", ")}\n`;
    }

    return formattedData;
  };

  const handleCalendarUpload = async (e) => {
    const file = e.target.files[0];
    setFile(file);
    setIsLoading(true);

    try {
      const text = await file.text();
      const jcalData = ICAL.parse(text);
      const comp = new ICAL.Component(jcalData);
      const vevents = comp.getAllSubcomponents("vevent");

      const events = vevents.map((vevent) => {
        const event = new ICAL.Event(vevent);
        return {
          summary: event.summary,
          start: event.startDate.toJSDate(),
          end: event.endDate.toJSDate(),
        };
      });

      setCalendarData(events);
      const scheduleSummary = formatScheduleForAI(events);
      setSuccess("Calendar processed successfully!");

      const systemMessage = {
        role: "system",
        content: `Yo are a personalized healthy habit recommendation assistant. Your goal is to analyze the user's schedule and suggest specific, actionable healthy habits they can incorporate based on the exact times and patterns in their calendar.

${scheduleSummary}

When making recommendations:
1. Be extremely specific about timing (e.g., "Since you wake up at 7:00 AM on weekdays and don't start work until 8:30 AM, you have 20 minutes at 7:10 AM for a quick morning workout").
2. Consider the user's existing schedule patterns and find small pockets of time they could use effectively.
3. Suggest realistic habit durations (5-30 minutes) that can fit into the identified gaps.
4. Recommend a mix of physical, mental, and nutritional habits.
5. Reference specific events and times from their calendar when making suggestions.
6. Provide 3-5 specific, personalized recommendations based on their actual schedule.

For each recommendation, include:
- The exact time slot you're targeting
- The specific habit to incorporate
- A brief explanation of why this would be beneficial
- How long it would take
- Any preparation needed`,
      };

      setChatMessages([
        systemMessage,
        {
          role: "user",
          content:
            "Based on my calendar, what specific healthy habits can I incorporate into my schedule? Please be precise about when and how I could fit these into my day.",
        },
      ]);
    } catch (err) {
      console.error("Failed to parse calendar:", err);
      setError("There was an issue processing your calendar file.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.calendar_container}>
      <div className={styles.calendar_header_container}>
        <div className={styles.calendar_header}>PERSONALIZED HABIT</div>
        <div className={styles.calendar_header}>RECOMMENDATIONS</div>
      </div>

      <div className={styles.upload_section}>
        {/* <label htmlFor="calendar-upload" className={styles.upload_label}>
          {file ? file.name : "Choose a calendar file (.ics)"}
        </label> */}
        <input
          id="calendar-upload"
          type="file"
          accept=".ics"
          onChange={handleCalendarUpload}
          className={styles.hidden_file_input}
          disabled={isLoading}
        />

        <button
          className={styles.upload_button}
          onClick={() => document.getElementById("calendar-upload").click()}
          disabled={isLoading}
        >
          {/* {file ? file.name : "Upload File"} */}
          Upload File
        </button>

        {isLoading && (
          <p className={styles.loading}>Processing calendar data...</p>
        )}
        {error && <p className={styles.error}>{error}</p>}
      </div>

      <Chatbot triggerMessages={chatMessages} />
    </div>
  );
};

export default Calendar;
