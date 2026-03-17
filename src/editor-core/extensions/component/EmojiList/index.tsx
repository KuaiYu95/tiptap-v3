import { Box, InputAdornment, Paper, Tab, Tabs, TextField, useTheme } from '@mui/material'
import Grid from '@mui/material/Grid'
import { Editor } from '@tiptap/core'
import { EmojiItem } from '@tiptap/extension-emoji'
import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react'

export type EmojiListProps = {
  items: EmojiItem[]
  command: (props: { name: string }) => void
  query?: string
  editor?: Editor
}

export type EmojiListRef = {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean
}

// 每行显示的 emoji 数量
const EMOJIS_PER_ROW = 8

// 分类定义：中文显示名 -> 英文搜索关键词数组
const EMOJI_CATEGORIES = [
  { label: '表情', keywords: ['face', 'smile', 'grinning', 'laugh', 'cry', 'angry', 'sad', 'happy', 'wink', 'kiss', 'love', 'joy'] },
  { label: '手势', keywords: ['hand', 'thumbs', 'finger', 'wave', 'clap', 'fist', 'victory', 'peace', 'ok'] },
  { label: '人物', keywords: ['person', 'man', 'woman', 'baby', 'boy', 'girl', 'family', 'people', 'adult', 'child', 'prince', 'princess', 'superhero', 'angel', 'santa'] },
  { label: '动物', keywords: ['cat', 'dog', 'bird', 'fish', 'bear', 'lion', 'tiger', 'panda', 'monkey', 'pig', 'cow', 'horse', 'mouse', 'rabbit', 'fox', 'elephant', 'dolphin', 'whale', 'butterfly', 'bug', 'bee', 'spider', 'snake', 'turtle'] },
  { label: '食物', keywords: ['food', 'apple', 'banana', 'pizza', 'cake', 'coffee', 'tea', 'beer', 'wine', 'bread', 'meat', 'egg', 'rice', 'sushi', 'ice-cream', 'cookie', 'chocolate', 'candy'] },
  { label: '活动', keywords: ['sport', 'ball', 'game', 'music', 'dance', 'party', 'fireworks', 'soccer', 'basketball', 'football', 'tennis', 'video-game'] },
  { label: '旅行', keywords: ['car', 'bus', 'train', 'plane', 'ship', 'bike', 'airplane', 'helicopter', 'rocket', 'luggage', 'hotel', 'beach'] },
  { label: '物品', keywords: ['phone', 'computer', 'book', 'gift', 'money', 'key', 'lock', 'light', 'camera', 'watch', 'clock', 'scissors'] },
  { label: '符号', keywords: ['heart', 'arrow', 'check', 'cross', 'question', 'exclamation', 'plus', 'minus', 'star', 'circle', 'square', 'flag'] },
  { label: '自然', keywords: ['sun', 'moon', 'star', 'cloud', 'rain', 'snow', 'tree', 'flower', 'leaf', 'fire', 'water', 'mountain'] },
]

export const EmojiList = forwardRef<EmojiListRef, EmojiListProps>((props, ref) => {
  const theme = useTheme()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState(0)

  // 使用传入的 query 或内部的 searchQuery
  const effectiveQuery = (props.query || searchQuery).trim()
  const hasQuery = effectiveQuery.length > 0

  // 根据搜索查询和分类过滤 emoji
  const filteredItems = useMemo(() => {
    if (!props.editor?.storage?.emoji?.emojis) {
      return props.items
    }

    const allEmojis = props.editor.storage.emoji.emojis as EmojiItem[]
    const currentCategory = EMOJI_CATEGORIES[activeTab]

    // 确定搜索查询：优先使用传入的 query 或内部的 searchQuery，否则使用当前分类的关键词
    let query = ''
    if (hasQuery) {
      // 有搜索查询，使用搜索查询
      query = effectiveQuery
    } else if (currentCategory.keywords.length > 0) {
      // 没有搜索查询，使用当前分类的关键词
      query = currentCategory.keywords.join(' ')
    }

    if (query) {
      const normalizedQuery = query.toLowerCase().trim()
      const keywords = normalizedQuery.split(' ').filter(k => k.length > 0)

      // 使用和 emoji.ts 相同的搜索逻辑：优先匹配开头，其次匹配包含
      return allEmojis
        .map((item: EmojiItem) => {
          const { shortcodes = [], tags = [] } = item
          let score = 0

          // 检查 shortcodes 和 tags
          const allMatches = [
            ...shortcodes.map((s: string) => s.toLowerCase()),
            ...tags.map((t: string) => t.toLowerCase())
          ]

          // 如果有关键词数组，检查是否匹配任一关键词
          if (keywords.length > 0) {
            keywords.forEach(keyword => {
              const exactStart = allMatches.some(m => m === keyword)
              const startsWith = allMatches.some(m => m.startsWith(keyword))
              const includes = allMatches.some(m => m.includes(keyword))

              if (exactStart) score += 3
              else if (startsWith) score += 2
              else if (includes) score += 1
            })
          } else {
            // 单个查询的匹配逻辑
            const exactStart = allMatches.some(m => m === normalizedQuery)
            const startsWith = allMatches.some(m => m.startsWith(normalizedQuery))
            const includes = allMatches.some(m => m.includes(normalizedQuery))

            if (exactStart) score = 3
            else if (startsWith) score = 2
            else if (includes) score = 1
          }

          return { item, score }
        })
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score) // 按分数排序
        .map(({ item }) => item)
        .slice(0, 160) // 限制结果数量
    }

    // 没有搜索查询且没有分类关键词时，使用传入的 items
    return props.items
  }, [effectiveQuery, hasQuery, props.items, props.editor, activeTab])

  // 扁平化所有 emoji 用于索引
  const flatItems = useMemo(() => {
    return filteredItems
  }, [filteredItems])

  const selectItem = (index: number) => {
    const item = flatItems[index]
    if (item) {
      props.command({ name: item.name })
    }
  }

  const upHandler = () => {
    setSelectedIndex((selectedIndex + flatItems.length - 1) % flatItems.length)
  }

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % flatItems.length)
  }

  const leftHandler = () => {
    const newIndex = Math.max(0, selectedIndex - 1)
    setSelectedIndex(newIndex)
  }

  const rightHandler = () => {
    const newIndex = Math.min(flatItems.length - 1, selectedIndex + 1)
    setSelectedIndex(newIndex)
  }

  const enterHandler = () => {
    selectItem(selectedIndex)
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
    // 点击分类 tab 时，清空搜索框（分类会通过 activeTab 自动搜索）
    setSearchQuery('')
  }

  // 当 query 变化时，同步到内部的 searchQuery（用于搜索框显示）
  useEffect(() => {
    if (props.query !== undefined) {
      setSearchQuery(props.query)
    }
  }, [props.query])

  useEffect(() => {
    setSelectedIndex(0)
  }, [flatItems.length, searchQuery, activeTab, props.query])

  // 滚动到选中的 emoji
  useEffect(() => {
    if (flatItems.length === 0) return

    const selectedElement = document.querySelector(`[data-emoji-index="${selectedIndex}"]`)
    if (selectedElement) {
      selectedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [selectedIndex, flatItems.length])

  useImperativeHandle(ref, () => {
    return {
      onKeyDown: (x: { event: KeyboardEvent }) => {
        if (x.event.key === 'ArrowUp') {
          upHandler()
          return true
        }

        if (x.event.key === 'ArrowDown') {
          downHandler()
          return true
        }

        if (x.event.key === 'ArrowLeft') {
          leftHandler()
          return true
        }

        if (x.event.key === 'ArrowRight') {
          rightHandler()
          return true
        }

        if (x.event.key === 'Enter') {
          enterHandler()
          return true
        }

        return false
      },
    }
  }, [upHandler, downHandler, leftHandler, rightHandler, enterHandler])

  return (
    <Paper
      elevation={8}
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        width: 280,
        maxHeight: 320,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        overflow: 'hidden',
      }}
    >
      {/* 搜索框 - 只在没有查询时显示 */}
      {!hasQuery && (
        <Box sx={{ p: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
          <TextField
            fullWidth
            size="small"
            placeholder="搜索 emoji..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
            }}
            autoFocus={false}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Box sx={{ fontSize: '0.875rem' }}>🔍</Box>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1,
                backgroundColor: 'action.hover',
                fontSize: '0.875rem',
                '& fieldset': {
                  borderColor: 'divider',
                },
                '&:hover fieldset': {
                  borderColor: 'primary.main',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main',
                },
              },
            }}
          />
        </Box>
      )}

      {/* 分类 Tabs - 只在没有查询时显示 */}
      {!hasQuery && (
        <Box
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            backgroundColor: 'background.paper',
            position: 'sticky',
            top: 0,
            zIndex: 1,
          }}
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              minHeight: 32,
              height: 32,
              '& .MuiTabs-scrollButtons': {
                width: 28,
                '&.Mui-disabled': {
                  opacity: 0.3,
                },
              },
              '& .MuiTab-root': {
                minHeight: 32,
                height: 32,
                fontSize: '0.75rem',
                textTransform: 'none',
                fontWeight: 500,
                px: 1,
                py: 0,
                minWidth: 'auto',
                color: 'text.secondary',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  color: 'primary.main',
                  backgroundColor: 'action.hover',
                },
                '&.Mui-selected': {
                  color: 'primary.main',
                  fontWeight: 600,
                },
              },
              '& .MuiTabs-indicator': {
                height: 2,
                borderRadius: '2px 2px 0 0',
                backgroundColor: `${theme.palette.primary.main} !important`,
              },
            }}
          >
            {EMOJI_CATEGORIES.map((category) => (
              <Tab key={category.label} label={category.label} />
            ))}
          </Tabs>
        </Box>
      )}

      {/* Emoji 网格 */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          p: 1,
          '&::-webkit-scrollbar': {
            width: '4px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '2px',
            '&:hover': {
              background: 'rgba(0, 0, 0, 0.3)',
            },
          },
        }}
      >
        {flatItems.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 4,
              color: 'text.secondary',
              width: '100%',
            }}
          >
            <Box sx={{ fontSize: '3rem', mb: 1 }}>😕</Box>
            <Box sx={{ fontSize: '0.875rem' }}>未找到匹配的 emoji</Box>
          </Box>
        ) : (
          <Grid container spacing={0.5}>
            {flatItems.map((item, index) => {
              const isSelected = index === selectedIndex

              return (
                <Grid
                  size={12 / EMOJIS_PER_ROW}
                  key={`${item.name}-${index}`}
                  data-emoji-index={index}
                  onClick={() => selectItem(index)}
                  sx={{
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: `${100 / EMOJIS_PER_ROW}%`,
                    aspectRatio: '1',
                    minWidth: 0,
                    borderRadius: 1,
                    transition: 'all 0.15s ease-in-out',
                    position: 'relative',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                      transform: 'scale(1.1)',
                      zIndex: 1,
                    },
                    ...(isSelected && {
                      backgroundColor: 'action.selected',
                      transform: 'scale(1.15)',
                      zIndex: 2,
                      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        inset: -1,
                        borderRadius: 1,
                        border: '1.5px solid',
                        borderColor: 'primary.main',
                        pointerEvents: 'none',
                      },
                    }),
                  }}
                >
                  <Box
                    sx={{
                      fontSize: '1.25rem',
                      lineHeight: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      height: '100%',
                      img: {
                        width: '1.25rem',
                        height: '1.25rem',
                        objectFit: 'contain',
                      },
                    }}
                  >
                    {item.fallbackImage ? (
                      <img src={item.fallbackImage} alt={item.name} />
                    ) : (
                      item.emoji
                    )}
                  </Box>
                </Grid>
              )
            })}
          </Grid>
        )}
      </Box>
    </Paper>
  )
})