import { FloatingPopover } from "../../../../components"
import { PauseLineIcon, PlayLineIcon, SpeedLineIcon, VolumeDownLineIcon, VolumeMuteLineIcon, VolumeUpLineIcon } from "../../../../components/Icons"
import { Box, Divider, IconButton, MenuItem, MenuList, Paper, Slider, Stack, Tooltip, Typography } from "@mui/material"
import React, { useEffect, useRef, useState } from "react"
import { AudioAttributes } from "./shared"
import Disk from '../../../../asset/images/disk.png'

interface AudioPlayerProps {
  attrs: AudioAttributes
  onError?: (error: Error) => void
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  attrs,
  onError
}) => {
  const audioRef = useRef<HTMLAudioElement>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.5)
  const [playbackRate, setPlaybackRate] = useState(1)

  const [anchorElSpeed, setAnchorElSpeed] = useState<HTMLDivElement | null>(null)
  const handleCloseSpeedPopover = () => setAnchorElSpeed(null)
  const handleShowSpeedPopover = (event: React.MouseEvent<HTMLDivElement>) => {
    if (anchorElSpeed) {
      handleCloseSpeedPopover()
    } else {
      setAnchorElSpeed(event.currentTarget)
    }
  }

  // 格式化时间
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
  }

  // 处理声音
  const toogleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.muted = false
      } else {
        audioRef.current.muted = true
      }
      setIsMuted(!isMuted)
    }
  }

  // 处理播放/暂停
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  // 处理进度条变化
  const handleProgressChange = (event: Event, newValue: number | number[]) => {
    const newTime = newValue as number
    if (audioRef.current) {
      audioRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  // 处理音量变化
  const handleVolumeChange = (event: Event, newValue: number | number[]) => {
    const newVolume = newValue as number
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
  }

  // 处理播放速度变化
  const handlePlaybackRateChange = (rate: number) => {
    setPlaybackRate(rate)
    if (audioRef.current) {
      audioRef.current.playbackRate = rate
    }
    handleCloseSpeedPopover()
  }

  // 音频事件处理
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.volume = volume
    audio.playbackRate = playbackRate
    audio.muted = attrs.muted

    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const handlePlay = () => {
      setIsPlaying(true)
    }

    const handlePause = () => {
      setIsPlaying(false)
    }

    const handleVolumeUpdate = () => {
      setVolume(audio.volume)
      setIsMuted(audio.muted)
    }

    const handleError = (e: ErrorEvent) => {
      onError?.(e.error as unknown as Error)
    }

    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('volumechange', handleVolumeUpdate)
    audio.addEventListener('error', handleError)

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('volumechange', handleVolumeUpdate)
      audio.removeEventListener('error', handleError)
    }
  }, [attrs.muted, attrs.src, onError, playbackRate, volume])

  return (
    <>
      <Stack
        direction={'row'}
        alignItems={'center'}
        flexWrap={'wrap'}
        gap={1.5}
        sx={{
          position: 'relative',
          borderRadius: 'var(--mui-shape-borderRadius)',
          p: '0.5rem 1rem',
          bgcolor: 'background.paper3',
        }}
      >
        <Box
          sx={{
            height: 48,
            minWidth: 48,
            objectFit: 'cover',
            cursor: 'pointer',
            position: 'relative',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--mui-shape-borderRadius) 0 0 var(--mui-shape-borderRadius)',
            backgroundSize: 'cover',
            backgroundImage: `url(${attrs.poster || Disk})`,
          }}
          onClick={togglePlay}
        />
        <Box sx={{ flex: 1, minWidth: 180 }}>
          <Stack direction="row" alignItems="center" justifyContent={'space-between'} sx={{ mb: 0.5 }}>
            <Box sx={{ fontWeight: '500', fontSize: 14 }}>{attrs.title || '音频'}</Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ color: 'text.tertiary' }}>
              <Typography variant="caption">
                {formatTime(currentTime)}
              </Typography>
              <Divider orientation="vertical" flexItem sx={{ height: '1rem', mx: 0.5, alignSelf: 'center', borderColor: 'divider' }} />
              <Typography variant="caption">
                {formatTime(duration)}
              </Typography>
            </Stack>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box sx={{
              cursor: 'pointer',
              color: 'text.disabled',
              px: 1,
              py: 0.5,
              borderRadius: 'var(--mui-shape-borderRadius)',
              backgroundColor: 'action.hover',
              '&:hover': {
                backgroundColor: 'action.selected',
                color: 'text.primary',
              },
            }}>
              {isPlaying ? <PauseLineIcon sx={{ fontSize: '1rem' }} onClick={togglePlay} /> : <PlayLineIcon sx={{ fontSize: '1rem' }} onClick={togglePlay} />}
            </Box>
            <Slider
              value={currentTime}
              min={0}
              max={duration || 100}
              onChange={handleProgressChange}
              size="small"
              sx={{
                py: '3px',
                flex: 1,
                '& .MuiSlider-track': {
                  border: 'none',
                },
                '& .MuiSlider-thumb': {
                  width: '10px',
                  height: '10px',
                  '&::after': {
                    width: '12px !important',
                    height: '12px !important',
                  },
                  '&:hover, &.Mui-focusVisible, &.Mui-active': {
                    boxShadow: 'none',
                  },
                },
              }}
            />
          </Stack>
        </Box>
        <Stack direction="row" alignItems="center" sx={{
          flexShrink: 0,
          color: 'text.disabled'
        }} gap={1}>
          {volume > 0 ? <VolumeDownLineIcon sx={{ fontSize: '1rem' }} />
            : <VolumeMuteLineIcon sx={{ fontSize: '1rem' }} />}
          <Slider
            value={volume}
            min={0}
            max={1}
            step={0.01}
            onChange={handleVolumeChange}
            size="small"
            color="error"
            disabled={isMuted}
            sx={(t) => ({
              width: 64,
              py: '3px',
              color: 'rgba(0,0,0,0.87)',
              '& .MuiSlider-track': {
                border: 'none',
              },
              '& .MuiSlider-thumb': {
                width: '8px',
                height: '8px',
                backgroundColor: '#fff',
                '&::before': {
                  boxShadow: '0 4px 8px rgba(0,0,0,0.4)',
                },
                '&::after': {
                  width: '12px !important',
                  height: '12px !important',
                },
                '&:hover, &.Mui-focusVisible, &.Mui-active': {
                  boxShadow: 'none',
                },
              },
              ...t.applyStyles('dark', {
                color: '#fff',
              }),
            })}
          />
          <VolumeUpLineIcon sx={{ fontSize: '1rem' }} />
        </Stack>
        <Tooltip arrow title='倍速播放'>
          <Box onClick={handleShowSpeedPopover}>
            <IconButton size="small" sx={{
              flexShrink: 0,
              color: playbackRate !== 1 ? 'primary.main' : 'text.tertiary'
            }}>
              <SpeedLineIcon sx={{ fontSize: '1rem' }} />
            </IconButton>
          </Box>
        </Tooltip>
      </Stack>
      <audio
        ref={audioRef}
        src={attrs.src}
        style={{ display: 'none' }}
        onError={(e) => {
          onError?.(e as unknown as Error)
        }}
      />
      <FloatingPopover
        open={Boolean(anchorElSpeed)}
        anchorEl={anchorElSpeed}
        onClose={handleCloseSpeedPopover}
        placement="bottom"
      >
        <Paper sx={{
          p: 0.5,
          borderRadius: 'var(--mui-shape-borderRadius)',
          '.MuiList-root': {
            p: '0px !important',
            m: '0px !important',
          }
        }}>
          <MenuList>
            {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate, index) => (
              <MenuItem
                key={index}
                selected={rate === playbackRate}
                onClick={() => handlePlaybackRateChange(rate)}
                sx={{
                  py: 1,
                  px: 2,
                  fontSize: '0.875rem',
                  borderRadius: 'var(--mui-shape-borderRadius)',
                  '&:hover:not(.Mui-selected)': {
                    backgroundColor: 'action.hover'
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'action.selected',
                  }
                }}
              >
                <Box>{rate}x</Box>
              </MenuItem>
            ))}
          </MenuList>
        </Paper>
      </FloatingPopover>
    </>
  )
}

export default AudioPlayer
