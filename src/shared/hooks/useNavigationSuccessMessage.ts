import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { getSuccessMessage } from '../utils/navigationState'

export function useNavigationSuccessMessage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [message] = useState(() => getSuccessMessage(location.state))

  useEffect(() => {
    if (!message) {
      return
    }

    void navigate(
      `${location.pathname}${location.search}${location.hash}`,
      { replace: true, state: null },
    )
  }, [location.hash, location.pathname, location.search, message, navigate])

  return message
}
