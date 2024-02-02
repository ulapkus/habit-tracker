"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import arrow from "../public/arrow.png";

export default function Dashboard() {
  const [displayedQuote, setDisplayedQuote] = useState("");
  const [displayedAuthor, setDisplayedAuthor] = useState("");
  const { data: session } = useSession();

  const motivationalQuotes = [
    {
      text: "Don’t watch the clock; do what it does. Keep going.",
      author: "SAM LEVENSON",
    },
    {
      text: "Believe you can and you're halfway there.",
      author: "THEODORE ROOSEVELT",
    },
    {
      text: "The only way to achieve the impossible is to believe it is possible.",
      author: "CHARLES KINGSLEIGH",
    },
    {
      text: "Success is not final, failure is not fatal: It is the courage to continue that counts.",
      author: "WINSTON CHURCHILL",
    },
    {
      text: "Your time is limited, don't waste it living someone else's life.",
      author: "STEVE JOBS",
    },
    {
      text: "Don't be pushed around by the fears in your mind. Be led by the dreams in your heart.",
      author: "ROY T. BENNETT",
    },
    {
      text: "It always seems impossible until it's done.",
      author: "NELSON MANDELA",
    },
    {
      text: "Your attitude, not your aptitude, will determine your altitude.",
      author: "ZIG ZIGLAR",
    },
    {
      text: "The only limit to our realization of tomorrow will be our doubts of today.",
      author: "FRANKLIN D. ROOSEVELT",
    },
    {
      text: "Do not wait to strike till the iron is hot, but make it hot by striking.",
      author: "WILLIAM BUTLER YEATS",
    },
    {
      text: "The only person you are destined to become is the person you decide to be.",
      author: "RALPH WALDO EMERSON",
    },
    {
      text: "Success is not in what you have, but who you are.",
      author: "BO BENNETT",
    },
    {
      text: "If you want to achieve greatness stop asking for permission.",
      author: "ANONYMOUS",
    },
    {
      text: "Do not wait; the time will never be 'just right.' Start where you stand, and work with whatever tools you may have at your command, and better tools will be found as you go along.",
      author: "NAPOLEON HILL",
    },
    {
      text: "Our greatest glory is not in never falling, but in rising every time we fall.",
      author: "CONFUCIUS",
    },
    {
      text: "The only way to do great work is to love what you do.",
      author: "STEVE JOBS",
    },
    {
      text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.",
      author: "RALPH WALDO EMERSON",
    },
    {
      text: "Success is liking yourself, liking what you do, and liking how you do it.",
      author: "MAYA ANGELOU",
    },
    {
      text: "The future belongs to those who believe in the beauty of their dreams.",
      author: "ELEANOR ROOSEVELT",
    },
    {
      text: "Don't count the days, make the days count.",
      author: "MUHAMMAD ALI",
    },
    {
      text: "The only place where success comes before work is in the dictionary.",
      author: "VIDAL SASSOON",
    },
    {
      text: "Don't be afraid to give up the good to go for the great.",
      author: "JOHN D. ROCKEFELLER",
    },
    {
      text: "It's not about how hard you hit. It's about how hard you can get hit and keep moving forward.",
      author: "ROCKY BALBOA",
    },
    {
      text: "You are the master of your destiny. You can influence, direct, and control your own environment. You can make your life what you want it to be.",
      author: "NAPOLEON HILL",
    },
    {
      text: "Challenges are what make life interesting and overcoming them is what makes life meaningful.",
      author: "JOSHUA J. MARINE",
    },
  ];

  useEffect(() => {
    setDisplayedQuote(quote().text);
    setDisplayedAuthor(quote().author);
  }, []);

  const quote = () => {
    const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
    return motivationalQuotes[randomIndex];
  };

  return (
    <div className="quote-background">
      <div className="quote-box">
        <div className="quote-welcome-user">
          <h1>WELCOME BACK,&nbsp;</h1>
          {!session ? null : (
            <div className="quote-user"> {session.user?.name}</div>
          )}
        </div>
        <p className="quote">
          &quot;{displayedQuote}&quot;
          <span className="author">- {displayedAuthor}</span>
        </p>
        <Link href="/chart" className="quote-button-plus-arrow">
          <p className="quote-button">Go to chart</p>
          <Image className="quote-arrow" src={arrow} alt="habbit rabbit logo" />
        </Link>
      </div>
    </div>
  );
}
