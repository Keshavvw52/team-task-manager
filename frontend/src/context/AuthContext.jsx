import {
  createContext,
  useContext,
  useEffect,
  useState
} from 'react'

import api from '../api/axios'

const AuthContext = createContext(null)


export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')

    if (token) {
      api.get('/auth/me')
        .then(res => {
          setUser(res.data)
        })
        .catch(() => {
          localStorage.removeItem('token')
          setUser(null)
        })
        .finally(() => {
          setLoading(false)
        })

    } else {
      setLoading(false)
    }
  }, [])


  const login = async (email, password) => {
    const res = await api.post('/auth/login', {
      email,
      password
    })

    localStorage.setItem(
      'token',
      res.data.access_token
    )

    const me = await api.get('/auth/me')

    setUser(me.data)

    return me.data
  }


  const signup = async (
    name,
    email,
    password,
    role
  ) => {
    const res = await api.post('/auth/signup', {
      name,
      email,
      password,
      role
    })

    localStorage.setItem(
      'token',
      res.data.access_token
    )

    const me = await api.get('/auth/me')

    setUser(me.data)

    return me.data
  }


  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }


  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}


export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error(
      'useAuth must be used within AuthProvider'
    )
  }

  return context
}
