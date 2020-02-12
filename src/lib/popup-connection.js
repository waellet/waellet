import stampit from '@stamp/it'

export const PopupConnections = stampit({
    methods: {
        init() {
            this.popups = new Map()
        },
        addPopup(id, connection) {
            this.popups.set(id, PopupConnection({ id, connection }))
            console.log(this.popups)
        },
        getPopup(id) {
            return this.popups.get(id)
        },
        addActions(id, actions) {
            const popup = this.popups.getPopup(id)
            popup.actions = { ...popup.actions, actions }
            this.popups.set(id, popup)
        }
    }
})

export const PopupConnection = stampit({
    init({ id, connection, actions = {} }) {
        this.id = id
        this.connection = connection
        this.actions = actions
    }

})