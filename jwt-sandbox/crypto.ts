import bcrypt from 'bcryptjs'
// cái này chưa hỗ trợ ts nên cần cài npm install --save-dev @types/bcrypt

const saltRounds = 10 // số vòng quay để tạo ra salt

async function hashPassword(password: string): Promise<string> {
  const hash = await bcrypt.hash(password, saltRounds) // auto generate salt
  return hash
}

async function comparePassword(password: string, hash: string): Promise<boolean> {
  const isMatch = await bcrypt.compare(password, hash) // sử dụng hàm compare của bcrypt
  return isMatch
}

async function main() {
  const password = '123456'
  const hash = await hashPassword(password)
  console.log('Hash:', hash)
  const isMatch = await comparePassword(password, hash)
  console.log('Is match:', isMatch)
}

// chạy hàm async main
main()
  .then(() => console.log('Done'))
  .catch((err) => console.error(err))
  .finally(() => process.exit(0))
