export function addOpacityToColor(color: string, opacity: number) {
  let red: number
  let green: number
  let blue: number

  if (color.startsWith('#')) {
    red = parseInt(color.slice(1, 3), 16)
    green = parseInt(color.slice(3, 5), 16)
    blue = parseInt(color.slice(5, 7), 16)
  } else if (color.startsWith('rgb')) {
    const matches = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/) as RegExpMatchArray
    red = parseInt(matches[1], 10)
    green = parseInt(matches[2], 10)
    blue = parseInt(matches[3], 10)
  } else {
    return ''
  }

  return `rgba(${red}, ${green}, ${blue}, ${opacity})`
}
