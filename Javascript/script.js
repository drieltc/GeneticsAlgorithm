const GENES = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890, .-;:_!\"#%&/()=?@${[]}"
const TARGET = "Hello, World!"

function generateRandomString(lenght){
    let randomString = ""
    for(let i =0; i < lenght; i++){
        let randomNumber = Math.floor(Math.random() * GENES.length)
        randomString += GENES[randomNumber]
    }
    return randomString
}
console.log(generateRandomString(13))
