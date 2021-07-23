import { useContext } from "react"
import { AuthContext } from "./contexts/AuthContext"

import style from '../styles/login.module.css'

export default function Home() {
  const { login } = useContext(AuthContext)

  return (
    <div className={style.container}>
      <button onClick={login} className={style.btnLogin}>Login com Github</button>
    </div>
  )
}
