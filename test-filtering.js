const allUsers = [
    { id: 1, name: 'Test User', role: 'Actor', experience: 'Beginner', location: 'Bangalore', age: 20 }
];

const criteria = {
    category: 'Artist',
    role: 'Actor',
    experience: 'Any',
    ageRange: 'Any',
    gender: 'Any',
    skills: '',
    location: 'Banglore' // Misspelled like in the screenshot
};

let matches = [...allUsers]
if (criteria.role !== 'All') {
    matches = matches.filter(u => u.role === criteria.role)
}
console.log("After role filter:", matches.length);

if (criteria.experience && criteria.experience !== 'Any') {
    matches = matches.filter(u => u.experience === criteria.experience)
}
console.log("After exp filter:", matches.length);

if (criteria.gender !== 'Any') {
     matches = matches.filter(u => u.gender === criteria.gender)
}
console.log("After gender filter:", matches.length);

if (criteria.location) {
     matches = matches.filter(u => u.location?.toLowerCase().includes(criteria.location.toLowerCase()))
}
console.log("After location filter:", matches.length);
