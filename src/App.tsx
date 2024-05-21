import { useEffect, useState } from 'react'
import './App.css'
import { Box, Tab, Tabs, ThemeProvider, createTheme } from '@mui/material'


function App() {

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });

  const isEmptyObjectReturnNull = (object: any) => {
    if (Object.keys(object).length === 0) {
      return null
    }
    return object
  }

  const [link_, setLink] = useState("")
  const [email_, setEmail] = useState("")
  const [token_, setToken] = useState("")
  const [tab, setTab] = useState(0)

  const firstLoad = async () => {

    const { link, email, token } = isEmptyObjectReturnNull(await chrome.storage.local.get(["link", "email", "token"]))

    setLink(link)
    setEmail(email)
    setToken(token)

  }
  useEffect(() => {
    firstLoad()
    console.log(link_, email_, token_)
  }, [])

  const onChangeTab = (_event: React.SyntheticEvent, newTab: number) => {
    setTab(newTab)
  }

  interface TabProps {
    tab: number,
    index: number
  }

  const AccountSettings = ({
    tab,
    index
  }: TabProps) => {
    if (tab !== index) {
      return (<></>)
    }
    return (
      <>
        <h3>TestRail Link</h3>
        <input type='url' placeholder='Enter TestRail link here...' value={link_} onChange={(event) => setLink(event.target.value)}></input>
        <button type='submit' onClick={() => chrome.storage.local.set({ link: link_ })}>Save</button>

        <h3>Email</h3>
        <input type='email' placeholder='Enter email here...' value={email_} onChange={(event) => setEmail(event.target.value)}></input>
        <button type='submit' onClick={() => chrome.storage.local.set({ email: email_ })}>Save</button>

        <h3>Token</h3>
        <input type='password' placeholder='Enter token here...' value={token_} onChange={(event) => setToken(event.target.value)}></input>
        <button type='submit' onClick={() => chrome.storage.local.set({ token: token_ })}>Save</button>
      </>
    )
  }

  const SuitesSettings = ({
    tab,
    index
  }: TabProps) => {
    if (tab !== index) {
      return (<></>)
    }

    return (
      <>

      </>
    )
  }

  return (
    <>
      <ThemeProvider theme={darkTheme}>
        <h1>TestRail +</h1>

        <h2>Settings</h2>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tab}
            onChange={onChangeTab}
            aria-label="basic tabs example"
            textColor="primary"
            indicatorColor="primary">
            <Tab label="Account" />
            <Tab label="Test Suites" />
          </Tabs>
        </Box>

        <AccountSettings tab={tab} index={0} />
        <SuitesSettings tab={tab} index={0} />
      </ThemeProvider>
    </>
  )
}

export default App
