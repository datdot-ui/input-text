const style_sheet = require('support-style-sheet')
const message_maker = require('message-maker')
const big_number = require('bignumber.js')
module.exports = i_input
const pow = big_number(10).pow(18)
console.log( big_number(pow.toFixed() + 1).div(pow).toFixed(18).split('.')[1]);
let val = '99.999'
let i = val.split('.')[0]
let d = val.split('.')[1]
console.log('i:', i);
console.log('d:', d);
let big_d = new big_number(d * big_number(10).pow(18 - d.length))
let new_d = big_d.plus(1).toString()
let new_val = `${i}.${new_d}`
console.log(new_val);

function i_input (option, protocol) {
    const {page = 'Demo', to = '', flow = 'i-input', name, role = 'input', type = 'text', value = '', fixed = 0, min = 0, max = 100, maxlength = 0, step = 0.01, float = false, checked = false, disabled = false, theme} = option
    let is_checked = checked
    let is_disabled = disabled
    const send = protocol(get)
    let make = message_maker(`${name} / ${role} / ${flow} / ${page}`)
    let message = make({type: 'ready', data: {input: type, value}})
    send(message)
    const widget = () => {
        const el = document.createElement('i-input')
        const shadow = el.attachShadow({mode: 'closed'})
        const input = document.createElement('input')
        input.type = type
        input.name = name
        if (value !== '') input.value = value
        // properties
        el.setAttribute('role', role)
        el.setAttribute('type', type)
        input.setAttribute('role', role)
        input.setAttribute('aria-label', name)
        if (is_disabled) el.setAttribute('disabled', is_disabled)
        style_sheet(shadow, style)
        shadow.append(input)
        if (maxlength > 0 && fixed === 0) {
            input.setAttribute('maxlength', maxlength)
            input.onkeypress = (e) => handle_normal_pressed(e, input)
        }
        // float number
        if (type === 'number' && fixed > 0 ) render_number_input(input)
        input.onblur = (e) => handle_blur(e, input)
        // Safari is not support onfocus to use select()
        input.onclick = (e) => handle_click(e, input)
        input.onfocus = (e) => handle_focus(e, input)
        input.onwheel = (e) => e.preventDefault()
        return el
    }
    // input click event
    function handle_click (e, input) {
        input.select()
    }
    // input focus event
    function handle_focus (e, input) {

    }
    // input blur event
    function handle_blur (e, input) {
        if (input.value === '') return
        if (type === 'number') {
            if (input.value.indexOf('e') >= 1) input.value = Number(input.value).toFixed(fixed)
        }
        message = make({to, type: 'blur', data: {input: name, value: input.value}})
        send(message)
    }
    // input keypress event
    function handle_normal_pressed (e, input) {
        const key = e.key
        const code = e.keyCode || e.charCode
        if (code === 13 || key === 'Enter') input.blur()
        if (code === 8 || key === 'Backspace') input.value = ''
        if (input.value.length >= maxlength) return e.preventDefault()
    }
    // generate float number input
    function render_number_input (input) {
        if (fixed < 1) return 
        input.value = value
        input.min = min
        input.max = max
        // if (fixed <= 14) {
            input.step = convert_exponential_to_decimal(step)
            input.placeholder = `0.${'0'.repeat(fixed)}`
        // } else {
        //     message = make({to: 'number-input', type: 'error', data: 'fixed cannot over than 13 maximun length'})
        //     send(message)
        // }
        input.onkeypress = (e) => handle_pressed(e, input)
        input.onkeydown = (e) => handle_keydown_change(e, input)
        input.onkeyup = (e) => handle_keyup_change(e, input)
    }
    // float number input pressed event
    function handle_pressed (e, input) {
        const regex = /[\d+\.]/
        const key = e.key
        const code = e.keyCode || e.charCode
        if (code === 13 || key === 'Enter') input.blur()
        if (!key.match(regex)) return false
        if (input.value.length >= input.maxlength) return false
    }
    // float number input keydown event
    function handle_keydown_change (e, input) {
        const val = input.value === '' ? 0 : Number(input.value)
        const key = e.key
        const code = e.keyCode || e.charCode
        if (val < min || val > max) e.preventDefault()
        if (code === 38 || key === 'ArrowUp') {
            // if (fixed > 14) return
            if (input.value >= max ) return input.value = max
            e.preventDefault()
            const number = Math.pow(10, fixed)
            const inc = number * step
            let plus_val = (val * number) + inc
            let new_val = parseFloat(plus_val / number).toFixed(fixed)
            input.value = new_val
            console.log(`new: ${new_val}`,`inc: ${inc}`, `plus val: ${plus_val}`, `number: ${number}`)
        }
        if (code === 40 || key === 'ArrowDown' ) {
            // if (fixed > 14) return
            if (input.value <= min ) return input.value = min
            e.preventDefault()
            const number = Math.pow(10, fixed)
            const dec = number * step 
            let minus_val = (val * number) - dec
            let new_val = parseFloat(minus_val / number).toFixed(fixed)
            input.value = new_val
            console.log(`new: ${new_val}`, `dec: ${dec}`, `minus val: ${minus_val}`, `number: ${number}`)
        }
    }
    // float number input keyup event
    function handle_keyup_change (e, input) {
        const val = input.value === '' ? 0 : Number(input.value)
        if (val < min || val > max) e.preventDefault()
        if (val > max) input.value = max
        if (val < min) input.value = min
        if (input.value.indexOf('.') > 0 && input.value.split('.')[1].length > fixed) {
            // find decimals in val 
            const decimals = input.value.split('.')[1]
            // last number in decimals
            const last = Number(decimals.split('')[decimals.length - 1])
            // if last less than 5 then convert to regular math
            if ( last < 5) return input.value = parseFloat(val).toFixed(fixed)
            // else do toFixed() to convert to correct number
            return input.value = toFixed(val, fixed)
        }
    }
    // it has an issue with 1.104 (it will be 1.11, not corrected)
    function toFixed(number, decimals) {
        let x = Math.pow(10, Number(decimals) + 1)
        return (Number(number) + (1 / x)).toFixed(decimals)
    }
    function convert_exponential_to_decimal (exponential_number) {
        const str = exponential_number.toString()
        if (str.indexOf('e') === -1) return exponential_number
        const exponent = Number(str.split('-')[1], 10)
        const result = exponential_number.toFixed(exponent)
        return result
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
