"use client";

import React from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import styles from "../styles/page.module.css";

const Navbar = () => {
  const { data: session } = useSession();
  const [textColor, setTextColor] = useState("");
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/chart") {
      setTextColor("#FFFAE5");
    } else {
      setTextColor("#8AEEB3");
    }
    return () => {
      setTextColor("");
    };
  }, [pathname]);

  return (
    <div className={styles.nav_background}>
      <div className={styles.nav_main}>
        <div className={styles.logo_div}>
          <Link href="/" className={styles.logo}></Link>
        </div>
        <div className={styles.chart_and_stats}>
          <Link
            href="/about"
            className={styles.nav_link}
            style={{ color: textColor }}
          >
            ABOUT
          </Link>
          {!session ? (
            <>
              <Link
                href="/login"
                className={styles.nav_link}
                style={{ color: textColor }}
              >
                LOGIN
              </Link>
              <Link
                href="/register"
                className={styles.nav_link}
                style={{ color: textColor }}
              >
                REGISTER
              </Link>
              {/* <Link
                href="/calendar"
                className={styles.nav_link}
                style={{ color: textColor }}
              >
                CALENDAR
              </Link> */}
            </>
          ) : (
            <>
              <Link
                href="/chart"
                className={styles.nav_link}
                style={{ color: textColor }}
              >
                CHART
              </Link>
              <Link
                href="/stats"
                className={styles.nav_link}
                style={{ color: textColor }}
              >
                STATS
              </Link>
              {/* <Link
                href="/calendar"
                className={styles.nav_link}
                style={{ color: textColor }}
              >
                CALENDAR
              </Link> */}
              <p
                className={`${styles.nav_link} ${styles.logout}`}
                onClick={() => {
                  signOut();
                }}
                style={{ color: "#BA3032" }}
              >
                LOGOUT
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
