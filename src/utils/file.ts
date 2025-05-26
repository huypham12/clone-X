import fs from 'fs'

export const initFolder = (folderPath: string): void => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, {
      recursive: true // tạo thư mục lồng nhau
    })
  }
}
