import React, { useState } from "react";
import axios from "axios";
import Image from "next/image";
import arrow from "../../public/arrow.png";
import styles from "../styles/page.module.css";
import Chatbot from "../chatbot/page";

export default function CalendarChild({ isOpen, onClose }) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);

  const suggestHabits = async (events) => {
    const calendarSummary = events
      .map((e) => `Event: ${e.summary}\nStart: ${e.start}\nEnd: ${e.end}`)
      .join("\n\n");

    const messages = [
      {
        role: "system",
        content:
          "You are a helpful habit coach that suggests habits based on a user's weekly calendar.",
      },
      {
        role: "user",
        content: `Here is my upcoming schedule:\n\n${calendarSummary}\n\nWhat are 3 habits I can realistically incorporate into this routine?`,
      },
    ];

    const response = await axios.post("/api/chat", { messages });

    const reply = response.data.choices[0].message.content;
    setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
  };
  const handleCalendarUpload = async (e) => {
    const file = e.target.files[0];
    setFile(file);

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
          location: event.location,
        };
      });

      // Format events for the chat
      const formattedEvents = events
        .map(
          (e) =>
            `- ${
              e.summary
            } from ${e.start.toLocaleTimeString()} to ${e.end.toLocaleTimeString()} on ${e.start.toLocaleDateString()}`
        )
        .join("\n");

      // Set chat messages with the calendar data
      setChatMessages([
        {
          role: "system",
          content: `You are a personalized healthy habit recommendation assistant. Analyze this schedule and suggest specific, actionable healthy habits that can fit into the user's calendar.

Schedule:
${formattedEvents}

When making recommendations:
1. Be specific about timing
2. Consider the user's existing schedule patterns
3. Suggest realistic habit durations (5-30 minutes)
4. Recommend a mix of physical, mental, and nutritional habits
5. Reference specific events from their calendar`,
        },
        {
          role: "user",
          content:
            "Based on my calendar, what specific healthy habits can I incorporate into my schedule? Please be precise about when and how I could fit these into my day.",
        },
      ]);

      setSuccess("Calendar processed successfully!");
    } catch (err) {
      console.error("Failed to parse calendar:", err);
      setError("There was an issue processing your calendar file.");
    }
  };

  return (
    <div>
      <div className={styles.calendar_container}>
        <h1>Upload Your Calendar</h1>

        <div className={styles.upload_section}>
          <label htmlFor="calendar-upload" className={styles.upload_label}>
            {file ? file.name : "Choose a calendar file"}
          </label>

          <input
            id="calendar-upload"
            type="file"
            accept=".ics"
            onChange={handleCalendarUpload}
            className={styles.file_input}
            disabled={isLoading}
          />

          {isLoading && <p className={styles.loading}>Uploading...</p>}
          {error && <p className={styles.error}>{error}</p>}
          {success && <p className={styles.success}>{success}</p>}
        </div>

        <p className={styles.help_text}>
          Upload your calendar in .ics format to import your events
        </p>
        <Chatbot triggerMessages={chatMessages} />
      </div>
    </div>
  );
}
