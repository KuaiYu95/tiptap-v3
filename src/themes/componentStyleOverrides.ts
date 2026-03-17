import { addOpacityToColor } from '../utils';
import { type ThemeColor } from './color';
export default function componentStyleOverrides(color: ThemeColor) {
  return {
    MuiButton: {
      styleOverrides: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        root: ({ ownerState }: { ownerState: any }) => {
          return {
            height: '36px',
            fontSize: 14,
            lineHeight: '36px',
            paddingLeft: '16px',
            paddingRight: '16px',
            boxShadow: 'none',
            transition: 'all 0.2s ease-in-out',
            borderRadius: '10px',
            fontWeight: '400',
            ...(ownerState.variant === 'contained' && {
              color: color.text.inverse,
              backgroundColor: color.text.primary,
            }),
            ...(ownerState.variant === 'text' && {}),
            ...(ownerState.variant === 'outlined' && {
              color: color.text.primary,
              border: `1px solid ${color.text.primary}`,
            }),
            ...(ownerState.disabled === true && {
              cursor: 'not-allowed !important',
            }),
            ...(ownerState.size === 'small' && {
              height: '32px',
              lineHeight: '32px',
            }),
            '&:hover': {
              boxShadow: 'none',
              ...(ownerState.variant === 'contained' && {
                backgroundColor: addOpacityToColor(color.text.primary, 0.9),
              }),
              ...(ownerState.variant === 'text' && {
                backgroundColor: color.background.paper3,
              }),
              ...(ownerState.variant === 'outlined' && {
                backgroundColor: color.background.paper3,
              }),
              ...(ownerState.color === 'neutral' && {
                color: color.text.primary,
              }),
            },
          };
        },
        startIcon: {
          marginLeft: 0,
          marginRight: 8,
          '>*:nth-of-type(1)': {
            fontSize: 14,
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: '10px',
          maxWidth: '600px',
          padding: '8px 16px',
          backgroundColor: color.text.primary,
          fontSize: '12px',
          lineHeight: '20px',
          color: color.primary.contrastText,
        },
        arrow: {
          color: color.text.primary,
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 1,
      },
      styleOverrides: {
        root: ({ ownerState }: { ownerState: { elevation?: number } }) => {
          return {
            ...(ownerState.elevation === 0 && {
              backgroundColor: color.background.paper2,
            }),
            ...(ownerState.elevation === 2 && {
              backgroundColor: color.background.paper3,
            }),
            backgroundImage: 'none',
          };
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          label: {
            color: color.text.secondary,
          },
          'label.Mui-focused': {
            color: color.text.primary,
          },
          '& .MuiInputBase-input::placeholder': {
            fontSize: '12px',
          },
        },
      },
    },
  };
}
