const style_sheet = require('support-style-sheet')
const message_maker = require('message-maker')
module.exports = i_input

function i_input (option, protocol) {
    const {page, flow = 'i-input', name, body = '', role = 'input', type = 'text', editable = true, checked = false, disabled = false, theme} = option
    let is_checked = checked
    let is_disabled = disabled
    let is_editable = editable
    const send = protocol(get)
    let make = message_maker(`${name} / ${role} / ${flow}`)
    let message = make({type: 'ready', data: body})
    send(message)
    const widget = () => {
        const input = document.createElement('i-input')
        const shadow = input.attachShadow({mode: 'closed'})
        input.setAttribute('role', role)
        input.setAttribute('type', type)
        input.setAttribute('aria-label', name)
        input.setAttribute('name', name)
        input.setAttribute('value', body)
        style_sheet(shadow, style)
        shadow.append(body)
        // properties
        if (is_editable) input.setAttribute('contenteditable', is_editable)
        if (is_disabled) Input.setAttribute('disabled', is_disabled)

        input.onkeydown = (e) => {
            const text = e.key
            input.value = text
            shadow.host.innerHTML += text
        }
        // shadow.host.onkeydown = (e) => {
        //     const text = e.key
        //     shadow.innerHTML += text
        // }
        // shadow.host.onfocus = (e) => {
        //     console.log( e.target );
        // }
        return input
    }

    function get (msg) {

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
           shadow_color, offset_x, offset_y, blur, shadow_opacity,
           shadow_color_hover, offset_x_hover, offset_y_hover, blur_hover, shadow_opacity_hover
       } = theme.props
   }
    
    const style = `
    :host(i-input) {
        --size: ${size ? size : 'var(--size14)'};
        --size-hover: ${size_hover ? size_hover : 'var(--size)'};
        --curren-size: ${current_size ? current_size : 'var(--size14)'};
        --bold: ${weight ? weight : 'normal'};
        --color: ${color ? color : 'var(--primary-color)'};
        --bg-color: ${bg_color ? bg_color : 'var(--color-white)'};
        --width: ${width ? width : 'unset'};
        --height: ${height ? height : 'unset'};
        --opacity: ${opacity ? opacity : '1'};
        --padding: ${padding ? padding : '12px'};
        --border-width: ${border_width ? border_width : '0px'};
        --border-style: ${border_style ? border_style : 'solid'};
        --border-color: ${border_color ? border_color : 'var(--primary-color)'};
        --border-opacity: ${border_opacity ? border_opacity : '1'};
        --border: var(--border-width) var(--border-style) hsla( var(--border-color), var(--border-opacity) );
        --border-radius: ${border_radius ? border_radius : 'var(--primary-button-radius)'};
        --fill: ${fill ? fill : 'var(--primary-color)'};
        --fill-hover: ${fill_hover ? fill_hover : 'var(--color-white)'};
        --icon-size: ${icon_size ? icon_size : '16px'};
        --offset_x: ${offset_x ? offset_x : '0px'};
        --offset-y: ${offset_y ? offset_y : '6px'};
        --blur: ${blur ? blur : '30px'};
        --shadow-color: ${shadow_color ? shadow_color : 'var(--pimary-color)'};
        --shadow-opacity: ${shadow_opacity ? shadow_opacity : '1'};
        --box-shadow: var(--offset_x) var(--offset-y) var(--blur) hsla( var(--shadow-color), var(--shadow-opacity) );
        display: grid;
        grid-auto-flow: column;
        grid-column-gap: 5px;
        justify-content: center;
        align-items: center;
        ${width && 'width: var(--width)'};
        ${height && 'height: var(--height)'};
        font-size: var(--size);
        font-weight: var(--bold);
        color: hsl( var(--color) );
        background-color: hsla( var(--bg-color), var(--opacity) );
        border: var(--border);
        border-radius: var(--border-radius);
        box-shadow: var(--box-shadow);
        padding: var(--padding);
        transition: font-size .3s, color .3s, background-color .3s ease-in-out;
    }
    ${custom_style}
    `
    return widget
}
