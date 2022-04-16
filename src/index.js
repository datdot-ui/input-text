const style_sheet = require('support-style-sheet')
const message_maker = require('message-maker')

var id = 0

module.exports = i_input

function i_input (opts, protocol) {
    const { value = '', maxlength = 50, placeholder = '', theme } = opts
    const status = { }

// --------------------start protocol---------------------
    const myaddress = `input-text-${id++}` // unique
    const inbox = {}
    const outbox = {}
    const recipients = {}
    const message_id = to => ( outbox[to] = 1 + (outbox[to]||0) )

    const {notify, address} = protocol(myaddress, listen)
    recipients['parent'] = { notify, address, make: message_maker(myaddress) }

    const { make } = recipients['parent'] 
    let message = make({to: address, type: 'ready', ref: { cause: {} }})
    notify(message)

    function listen (msg) {
        const { head, refs, type, data, meta } = msg // listen to msg
        inbox[head.join('/')] = msg                  // store msg
        const [from, to, msg_id] = head
    }
// --------------------end protocol---------------------

    const make_element = () => {
        const el = document.createElement('input-text')
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
        return el
    }
    function set_attributes (el, input) {
        input.type = 'text'
        input.name = myaddress
        input.value = value
        input.placeholder = placeholder

        // properties
        input.setAttribute('aria-myaddress', 'input')
        if (status.is_disabled) el.setAttribute('disabled', status.is_disabled)
        input.setAttribute('maxlength', maxlength)
    }

    // input click event
    function handle_click (e, input) {}
    // input focus event
    function handle_focus (e, input) {}
    // input blur event
    function handle_blur (e, input) {
        if (input.value === '') return
        message = make({to: address, type: 'input', data: { value: input.value }})
        notify(message)
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
    :host(input-text) {
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
        --shadow-opacity: 0;
    }
    [type = 'text'] {
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
        box-shadow: var(--shadow-xy) var(--shadow-blur) hsla( var(--shadow-color), var(--shadow-opacity));
        -moz-appearance: textfield;
    }
    :focus {
        --shadow-opacity: ${shadow_opacity ? shadow_opacity : '.3'};
        font-size: var(--current-size);
    }
    ${custom_style}
    `
    const element = make_element()
// ---------------------------------------------------------------
    return element
// ---------------------------------------------------------------
}
