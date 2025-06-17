import databaseService from './database.services'
databaseService.connect()

// Arrays for generating random Vietnamese names
const firstNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Vũ', 'Đặng', 'Bùi', 'Đỗ']
const middleNames = ['Văn', 'Thị', 'Minh', 'Hồng', 'Ngọc', 'Thu', 'Anh', 'Quang', 'Đức', 'Hương']
const lastNames = ['Hùng', 'Linh', 'Nam', 'Mai', 'Dương', 'Hải', 'Phương', 'Thảo', 'Bình', 'Tâm']

// Function to generate random Vietnamese name
function generateVietnameseName() {
  const first = firstNames[Math.floor(Math.random() * firstNames.length)]
  const middle = middleNames[Math.floor(Math.random() * middleNames.length)]
  const last = lastNames[Math.floor(Math.random() * lastNames.length)]
  return `${first} ${middle} ${last}`
}

// Function to generate random user data
function generateUsers(count: number) {
  const users = []
  for (let i = 0; i < count; i++) {
    users.push({
      name: generateVietnameseName(),
      age: Math.floor(Math.random() * (80 - 18 + 1)) + 18, // Random age between 18 and 80
      sex: Math.random() > 0.5 ? 'Male' : 'Female'
    })
  }
  return users
}

// Main function to connect to MongoDB and insert users
export async function insertUsers() {
  try {
    // Generate 1000 users
    const users = generateUsers(1000)

    // Insert users into MongoDB
    const result = await databaseService.test.insertMany(users)
    console.log(`${result.insertedCount} users inserted successfully`)
  } catch (err) {
    console.error('Error:', err)
  } finally {
    // Close the connection
    await databaseService.disconnect()
    console.log('MongoDB connection closed')
  }
}

// Run the script
insertUsers().catch(console.dir)
