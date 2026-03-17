'use client';

import {
  ThemeProvider as MUIThemeProvider,
  useMediaQuery,
} from '@mui/material';
import React, { useLayoutEffect, useMemo, useState } from 'react';

import themes from '../../../themes';
import { type ThemeColor } from '../../../themes/color';
import ThemeContext, { type ThemeMode } from '../../../themes/themeContext';

export type Colors = Record<string, ThemeColor>;

interface EditorThemeProviderProps {
  children?: React.ReactNode;
  colors?: Colors;
  mode?: keyof Colors;
  theme?: object;
}

const DEFAULT_THEMES = ['light', 'dark', 'system'];

let CX_THEME_COLORS: Colors | undefined;
const EditorThemeProvider: React.FC<EditorThemeProviderProps> = ({
  children,
  colors = CX_THEME_COLORS,
  mode: propsMode,
  theme: options = {},
}) => {
  const [mode, setMode] = useState(() => {
    if (propsMode) {
      window.localStorage.setItem('themeMode', propsMode);
      return propsMode;
    }
    const storageMode = window.localStorage.getItem('themeMode') || 'system';
    let parseStorageMode = storageMode;

    if (storageMode) {
      try {
        parseStorageMode = JSON.parse(storageMode);
      } catch (error) { }
    }

    if (colors) {
      CX_THEME_COLORS = colors;
      const colorsThemeMode = Object.keys(colors);
      const colorsFirstMode = colorsThemeMode[0];
      if (
        (parseStorageMode && colors.hasOwnProperty(parseStorageMode)) ||
        (parseStorageMode === 'system' &&
          colors.hasOwnProperty('light') &&
          colors.hasOwnProperty('dark'))
      ) {
        return parseStorageMode;
      }
      window.localStorage.setItem('themeMode', colorsFirstMode);
      return colorsFirstMode;
    } else {
      return parseStorageMode && DEFAULT_THEMES.includes(parseStorageMode)
        ? parseStorageMode
        : 'system';
    }
  });

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const theme = useMemo(() => {
    let newMode = mode;
    if (
      mode === 'system' &&
      ((colors?.hasOwnProperty('dark') && colors?.hasOwnProperty('light')) ||
        colors === void 0)
    ) {
      newMode = prefersDarkMode ? 'dark' : 'light';
    }
    return themes({ mode: newMode, colors, theme: options });
  }, [mode, prefersDarkMode, colors]);

  const themeMode = useMemo(() => {
    return {
      mode,
      colors,
      setThemeMode: (mode: ThemeMode) => {
        setMode(mode);
        window.localStorage.setItem('themeMode', mode);
      },
    };
  }, [mode]);

  useLayoutEffect(() => {
    const bodyStyle = document.body.style;
    const body = document.body;
    let newMode = mode;
    if (
      mode === 'system' &&
      ((colors?.hasOwnProperty('dark') && colors?.hasOwnProperty('light')) ||
        colors === void 0)
    ) {
      newMode = prefersDarkMode ? 'dark' : 'light';
    }
    body.className = newMode;
    // @ts-ignore
    bodyStyle.backgroundColor = theme.palette.background.paper2;
    bodyStyle.color = theme.palette.text.secondary;
  }, [theme]);

  return (
    <ThemeContext.Provider value={themeMode}>
      <MUIThemeProvider theme={theme}>{children}</MUIThemeProvider>
    </ThemeContext.Provider>
  );
};

export default EditorThemeProvider;
