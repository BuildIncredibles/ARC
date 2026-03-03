import React, { createContext, useContext, useEffect, useState } from "react"
import { ArcEngine } from "./core"
import { ArcState } from "./types"

const arc = new ArcEngine()

const ArcContext = createContext<ArcState>(arc.getState())

export const ArcProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [state, setState] = useState(arc.getState())

  useEffect(() => {
    return arc.subscribe(setState)
  }, [])

  return (
    <ArcContext.Provider value={state}>
      {children}
    </ArcContext.Provider>
  )
}

export const useArc = () => useContext(ArcContext)

export { arc }