# datdot-ui-input-text
DatDot vanilla js UI component

Opts
---

`{ name = 'input-text', value = '', maxlength = 50, placeholder = '', status = { current = false, disabled: false }, theme = default_theme }`

Incomming message types
---

`help` requests info on current state
`update`

Outgoing message types
---

**parent**
`help` sends info on current state
`onblur` updates any of the data sent { value, min, max, placeholder, sheets }