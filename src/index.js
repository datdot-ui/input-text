const style_sheet = require('support-style-sheet')
const protocol_maker = require('protocol-maker')

var id = 0
const sheet = new CSSStyleSheet()
const default_opts = { 
	name: 'input-text',
	value: '',
	maxlength: 50, 
	placeholder: '',
	status: {
		current: false, 
		disabled: false,
	},
	theme: get_theme()
}
sheet.replaceSync(default_opts.theme)


module.exports = input_text

input_text.help = () => { return { opts: default_opts } }

function input_text (opts, parent_wire) {
	const { 
		name = default_opts.name,
		value = default_opts.value, 
		maxlength = default_opts.maxlength, 
		placeholder = default_opts.placeholder,
		status = default_opts.status, 
		theme = `` } = opts
	

	const current_state = { opts: { name, value, maxlength, placeholder, status, sheets: [default_opts.theme, theme] } }
	
	// protocol		 
	const initial_contacts = { 'parent': parent_wire }
	const contacts = protocol_maker('input-number', listen, initial_contacts)
	function listen (msg) {
			const { head, refs, type, data, meta } = msg // listen to msg
			const [from, to, msg_id] = head
			const $from = contacts.by_address[from]
			if (type === 'help') {
				$from.notify($from.make({ to: $from.address, type: 'help', data: { state: get_current_state() }, refs: { cause: head }}))
		}
			if (type === 'update') handle_update(data)
	}

	// make input text
	const el = document.createElement('input-text')
	const shadow = el.attachShadow({mode: 'closed'})
	const input = document.createElement('input')

	input.type = 'text'
	input.name = name
	input.value = value
	input.placeholder = placeholder
	input.setAttribute('aria-label', name)
	input.setAttribute('maxlength', maxlength)
	if (current_state.opts.status.disabled) el.setAttribute('disabled', current_state.opts.status.disabled)

	const custom_theme = new CSSStyleSheet()
	custom_theme.replaceSync(theme)
	shadow.adoptedStyleSheets = [sheet, custom_theme]

	shadow.append(input)

	// event listeners
	/* input.onwheel = (e) => e.preventDefault() */
	input.onblur = (e) => handle_blur(e, input) // when element loses focus
	// Safari doesn't support onfocus @TODO use select()
	input.onclick = (e) => handle_click(e, input)
	input.onfocus = (e) => handle_focus(e, input)
	input.onkeydown = (e) => handle_keydown_change(e, input)

	return el

	// event handlers
	function handle_click (e, input) {
			e.target.select()
	}
	function handle_focus (e, input) {}
	function handle_blur (e, input) {
			if (input.value === '') return
			const $parent = contacts.by_name['parent']
			$parent.notify($parent.make({to: $parent.address, type: 'onblur', data: { value: input.value }}))
		}
		function handle_keydown_change (e, input) {
			const val = input.value === '' ? 0 : input.value
			const key = e.key
			const code = e.keyCode || e.charCode   
			current_state.opts.value = val
			if (code === 13 || key === 'Enter') input.blur()
	}
	function handle_update (data) {
		const { value, maxlength, placeholder, sheets } = data
		if (value) {
			current_state.opts.value = data.value
			input.value = current_state.opts.value
		}
		if (sheets) {
			const new_sheets = sheets.map(sheet => {
				if (typeof sheet === 'string') {
					current_state.opts.sheets.push(sheet)
					const new_sheet = new CSSStyleSheet()
					new_sheet.replaceSync(sheet)
					return new_sheet
					} 
					if (typeof sheet === 'number') return shadow.adoptedStyleSheets[sheet]
			})
			shadow.adoptedStyleSheets = new_sheets
		}
	}

	// get current state
	function get_current_state () {
		return  {
			opts: current_state.opts,
			contacts
		}
	}
}
function get_theme () {
	return `
	:host(input-text) {
		--b: 0, 0%;
		--r: 100%, 50%;
		--color-white: var(--b); 100%;
		--color-black: var(--b); 0%;
		--color-blue: 214, var(--r);
		--size14: 1.4rem;
		--size16: 1.6rem;
		--weight200: 200;
		--weight800: 800;
		--primary-color: var(--color-black);
		--primary-button-radius: 8px;
		--primary-bg-color: var(--color-white);
		--primary-color-hover: var(--color-black);
		--size: var(--size14);
		--size-hover: var(--size);
		--current-size: var(--size);
		--bold: var(--weight800);
		--color: var(--primary-color);
		--bg-color: var(--primary-bg-color);
		--width: unset;
		--height: 32px;
		--opacity: 1;
		--padding: 8px 12px;
		--border-width: 1px;
		--border-style: solid;
		--border-color: var(--primary-color);
		--border-opacity: 1;
		--border-radius: var(--primary-button-radius);
		--border: var(--border-width) var(--border-style) hsla(var(--border-color), var(--border-opacity));
		--fill: var(--primary-color);
		--fill-hover: var(--color-white);
		--icon-size: var(--size16);
		--shadow-xy: 4px 4px;
		--shadow-blur: 8px;
		--shadow-color: var(--b), 0%;
		--shadow-opacity: 0;
		--shadow-opacity-focus: .65;
		max-width: 100%;
    display: grid;
	}
	input {
		border: var(--border);
		border-radius: var(--border-radius);
		width: var(--width);
		height: var(--height);
		max-width: 100%;
		text-align: left;
		align-items: center;
		font-size: var(--size);
		font-weight: var(--bold);
		color: hsl( var(--color) );
		padding: var(--padding);
		transition: font-size .3s, color .3s, background-color .3s, box-shadow .3s ease-in-out;
		outline: none;
		-moz-appearance: textfield;
	}
	:focus {
		--shadow-opacity: var(--shadow-opacity-focus);
		box-shadow: var(--shadow-xy) var(--shadow-blur) hsla( var(--shadow-color), var(--shadow-opacity));
	}`
}