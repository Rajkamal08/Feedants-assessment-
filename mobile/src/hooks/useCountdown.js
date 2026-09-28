import { useState, useEffect } from 'react';

export const useCountdown = (targetDate) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(targetDate));

  useEffect(() => {
    if (!targetDate) return;

    // Update the timer every second
    const timer = setInterval(() => {
      const calculatedTime = calculateTimeLeft(targetDate);
      setTimeLeft(calculatedTime);

      // Stop the timer if it reaches 0
      if (
        calculatedTime.days === 0 &&
        calculatedTime.hours === 0 &&
        calculatedTime.minutes === 0 &&
        calculatedTime.seconds === 0
      ) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
};

const calculateTimeLeft = (targetDate) => {
  if (!targetDate) return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };

  const difference = new Date(targetDate) - new Date();

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    isPast: false,
  };
};

export const formatTime = (time) => {
  return time < 10 ? `0${time}` : time;
};
