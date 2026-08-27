import { Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Browse from './pages/Browse'
import ReportItem from './pages/ReportItem'
import ItemDetails from './pages/ItemDetails'
import Login from './pages/Login'
import Register from './pages/Register'
import ThemeToggle from './components/ThemeToggle'
import { useAuth } from './context/AuthContext'
import './App.css'

function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }
  return children
}

function HomeGate({ children }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  const skipped = (() => {
    try {
      return localStorage.getItem('campusfind_skipped') === '1'
    } catch {
      return false
    }
  })()

  if (!isAuthenticated && !skipped) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }
  return children
}

function App() {
  const location = useLocation()
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="app">
      <nav className="navbar">
        <Link to="/" className="nav-brand">CampusFind</Link>
        <div className="nav-links">
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link>
          <Link to="/browse" className={location.pathname === '/browse' ? 'active' : ''}>Browse</Link>
          {isAuthenticated ? (
            <>
              <span className="nav-user" title={`${user.role}`}>
                {user.name} <small>({user.role})</small>
              </span>
              <button type="button" className="nav-logout-btn" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={location.pathname === '/login' ? 'active' : ''}>Log in</Link>
              <Link to="/register" className={location.pathname === '/register' ? 'active' : ''}>Sign up</Link>
            </>
          )}
        </div>
        <div className="nav-action">
          <Link to="/report" className="nav-report-btn">+ Report Item</Link>
          <ThemeToggle />
        </div>
      </nav>

      <main className="main-content">
        <Routes>
          <Route
            path="/"
            element={
              <HomeGate>
                <Home />
              </HomeGate>
            }
          />
          <Route
            path="/browse"
            element={
              <HomeGate>
                <Browse />
              </HomeGate>
            }
          />
          <Route
            path="/report"
            element={
              <RequireAuth>
                <ReportItem />
              </RequireAuth>
            }
          />
          <Route path="/item/:id" element={<ItemDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>

      <footer className="footer">
        <p>CampusFind — Help your fellow students find their lost items</p>
      </footer>
    </div>
  )
}

export default App
