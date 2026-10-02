import { lazy } from 'react'

// Exported loader lets us preload the chunk on hover and before the
// takeover finishes, so the route never shows a blank frame.
export const loadCountWise = () => import('../pages/CountWise')
export const CountWise = lazy(loadCountWise)
