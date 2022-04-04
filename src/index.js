const style_sheet = require('support-style-sheet')
const message_maker = require('message-maker')
// const big_int = require('big-int')
const practice = require('practice')

var id = 0

module.exports = i_input

function i_input (opts, protocol) {
    const { role = 'input', type = 'text', value = '', min = 0, max = 100, maxlength = 50, step = '1', placeholder = '', checked = false, disabled = false, theme } = opts
    const status = {
        is_checked: checked,
        is_disabled: disabled,
    }
    let [step_i, step_d] = get_int_and_dec(step)

/* ------------------------------------------------
                    <protocol>
------------------------------------------------ */
    const myaddress = `i-input-${id++}` // unique
    const inbox = {}
    const outbox = {}
    const recipients = {}
    const message_id = to => ( outbox[to] = 1 + (outbox[to]||0) )

    const {notify, address} = protocol(myaddress, listen)
    recipients['parent'] = { notify, address, make: message_maker(myaddress) }

    let make = message_maker(myaddress) // @TODO: replace flow with myaddress/myaddress
    let message = make({to: address, type: 'ready', data: {input: type, value}})
    notify(message)

    function listen (msg) {
        const { head, refs, type, data, meta } = msg // listen to msg
        inbox[head.join('/')] = msg                  // store msg
        const [from, to, msg_id] = head
        // todo: what happens when we receive the message
        const { notify, make, address } = recipients['parent']
        if (from === recipients['parent'].address) {
            if (type === 'disabled' || type ==='enabled') {
                element.disabled = (type === 'disable') ? true : false
                notify(make({ to: address, type: `confirm-${type}`, refs: { cause: msg.head  } }))
            }
        }
        if (from === 'icon') {}
        else { }
    }
/* ------------------------------------------------
                    </protocol>
------------------------------------------------ */

    const make_element = () => {
        const el = document.createElement('i-input')
        const shadow = el.attachShadow({mode: 'closed'})
        const input = document.createElement('input')
        set_attributes(el, input)
        style_sheet(shadow, style)
        shadow.append(input)
        // handle events go here
        input.onwheel = (e) => e.preventDefault()
        input.onblur = (e) => handle_blur(e, input) // when element loses focus
        // Safari doesn't support onfocus @TODO use select()
        input.onclick = (e) => handle_click(e, input)
        input.onfocus = (e) => handle_focus(e, input)
        input.onkeydown = (e) => handle_keydown_change(e, input)
        input.onkeyup = (e) => handle_keyup_change(e, input)
        return el
    }
// ---------------------------------------------------------------
    // all set attributes go here
    function set_attributes (el, input) {
        input.type = type
        input.name = name
        input.value = value
        input.placeholder = placeholder
        if (type === 'number') {
            input.min = min
            input.max = max
        }
        // properties
        el.setAttribute('role', role)
        el.setAttribute('type', type)
        input.setAttribute('role', role)
        input.setAttribute('aria-myaddress', name)
        if (status.is_disabled) el.setAttribute('disabled', status.is_disabled)
        input.setAttribute('maxlength', maxlength)
    }
    // get integers and decimals in value
    function get_int_and_dec (string) {
        let [i, d] = string.split('.')
        if (i === '') i = '0'
        if (d === void 0) d = '0'
        return [i, d]
    } 
    function increase (e, input, val) {
        e.preventDefault()
        let [step_i, step_d] = get_int_and_dec(step)
        let [val_i, val_d] = get_int_and_dec(value)
        let step_len = step_d.length
        let val_len = val_d.length
        if (val_len < step_len) val_d = val_d.padEnd(step_len, '0')
        if (val_len > step_len) step_d = step_d.padEnd(val_len, '0')
        let [cal_i, cal_d] = [`${BigInt(val_i) + BigInt(step_i)}`,`${BigInt(val_d) + BigInt(step_d)}`]
        let cal_len = cal_d.length
        if (cal_len > val_len) {
            const offset = cal_len - val_len
            let [new_i, new_d] = [cal_d.slice(0, offset), cal_d.slice(offset)]
            cal_i = `${BigInt(cal_i) + BigInt(new_i)}`
            cal_d = new_d
        }
        let update = `${cal_i}.${cal_d}`
        input.value = update
        console.log('step:', step_i, step_d);
        console.log('val:', val_i, val_d);
    }
    function decrease (e, input, val) {
        e.preventDefault()
        let [val_i, val_d] = get_int_and_dec(val)
        let step_len = step_d.length
        let val_len = val_d.length
        if (val_len < step_len) val_d = val_d.padEnd(step_len, '0')
        if (val_len > step_len) step_d = step_d.padEnd(val_len, '0')
        let [cal_i, cal_d] = [`${BigInt(val_i) - BigInt(step_i)}`,`${BigInt(val_d) - BigInt(step_d)}`]
        let update = `${cal_i}.${Math.abs(cal_d)}`
        input.value = update
        console.log('step:', step_i, step_d);
        console.log('val:', val_i, val_d);
    }
    // input click event
    function handle_click (e, input) {}
    // input focus event
    function handle_focus (e, input) {}
    // input blur event
    function handle_blur (e, input) {
        if (input.value === '') return
        message = make({to: address, type: 'blur', data: {input: name, value: input.value}})
        notify(message)
    }

    // input keydown event
    function handle_keydown_change (e, input) {
        const val = input.value
        const key = e.key
        const code = e.keyCode || e.charCode   
        if (code === 13 || key === 'Enter') input.blur()
        // if (code === 8 || key === 'Backspace') input.value = ''    
        if (type === 'number' || type === 'decimal number') {
            if (Number(val) >= Number(max)) return input.value = Number(max)
            // if (val.length > 1 && val.charAt(0) === 0) input.value = 0
            if (maxlength > 0 && val.length > maxlength) e.preventDefault()
            if (val < min || val > max) e.preventDefault()
            if (code === 38 || key === 'ArrowUp') increase(e, input, val)
            if (code === 40 || key === 'ArrowDown' ) decrease(e, input, val)
        }
    }
    // float number input keyup event
    function handle_keyup_change (e, input) {
        const val = input.value === '' ? 0 : input.value
        if (type === 'number') {
            if (val < min || val > max) e.preventDefault()
            if (val > max) input.value = max
            if (val < min) input.value = min
        }
    }
    
   // insert CSS style
   const custom_style = theme ? theme.style : ''
   // set CSS variables
   if (theme && theme.props) {
       var {size, size_hover, current_size,
           weight, weight_hover, current_weight,
           color, color_hover, current_color, current_bg_color, 
           bg_color, bg_color_hover, border_color_hover,
           border_width, border_style, border_opacity, border_color, border_radius, 
           padding, width, height, opacity,
           fill, fill_hover, icon_size, current_fill,
           shadow_color, shadow_offset_xy, shadow_blur, shadow_opacity,
           shadow_color_hover, shadow_offset_xy_hover, blur_hover, shadow_opacity_hover
       } = theme.props
   }

// ---------------------------------------------------------------
    const style = `
    :host(i-input) {
        --size: ${size ? size : 'var(--size14)'};
        --size-hover: ${size_hover ? size_hover : 'var(--size)'};
        --current-size: ${current_size ? current_size : 'var(--size)'};
        --bold: ${weight ? weight : 'normal'};
        --color: ${color ? color : 'var(--primary-color)'};
        --bg-color: ${bg_color ? bg_color : 'var(--color-white)'};
        --width: ${width ? width : 'unset'};
        --height: ${height ? height : '32px'};
        --opacity: ${opacity ? opacity : '1'};
        --padding: ${padding ? padding : '8px 12px'};
        --border-width: ${border_width ? border_width : '0px'};
        --border-style: ${border_style ? border_style : 'solid'};
        --border-color: ${border_color ? border_color : 'var(--primary-color)'};
        --border-opacity: ${border_opacity ? border_opacity : '1'};
        --border: var(--border-width) var(--border-style) hsla( var(--border-color), var(--border-opacity) );
        --border-radius: ${border_radius ? border_radius : 'var(--primary-button-radius)'};
        --fill: ${fill ? fill : 'var(--primary-color)'};
        --fill-hover: ${fill_hover ? fill_hover : 'var(--color-white)'};
        --icon-size: ${icon_size ? icon_size : '16px'};
        --shadow-xy: ${shadow_offset_xy ? shadow_offset_xy : '0 0'};
        --shadow-blur: ${shadow_blur ? shadow_blur : '8px'};
        --shadow-color: ${shadow_color ? shadow_color : 'var(--color-black)'};
        --shadow-opacity: ${shadow_opacity ? shadow_opacity : '0.25'};
        ${width && 'width: var(--width)'};
        height: var(--height);
        max-width: 100%;
        display: grid;
    }
    [role="input"][type="text"], [role="input"][type="number"] {
        --shadow-opacity: 0;
        text-align: left;
        align-items: center;
        font-size: var(--size);
        font-weight: var(--bold);
        color: hsl( var(--color) );
        background-color: hsla( var(--bg-color), var(--opacity) );
        border: var(--border);
        border-radius: var(--border-radius);
        padding: var(--padding);
        transition: font-size .3s, color .3s, background-color .3s, box-shadow .3s ease-in-out;
        outline: none;
        box-shadow: var(--shadow-xy) var(--shadow-blur) hsla( var(--shadow-color), var(--shadow-opacity));;
    }
    [role="input"]:focus {
        --shadow-opacity: ${shadow_opacity ? shadow_opacity : '.3'};
        font-size: var(--current-size);
    }
    [role="input"][type="number"] {
        -moz-appearance: textfield;
    }
    [role="input"][type="number"]::-webkit-outer-spin-button, 
    [role="input"][type="number"]::-webkit-inner-spin-button {
        -webkit-appearance: none;
    }
    ${custom_style}
    `
    const element = make_element()
// ---------------------------------------------------------------
    return element
// ---------------------------------------------------------------
}
