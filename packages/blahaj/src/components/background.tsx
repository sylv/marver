import React, { FC, Fragment, memo, useEffect, useState } from 'react';
import create from 'zustand';
import { AnimatePresence, motion } from 'framer-motion';
import produce from 'immer';
import noise from '../assets/noise.svg';

const useStore = create(() => ({
  colours: null as null | string[],
  url: null as null | string,
  previousUrl: null as null | string,
}));

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const animateDuration = 3;
const bubbleCount = 5;

export const useBackgroundColours = (coloursOrUrl: string | string[] | null) => {
  useEffect(() => {
    if (Array.isArray(coloursOrUrl)) {
      useStore.setState(
        produce((state) => {
          if (state.url) state.previousUrl = state.url;
          state.url = null;
          state.colours = coloursOrUrl;
        })
      );
    } else if (typeof coloursOrUrl === 'string') {
      useStore.setState(
        produce((state) => {
          if (state.url === coloursOrUrl) return;
          if (state.url) state.previousUrl = state.url;
          state.url = coloursOrUrl;
          state.colours = null;
        })
      );
    } else {
      useStore.setState(
        produce((state) => {
          if (state.url) state.previousUrl = state.url;
          state.url = null;
          state.colours = null;
        })
      );
    }
  }, [coloursOrUrl]);
};

const Bubble = memo<{ colours: string[]; index: number }>(({ colours, index }) => {
  const [x, setX] = useState(randomInt(0, 80));
  const [y, setY] = useState(randomInt(0, 80));
  const [size] = useState(randomInt(200, 600));
  const [duration] = useState(randomInt(7.5, 15));
  const colour = colours[index % colours.length];

  useEffect(() => {
    const moveTarget = () => {
      setX(randomInt(0, 80));
      setY(randomInt(0, 80));
    };

    moveTarget();
    const interval = setInterval(moveTarget, duration * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      key={index}
      className="absolute rounded-full"
      style={{
        height: `${size}px`,
        width: `${size}px`,
        marginLeft: `${x}vw`,
        marginTop: `${y}vh`,
        backgroundColor: colour,
        transitionDuration: `${duration}s`,
        animationDuration: `${duration}s`,
        transitionTimingFunction: 'linear',
      }}
    />
  );
});

export const Background: FC = () => {
  const state = useStore();
  const colours = state.colours ?? ['#8a39e6', '#e639e0'];

  return (
    <Fragment>
      <div
        id="background-noise"
        className="fixed top-0 w-screen h-screen -z-10 opacity-10"
        style={{
          backgroundImage: `url(${noise})`,
          backgroundRepeat: 'repeat',
          backgroundSize: '100px',
        }}
      />
      <AnimatePresence>
        {state.url && (
          <motion.div
            key={state.url}
            className="fixed top-0 h-screen w-screen overflow-hidden -z-20 blur-3xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3, transition: { duration: animateDuration } }}
            exit={{ opacity: 0, transition: { duration: animateDuration } }}
            style={{
              backgroundImage: `url(${state.url})`,
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        )}
        {state.url && state.previousUrl && (
          <motion.div
            key={state.previousUrl}
            className="fixed top-0 h-screen w-screen overflow-hidden -z-30 blur-3xl"
            initial={{ opacity: 0.3 }}
            animate={{ opacity: 0, transition: { duration: animateDuration } }}
            exit={{ opacity: 0 }}
            style={{
              backgroundImage: `url(${state.previousUrl})`,
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        )}
        {!state.url && (
          <motion.div
            key="background-orbs"
            className="fixed top-0 h-screen w-screen overflow-hidden -z-40 blur-3xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1, transition: { duration: animateDuration } }}
            exit={{ opacity: 0 }}
          >
            {new Array(bubbleCount).fill(null).map((_, index) => (
              <Bubble colours={colours} index={index} key={index} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </Fragment>
  );
};
