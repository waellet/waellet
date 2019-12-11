export default class WebCrypto {

    async encrypt(message, password, nonce, salt ) {
        let keyMaterial = await this.getKeyMaterial(password);
        let key = await this.getKey(keyMaterial, salt);
        let encoded = this.getMessageEncoding(message);

        let ciphertext = await window.crypto.subtle.encrypt(
            {
              name: "AES-GCM",
              iv:nonce
            },
            key,
            encoded
        );       
        console.log(ciphertext)
        return Buffer.from(ciphertext).toString('hex')
    }

    async decrypt(message, password, nonce, salt ) {
        console.log(Buffer.from(message))
        message = Buffer.from(message, 'hex')
        nonce = Buffer.from(nonce, 'hex')
        salt = Buffer.from(salt, 'hex')
        console.log(nonce)
        console.log(salt)
        console.log(message)
        let keyMaterial = await this.getKeyMaterial(password);
        let key = await this.getKey(keyMaterial, salt);

        try {
            let decrypted = await window.crypto.subtle.decrypt(
                {
                    name: "AES-GCM",
                    iv:nonce
                },
                key,
                message
            );
            let dec = new TextDecoder();
            let decoded = dec.decode(decrypted);
            console.log(decrypted)
            return decoded
        } catch (e) {
            console.log(e)
            return e
        }
      }

    getKeyMaterial(password) {
        let enc = new TextEncoder();
        return window.crypto.subtle.importKey(
          "raw", 
          enc.encode(password), 
          {name: "PBKDF2"}, 
          false, 
          ["deriveBits", "deriveKey"]
        );
    }
    getKey(keyMaterial, salt) {
        return window.crypto.subtle.deriveKey(
          {
            "name": "PBKDF2",
            salt: salt, 
            "iterations": 100000,
            "hash": "SHA-256"
          },
          keyMaterial,
          { "name": "AES-GCM", "length": 256},
          true,
          [ "encrypt", "decrypt" ]
        );
    }

    getMessageEncoding(message) {
        let enc = new TextEncoder();
        return enc.encode(message);
    }
}