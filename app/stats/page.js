"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import rabbitOne from "../../public/bunny-one.png";
import stats from "../../public/blurred-stats.png";
import { differenceInDays } from "date-fns";

export default function Stats() {
  const [dateCreated, setDateCreated] = useState();
  const daysDifference = differenceInDays(new Date(), new Date(dateCreated));

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
      <div className="stats-top">
        <div className="stats-main">
          <p className="days-tracked">
            You&apos;ve been habit hoppin&apos; for {daysDifference} days
          </p>
          <p className="insights">HERE ARE YOUR INSIGHTS</p>
        </div>
        <div className="stats-rabbit-container">
          <Image className="stats-rabbit" src={rabbitOne} alt="rabbit icon" />
          <p className="stats-rabbit-comment">THIS PAGE IS COMING SOON!</p>
        </div>
      </div>
      <Image src={stats} alt="user statistics" className="stats-image" />
    </div>
  );
}
