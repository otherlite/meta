const useDbClick = (clickCallback, doubleClickCallback) => {
  let time = null

  const onClick = useCallback(
    (...args) => {
      if (time) {
        clearTimeout(time)
        time = null
        doubleClickCallback(...args)
      } else {
        time = setTimeout(() => {
          time = null
          clickCallback(...args)
        }, 300)
      }
    },
    [clickCallback, doubleClickCallback],
  )

  return {
    onClick,
  }
}
