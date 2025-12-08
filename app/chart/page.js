"use client";

import React, { useEffect, useState, createContext } from "react";
import Child from "../components/modal";
import Childtwo from "../components/addHabit";
import { format, addDays, set, getYear } from "date-fns";
import Image from "next/image";
import rabbitEars from "../../public/rabbit-ears.png";
import arrowLeft from "../../public/arrow-left.png";
import arrowRight from "../../public/arrow-right.png";
import Bunny from "../components/bunny";
import styles from "../styles/page.module.css";
// import CalendarChild from "../components/modalcalendar";

export const Context = createContext([[], () => {}]);
export const DaysContext = React.createContext();
export const ColorContext = React.createContext();
export const ModalContext = React.createContext();
export default function Chart() {
  const [habits, setHabits] = useState([]);
  const [days, setDays] = useState({});
  const [colors, setColors] = useState({});
  const [weekCount, setWeekCount] = useState(-1);
  const [view, setView] = useState("week");
  const [isDayClicked, setIsDayClicked] = useState(false);
  const [isSubmitClicked, setIsSubmitClicked] = useState(false);
  const [modalVisibility, setModalVisibility] = useState(true);
  const [modalVisibilityNew, setModalVisibilityNew] = useState(false);
  const [month, setMonth] = useState(() => new Date().getMonth());
  const [year, setYear] = useState(() => getYear(new Date()));
  const [yearWeek, setYearWeek] = useState(() => getYear(new Date()));
  const [weekDates, setWeekDates] = useState(() => {
    const past7Days = Array.from({ length: 7 }, (_, index) => {
      const dates = new Date(new Date());
      dates.setDate(new Date().getDate() - index);
      return dates;
    });
    return past7Days.sort((a, b) => a - b);
  });
  const [isNewUser, setIsNewUser] = useState(true);
  const [resetChildtwo, setResetChildtwo] = useState(false);
  // const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);

  async function fetchState() {
    try {
      const res = await fetch("/api/fetchState");
      if (!res.ok) {
        throw new Error("Error fetching user", error.message);
      }
      const newResponse = await res.json();
      setDays(newResponse.data[0].days);
      setHabits(newResponse.data[0].habits);
      setColors(newResponse.data[0].colors);
    } catch (error) {
      console.log("Error fetching current user", error.message);
    }
  }

  useEffect(() => {
    fetchState();
  }, []);

  useEffect(() => {
    if (isNewUser) {
      setModalVisibility(true);
    }
  }, [isNewUser]);

  const addHabit = () => {
    setModalVisibilityNew(true);
    setResetChildtwo(true);
  };

  const openCalendar = () => {
    setIsCalendarModalOpen(true);
  };

  const eraseHabit = (activity, i) => {
    const newHabits = [...habits];
    newHabits.splice(i, 1);
    setHabits(newHabits);

    const newDays = { ...days };
    delete newDays[activity];
    setDays(newDays);

    const newColors = { ...colors };
    delete newColors[activity];
    setColors(newColors);

    setIsSubmitClicked(true);
  };

  const saveAddOrRemoveHabit = async () => {
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

  useEffect(() => {
    if (isSubmitClicked) {
      saveAddOrRemoveHabit();
      setIsSubmitClicked(false);
    }
  }, [isSubmitClicked]);

  const saveCellClick = async () => {
    const daysCopy = days;
    try {
      const res = await fetch("/api/sendCopy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          daysCopy,
        }),
      });
      await res.json();
    } catch (error) {
      console.log(error);
    }
  };

  const cellClickWeek = (activityy, dayIndexx) => {
    const dates = weekDates[dayIndexx];
    const newDates = `${dates.getFullYear()}-${
      dates.getMonth() + 1
    }-${dates.getDate()}`;
    if (days[activityy].includes(newDates)) {
      setDays((prevDays) => {
        return {
          ...prevDays,
          [activityy]: prevDays[activityy].filter((date) => date !== newDates),
        };
      });
    } else {
      setDays((prevDays) => {
        return {
          ...prevDays,
          [activityy]: [...prevDays[activityy], newDates],
        };
      });
    }
    setIsDayClicked(true);
  };

  const cellClickMonth = (activity, dayIndex) => {
    const dates = new Date(year, month, dayIndex + 1);
    const newDates = `${dates.getFullYear()}-${
      dates.getMonth() + 1
    }-${dates.getDate()}`;

    if (days[activity].includes(newDates)) {
      setDays((prevDays) => {
        return {
          ...prevDays,
          [activity]: prevDays[activity].filter((date) => date !== newDates),
        };
      });
    } else {
      setDays((prevDays) => {
        return {
          ...prevDays,
          [activity]: [...prevDays[activity], newDates],
        };
      });
    }
    setIsDayClicked(true);
  };

  useEffect(() => {
    if (isDayClicked) {
      saveCellClick();
      setIsDayClicked(false);
    }
  }, [isDayClicked]);

  const back = () => {
    setWeekCount((prevWeekCount) => prevWeekCount - 1);
  };

  const next = () => {
    setWeekCount((prevWeekCount) => prevWeekCount + 1);
  };

  const generateDateArray = (state) => {
    const today = addDays(new Date(), 1);
    const startDate = new Date(today);
    startDate.setDate(today.getDate() + state * 7);
    const newYear = getYear(startDate);
    setYearWeek(newYear);

    const dateArray = Array.from({ length: 7 }, (_, index) => {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + index);
      return currentDate;
    });
    setWeekDates(dateArray);
    return dateArray;
  };

  useEffect(() => {
    generateDateArray(weekCount);
  }, [weekCount]);

  const dayColorWeek = (activityy, dayIndexxx) => {
    const date = new Date(
      new Date(year, month, new Date().getDate() + (weekCount * 7 + 1))
    );
    date.setDate(date.getDate() + dayIndexxx);
    return days[activityy].includes(
      `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
    )
      ? colors[activityy]
      : "rgba(255, 255, 255, 0.1)";
  };

  const dayShadowWeek = (activityy, dayIndexxx) => {
    const date = new Date(
      new Date(year, month, new Date().getDate() + (weekCount * 7 + 1))
    );
    date.setDate(date.getDate() + dayIndexxx);
    return days[activityy].includes(
      `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
    )
      ? `0 4px 30px ${colors[activityy]}`
      : "0 4px 30px rgba(0, 0, 0, 0.1)";
  };

  const handleChange = (event) => {
    if (event.target.value === "month") {
      monthView();
    } else if (event.target.value === "week") {
      weekView();
    }
  };

  const weekView = () => {
    setView("week");
    setModalVisibility(false);
  };

  const monthView = () => {
    setView("month");
    setModalVisibility(false);
  };

  const getDayOfWeek = (year, month, day) => {
    const week = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return week[new Date(year, month, day).getDay()];
  };

  const renderWeekView = () => {
    return (
      <div className={styles.background_week}>
        <Bunny />
        <div className={styles.main_items_week}>
          <div className={styles.header_week}>
            <div className={styles.header_left_week}>
              <Image
                src={arrowLeft}
                alt="left arrow"
                className={styles.back}
                onClick={back}
              />
              <div className={styles.header_four}>
                <h4>{format(weekDates[0], "EEEE, M/d")}</h4>
                <h4>to {format(weekDates[6], "EEEE, M/d")}</h4>
              </div>
              <Image
                src={arrowRight}
                alt="right arrow"
                className={styles.next}
                onClick={next}
              />
            </div>
            <div className={styles.header_right_week}>
              {/* <div className={styles.month_view_container}>
                <p
                  onClick={openCalendar}
                  style={{
                    color: "white",
                    fontFamily: "Roboto Mono, monospace",
                    fontSize: 12,
                    whiteSpace: "wrap",
                    textAlign: "center",
                    width: "90%",
                    cursor: "pointer",
                  }}
                >
                  UPLOAD CALENDAR
                </p>
              </div> */}
              <div
                className={styles.month_view_container}
                onChange={handleChange}
              >
                <select className={styles.month_view}>
                  <option className={styles.month_view_child} value="">
                    WEEK
                  </option>
                  <option className={styles.month_view_child} value="month">
                    MONTH
                  </option>
                </select>
              </div>
              <div className={styles.add_more_week_container}>
                <Image
                  src={rabbitEars}
                  alt="rabbit ears"
                  className={styles.rabbit_month}
                />
                <p className={styles.add_more_week} onClick={() => addHabit()}>
                  NEW HABIT +
                </p>
              </div>
            </div>
          </div>
          <div className={styles.main_table}>
            <ModalContext.Provider
              value={{
                value: [modalVisibility, setModalVisibility],
                value2: [modalVisibilityNew, setModalVisibilityNew],
                value3: [days, setDays],
                value4: [colors, setColors],
                value5: [habits, setHabits],
                value6: [isNewUser, setIsNewUser],
                value7: [resetChildtwo, setResetChildtwo],
              }}
            >
              <Child />
              <Childtwo />
              {/* <CalendarChild 
                isOpen={isCalendarModalOpen} 
                onClose={() => setIsCalendarModalOpen(false)} 
              /> */}
            </ModalContext.Provider>
            <table>
              <thead>
                <tr className={styles.week_header}>
                  {weekDates.map((datee, dayIndexx) => (
                    <th className={styles.days} key={dayIndexx}>
                      <p>{getDayOfWeek(year, month, dayIndexx - 1)}</p>
                      <p>{`${datee.getMonth() + 1}/${datee.getDate()}`}</p>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {days &&
                  Object.keys(days).map((activityy, indexx) => (
                    <tr key={indexx} className={styles.week_cell_row}>
                      <td className={styles.week_cell_habit}>
                        <div className={styles.activity_week}>{activityy}</div>
                        <p
                          onClick={() => eraseHabit(activityy, indexx)}
                          className={styles.x_button_week}
                        >
                          X
                        </p>
                      </td>
                      {weekDates.map((datee, dayIndexxx) => (
                        <td
                          className={styles.week_cell}
                          key={dayIndexxx}
                          onClick={() => cellClickWeek(activityy, dayIndexxx)}
                          style={{
                            backgroundColor: dayColorWeek(
                              activityy,
                              dayIndexxx
                            ),
                            boxShadow: dayShadowWeek(activityy, dayIndexxx),
                          }}
                        ></td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const previousMonth = () => {
    setMonth((prevMonth) => (prevMonth === 0 ? 11 : prevMonth - 1));
    setYear((prevYear) => (month === 0 ? prevYear - 1 : prevYear));
  };

  const nextMonth = () => {
    setMonth((prevMonth) => (prevMonth === 11 ? 0 : prevMonth + 1));
    setYear((prevYear) => (month === 11 ? prevYear + 1 : prevYear));
  };

  useEffect(() => {
    renderMonthView();
  }, [month, year]);

  const dayColorMonth = (activity, dayIndex) => {
    const dates = new Date(year, month, dayIndex + 1);
    return days[activity].includes(
      `${dates.getFullYear()}-${dates.getMonth() + 1}-${dates.getDate()}`
    )
      ? colors[activity]
      : "rgba(255, 255, 255, 0.1)";
  };

  const dayShadowMonth = (activity, dayIndex) => {
    const dates = new Date(year, month, dayIndex + 1);
    return days[activity].includes(
      `${dates.getFullYear()}-${dates.getMonth() + 1}-${dates.getDate()}`
    )
      ? `0 4px 30px ${colors[activity]}`
      : "0 4px 30px rgba(0, 0, 0, 0.1)";
  };

  const daysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const renderMonthView = () => {
    return (
      <div>
        <div className={styles.background_month}>
          <Bunny />
          <div className={styles.main_items_month}>
            <div className={styles.header_month}>
              <div className={styles.header_left_month}>
                <Image
                  src={arrowLeft}
                  alt="left arrow"
                  className={styles.backMonth}
                  onClick={previousMonth}
                />
                <div className={styles.month_and_year}>
                  <h6>
                    {format(set(new Date(), { month: month }), "MMMM")} {year}
                  </h6>
                </div>
                <Image
                  src={arrowRight}
                  alt="right arrow"
                  className={styles.nextMonth}
                  onClick={nextMonth}
                />
              </div>
              <div className={styles.header_right_month}>
                <div className={styles.week_view_container}>
                  <select className={styles.week_view} onChange={handleChange}>
                    <option className={styles.week_view_child} value="">
                      MONTH
                    </option>
                    <option className={styles.week_view_child} value="week">
                      WEEK
                    </option>
                  </select>
                </div>
                <div className={styles.add_more_month_container}>
                  <Image
                    src={rabbitEars}
                    alt="rabbit ears"
                    className={styles.add_more_img_month}
                  />
                  <p
                    className={styles.add_more_month}
                    onClick={() => addHabit()}
                  >
                    NEW HABIT +
                  </p>
                </div>
              </div>
            </div>
            <div className={styles.main_table_month}>
              <ModalContext.Provider
                value={{
                  value: [modalVisibility, setModalVisibility],
                  value2: [modalVisibilityNew, setModalVisibilityNew],
                  value3: [days, setDays],
                  value4: [colors, setColors],
                  value5: [habits, setHabits],
                  value6: [isNewUser, setIsNewUser],
                  value7: [resetChildtwo, setResetChildtwo],
                }}
              >
                <Child />
                <Childtwo />
              </ModalContext.Provider>
              <table className={styles.habit_table_month}>
                <thead>
                  <tr className={styles.month_header}>
                    {Array.from(
                      { length: daysInMonth(year, month) },
                      (_, dayIndex) => (
                        <th className={styles.month_daysofweek} key={dayIndex}>
                          <p>{getDayOfWeek(year, month, dayIndex + 1)}</p>
                          <p>{dayIndex + 1}</p>
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {habits.length > 0 ? (
                    Object.keys(days).map((activity, index) => (
                      <tr key={index} className={styles.month_cell_row}>
                        <td className={styles.month_cell_habit}>
                          <div className={styles.activity_month}>
                            {activity}
                          </div>
                          <p
                            onClick={() => eraseHabit(activity, index)}
                            className={styles.x_button_month}
                          >
                            X
                          </p>
                        </td>
                        {Array.from(
                          { length: daysInMonth(year, month) },
                          (_, dayIndex) => (
                            <td
                              className={styles.month_cell}
                              key={dayIndex}
                              onClick={() => cellClickMonth(activity, dayIndex)}
                              style={{
                                backgroundColor: dayColorMonth(
                                  activity,
                                  dayIndex
                                ),
                                boxShadow: dayShadowMonth(activity, dayIndex),
                              }}
                            ></td>
                          )
                        )}
                      </tr>
                    ))
                  ) : (
                    <div className={styles.no_habits_container}>
                      <div className={styles.no_habits_text}>
                        HABIT LIST EMPTY
                      </div>
                      <div className={styles.no_habits_subcontainer}>
                        <div className={styles.no_habits_text_small}>
                          Want to add a habit?
                        </div>
                        <div className={styles.add_more_week_container}>
                          <p
                            className={styles.add_more_week}
                            onClick={() => addHabit()}
                          >
                            NEW HABIT +
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return <div>{view === "week" ? renderWeekView() : renderMonthView()}</div>;
}
