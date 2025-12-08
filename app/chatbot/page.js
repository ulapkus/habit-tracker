import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "../styles/page.module.css";
import { schedule } from "./testschedule";

const Chatbot = ({ triggerMessages = [] }) => {
  const [messages, setMessages] = useState([
    {
      role: "system",
      content: `You are a helpful assistant focused on suggesting personalized healthy habits. 

  ${schedule}

  Your goal is to give suggestions that align specifically with this routine.

  When making recommendations:
1. Be extremely specific about timing (e.g., "Since you wake up at 7:00 AM on weekdays and don't start work until 8:30 AM, you have 20 minutes at 7:10 AM for a quick morning workout").
2. Consider the user's existing schedule patterns and find small pockets of time they could use effectively.
3. Suggest realistic habit durations (5-30 minutes) that can fit into the identified gaps.
4. Recommend a mix of physical, mental, and nutritional habits.
5. Reference specific events and times when making suggestions.
6. Provide 3-5 specific, personalized recommendations based on their actual schedule.
7. Only recommend habits that can be done before or after the schedule events.
8. Do not recommend habits that interfere with the schedule events.
9. Reccomend habits that are not already in the schedule.
10. Recommend habits that can be done immediately before or after the schedule events and which complement the schedule events occurring immediately before or after (e.g., "Since you hike with friends at 12:00 PM on Saturday, you have 1 hour at 11:00 AM for a stretch and a healthy meal").

For each recommendation, include:
- The exact time slot you're targeting
- The specific habit to incorporate
- A brief explanation of why this would be beneficial
- How long it would take
- Any preparation needed
`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendPrompt = async (prompt) => {
    setLoading(true);

    try {
      // Create a new array with all current messages
      const newMessages = [...messages];

      // Add the user message to both the display and API call
      newMessages.push({ role: "user", content: prompt });
      setMessages(newMessages);

      const response = await axios.post();
    } catch (error) {
      console.error("Error fetching response:", error);
    } finally {
      setLoading(false);
    }

  useEffect(() => {
    const runMessages = async () => {
      if (triggerMessages.length > 0) {
        // First, add any system messages to the messages state without displaying them
        const systemMessages = triggerMessages.filter(
          (msg) => msg.role === "system"
        );
        if (systemMessages.length > 0) {
          setMessages((prev) => {
            // Ensure we're not duplicating system messages
            const existingSystemContents = prev
              .filter((msg) => msg.role === "system")
              .map((msg) => msg.content);

            const newSystemMessages = systemMessages.filter(
              (msg) => !existingSystemContents.includes(msg.content)
            );

            return [...prev, ...newSystemMessages];
          });

          // Give state update time to process
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        // Then, process any user messages
        const userMessages = triggerMessages.filter(
          (msg) => msg.role === "user"
        );
        for (const msg of userMessages) {
          await sendPrompt(msg.content);
        }
      }
    };

    runMessages();
  }, [triggerMessages]);

  const sendMessage = () => {
    if (input.trim()) {
      sendPrompt(input);
      setInput("");
    }
  };

  const formatMessage = (content) => {
    return content.split("\n").map((line, index) => {
      if (line.trim().startsWith("•") || line.trim().startsWith("-")) {
        return (
          <div key={index} className={styles.bullet_point}>
            {line}
          </div>
        );
      }
      return line.trim() && <p key={index}>{line}</p>;
    });
  };

  return (
    <div className={styles.chatbot_container}>
      <div className={styles.chatbot_header}>AI Chatbot</div>
      <div className={styles.messages_container}>
        {messages
          .filter((msg) => msg.role !== "system") // Don't display system messages
          .map((msg, i) => (
            <div
              key={i}
              className={`${styles.message} ${
                msg.role === "user" ? styles.user_message : styles.bot_message
              }`}
            >
              <strong>{msg.role === "user" ? "You" : "Bot"}:</strong>
              <div className={styles.message_content}>
                {formatMessage(msg.content)}
              </div>
            </div>
          ))}
        {loading && <p className={styles.typing_indicator}>Bot is typing...</p>}
      </div>
      <div className={styles.input_container}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type your message..."
          className={styles.chat_input}
        />
        <button onClick={sendMessage} className={styles.send_button}>
          Send
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
