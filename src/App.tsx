import { useEffect, useState } from 'react'
import './App.css'


function App() {

  const isEmptyObjectReturnNull = (object: any) => {
    if (Object.keys(object).length === 0) {
      return null
    }
    return object
  }

  const [link_, setLink] = useState("")
  const [email_, setEmail] = useState("")
  const [token_, setToken] = useState("")

  const firstLoad = async () => {

    const {link, email, token} = isEmptyObjectReturnNull(await chrome.storage.local.get(["link", "email", "token"]))

    setLink(link)
    setEmail(email)
    setToken(token)
    
  }
  useEffect(() => {
    firstLoad()
    console.log(link_, email_, token_)
  }, [])

  return (
    <>
      <h1>TestRail +</h1>
      <hr></hr>

      <h2>Settings</h2>
      <hr></hr>

      <h3>TestRail Link</h3>
      <input type='url' placeholder='Enter TestRail link here...' value={link_} onChange={(event) => setLink(event.target.value)}></input>
      <button type='submit' onClick={() => chrome.storage.local.set({link: link_})}>Change</button>

      <h3>Email</h3>
      <input type='email' placeholder='Enter email here...' value={email_} onChange={(event) => setEmail(event.target.value)}></input>
      <button type='submit' onClick={() => chrome.storage.local.set({email: email_})}>Change</button>

      <h3>Token</h3>
      <input type='password' placeholder='Enter token here...' value={token_} onChange={(event) => setToken(event.target.value)}></input>
      <button type='submit' onClick={() => chrome.storage.local.set({token: token_})}>Change</button>
    </>
  )
}

export default App
