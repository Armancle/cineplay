const moviesData = [
  {
    id: "m1",
    title: "Inception",
    poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=600&auto=format&fit=crop",
    genre: ["Sci-Fi", "Action", "Thriller"],
    rating: 8.8,
    year: 2010,
    runtime: 148,
    description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    mood: ["Thought-provoking", "Action-packed", "Suspenseful"]
  },
  {
    id: "m2",
    title: "The Dark Knight",
    poster: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=600&auto=format&fit=crop",
    genre: ["Action", "Crime", "Drama"],
    rating: 9.0,
    year: 2008,
    runtime: 152,
    description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
    mood: ["Action-packed", "Scary", "Thought-provoking"]
  },
  {
    id: "m3",
    title: "Interstellar",
    poster: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop",
    genre: ["Sci-Fi", "Drama", "Adventure"],
    rating: 8.7,
    year: 2014,
    runtime: 169,
    description: "When Earth becomes uninhabitable, a team of explorers travels through a wormhole in space in an attempt to ensure humanity's survival.",
    mood: ["Emotional", "Thought-provoking", "Relaxing"]
  },
  {
    id: "m4",
    title: "Spirited Away",
    poster: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600&auto=format&fit=crop",
    genre: ["Animation", "Adventure", "Fantasy"],
    rating: 8.6,
    year: 2001,
    runtime: 125,
    description: "During her family's move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits, and where humans are changed into beasts.",
    mood: ["Emotional", "Relaxing", "Thought-provoking"]
  },
  {
    id: "m5",
    title: "Parasite",
    poster: "https://images.unsplash.com/photo-1593085512500-5d55148d6f0d?q=80&w=600&auto=format&fit=crop",
    genre: ["Drama", "Thriller", "Comedy"],
    rating: 8.5,
    year: 2019,
    runtime: 132,
    description: "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.",
    mood: ["Thought-provoking", "Suspenseful", "Emotional"]
  },
  {
    id: "m6",
    title: "Whiplash",
    poster: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&auto=format&fit=crop",
    genre: ["Drama", "Music"],
    rating: 8.5,
    year: 2014,
    runtime: 106,
    description: "A promising young drummer enrolls at a cut-throat music conservatory where his dreams of greatness are mentored by an instructor who will stop at nothing to realize a student's potential.",
    mood: ["Emotional", "Suspenseful", "Action-packed"]
  },
  {
    id: "m7",
    title: "Dune: Part Two",
    poster: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=600&auto=format&fit=crop",
    genre: ["Sci-Fi", "Action", "Adventure"],
    rating: 8.9,
    year: 2024,
    runtime: 166,
    description: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
    mood: ["Action-packed", "Thought-provoking", "Suspenseful"]
  },
  {
    id: "m8",
    title: "Spider-Man: Into the Spider-Verse",
    poster: "https://images.unsplash.com/photo-1608889175123-8ec330b86f84?q=80&w=600&auto=format&fit=crop",
    genre: ["Animation", "Action", "Adventure"],
    rating: 8.4,
    year: 2018,
    runtime: 117,
    description: "Teen Miles Morales becomes the Spider-Man of his universe and must join with five spider-powered individuals from other dimensions to stop a threat for all realities.",
    mood: ["Action-packed", "Relaxing", "Emotional"]
  },
  {
    id: "m9",
    title: "Get Out",
    poster: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=600&auto=format&fit=crop",
    genre: ["Horror", "Mystery", "Thriller"],
    rating: 7.8,
    year: 2017,
    runtime: 104,
    description: "A young African-American visits his white girlfriend's parents for the weekend, where his simmering uneasiness about their reception eventually reaches a boiling point.",
    mood: ["Scary", "Suspenseful", "Thought-provoking"]
  },
  {
    id: "m10",
    title: "Blade Runner 2049",
    poster: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=600&auto=format&fit=crop",
    genre: ["Sci-Fi", "Action", "Mystery"],
    rating: 8.0,
    year: 2017,
    runtime: 164,
    description: "A new blade runner, LAPD Officer K, unearths a long-buried secret that has the potential to plunge what's left of society into chaos.",
    mood: ["Thought-provoking", "Relaxing", "Suspenseful"]
  },
  {
    id: "m11",
    title: "The Shawshank Redemption",
    poster: "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=600&auto=format&fit=crop",
    genre: ["Drama"],
    rating: 9.3,
    year: 1994,
    runtime: 142,
    description: "Over the course of several years, two convicts form a friendship, seeking consolation and, eventually, redemption through basic compassion.",
    mood: ["Emotional", "Thought-provoking", "Relaxing"]
  },
  {
    id: "m12",
    title: "Pulp Fiction",
    poster: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=600&auto=format&fit=crop",
    genre: ["Crime", "Drama"],
    rating: 8.9,
    year: 1994,
    runtime: 154,
    description: "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
    mood: ["Action-packed", "Thought-provoking", "Suspenseful"]
  },
  {
    id: "m13",
    title: "Mad Max: Fury Road",
    poster: "https://images.unsplash.com/photo-1514539079130-25950c84af65?q=80&w=600&auto=format&fit=crop",
    genre: ["Action", "Sci-Fi", "Adventure"],
    rating: 8.1,
    year: 2015,
    runtime: 120,
    description: "In a post-apocalyptic wasteland, a woman rebels against a tyrannical ruler in search for her homeland with the aid of a group of female prisoners, a psychotic worshiper, and a drifter named Max.",
    mood: ["Action-packed", "Suspenseful", "Emotional"]
  },
  {
    id: "m14",
    title: "La La Land",
    poster: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop",
    genre: ["Comedy", "Drama", "Music"],
    rating: 8.0,
    year: 2016,
    runtime: 128,
    description: "While navigating their careers in Los Angeles, a pianist and an actress fall in love while attempting to reconcile their aspirations for the future.",
    mood: ["Emotional", "Relaxing", "Thought-provoking"]
  },
  {
    id: "m15",
    title: "The Matrix",
    poster: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=600&auto=format&fit=crop",
    genre: ["Sci-Fi", "Action"],
    rating: 8.7,
    year: 1999,
    runtime: 136,
    description: "When a beautiful stranger leads computer hacker Neo to a forbidding underworld, he discovers the shocking truth--the life he knows is the elaborate deception of an evil cyber-intelligence.",
    mood: ["Action-packed", "Thought-provoking", "Suspenseful"]
  },
  {
    id: "m16",
    title: "Avatar: The Way of Water",
    poster: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop",
    genre: ["Sci-Fi", "Action", "Adventure"],
    rating: 7.6,
    year: 2022,
    runtime: 192,
    description: "Jake Sully lives with his newfound family formed on the extrasolar moon Pandora. Once a familiar threat returns to finish what was previously started, Jake must work with Neytiri and the army of the Na'vi race to protect their home.",
    mood: ["Action-packed", "Emotional", "Relaxing"]
  },
  {
    id: "m17",
    title: "Joker",
    poster: "https://images.unsplash.com/photo-1531259683007-016a7b628fc3?q=80&w=600&auto=format&fit=crop",
    genre: ["Crime", "Drama", "Thriller"],
    rating: 8.4,
    year: 2019,
    runtime: 122,
    description: "A mentally troubled stand-up comedian embarks on a downward spiral that leads to the creation of an iconic villain in a gritty, realistic Gotham City.",
    mood: ["Emotional", "Thought-provoking", "Scary"]
  },
  {
    id: "m18",
    title: "A Quiet Place",
    poster: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=600&auto=format&fit=crop",
    genre: ["Horror", "Sci-Fi", "Thriller"],
    rating: 7.5,
    year: 2018,
    runtime: 90,
    description: "A family struggles for survival in a world where most humans have been killed by blind but noise-sensitive creatures. They are forced to communicate only in sign language to keep the creatures at bay.",
    mood: ["Scary", "Suspenseful", "Emotional"]
  },
  {
    id: "m19",
    title: "Gladiator",
    poster: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?q=80&w=600&auto=format&fit=crop",
    genre: ["Action", "Adventure", "Drama"],
    rating: 8.5,
    year: 2000,
    runtime: 155,
    description: "A former Roman General sets out to exact vengeance against the corrupt emperor who murdered his family and sent him into slavery.",
    mood: ["Action-packed", "Emotional", "Thought-provoking"]
  },
  {
    id: "m20",
    title: "Your Name.",
    poster: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop",
    genre: ["Animation", "Drama", "Fantasy"],
    rating: 8.4,
    year: 2016,
    runtime: 106,
    description: "Two strangers find themselves linked in a bizarre way. When a connection is formed, will distance be the only thing to keep them apart?",
    mood: ["Emotional", "Relaxing", "Thought-provoking"]
  },
  {
    id: "m21",
    title: "Everything Everywhere All at Once",
    poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=600&auto=format&fit=crop",
    genre: ["Action", "Comedy", "Sci-Fi"],
    rating: 8.7,
    year: 2022,
    runtime: 139,
    description: "A middle-aged Chinese immigrant is swept up into an insane adventure in which she alone can save existence by exploring other universes and connecting with the lives she could have led.",
    mood: ["Thought-provoking", "Action-packed", "Emotional"]
  }
];

const gamesData = [
  {
    id: "g1",
    title: "The Witcher 3: Wild Hunt",
    cover: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=600&auto=format&fit=crop",
    genre: ["RPG", "Action", "Fantasy"],
    platform: ["PC", "PlayStation", "Xbox", "Nintendo Switch"],
    rating: 9.7,
    year: 2015,
    description: "Geralt of Rivia, a monster hunter, embarks on a quest to find his adoptive daughter Ciri, who is being pursued by the Wild Hunt.",
    mood: ["Action-packed", "Emotional", "Thought-provoking"]
  },
  {
    id: "g2",
    title: "Elden Ring",
    cover: "https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?q=80&w=600&auto=format&fit=crop",
    genre: ["RPG", "Action", "Dark Fantasy"],
    platform: ["PC", "PlayStation", "Xbox"],
    rating: 9.6,
    year: 2022,
    description: "In the Lands Between ruled by Queen Marika the Eternal, the Elden Ring has been shattered. The Tarnished must rise and become the Elden Lord.",
    mood: ["Action-packed", "Scary", "Thought-provoking"]
  },
  {
    id: "g3",
    title: "Red Dead Redemption 2",
    cover: "https://images.unsplash.com/photo-1533130061792-64b345e4a833?q=80&w=600&auto=format&fit=crop",
    genre: ["Action", "Adventure", "Open World"],
    platform: ["PC", "PlayStation", "Xbox"],
    rating: 9.8,
    year: 2018,
    description: "Amidst the decline of the Wild West, outlaw Arthur Morgan and the Van der Linde gang struggle to survive against government forces and rival gangs.",
    mood: ["Emotional", "Thought-provoking", "Action-packed"]
  },
  {
    id: "g4",
    title: "The Legend of Zelda: Breath of the Wild",
    cover: "https://images.unsplash.com/photo-1551103782-8ab07afd45c1?q=80&w=600&auto=format&fit=crop",
    genre: ["Adventure", "Action", "Open World"],
    platform: ["Nintendo Switch"],
    rating: 9.5,
    year: 2017,
    description: "After a 100-year slumber, Link awakens in a ruined Hyrule. He must regain his memories and defeat Calamity Ganon to save Zelda.",
    mood: ["Relaxing", "Thought-provoking", "Action-packed"]
  },
  {
    id: "g5",
    title: "Cyberpunk 2077",
    cover: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop",
    genre: ["RPG", "Sci-Fi", "Action"],
    platform: ["PC", "PlayStation", "Xbox"],
    rating: 8.6,
    year: 2020,
    description: "V is a mercenary outlaw fighting through the dystopian metropolis of Night City, seeking a one-of-a-kind implant that is the key to immortality.",
    mood: ["Action-packed", "Thought-provoking", "Suspenseful"]
  },
  {
    id: "g6",
    title: "God of War Ragnarök",
    cover: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=600&auto=format&fit=crop",
    genre: ["Action", "Adventure", "Mythology"],
    platform: ["PlayStation"],
    rating: 9.5,
    year: 2022,
    description: "Kratos and his teenage son Atreus travel through the Nine Realms of Norse mythology as Fimbulwinter prepares for Ragnarök.",
    mood: ["Action-packed", "Emotional", "Thought-provoking"]
  },
  {
    id: "g7",
    title: "Hades",
    cover: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&auto=format&fit=crop",
    genre: ["Roguelike", "Action", "Indie"],
    platform: ["PC", "PlayStation", "Xbox", "Nintendo Switch"],
    rating: 9.3,
    year: 2020,
    description: "As the Prince of the Underworld, Zagreus attempts to battle his way out of the domain of his overbearing father, Hades.",
    mood: ["Action-packed", "Relaxing", "Emotional"]
  },
  {
    id: "g8",
    title: "Minecraft",
    cover: "https://images.unsplash.com/photo-1605901309584-818e25960a8f?q=80&w=600&auto=format&fit=crop",
    genre: ["Sandbox", "Survival"],
    platform: ["PC", "PlayStation", "Xbox", "Nintendo Switch"],
    rating: 9.0,
    year: 2011,
    description: "Explore infinite blocky worlds, craft items, build structures, and survive monsters in this ultimate creative and survival experience.",
    mood: ["Relaxing", "Thought-provoking"]
  },
  {
    id: "g9",
    title: "Portal 2",
    cover: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600&auto=format&fit=crop",
    genre: ["Puzzle", "Sci-Fi", "Comedy"],
    platform: ["PC", "PlayStation", "Xbox", "Nintendo Switch"],
    rating: 9.8,
    year: 2011,
    description: "Trapped in the Aperture Science facility, Chell must navigate mind-bending portal puzzles and outsmart the rogue AI GLaDOS and the bumbling Wheatley.",
    mood: ["Thought-provoking", "Relaxing", "Suspenseful"]
  },
  {
    id: "g10",
    title: "Resident Evil 4 (Remake)",
    cover: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=600&auto=format&fit=crop",
    genre: ["Horror", "Action", "Thriller"],
    platform: ["PC", "PlayStation", "Xbox"],
    rating: 9.4,
    year: 2023,
    description: "Six years after the Raccoon City disaster, agent Leon S. Kennedy is sent to rescue the US President's kidnapped daughter from a secluded European village.",
    mood: ["Scary", "Suspenseful", "Action-packed"]
  },
  {
    id: "g11",
    title: "Hollow Knight",
    cover: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=600&auto=format&fit=crop",
    genre: ["Metroidvania", "Indie", "Adventure"],
    platform: ["PC", "PlayStation", "Xbox", "Nintendo Switch"],
    rating: 9.4,
    year: 2017,
    description: "Descend into the ruined kingdom of Hallownest, a vast subterranean world filled with bugs, ancient secrets, and challenging boss battles.",
    mood: ["Relaxing", "Emotional", "Thought-provoking"]
  },
  {
    id: "g12",
    title: "GTA V",
    cover: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=600&auto=format&fit=crop",
    genre: ["Action", "Open World", "Crime"],
    platform: ["PC", "PlayStation", "Xbox"],
    rating: 9.5,
    year: 2013,
    description: "Three very different criminals team up to execute a series of daring and dangerous heists across the sprawling metropolis of Los Santos.",
    mood: ["Action-packed", "Suspenseful"]
  },
  {
    id: "g13",
    title: "Marvel's Spider-Man 2",
    cover: "https://images.unsplash.com/photo-1608889175123-8ec330b86f84?q=80&w=600&auto=format&fit=crop",
    genre: ["Action", "Adventure", "Superhero"],
    platform: ["PlayStation"],
    rating: 9.2,
    year: 2023,
    description: "Spider-Men Peter Parker and Miles Morales face ultimate tests of strength as they fight to save New York City from Venom and Kraven the Hunter.",
    mood: ["Action-packed", "Emotional", "Suspenseful"]
  },
  {
    id: "g14",
    title: "Baldur's Gate 3",
    cover: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600&auto=format&fit=crop",
    genre: ["RPG", "Fantasy"],
    platform: ["PC", "PlayStation", "Xbox"],
    rating: 9.8,
    year: 2023,
    description: "Gather your party and return to the Forgotten Realms in a tale of fellowship, betrayal, sacrifice, and the lure of absolute power.",
    mood: ["Thought-provoking", "Emotional", "Action-packed"]
  },
  {
    id: "g15",
    title: "Stardew Valley",
    cover: "https://images.unsplash.com/photo-1500485035595-cbe6f645feb1?q=80&w=600&auto=format&fit=crop",
    genre: ["Simulation", "Indie", "RPG"],
    platform: ["PC", "PlayStation", "Xbox", "Nintendo Switch"],
    rating: 9.2,
    year: 2016,
    description: "You've inherited your grandfather's old farm plot in Stardew Valley. Armed with hand-me-down tools and a few coins, you set out to build a new life.",
    mood: ["Relaxing", "Emotional"]
  },
  {
    id: "g16",
    title: "Alan Wake 2",
    cover: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=600&auto=format&fit=crop",
    genre: ["Horror", "Mystery", "Thriller"],
    platform: ["PC", "PlayStation", "Xbox"],
    rating: 9.1,
    year: 2023,
    description: "An FBI agent investigating ritualistic murders in Bright Falls and a trapped writer attempting to write himself out of a dark dimension find their realities intertwined.",
    mood: ["Scary", "Suspenseful", "Thought-provoking"]
  },
  {
    id: "g17",
    title: "Super Mario Odyssey",
    cover: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600&auto=format&fit=crop",
    genre: ["Platformer", "Adventure", "Family"],
    platform: ["Nintendo Switch"],
    rating: 9.4,
    year: 2017,
    description: "Join Mario on a massive, globe-trotting 3D adventure using his new ally Cappy to rescue Princess Peach from Bowser's wedding plans.",
    mood: ["Relaxing", "Action-packed"]
  },
  {
    id: "g18",
    title: "The Last of Us Part I",
    cover: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=600&auto=format&fit=crop",
    genre: ["Action", "Adventure", "Post-Apocalyptic"],
    platform: ["PC", "PlayStation"],
    rating: 9.6,
    year: 2022,
    description: "In a ravaged civilization where infected and hardened survivors run rampant, Joel, a weary protagonist, is hired to smuggle 14-year-old Ellie out of a military quarantine zone.",
    mood: ["Emotional", "Action-packed", "Suspenseful"]
  },
  {
    id: "g19",
    title: "Persona 5 Royal",
    cover: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600&auto=format&fit=crop",
    genre: ["RPG", "Anime", "Turn-Based"],
    platform: ["PC", "PlayStation", "Xbox", "Nintendo Switch"],
    rating: 9.5,
    year: 2019,
    description: "Transferring to a Tokyo high school, Joker discovers supernatural powers and forms the Phantom Thieves of Hearts to reform corrupt adults.",
    mood: ["Thought-provoking", "Relaxing", "Emotional"]
  },
  {
    id: "g20",
    title: "Outer Wilds",
    cover: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop",
    genre: ["Adventure", "Sci-Fi", "Mystery"],
    platform: ["PC", "PlayStation", "Xbox", "Nintendo Switch"],
    rating: 9.4,
    year: 2019,
    description: "You are the newest recruit of Outer Wilds Ventures, a fledgling space program searching for answers in a strange, constantly evolving solar system trapped in an infinite time loop.",
    mood: ["Thought-provoking", "Relaxing", "Emotional"]
  },
  {
    id: "g21",
    title: "Disco Elysium",
    cover: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600&auto=format&fit=crop",
    genre: ["RPG", "Detective", "Indie"],
    platform: ["PC", "PlayStation", "Xbox", "Nintendo Switch"],
    rating: 9.6,
    year: 2019,
    description: "You're a detective with a unique skill system at your disposal and a whole city block to carve your path across. Interrogate unforgettable characters or take bribes.",
    mood: ["Thought-provoking", "Emotional", "Relaxing"]
  }
];

// Export datasets to global scope or export module
if (typeof module !== "undefined" && module.exports) {
  module.exports = { moviesData, gamesData };
} else {
  window.moviesData = moviesData;
  window.gamesData = gamesData;
}
