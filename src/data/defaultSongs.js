// 30 Iconic Horror Songs and Sound Clips for Horror Song Trivia
export const DEFAULT_HORROR_SONGS = [
  {
    round_number: 1,
    title: "Halloween Theme",
    artist: "John Carpenter",
    correct_answer: "Halloween",
    accepted_answers: ["halloween theme", "john carpenter halloween", "halloween main theme", "michael myers theme"],
    hint: "1978 classic directed by John Carpenter. He came home.",
    audio_path: "",
    synth_motif: "halloween"
  },
  {
    round_number: 2,
    title: "Tubular Bells (The Exorcist)",
    artist: "Mike Oldfield",
    correct_answer: "The Exorcist",
    accepted_answers: ["tubular bells", "exorcist", "the exorcist theme", "mike oldfield tubular bells"],
    hint: "Your mother sews socks in hell. 1973 demonic possession masterpiece.",
    audio_path: "",
    synth_motif: "tubular"
  },
  {
    round_number: 3,
    title: "Thriller",
    artist: "Michael Jackson",
    correct_answer: "Thriller",
    accepted_answers: ["michael jackson thriller", "thriller michael jackson"],
    hint: "'Cause this is thriller, thriller night! Vincent Price narrates.",
    audio_path: "",
    synth_motif: "thriller"
  },
  {
    round_number: 4,
    title: "Psycho (The Murder / Shower Scene)",
    artist: "Bernard Herrmann",
    correct_answer: "Psycho",
    accepted_answers: ["psycho theme", "shower scene", "the murder", "bernard herrmann psycho"],
    hint: "Alfred Hitchcock's screeching violins at the Bates Motel.",
    audio_path: "",
    synth_motif: "psycho"
  },
  {
    round_number: 5,
    title: "Stranger Things Theme",
    artist: "Kyle Dixon & Michael Stein",
    correct_answer: "Stranger Things",
    accepted_answers: ["stranger things theme", "the upside down", "stranger things main theme"],
    hint: "Hawkins, Indiana. 1980s synth pulse and the Demogorgon.",
    audio_path: "",
    synth_motif: "stranger"
  },
  {
    round_number: 6,
    title: "Jaws Main Title",
    artist: "John Williams",
    correct_answer: "Jaws",
    accepted_answers: ["jaws theme", "jaws main title", "shark theme", "john williams jaws"],
    hint: "Two menacing notes from the ocean deep. You're gonna need a bigger boat.",
    audio_path: "",
    synth_motif: "jaws"
  },
  {
    round_number: 7,
    title: "A Nightmare on Elm Street Theme",
    artist: "Charles Bernstein",
    correct_answer: "A Nightmare on Elm Street",
    accepted_answers: ["nightmare on elm street", "elm street", "freddy krueger", "freddy krueger theme"],
    hint: "1, 2, Freddy's coming for you... 3, 4, better lock your door.",
    audio_path: "",
    synth_motif: "elmstreet"
  },
  {
    round_number: 8,
    title: "Hello Zepp (Saw Theme)",
    artist: "Charlie Clouser",
    correct_answer: "Saw",
    accepted_answers: ["hello zepp", "saw theme", "saw movie theme", "jigsaw theme"],
    hint: "I want to play a game. The dramatic violin crescendo at the final twist.",
    audio_path: "",
    synth_motif: "saw"
  },
  {
    round_number: 9,
    title: "Ghostbusters",
    artist: "Ray Parker Jr.",
    correct_answer: "Ghostbusters",
    accepted_answers: ["ghost busters", "who you gonna call", "ray parker jr ghostbusters"],
    hint: "If there's something strange in your neighborhood, who you gonna call?",
    audio_path: "",
    synth_motif: "ghostbusters"
  },
  {
    round_number: 10,
    title: "The Shining (Main Title - Dies Irae)",
    artist: "Wendy Carlos & Rachel Elkind",
    correct_answer: "The Shining",
    accepted_answers: ["the shining theme", "dies irae", "wendy carlos the shining", "overlook hotel"],
    hint: "Stanley Kubrick. A yellow Beetle winding up the snowy Colorado mountains.",
    audio_path: "",
    synth_motif: "shining"
  },
  {
    round_number: 11,
    title: "Sweet Dreams (Are Made of This)",
    artist: "Marilyn Manson",
    correct_answer: "Sweet Dreams",
    accepted_answers: ["sweet dreams are made of this", "sweet dreams marilyn manson", "eurythmics sweet dreams"],
    hint: "Gothic cover of an 80s hit with distorted bass and raspy screams.",
    audio_path: "",
    synth_motif: "sweetdreams"
  },
  {
    round_number: 12,
    title: "Somebody's Watching Me",
    artist: "Rockwell",
    correct_answer: "Somebody's Watching Me",
    accepted_answers: ["somebodys watching me", "somebody is watching me", "rockwell somebodys watching me"],
    hint: "Paranoid 80s hit featuring Michael Jackson on the chorus. Who's in the mirror?",
    audio_path: "",
    synth_motif: "somebody"
  },
  {
    round_number: 13,
    title: "Monster Mash",
    artist: "Bobby 'Boris' Pickett",
    correct_answer: "Monster Mash",
    accepted_answers: ["the monster mash", "bobby boris pickett monster mash"],
    hint: "It was a graveyard smash! Caught on in a flash.",
    audio_path: "",
    synth_motif: "monstermash"
  },
  {
    round_number: 14,
    title: "Suspiria Theme",
    artist: "Goblin",
    correct_answer: "Suspiria",
    accepted_answers: ["suspiria theme", "goblin suspiria"],
    hint: "Dario Argento's witch ballet academy. Whispered 'La la la' chant.",
    audio_path: "",
    synth_motif: "suspiria"
  },
  {
    round_number: 15,
    title: "Bury a Friend",
    artist: "Billie Eilish",
    correct_answer: "Bury a Friend",
    accepted_answers: ["bury a friend billie eilish", "billie eilish bury a friend"],
    hint: "'What do you want from me? Why don't you run from me?' Monster under the bed.",
    audio_path: "",
    synth_motif: "buryafriend"
  },
  {
    round_number: 16,
    title: "The X-Files Theme",
    artist: "Mark Snow",
    correct_answer: "The X-Files",
    accepted_answers: ["x files", "x-files", "x files theme", "the x files theme"],
    hint: "Whistling echo theme. The truth is out there, Mulder and Scully.",
    audio_path: "",
    synth_motif: "xfiles"
  },
  {
    round_number: 17,
    title: "The Addams Family Theme",
    artist: "Vic Mizzy",
    correct_answer: "The Addams Family",
    accepted_answers: ["addams family", "the addams family theme", "addams family theme"],
    hint: "They're creepy and they're kooky, mysterious and spooky. *double finger snap*",
    audio_path: "",
    synth_motif: "addams"
  },
  {
    round_number: 18,
    title: "(Don't Fear) The Reaper",
    artist: "Blue Öyster Cult",
    correct_answer: "Don't Fear the Reaper",
    accepted_answers: ["dont fear the reaper", "(don't fear) the reaper", "fear the reaper", "blue oyster cult reaper"],
    hint: "Famous guitar riff and cowbell, used in the original 1978 Halloween opening.",
    audio_path: "",
    synth_motif: "reaper"
  },
  {
    round_number: 19,
    title: "Bark at the Moon",
    artist: "Ozzy Osbourne",
    correct_answer: "Bark at the Moon",
    accepted_answers: ["ozzy osbourne bark at the moon", "bark at the moon ozzy"],
    hint: "Prince of Darkness howling like a werewolf in a cemetery.",
    audio_path: "",
    synth_motif: "bark"
  },
  {
    round_number: 20,
    title: "Pet Sematary",
    artist: "The Ramones",
    correct_answer: "Pet Sematary",
    accepted_answers: ["pet cemetery", "the ramones pet sematary", "ramones pet sematary"],
    hint: "Stephen King novel soundtrack: 'I don't wanna be buried in a pet sematary...'",
    audio_path: "",
    synth_motif: "petsematary"
  },
  {
    round_number: 21,
    title: "Dragula",
    artist: "Rob Zombie",
    correct_answer: "Dragula",
    accepted_answers: ["rob zombie dragula", "dig through the ditches", "burn through the witches"],
    hint: "Industrial horror anthem: 'Dig through the ditches and burn through the witches!'",
    audio_path: "",
    synth_motif: "dragula"
  },
  {
    round_number: 22,
    title: "Highway to Hell",
    artist: "AC/DC",
    correct_answer: "Highway to Hell",
    accepted_answers: ["acdc highway to hell", "ac/dc highway to hell"],
    hint: "Bon Scott's screaming rock anthem heading straight down into the underworld.",
    audio_path: "",
    synth_motif: "highway"
  },
  {
    round_number: 23,
    title: "Sympathy for the Devil",
    artist: "The Rolling Stones",
    correct_answer: "Sympathy for the Devil",
    accepted_answers: ["the rolling stones sympathy for the devil", "rolling stones sympathy for the devil"],
    hint: "'Please allow me to introduce myself, I'm a man of wealth and taste...'",
    audio_path: "",
    synth_motif: "sympathy"
  },
  {
    round_number: 24,
    title: "Superstition",
    artist: "Stevie Wonder",
    correct_answer: "Superstition",
    accepted_answers: ["stevie wonder superstition", "very superstitious"],
    hint: "Thirteen-month-old baby, broke the lookin' glass... famous clavinet groove.",
    audio_path: "",
    synth_motif: "superstition"
  },
  {
    round_number: 25,
    title: "Bad Moon Rising",
    artist: "Creedence Clearwater Revival",
    correct_answer: "Bad Moon Rising",
    accepted_answers: ["bad moon rising ccr", "creedence clearwater revival bad moon rising"],
    hint: "Soundtrack to An American Werewolf in London: 'I see trouble on the way.'",
    audio_path: "",
    synth_motif: "badmoon"
  },
  {
    round_number: 26,
    title: "Disturbia",
    artist: "Rihanna",
    correct_answer: "Disturbia",
    accepted_answers: ["rihanna disturbia"],
    hint: "'Bum-bum-be-dum-bum-bum-be-dum...' Dark horror-pop about losing one's mind.",
    audio_path: "",
    synth_motif: "disturbia"
  },
  {
    round_number: 27,
    title: "Feed My Frankenstein",
    artist: "Alice Cooper",
    correct_answer: "Feed My Frankenstein",
    accepted_answers: ["alice cooper feed my frankenstein", "frankenstein alice cooper"],
    hint: "Shock rock legend, featured in Wayne's World backstage scene.",
    audio_path: "",
    synth_motif: "frankenstein"
  },
  {
    round_number: 28,
    title: "Spooky",
    artist: "Classics IV",
    correct_answer: "Spooky",
    accepted_answers: ["classics iv spooky", "dusty springfield spooky"],
    hint: "60s soft rock haunt: 'Love is kinda crazy with a spooky little girl like you.'",
    audio_path: "",
    synth_motif: "spooky"
  },
  {
    round_number: 29,
    title: "Ghost Town",
    artist: "The Specials",
    correct_answer: "Ghost Town",
    accepted_answers: ["the specials ghost town", "specials ghost town"],
    hint: "Eerie 1981 2-tone ska track with eerie flute: 'This town is coming like a ghost town...'",
    audio_path: "",
    synth_motif: "ghosttown"
  },
  {
    round_number: 30,
    title: "Creep",
    artist: "Radiohead",
    correct_answer: "Creep",
    accepted_answers: ["radiohead creep", "im a creep", "i'm a creep"],
    hint: "The ultimate 90s existential haunting: 'But I'm a creep, I'm a weirdo...'",
    audio_path: "",
    synth_motif: "creep"
  }
];
