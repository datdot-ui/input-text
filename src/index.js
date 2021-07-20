const style_sheet = require('support-style-sheet')
const message_maker = require('message-maker')
// const big_int = require('big-int')
const practice = require('practice')

module.exports = i_input

function i_input (option, protocol) {
    const {page = 'Demo', to = '', flow = 'i-input', name, role = 'input', type = 'text', value = '', min = 0, max = 100, maxlength = 0, step = '1', placeholder = '', float = false, checked = false, disabled = false, theme} = option
    let is_checked = checked
    let is_disabled = disabled
    const send = protocol(get)
    let make = message_maker(`${name} / ${role} / ${flow} / ${page}`)
    let message = make({type: 'ready', data: {input: type, value}})
    let [int, dec] = get_step_arr()
    let cal_int = 0
    let cal_dec = 0
    send(message)
    const widget = () => {
        const el = document.createElement('i-input')
        const shadow = el.attachShadow({mode: 'closed'})
        const input = document.createElement('input')
        set_attribute(el, input)
        style_sheet(shadow, style)
        shadow.append(input)
        // handle events go here
        input.onblur = (e) => handle_blur(e, input)
        // Safari is not support onfocus to use select()
        input.onclick = (e) => handle_click(e, input)
        input.onfocus = (e) => handle_focus(e, input)
        input.onwheel = (e) => e.preventDefault()
        input.onkeypress = (e) => handle_pressed(e, input)
        input.onkeydown = (e) => handle_keydown_change(e, input)
        input.onkeyup = (e) => handle_keyup_change(e, input)
        return el
    }
    // all set attributes go here
    function set_attribute (el, input) {
        input.type = type
        input.name = name
        if (value !== '') input.value = value
        if (placeholder !== '') input.placeholder = placeholder
        if (type === 'number') {
            input.min = min
            input.max = max
        }
        if (step !== '1') input.step =  `${int}.${dec}` 
        // properties
        el.setAttribute('role', role)
        el.setAttribute('type', type)
        input.setAttribute('role', role)
        input.setAttribute('aria-label', name)
        if (is_disabled) el.setAttribute('disabled', is_disabled)
        if (maxlength > 0 ) input.setAttribute('maxlength', maxlength)
    }
    // to find integers and decimals in step
    function get_step_arr () {
        let str = `${step}`
        let [i, d] = str.split('.')
        // if d === undefined, make d euqal to 0
        if (d === void 0) d = '0'
        return [i, d]
    }
    // to find integers and decimals in input.value
    function get_val_arr (string) {
        let [i, d] = string.split('.')
        // if (i or d) === undefined, make d euqal to 0
        if (i === '') i = '0'
        if (d === void 0) d = '0'
        return [i, d]
    }
    function to_increase (e, input, val) {
        e.preventDefault()
        let [step_i, step_d] = get_step_arr()
        let [val_i, val_d] = get_val_arr(input.value)
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
    function to_decrease (e, input, val) {
        e.preventDefault()
        let [step_i, step_d] = get_step_arr()
        let [val_i, val_d] = get_val_arr(val)
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
    function handle_click (e, input) {
    }
    // input focus event
    function handle_focus (e, input) {

    }
    // input blur event
    function handle_blur (e, input) {
        if (input.value === '') return
        message = make({to, type: 'blur', data: {input: name, value: input.value}})
        send(message)
    }
    // input keypress event
    function handle_pressed (e, input) {
        const key = e.key
        const code = e.keyCode || e.charCode
        if (Number(val) >= Number(max)) return input.value = Number(max)
        if (Number(val) < 1) return input.value = Number(min)
        if (code === 13 || key === 'Enter') input.blur()
        if (code === 8 || key === 'Backspace') input.value = ''
        if (maxlength > 0 && input.value.length > maxlength) e.preventDefault()
    }
    // float number input keydown event
    function handle_keydown_change (e, input) {
        const val = input.value === '' ? 0 : input.value
        const key = e.key
        const code = e.keyCode || e.charCode
        if (type === 'number') {
            if (val < min || val > max) e.preventDefault()
            if (code === 38 || key === 'ArrowUp') to_increase(e, input, val)
            if (code === 40 || key === 'ArrowDown' ) to_decrease(e, input, val)
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
    function get (msg) {}
    
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
    return widget()
}
