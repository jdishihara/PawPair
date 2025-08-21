#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Mock data generators
const firstNames = ['Sarah', 'Mike', 'Alex', 'Jenny', 'David', 'Emma', 'Chris', 'Lisa', 'Tom', 'Anna', 'Jake', 'Mia', 'Ryan', 'Zoe', 'Ben'];
const lastNames = ['Johnson', 'Chen', 'Rodriguez', 'Kim', 'Wilson', 'Davis', 'Brown', 'Garcia', 'Miller', 'Martinez', 'Anderson', 'Taylor', 'Thomas', 'Jackson', 'White'];
const dogNames = ['Buddy', 'Luna', 'Charlie', 'Bella', 'Max', 'Lucy', 'Cooper', 'Daisy', 'Rocky', 'Molly', 'Bear', 'Sadie', 'Duke', 'Maggie', 'Zeus'];
const dogBreeds = ['Golden Retriever', 'French Bulldog', 'Labrador', 'German Shepherd', 'Poodle', 'Bulldog', 'Beagle', 'Rottweiler', 'Siberian Husky', 'Pug'];
const cities = ['San Francisco', 'Oakland', 'Berkeley', 'San Jose', 'Palo Alto', 'Mountain View', 'Redwood City', 'Fremont', 'Hayward', 'Sunnyvale'];

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateRandomUser(index, userType) {
  const firstName = getRandomElement(firstNames);
  const lastName = getRandomElement(lastNames);
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index}@test.com`;
  const city = getRandomElement(cities);
  
  const baseUser = {
    email,
    password: 'password123',
    firstName,
    lastName,
    phone: `555-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
    userType,
    address: `${Math.floor(Math.random() * 9999) + 1} ${getRandomElement(['Main St', 'Oak Ave', 'Pine St', 'Elm St', 'Maple Dr', 'First Ave', 'Second St', 'Third Ave'])}`,
    city,
    state: 'CA',
    zipCode: `${94000 + Math.floor(Math.random() * 200)}`,
    latitude: 37.7749 + (Math.random() - 0.5) * 0.2,
    longitude: -122.4194 + (Math.random() - 0.5) * 0.2,
  };

  if (userType === 'owner') {
    return {
      ...baseUser,
      dogName: getRandomElement(dogNames),
      dogBreed: getRandomElement(dogBreeds),
      dogAge: `${Math.floor(Math.random() * 12) + 1} years`,
      dogWeight: `${Math.floor(Math.random() * 80) + 10} lbs`,
      dogSize: getRandomElement(['small', 'medium', 'large', 'extra_large']),
      needsSitting: Math.random() > 0.5,
      needsWalking: Math.random() > 0.3,
    };
  } else {
    return {
      ...baseUser,
      experience: getRandomElement(['1-2 years', '3-5 years', '5+ years', 'Professional']),
      homeType: getRandomElement(['apartment', 'house', 'house_with_yard']),
      hasOtherPets: Math.random() > 0.6,
      maxDistance: Math.floor(Math.random() * 20) + 5,
      preferredSizes: ['small', 'medium', 'large'].filter(() => Math.random() > 0.3),
      providesSitting: Math.random() > 0.4,
      providesWalking: Math.random() > 0.2,
    };
  }
}

function generateUsers(ownerCount = 20, sitterCount = 15) {
  const users = [];
  
  // Generate owners
  for (let i = 0; i < ownerCount; i++) {
    users.push(generateRandomUser(i + 1, 'owner'));
  }
  
  // Generate sitters
  for (let i = 0; i < sitterCount; i++) {
    users.push(generateRandomUser(i + 1, 'sitter'));
  }
  
  return users;
}

// CLI
const args = process.argv.slice(2);
const ownerCount = parseInt(args[0]) || 20;
const sitterCount = parseInt(args[1]) || 15;

console.log(`Generating ${ownerCount} owners and ${sitterCount} sitters...`);

const users = generateUsers(ownerCount, sitterCount);
const outputPath = path.join(__dirname, '..', 'testUsers.json');

fs.writeFileSync(outputPath, JSON.stringify(users, null, 2));

console.log(`Generated ${users.length} users saved to ${outputPath}`);
console.log('To use these users, import them in your app or copy them to AsyncStorage.');