import { AppShell } from "./components/app-shell"
import { Button } from "./components/button"
import { ProfilePage } from "./components/profile"
import { ThemeToggle, ThemeToggleCompact, ThemeToggleSwitch } from "./components/theme-toggle"


function App() {

  return (
    <>
    {/* <Button>hello</Button> */}
    <AppShell sidebar={<ThemeToggleSwitch />}>
      <ProfilePage />
    </AppShell>

      </>
  )
}

export default App
