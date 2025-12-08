"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import rabbitOne from "../../public/bunny-one.png";
import stats from "../../public/blurred-stats.png";
import { differenceInDays } from "date-fns";
import styles from "../styles/page.module.css";

export default function Stats() {
  const [dateCreated, setDateCreated] = useState();
  const days = differenceInDays(new Date(), new Date(dateCreated));
  const daysDifference = Number.isNaN(days) ? 0 : days;

  async function getStartDate() {
    try {
      const res = await fetch("/api/getStats");

      if (!res.ok) {
        throw new Error("Error fetching users", error.message);
      }
      const modalResponse = await res.json();
      const updatedData = Object.values(modalResponse.data[0])[0];
      setDateCreated(updatedData);
    } catch (error) {
      console.log("Error fetching current user", error.message);
    }
  }

  useEffect(() => {
    getStartDate();
  }, []);

  return (
    <div>
      <div className={styles.stats_top}>
        <div className={styles.stats_main}>
          <p className={styles.days_tracked}>
            You&apos;ve been habit hoppin&apos; for {daysDifference} days
          </p>
          <p className={styles.insights}>HERE ARE YOUR INSIGHTS</p>
        </div>
        <div className={styles.stats_rabbit_container}>
          <Image
            className={styles.stats_rabbit}
            src={rabbitOne}
            alt="rabbit icon"
          />
          <p className={styles.stats_rabbit_comment}>
            THIS PAGE IS COMING SOON!
          </p>
        </div>
      </div>
      <Image src={stats} alt="user statistics" className={styles.stats_img} />
    </div>
  );
}
