import bcrypt from 'bcryptjs'

const password = 'admin-alex95'
const hash = bcrypt.hashSync(password, 10)

console.log('=================================')
console.log('Hash generado para la contraseña:')
console.log(hash)
console.log('=================================')
console.log('\nAñade esto a las variables de entorno de Zeabur:')
console.log(`ADMIN_PASSWORD_HASH=${hash}`)
