const moviesData = [
  {
    id: "m1",
    title: "Inception",
    poster: "images/posters/m1.jpg",
    backdrop: "images/posters/m1.jpg",
    genre: ["Sci-Fi", "Action", "Thriller"],
    rating: 8.8,
    year: 2010,
    runtime: 148,
    description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    mood: ["Thought-provoking", "Action-packed", "Suspenseful"],
    trailer: "YoHD9XEInc0",
    streaming: ["Netflix", "Apple TV"],
    director: "Christopher Nolan",
    cast: "Leonardo DiCaprio, Joseph Gordon-Levitt, Elliot Page"
  },
  {
    id: "m2",
    title: "The Dark Knight",
    poster: "images/posters/m2.jpg",
    backdrop: "images/posters/m2.jpg",
    genre: ["Action", "Crime", "Drama"],
    rating: 9.0,
    year: 2008,
    runtime: 152,
    description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
    mood: ["Action-packed", "Scary", "Thought-provoking"],
    trailer: "EXeTwQWrcwY",
    streaming: ["Prime Video", "Apple TV"],
    director: "Christopher Nolan",
    cast: "Christian Bale, Heath Ledger, Aaron Eckhart"
  },
  {
    id: "m3",
    title: "Interstellar",
    poster: "images/posters/interstellar.png",
    backdrop: "images/hero/interstellar-banner.jpg",
    genre: ["Sci-Fi", "Drama", "Adventure"],
    rating: 8.7,
    year: 2014,
    runtime: 169,
    description: "When Earth becomes uninhabitable, a team of explorers travels through a wormhole in space in an attempt to ensure humanity's survival.",
    mood: ["Emotional", "Thought-provoking", "Relaxing"],
    trailer: "zSWdZVtXT7E",
    streaming: ["Prime Video", "Netflix"],
    director: "Christopher Nolan",
    cast: "Matthew McConaughey, Anne Hathaway, Jessica Chastain"
  },
  {
    id: "m4",
    title: "Spirited Away",
    poster: "images/posters/m4.png",
    backdrop: "images/posters/m4.png",
    genre: ["Animation", "Adventure", "Fantasy"],
    rating: 8.6,
    year: 2001,
    runtime: 125,
    description: "During her family's move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits, and where humans are changed into beasts.",
    mood: ["Emotional", "Relaxing", "Thought-provoking"],
    trailer: "ByXuk9QqQkk",
    streaming: ["Netflix", "HBO Max"],
    director: "Hayao Miyazaki",
    cast: "Rumi Hiiragi, Miyu Irino, Mari Natsuki"
  },
  {
    id: "m5",
    title: "Parasite",
    poster: "images/posters/m5.png",
    backdrop: "images/posters/m5.png",
    genre: ["Drama", "Thriller", "Comedy"],
    rating: 8.5,
    year: 2019,
    runtime: 132,
    description: "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.",
    mood: ["Thought-provoking", "Suspenseful", "Emotional"],
    trailer: "5xH0HfJHsaY",
    streaming: ["Hulu", "Apple TV"],
    director: "Bong Joon Ho",
    cast: "Song Kang-ho, Lee Sun-kyun, Cho Yeo-jeong"
  },
  {
    id: "m6",
    title: "Whiplash",
    poster: "images/posters/m6.jpg",
    backdrop: "images/posters/m6.jpg",
    genre: ["Drama", "Music"],
    rating: 8.5,
    year: 2014,
    runtime: 106,
    description: "A promising young drummer enrolls at a cut-throat music conservatory where his dreams of greatness are mentored by an instructor who will stop at nothing to realize a student's potential.",
    mood: ["Emotional", "Suspenseful", "Action-packed"],
    trailer: "7d_jQy340Lw",
    streaming: ["Netflix", "Prime Video"],
    director: "Damien Chazelle",
    cast: "Miles Teller, J.K. Simmons, Melissa Benoist"
  },
  {
    id: "m7",
    title: "Dune: Part Two",
    poster: "images/posters/dune-part-two.png",
    backdrop: "images/hero/dune-part-two-banner.jpg",
    genre: ["Sci-Fi", "Action", "Adventure"],
    rating: 8.9,
    year: 2024,
    runtime: 166,
    description: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
    mood: ["Action-packed", "Thought-provoking", "Suspenseful"],
    trailer: "Way9Dexny3w",
    streaming: ["HBO Max", "Apple TV"],
    director: "Denis Villeneuve",
    cast: "Timothée Chalamet, Zendaya, Rebecca Ferguson"
  },
  {
    id: "m8",
    title: "Spider-Man: Into the Spider-Verse",
    poster: "images/posters/m8.png",
    backdrop: "images/posters/m8.png",
    genre: ["Animation", "Action", "Adventure"],
    rating: 8.4,
    year: 2018,
    runtime: 117,
    description: "Teen Miles Morales becomes the Spider-Man of his universe and must join with five spider-powered individuals from other dimensions to stop a threat for all realities.",
    mood: ["Action-packed", "Relaxing", "Emotional"],
    trailer: "g4Hbz2jLXvQ",
    streaming: ["Disney+", "Netflix"],
    director: "Bob Persichetti, Peter Ramsey",
    cast: "Shameik Moore, Jake Johnson, Hailee Steinfeld"
  },
  {
    id: "m9",
    title: "Get Out",
    poster: "images/posters/m9.png",
    backdrop: "images/posters/m9.png",
    genre: ["Horror", "Mystery", "Thriller"],
    rating: 7.8,
    year: 2017,
    runtime: 104,
    description: "A young African-American visits his white girlfriend's parents for the weekend, where his simmering uneasiness about their reception eventually reaches a boiling point.",
    mood: ["Scary", "Suspenseful", "Thought-provoking"],
    trailer: "DzfpyUB60YY",
    streaming: ["Peacock", "Apple TV"],
    director: "Jordan Peele",
    cast: "Daniel Kaluuya, Allison Williams, Bradley Whitford"
  },
  {
    id: "m10",
    title: "Blade Runner 2049",
    poster: "images/posters/m10.png",
    backdrop: "images/posters/m10.png",
    genre: ["Sci-Fi", "Action", "Mystery"],
    rating: 8.0,
    year: 2017,
    runtime: 164,
    description: "A new blade runner, LAPD Officer K, unearths a long-buried secret that has the potential to plunge what's left of society into chaos.",
    mood: ["Thought-provoking", "Relaxing", "Suspenseful"],
    trailer: "gCcx85zbxz4",
    streaming: ["HBO Max", "Prime Video"],
    director: "Denis Villeneuve",
    cast: "Ryan Gosling, Harrison Ford, Ana de Armas"
  },
  {
    id: "m11",
    title: "The Shawshank Redemption",
    poster: "images/posters/m11.jpg",
    backdrop: "images/posters/m11.jpg",
    genre: ["Drama"],
    rating: 9.3,
    year: 1994,
    runtime: 142,
    description: "Over the course of several years, two convicts form a friendship, seeking consolation and, eventually, redemption through basic compassion.",
    mood: ["Emotional", "Thought-provoking", "Relaxing"],
    trailer: "PLl99DfY644",
    streaming: ["HBO Max", "Apple TV"],
    director: "Frank Darabont",
    cast: "Tim Robbins, Morgan Freeman, Bob Gunton"
  },
  {
    id: "m12",
    title: "Pulp Fiction",
    poster: "images/posters/m12.jpg",
    backdrop: "images/posters/m12.jpg",
    genre: ["Crime", "Drama"],
    rating: 8.9,
    year: 1994,
    runtime: 154,
    description: "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
    mood: ["Action-packed", "Thought-provoking", "Suspenseful"],
    trailer: "s7EdQ4FqbhY",
    streaming: ["Paramount+", "Apple TV"],
    director: "Quentin Tarantino",
    cast: "John Travolta, Uma Thurman, Samuel L. Jackson"
  },
  {
    id: "m13",
    title: "Mad Max: Fury Road",
    poster: "images/posters/m13.jpg",
    backdrop: "images/posters/m13.jpg",
    genre: ["Action", "Sci-Fi", "Adventure"],
    rating: 8.1,
    year: 2015,
    runtime: 120,
    description: "In a post-apocalyptic wasteland, a woman rebels against a tyrannical ruler in search for her homeland with the aid of a group of female prisoners, a psychotic worshiper, and a drifter named Max.",
    mood: ["Action-packed", "Suspenseful", "Emotional"],
    trailer: "hEJnMQG56iU",
    streaming: ["HBO Max", "Apple TV"],
    director: "George Miller",
    cast: "Tom Hardy, Charlize Theron, Nicholas Hoult"
  },
  {
    id: "m14",
    title: "La La Land",
    poster: "images/posters/m14.png",
    backdrop: "images/posters/m14.png",
    genre: ["Comedy", "Drama", "Music"],
    rating: 8.0,
    year: 2016,
    runtime: 128,
    description: "While navigating their careers in Los Angeles, a pianist and an actress fall in love while attempting to reconcile their aspirations for the future.",
    mood: ["Emotional", "Relaxing", "Thought-provoking"],
    trailer: "0pdqf4P9MB8",
    streaming: ["Netflix", "Apple TV"],
    director: "Damien Chazelle",
    cast: "Ryan Gosling, Emma Stone, Rosemarie DeWitt"
  },
  {
    id: "m15",
    title: "The Matrix",
    poster: "images/posters/m15.png",
    backdrop: "images/posters/m15.png",
    genre: ["Sci-Fi", "Action"],
    rating: 8.7,
    year: 1999,
    runtime: 136,
    description: "When a beautiful stranger leads computer hacker Neo to a forbidding underworld, he discovers the shocking truth--the life he knows is the elaborate deception of an evil cyber-intelligence.",
    mood: ["Action-packed", "Thought-provoking", "Suspenseful"],
    trailer: "vKQi3bBA1y8",
    streaming: ["HBO Max", "Apple TV"],
    director: "The Wachowskis",
    cast: "Keanu Reeves, Laurence Fishburne, Carrie-Anne Moss"
  },
  {
    id: "m16",
    title: "Avatar: The Way of Water",
    poster: "images/posters/m16.jpg",
    backdrop: "images/posters/m16.jpg",
    genre: ["Sci-Fi", "Action", "Adventure"],
    rating: 7.6,
    year: 2022,
    runtime: 192,
    description: "Jake Sully lives with his newfound family formed on the extrasolar moon Pandora. Once a familiar threat returns to finish what was previously started, Jake must work with Neytiri and the army of the Na'vi race to protect their home.",
    mood: ["Action-packed", "Emotional", "Relaxing"],
    trailer: "d9MyW72ELq0",
    streaming: ["Disney+", "HBO Max"],
    director: "James Cameron",
    cast: "Sam Worthington, Zoe Saldana, Sigourney Weaver"
  },
  {
    id: "m17",
    title: "Joker",
    poster: "images/posters/m17.jpg",
    backdrop: "images/posters/m17.jpg",
    genre: ["Crime", "Drama", "Thriller"],
    rating: 8.4,
    year: 2019,
    runtime: 122,
    description: "A mentally troubled stand-up comedian embarks on a downward spiral that leads to the creation of an iconic villain in a gritty, realistic Gotham City.",
    mood: ["Emotional", "Thought-provoking", "Scary"],
    trailer: "zAGVQLHvwOY",
    streaming: ["HBO Max", "Apple TV"],
    director: "Todd Phillips",
    cast: "Joaquin Phoenix, Robert De Niro, Zazie Beetz"
  },
  {
    id: "m18",
    title: "A Quiet Place",
    poster: "images/posters/m18.png",
    backdrop: "images/posters/m18.png",
    genre: ["Horror", "Sci-Fi", "Thriller"],
    rating: 7.5,
    year: 2018,
    runtime: 90,
    description: "A family struggles for survival in a world where most humans have been killed by blind but noise-sensitive creatures. They are forced to communicate only in sign language to keep the creatures at bay.",
    mood: ["Scary", "Suspenseful", "Emotional"],
    trailer: "WR7cc5t7niU",
    streaming: ["Paramount+", "Hulu"],
    director: "John Krasinski",
    cast: "Emily Blunt, John Krasinski, Millicent Simmonds"
  },
  {
    id: "m19",
    title: "Gladiator",
    poster: "images/posters/m19.png",
    backdrop: "images/posters/m19.png",
    genre: ["Action", "Adventure", "Drama"],
    rating: 8.5,
    year: 2000,
    runtime: 155,
    description: "A former Roman General sets out to exact vengeance against the corrupt emperor who murdered his family and sent him into slavery.",
    mood: ["Action-packed", "Emotional", "Thought-provoking"],
    trailer: "P5ieIbInFpg",
    streaming: ["Paramount+", "Apple TV"],
    director: "Ridley Scott",
    cast: "Russell Crowe, Joaquin Phoenix, Connie Nielsen"
  },
  {
    id: "m20",
    title: "Your Name.",
    poster: "images/posters/m20.png",
    backdrop: "images/posters/m20.png",
    genre: ["Animation", "Drama", "Fantasy"],
    rating: 8.4,
    year: 2016,
    runtime: 106,
    description: "Two strangers find themselves linked in a bizarre way. When a connection is formed, will distance be the only thing to keep them apart?",
    mood: ["Emotional", "Relaxing", "Thought-provoking"],
    trailer: "xU47nhruN-k",
    streaming: ["Crunchyroll", "Apple TV"],
    director: "Makoto Shinkai",
    cast: "Ryunosuke Kamiki, Mone Kamishibai, Ryo Narita"
  },
  {
    id: "m21",
    title: "Everything Everywhere All at Once",
    poster: "images/posters/m21.jpg",
    backdrop: "images/posters/m21.jpg",
    genre: ["Action", "Comedy", "Sci-Fi"],
    rating: 8.7,
    year: 2022,
    runtime: 139,
    description: "A middle-aged Chinese immigrant is swept up into an insane adventure in which she alone can save existence by exploring other universes and connecting with the lives she could have led.",
    mood: ["Thought-provoking", "Action-packed", "Emotional"],
    trailer: "wxN1T1uxQ2g",
    streaming: ["Paramount+", "Showtime"],
    director: "Daniel Kwan, Daniel Scheinert",
    cast: "Michelle Yeoh, Stephanie Hsu, Ke Huy Quan"
  }
];

const gamesData = [
  {
    id: "g1",
    title: "The Witcher 3: Wild Hunt",
    cover: "images/posters/g1.jpg",
    genre: ["RPG", "Action", "Fantasy"],
    platform: ["PC", "PlayStation", "Xbox", "Nintendo Switch"],
    rating: 9.7,
    year: 2015,
    description: "Geralt of Rivia, a monster hunter, embarks on a quest to find his adoptive daughter Ciri, who is being pursued by the Wild Hunt.",
    mood: ["Action-packed", "Emotional", "Thought-provoking"],
    trailer: "XHPrwv6Nggc",
    developer: "CD Projekt Red"
  },
  {
    id: "g2",
    title: "Elden Ring",
    cover: "images/posters/elden-ring.png",
    genre: ["RPG", "Action", "Dark Fantasy"],
    platform: ["PC", "PlayStation", "Xbox"],
    rating: 9.6,
    year: 2022,
    description: "In the Lands Between ruled by Queen Marika the Eternal, the Elden Ring has been shattered. The Tarnished must rise and become the Elden Lord.",
    mood: ["Action-packed", "Scary", "Thought-provoking"],
    trailer: "E3Huy2cdih0",
    developer: "FromSoftware"
  },
  {
    id: "g3",
    title: "Red Dead Redemption 2",
    cover: "images/posters/g3.jpg",
    genre: ["Action", "Adventure", "Open World"],
    platform: ["PC", "PlayStation", "Xbox"],
    rating: 9.8,
    year: 2018,
    description: "Amidst the decline of the Wild West, outlaw Arthur Morgan and the Van der Linde gang struggle to survive against government forces and rival gangs.",
    mood: ["Emotional", "Thought-provoking", "Action-packed"],
    trailer: "eaW0tYxiHgU",
    developer: "Rockstar Games"
  },
  {
    id: "g4",
    title: "The Legend of Zelda: Breath of the Wild",
    cover: "images/posters/g4.jpg",
    genre: ["Adventure", "Action", "Open World"],
    platform: ["Nintendo Switch"],
    rating: 9.5,
    year: 2017,
    description: "After a 100-year slumber, Link awakens in a ruined Hyrule. He must regain his memories and defeat Calamity Ganon to save Zelda.",
    mood: ["Relaxing", "Thought-provoking", "Action-packed"],
    trailer: "zw47_q9wbBE",
    developer: "Nintendo EPD"
  },
  {
    id: "g5",
    title: "Cyberpunk 2077",
    cover: "images/posters/g5.jpg",
    genre: ["RPG", "Sci-Fi", "Action"],
    platform: ["PC", "PlayStation", "Xbox"],
    rating: 8.6,
    year: 2020,
    description: "V is a mercenary outlaw fighting through the dystopian metropolis of Night City, seeking a one-of-a-kind implant that is the key to immortality.",
    mood: ["Action-packed", "Thought-provoking", "Suspenseful"],
    trailer: "8X2kIfS6fb8",
    developer: "CD Projekt Red"
  },
  {
    id: "g6",
    title: "God of War Ragnarök",
    cover: "images/posters/g6.jpg",
    genre: ["Action", "Adventure", "Mythology"],
    platform: ["PlayStation"],
    rating: 9.5,
    year: 2022,
    description: "Kratos and his teenage son Atreus travel through the Nine Realms of Norse mythology as Fimbulwinter prepares for Ragnarök.",
    mood: ["Action-packed", "Emotional", "Thought-provoking"],
    trailer: "hfJ4Km46A-0",
    developer: "Santa Monica Studio"
  },
  {
    id: "g7",
    title: "Hades",
    cover: "images/posters/g7.jpg",
    genre: ["Roguelike", "Action", "Indie"],
    platform: ["PC", "PlayStation", "Xbox", "Nintendo Switch"],
    rating: 9.3,
    year: 2020,
    description: "As the Prince of the Underworld, Zagreus attempts to battle his way out of the domain of his overbearing father, Hades.",
    mood: ["Action-packed", "Relaxing", "Emotional"],
    trailer: "Bz8l935B70k",
    developer: "Supergiant Games"
  },
  {
    id: "g8",
    title: "Minecraft",
    cover: "images/posters/g8.jpg",
    genre: ["Sandbox", "Survival"],
    platform: ["PC", "PlayStation", "Xbox", "Nintendo Switch"],
    rating: 9.0,
    year: 2011,
    description: "Explore infinite blocky worlds, craft items, build structures, and survive monsters in this ultimate creative and survival experience.",
    mood: ["Relaxing", "Thought-provoking"],
    trailer: "MmB9b5njVbA",
    developer: "Mojang Studios"
  },
  {
    id: "g9",
    title: "Portal 2",
    cover: "images/posters/g9.jpg",
    genre: ["Puzzle", "Sci-Fi", "Comedy"],
    platform: ["PC", "PlayStation", "Xbox", "Nintendo Switch"],
    rating: 9.8,
    year: 2011,
    description: "Trapped in the Aperture Science facility, Chell must navigate mind-bending portal puzzles and outsmart the rogue AI GLaDOS and the bumbling Wheatley.",
    mood: ["Thought-provoking", "Relaxing", "Suspenseful"],
    trailer: "tax4e4hBB43",
    developer: "Valve"
  },
  {
    id: "g10",
    title: "Resident Evil 4 (Remake)",
    cover: "images/posters/g10.jpg",
    genre: ["Horror", "Action", "Thriller"],
    platform: ["PC", "PlayStation", "Xbox"],
    rating: 9.4,
    year: 2023,
    description: "Six years after the Raccoon City disaster, agent Leon S. Kennedy is sent to rescue the US President's kidnapped daughter from a secluded European village.",
    mood: ["Scary", "Suspenseful", "Action-packed"],
    trailer: "j5XvDVZ92rU",
    developer: "Capcom"
  },
  {
    id: "g11",
    title: "Hollow Knight",
    cover: "images/posters/g11.jpg",
    genre: ["Metroidvania", "Indie", "Adventure"],
    platform: ["PC", "PlayStation", "Xbox", "Nintendo Switch"],
    rating: 9.4,
    year: 2017,
    description: "Descend into the ruined kingdom of Hallownest, a vast subterranean world filled with bugs, ancient secrets, and challenging boss battles.",
    mood: ["Relaxing", "Emotional", "Thought-provoking"],
    trailer: "UAO2urG23S4",
    developer: "Team Cherry"
  },
  {
    id: "g12",
    title: "GTA V",
    cover: "images/posters/g12.png",
    genre: ["Action", "Open World", "Crime"],
    platform: ["PC", "PlayStation", "Xbox"],
    rating: 9.5,
    year: 2013,
    description: "Three very different criminals team up to execute a series of daring and dangerous heists across the sprawling metropolis of Los Santos.",
    mood: ["Action-packed", "Suspenseful"],
    trailer: "QkkoHAzjnUs",
    developer: "Rockstar North"
  },
  {
    id: "g13",
    title: "Marvel's Spider-Man 2",
    cover: "images/posters/g13.jpg",
    genre: ["Action", "Adventure", "Superhero"],
    platform: ["PlayStation"],
    rating: 9.2,
    year: 2023,
    description: "Spider-Men Peter Parker and Miles Morales face ultimate tests of strength as they fight to save New York City from Venom and Kraven the Hunter.",
    mood: ["Action-packed", "Emotional", "Suspenseful"],
    trailer: "bgqGdIoa52s",
    developer: "Insomniac Games"
  },
  {
    id: "g14",
    title: "Baldur's Gate 3",
    cover: "images/posters/g14.jpg",
    genre: ["RPG", "Fantasy"],
    platform: ["PC", "PlayStation", "Xbox"],
    rating: 9.8,
    year: 2023,
    description: "Gather your party and return to the Forgotten Realms in a tale of fellowship, betrayal, sacrifice, and the lure of absolute power.",
    mood: ["Thought-provoking", "Emotional", "Action-packed"],
    trailer: "Ug35RLya5tQ",
    developer: "Larian Studios"
  },
  {
    id: "g15",
    title: "Stardew Valley",
    cover: "images/posters/g15.png",
    genre: ["Simulation", "Indie", "RPG"],
    platform: ["PC", "PlayStation", "Xbox", "Nintendo Switch"],
    rating: 9.2,
    year: 2016,
    description: "You've inherited your grandfather's old farm plot in Stardew Valley. Armed with hand-me-down tools and a few coins, you set out to build a new life.",
    mood: ["Relaxing", "Emotional"],
    trailer: "ot7uXNQsk0g",
    developer: "ConcernedApe"
  },
  {
    id: "g16",
    title: "Alan Wake 2",
    cover: "images/posters/g16.jpg",
    genre: ["Horror", "Mystery", "Thriller"],
    platform: ["PC", "PlayStation", "Xbox"],
    rating: 9.1,
    year: 2023,
    description: "An FBI agent investigating ritualistic murders in Bright Falls and a trapped writer attempting to write himself out of a dark dimension find their realities intertwined.",
    mood: ["Scary", "Suspenseful", "Thought-provoking"],
    trailer: "dlQ3X49KAoo",
    developer: "Remedy Entertainment"
  },
  {
    id: "g17",
    title: "Super Mario Odyssey",
    cover: "images/posters/g17.jpg",
    genre: ["Platformer", "Adventure", "Family"],
    platform: ["Nintendo Switch"],
    rating: 9.4,
    year: 2017,
    description: "Join Mario on a massive, globe-trotting 3D adventure using his new ally Cappy to rescue Princess Peach from Bowser's wedding plans.",
    mood: ["Relaxing", "Action-packed"],
    trailer: "wGQHQc_3yYo",
    developer: "Nintendo EPD"
  },
  {
    id: "g18",
    title: "The Last of Us Part I",
    cover: "images/posters/g18.jpg",
    genre: ["Action", "Adventure", "Post-Apocalyptic"],
    platform: ["PC", "PlayStation"],
    rating: 9.6,
    year: 2022,
    description: "In a ravaged civilization where infected and hardened survivors run rampant, Joel, a weary protagonist, is hired to smuggle 14-year-old Ellie out of a military quarantine zone.",
    mood: ["Emotional", "Action-packed", "Suspenseful"],
    trailer: "WxjeV10H1F0",
    developer: "Naughty Dog"
  },
  {
    id: "g19",
    title: "Persona 5 Royal",
    cover: "images/posters/g19.jpg",
    genre: ["RPG", "Anime", "Turn-Based"],
    platform: ["PC", "PlayStation", "Xbox", "Nintendo Switch"],
    rating: 9.5,
    year: 2019,
    description: "Transferring to a Tokyo high school, Joker discovers supernatural powers and forms the Phantom Thieves of Hearts to reform corrupt adults.",
    mood: ["Thought-provoking", "Relaxing", "Emotional"],
    trailer: "SKpSpvD7b1A",
    developer: "ATLUS"
  },
  {
    id: "g20",
    title: "Outer Wilds",
    cover: "images/posters/g20.jpg",
    genre: ["Adventure", "Sci-Fi", "Mystery"],
    platform: ["PC", "PlayStation", "Xbox", "Nintendo Switch"],
    rating: 9.4,
    year: 2019,
    description: "You are the newest recruit of Outer Wilds Ventures, a fledgling space program searching for answers in a strange, constantly evolving solar system trapped in an infinite time loop.",
    mood: ["Thought-provoking", "Relaxing", "Emotional"],
    trailer: "d6LGNVCL1fs",
    developer: "Mobius Digital"
  },
  {
    id: "g21",
    title: "Disco Elysium",
    cover: "images/posters/g21.jpg",
    genre: ["RPG", "Detective", "Indie"],
    platform: ["PC", "PlayStation", "Xbox", "Nintendo Switch"],
    rating: 9.6,
    year: 2019,
    description: "You're a detective with a unique skill system at your disposal and a whole city block to carve your path across. Interrogate unforgettable characters or take bribes.",
    mood: ["Thought-provoking", "Emotional", "Relaxing"],
    trailer: "M89a1iH9tM4",
    developer: "ZA/UM"
  }
];

const actorsData = [
  { id: "a1", name: "Leonardo DiCaprio", role: "Actor", knownFor: "Inception, Titanic, Shutter Island", image: "images/posters/m1.jpg" },
  { id: "a2", name: "Christian Bale", role: "Actor", knownFor: "The Dark Knight, American Psycho", image: "images/posters/m2.jpg" },
  { id: "a3", name: "Matthew McConaughey", role: "Actor", knownFor: "Interstellar, True Detective", image: "images/posters/interstellar.png" },
  { id: "a4", name: "Michelle Yeoh", role: "Actress", knownFor: "Everything Everywhere All at Once", image: "images/posters/m21.jpg" },
  { id: "a5", name: "Song Kang-ho", role: "Actor", knownFor: "Parasite, Snowpiercer", image: "images/posters/m5.png" },
  { id: "a6", name: "Cillian Murphy", role: "Actor", knownFor: "Oppenheimer, Peaky Blinders", image: "images/posters/m2.jpg" },
  { id: "a7", name: "Miles Teller", role: "Actor", knownFor: "Whiplash, Top Gun: Maverick", image: "images/posters/m6.jpg" },
  { id: "a8", name: "Anne Hathaway", role: "Actress", knownFor: "Interstellar, The Dark Knight Rises", image: "images/posters/interstellar.png" }
];

const directorsData = [
  { id: "d1", name: "Christopher Nolan", role: "Director", knownFor: "Inception, The Dark Knight, Interstellar", image: "images/posters/m1.jpg" },
  { id: "d2", name: "Hayao Miyazaki", role: "Director", knownFor: "Spirited Away, Princess Mononoke", image: "images/posters/m4.png" },
  { id: "d3", name: "Bong Joon Ho", role: "Director", knownFor: "Parasite, Memories of Murder", image: "images/posters/m5.png" },
  { id: "d4", name: "Damien Chazelle", role: "Director", knownFor: "Whiplash, La La Land", image: "images/posters/m6.jpg" },
  { id: "d5", name: "Ridley Scott", role: "Director", knownFor: "Gladiator, Blade Runner", image: "images/posters/m1.jpg" },
  { id: "d6", name: "Makoto Shinkai", role: "Director", knownFor: "Your Name., Weathering With You", image: "images/posters/m20.png" }
];

const providersData = [
  { id: "p1", name: "Netflix", type: "STREAM", icon: "fa-solid fa-play", color: "#e50914" },
  { id: "p2", name: "Prime Video", type: "STREAM", icon: "fa-solid fa-film", color: "#00a8e1" },
  { id: "p3", name: "Disney+", type: "STREAM", icon: "fa-solid fa-sparkles", color: "#113ccf" },
  { id: "p4", name: "JioHotstar", type: "STREAM", icon: "fa-solid fa-star", color: "#ffaa00" },
  { id: "p5", name: "Apple TV", type: "RENT", icon: "fa-brands fa-apple", color: "#ffffff" },
  { id: "p6", name: "HBO Max", type: "STREAM", icon: "fa-solid fa-tv", color: "#9933ff" },
  { id: "p7", name: "Hulu", type: "STREAM", icon: "fa-solid fa-clapperboard", color: "#1ce783" }
];

// Enrich default items with missing metadata fields if not set
moviesData.forEach((m, idx) => {
  if (!m.language) m.language = idx % 2 === 0 ? "English" : (idx % 3 === 0 ? "Japanese" : "Korean");
  if (!m.country) m.country = idx % 3 === 0 ? "USA" : (idx % 4 === 0 ? "Japan" : "South Korea");
  if (!m.matchPercentage) m.matchPercentage = 85 + (idx % 15);
});

gamesData.forEach((g, idx) => {
  if (!g.tags) g.tags = ["Open World", "Story Rich", "Singleplayer", "Atmospheric"];
  if (!g.price) g.price = idx % 3 === 0 ? "Free" : `₹${999 + (idx * 200 % 2500)}`;
  if (!g.publisher) g.publisher = g.developer || "Global Publishing";
  if (!g.features) g.features = ["Controller Support", "Achievements", "Cloud Saves"];
  if (!g.sysReq) {
    g.sysReq = {
      minimum: "OS: Windows 10 (64-bit) | CPU: Intel Core i5-8400 / AMD Ryzen 5 2600 | RAM: 8 GB | GPU: NVIDIA GTX 1060 / AMD RX 580 | Storage: 60 GB",
      recommended: "OS: Windows 11 (64-bit) | CPU: Intel Core i7-10700K / AMD Ryzen 7 3700X | RAM: 16 GB | GPU: NVIDIA RTX 3070 / AMD RX 6700 XT | Storage: 60 GB SSD"
    };
  }
  if (!g.matchPercentage) g.matchPercentage = 88 + (idx % 12);
});

// Export datasets to global scope or export module
if (typeof module !== "undefined" && module.exports) {
  module.exports = { moviesData, gamesData, actorsData, directorsData, providersData };
} else {
  window.moviesData = moviesData;
  window.gamesData = gamesData;
  window.actorsData = actorsData;
  window.directorsData = directorsData;
  window.providersData = providersData;
}

