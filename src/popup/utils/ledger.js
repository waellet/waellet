export default  {
    async ledgerRequest({ commit, state, getters: { ledgerApi } }, { name, args}) {
        let error
        let result
        do {
            try {
                result = await ledgerApi[name](...args)
                error = false
            }catch(err) {
                error = true
            }finally {

            }

        } while (error)

        return result
    },

    async ledgerCreate({ commit, state, getters: { ledgerApi, ledgerNextIdx } } ) {
        try {
            const address = await ledgerApi.getAddress(ledgerNextIdx, true)
            console.log(address)
        } catch (error) {
            console.log(error)
        } finally {
            
        }
    }

} 