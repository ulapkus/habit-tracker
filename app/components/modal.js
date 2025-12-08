import React, { useEffect, useState } from "react";
import { ModalContext } from "../chart/page";
import Image from "next/image";
import arrow from "../../public/arrow.png";
import alert from "../../public/alert-icon.png";
import styles from "../styles/page.module.css";

export default function Child() {
  const { value } = React.useContext(ModalContext);
  const { value3 } = React.useContext(ModalContext);
  const { value4 } = React.useContext(ModalContext);
  const { value5 } = React.useContext(ModalContext);

  const [days, setDays] = value3;
  const [colors, setColors] = value4;
  const [habits, setHabits] = value5;
  const [modalVisibility, setModalVisibility] = value;
  const [habitInputField, setHabitInputField] = useState([[], [], []]);
  const [colorInputField, setColorInputField] = useState([[], [], []]);
  const [showModal, setShowModal] = useState(false);
  const [stateUpdated, setStateUpdated] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function getData() {
    try {
      const res = await fetch("/api/updateModal");
      if (!res.ok) {
        throw new Error("Error fetching users", error.message);
      }
      const modalResponse = await res.json();
      const updatedData = Object.values(modalResponse.data[0])[0];
      setShowModal(updatedData);
    } catch (error) {
      console.log("Error fetching current user", error.message);
    }
  }

  useEffect(() => {
    getData();
  }, []);

  const saveAddHabit = async () => {
    const daysCopy = days;
    const colorsCopy = colors;
    const habitsCopy = habits;
    try {
      const res = await fetch("/api/addOrRemoveHabit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          daysCopy,
          colorsCopy,
          habitsCopy,
        }),
      });
      await res.json();
    } catch (error) {
      console.log(error);
    }
  };

  const hasSeenModal = async () => {
    console.log("hasSeenModal");
    const makeFalse = false;
    try {
      const res = await fetch("/api/updateModal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          makeFalse,
        }),
      });
      await res.json();
    } catch (error) {
      console.log(error);
    }
  };

  function getInputValues() {
    const inputFields = document.querySelectorAll("input[type='text']");
    const inputValues = Array.from(inputFields).map((input) => input.value);

    const habitFilled = habitInputField.every((array) => array.length > 0);
    const colorFilled = colorInputField.every((array) => array.length > 0);

    if (habitFilled && colorFilled) {
      inputValues.map((inputValue, index) => {
        setDays((prevDays) => ({
          ...prevDays,
          [inputValues[index]]: [],
        }));

        inputValues.map((inputValue, index) => {
          setColors((prevColor) => ({
            ...prevColor,
            [inputValues[index]]: colorInputField[index],
          }));
        });
        setHabits((prevHabits) => [...habitInputField]);
      });
      setShowModal(false);
      hasSeenModal();
      setModalVisibility(false);
      setStateUpdated(true);
      setErrorMessage("");
    } else {
      setErrorMessage(
        "NOT ALL BOXES ARE FILLED IN. PLEASE INCLUDE THREE HABITS AND THREE COLORS."
      );
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }
  }

  useEffect(() => {
    if (stateUpdated) {
      saveAddHabit();
      setStateUpdated(false);
    }
  }, [stateUpdated]);

  const handleInputChange = (onChangeValue, i) => {
    const inputValue = [...habitInputField];
    inputValue[i] = onChangeValue.target.value;
    setHabitInputField(inputValue);
  };

  const handleColorChange = (e, index) => {
    const colorValue = [...colorInputField];
    colorValue[index] = e.target.value;
    setColorInputField(colorValue);
  };

  return (
    <div>
      {showModal && modalVisibility && (
        <div
          id="myModal"
          className={styles.modal_container}
          style={{
            display: "block",
            backgroundImage: `url('/background-modal.png')`,
          }}
        >
          <p
            className={`${styles.error} ${
              errorMessage ? styles.error_visible : ""
            }`}
          >
            {errorMessage && (
              <Image
                src={alert}
                alt="Error"
                className={styles.error_img}
              ></Image>
            )}
            {errorMessage}
          </p>
          <div className={styles.modal_content}>
            <section className={styles.question_main}>
              <div className={styles.modal_text}>
                <h5>{"Let's start you off with three habits to work on"}</h5>
                <div className={styles.input_boxes}>
                  <div className={styles.modal_habit_input}>
                    {habitInputField.map((habitInput, i) => {
                      return (
                        <div key={i} className={styles.modal_habit}>
                          <input
                            value={habitInput}
                            onChange={(e) => handleInputChange(e, i)}
                            placeholder="ENTER HABIT HERE..."
                            type="text"
                            className={styles.modal_question}
                          />
                        </div>
                      );
                    })}
                  </div>
                  <div className={styles.modal_color_input}>
                    {colorInputField.map((colorField, index) => {
                      return (
                        <div
                          key={index}
                          className={styles.modal_color_plus_button}
                        >
                          <select
                            className={styles.modal_color}
                            onChange={(e) => handleColorChange(e, index)}
                          >
                            <option value="">COLOR</option>
                            <option value="#e74645">RED</option>
                            <option value="#FF8466">ORANGE</option>
                            <option value="#FFBD49">YELLOW</option>
                            <option value="#93C574">GREEN</option>
                            <option value="#3b4cc3">BLUE</option>
                            <option value="#AA8AFA">PURPLE</option>
                            <option value="#FF81C3">PINK</option>
                          </select>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>
            <button onClick={getInputValues} className={styles.submit_q}>
              <p className={styles.start_hoppin}>Start hoppin&apos;</p>
              <Image src={arrow} alt="arrow" className={styles.arrow_q} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
