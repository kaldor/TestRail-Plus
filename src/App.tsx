import { useEffect, useState } from 'react'
import './App.css'
import { Box, List, ListItem, ListItemText, Tab, Tabs, ThemeProvider, createTheme } from '@mui/material'


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

  interface Suite {
    name: string,
    project_id: number,
    suite_id: number
  }

  const [tab, setTab] = useState(0)

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
    const [link_, setLink] = useState("")
    const [email_, setEmail] = useState("")
    const [token_, setToken] = useState("")

    const firstLoad = async () => {

      const { link, email, token } = isEmptyObjectReturnNull(await chrome.storage.local.get(["link", "email", "token", "suites"]))

      setLink(link || "")
      setEmail(email || "")
      setToken(token || "")

    }
    useEffect(() => {
      firstLoad()
      console.log(link_, email_, token_)
    }, [])

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
    index,
  }: TabProps) => {
    if (tab !== index) {
      return (<></>)
    }

    const [suites_, setSuites] = useState<Suite[]>([])

    const firstLoad = async () => {
      const { suites } = isEmptyObjectReturnNull(await chrome.storage.local.get(["link", "email", "token", "suites"]))
      setSuites(suites || [])
    }

    useEffect(() => {
      firstLoad()
    })


    const [addingSuite, setAddingSuite] = useState(false)

    const [editSuiteName, setEditSuiteName] = useState("")
    const [editProjectID, setEditProjectID] = useState(0)
    const [editSuiteID, setEditSuiteID] = useState(0)

    const removeByIndex = (list: Suite[], i: number) => {
      const newList = list
      newList.splice(i, 1)
      return newList
    }

    const onRemoveSuite = (i: number) => {
      const newList = removeByIndex(suites_, i)
      chrome.storage.local.set({ suites: newList })
      setSuites(newList)
    }

    const resetFields = () => {
      setAddingSuite(false)
      setEditSuiteName("")
      setEditProjectID(0)
      setEditSuiteID(0)
    }

    const onSubmitSuite = (newSuite: Suite) => {
      const newSuiteList = [...suites_, newSuite]
      chrome.storage.local.set({ suites: newSuiteList })
      setSuites(newSuiteList)
      resetFields()
    }

    return (
      <>
        <div></div>
        {!addingSuite ? <h3><button onClick={() => { setAddingSuite((prev) => !prev) }}>+</button> Add Suite</h3> : <></>}
        {addingSuite ?
          <>
            <h4>Suite Name</h4>
            <input type='text' placeholder='Enter Suite Name here...' value={editSuiteName} onChange={(event) => setEditSuiteName(event.target.value)}></input>
            <h4>Project ID</h4>
            <input type='number' value={editProjectID} onChange={(event) => setEditProjectID(Number(event.target.value))}></input>
            <h4>Suite ID</h4>
            <input type='number' value={editSuiteID} onChange={(event) => setEditSuiteID(Number(event.target.value))}></input>
            <div></div>
            <button type='submit' onClick={() => onSubmitSuite({ name: editSuiteName, project_id: editProjectID, suite_id: editSuiteID })}>Add</button>
          </>
          : <></>}
        <hr></hr>
        <List>
          {suites_.map((suite, i) => (
            <ListItem key={i}>
              <ListItemText primary={suite.name} secondary={`Project: ${suite.project_id} Suite: ${suite.suite_id}`} />
              <button onClick={() => onRemoveSuite(i)}>Remove</button>
            </ListItem>
          ))}
        </List>

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
        <SuitesSettings tab={tab} index={1} />
      </ThemeProvider>
    </>
  )
}

export default App
