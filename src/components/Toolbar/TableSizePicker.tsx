import { addOpacityToColor } from "../../utils";
import { Box, Stack, useTheme } from "@mui/material";
import React, { useState } from "react";

const TableSizePicker: React.FC<{ onConfirm: (cols: number, rows: number) => void }> = ({ onConfirm }) => {
  const theme = useTheme()
  const [cols, setCols] = useState(0);
  const [rows, setRows] = useState(0);
  const size = 10;

  return (
    <Stack gap={0.5}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `repeat(${size}, 18px)`,
          gridAutoRows: '18px',
          gap: '2px',
          p: 0.25,
        }}
        onMouseLeave={() => {
          setCols(0);
          setRows(0);
        }}
      >
        {Array.from({ length: size }).map((_, rowIndex) => (
          <React.Fragment key={`row-${rowIndex}`}>
            {Array.from({ length: size }).map((__, colIndex) => {
              const r = rowIndex + 1;
              const c = colIndex + 1;
              const activeCell = r <= rows && c <= cols;
              return (
                <Box
                  key={`cell-${r}-${c}`}
                  onMouseEnter={() => {
                    setCols(c);
                    setRows(r);
                  }}
                  onClick={() => onConfirm(c, r)}
                  sx={{
                    borderRadius: '3px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    bgcolor: 'background.default',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Box sx={{
                    width: '18px',
                    height: '18px',
                    transition: 'background-color 0.12s ease',
                    bgcolor: activeCell ? addOpacityToColor(theme.palette.primary.main, 0.5) : theme.palette.background.default,
                  }} />
                </Box>
              );
            })}
          </React.Fragment>
        ))}
      </Box>
      <Box sx={{ fontSize: 12, textAlign: 'center' }}>
        {cols > 0 && rows > 0 ? `${cols} 列 × ${rows} 行` : '选择表格大小'}
      </Box>
    </Stack>
  );
};

export default TableSizePicker;
